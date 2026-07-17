import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      console.error("Webhook received without jobId in query parameters");
      return NextResponse.json({ error: "Missing jobId query parameter" }, { status: 400 });
    }

    const payload = await request.json();
    console.log(`Received webhook callback for jobId: ${jobId}. Payload:`, JSON.stringify(payload));

    const { db } = await connectToDatabase();

    // Check if job exists in database
    const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
    if (!job) {
      console.error(`Job with ID ${jobId} not found in database during webhook processing`);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Determine if execution was successful
    // FAL AI async queue webhook payload structure typically has status / error info, or payload output
    const isError = payload.status === "ERROR" || !!payload.error;
    
    if (isError) {
      const errMsg = payload.error || "FAL AI queue processing failed";
      console.error(`FAL AI reported failure for job ${jobId}: ${errMsg}`);
      
      await db.collection("jobs").updateOne(
        { _id: new ObjectId(jobId) },
        {
          $set: {
            status: "failed",
            errorMessage: typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg),
            completedAt: new Date().toISOString(),
          },
        }
      );
      
      return NextResponse.json({ message: "Webhook processed (job recorded as failed)" });
    }

    // Grab video output URL from payload
    // Hunyuan-Video typically outputs: { video: { url: "https://..." } } or { output: { video: { url: "..." } } }
    let outputVideoUrl = "";
    if (payload.video?.url) {
      outputVideoUrl = payload.video.url;
    } else if (payload.output?.video?.url) {
      outputVideoUrl = payload.output.video.url;
    } else if (payload.file?.url) {
      outputVideoUrl = payload.file.url;
    } else if (payload.outputs?.[0]?.video?.url) {
      outputVideoUrl = payload.outputs[0].video.url;
    } else {
      // Look for any string value that looks like a video URL in outputs
      outputVideoUrl = payload.video_url || payload.url || "";
    }

    if (!outputVideoUrl) {
      console.error("Could not locate transformed video URL in FAL webhook payload", payload);
      
      await db.collection("jobs").updateOne(
        { _id: new ObjectId(jobId) },
        {
          $set: {
            status: "failed",
            errorMessage: "Transformed video output URL was missing from FAL response",
            completedAt: new Date().toISOString(),
          },
        }
      );
      
      return NextResponse.json({ error: "Output video URL not found" }, { status: 422 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const isPlaceholder = !cloudName || cloudName.includes("your_cloud_name") || !apiKey || apiKey.includes("your_api_key");

    let secureUrl = outputVideoUrl;
    let publicId = "mock_output_cloudinary_id";

    if (isPlaceholder) {
      console.warn("Cloudinary credentials are missing or placeholders. Bypassing output upload to Cloudinary: saving direct FAL output URL.");
    } else {
      console.log(`Uploading FAL output video to Cloudinary: ${outputVideoUrl}`);
      // Upload output video from FAL directly to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(outputVideoUrl, {
        resource_type: "video",
        folder: "meatech/outputs",
      });
      secureUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    }

    const completedAt = new Date().toISOString();
    const durationMs = job.createdAt
      ? new Date(completedAt).getTime() - new Date(job.createdAt).getTime()
      : undefined;

    // Update job document in database
    await db.collection("jobs").updateOne(
      { _id: new ObjectId(jobId) },
      {
        $set: {
          status: "completed",
          outputVideoUrl: secureUrl,
          outputCloudinaryId: publicId,
          completedAt,
          durationMs,
        },
      }
    );

    console.log(`Job ${jobId} successfully marked completed with URL: ${secureUrl}`);

    return NextResponse.json({
      message: "Webhook processed successfully",
      cloudinaryUrl: secureUrl,
    });
  } catch (error: any) {
    console.error("Error processing FAL AI webhook:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process webhook" },
      { status: 500 }
    );
  }
}
