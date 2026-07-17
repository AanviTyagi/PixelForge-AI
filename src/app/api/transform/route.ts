import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/** Calls Magic Hour image generator and returns the Cloudinary URL, or throws. */
async function generateWithMagicHour(
  apiKey: string,
  prompt: string,
  label: string
): Promise<string> {
  console.log(`[${label}] Trying Magic Hour API...`);

  // Step 1: Create image generation job
  const createRes = await fetch("https://api.magichour.ai/v1/ai-image-generator", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      image_count: 1,
      model: "flux-schnell",
      aspect_ratio: "1:1",
      resolution: "640px",
      style: {
        prompt: prompt || "Transform this image with artistic style",
        tool: "general",
      },
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Magic Hour create failed (${createRes.status}): ${errText}`);
  }

  const job = await createRes.json();
  const jobId = job.id;
  if (!jobId) throw new Error("Magic Hour did not return a job id");

  console.log(`[${label}] Job created: ${jobId}`);

  // Step 2: Poll until complete (max 120 s, every 3 s)
  const MAX_POLLS = 40;
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, 3000));

    const pollRes = await fetch(
      `https://api.magichour.ai/v1/image-projects/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!pollRes.ok) {
      const errText = await pollRes.text();
      throw new Error(`Magic Hour poll failed (${pollRes.status}): ${errText}`);
    }

    const poll = await pollRes.json();
    console.log(`[${label}] Poll ${i + 1}/${MAX_POLLS} — status: ${poll.status}`);

    if (poll.status === "complete") {
      const downloadUrl: string = poll.downloads?.[0]?.url || "";
      if (!downloadUrl) throw new Error("Magic Hour returned no download URL");

      // Step 3: Upload to Cloudinary for permanent storage
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const upload = await cloudinary.uploader.upload(downloadUrl, {
        folder: "meatech/outputs",
        resource_type: "image",
      });

      console.log(`[${label}] Succeeded: ${upload.secure_url}`);
      return upload.secure_url;
    }

    if (poll.status === "error" || poll.status === "canceled") {
      throw new Error(`Magic Hour job ${poll.status}: ${JSON.stringify(poll.error)}`);
    }
    // queued / rendering — keep polling
  }

  throw new Error("Magic Hour job timed out");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceVideoUrl, sourceVideoName, params } = body;

    if (!sourceVideoUrl || !sourceVideoName || !params) {
      return NextResponse.json(
        { error: "Missing required fields: sourceVideoUrl, sourceVideoName, or params" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    const newJob = {
      status: "pending",
      sourceVideoUrl,
      sourceVideoName,
      params,
      createdAt: new Date().toISOString(),
    };

    const insertResult = await db.collection("jobs").insertOne(newJob);
    const jobId = insertResult.insertedId.toString();

    const prompt: string = params.prompt || "Transform this image with artistic style";
    let outputImageUrl = "";

    // ── TRY 1: Magic Hour — Primary Key ──
    const mhPrimary = process.env.MAGIC_HOUR_API_KEY;
    if (mhPrimary && !outputImageUrl) {
      try {
        outputImageUrl = await generateWithMagicHour(mhPrimary, prompt, "Magic Hour Primary");
      } catch (err: any) {
        console.warn("[Magic Hour Primary] Failed:", err?.message || err);
      }
    }

    // ── TRY 2: Magic Hour — Secondary Key ──
    const mhSecondary = process.env.MAGIC_HOUR_API_KEY_SECONDARY;
    if (mhSecondary && !outputImageUrl) {
      try {
        outputImageUrl = await generateWithMagicHour(mhSecondary, prompt, "Magic Hour Secondary");
      } catch (err: any) {
        console.warn("[Magic Hour Secondary] Failed:", err?.message || err);
      }
    }

    if (!outputImageUrl) {
      throw new Error(
        "Image generation failed. Both Magic Hour API keys exhausted. Please try again later."
      );
    }

    await db.collection("jobs").updateOne(
      { _id: new ObjectId(jobId) },
      {
        $set: {
          status: "completed",
          outputVideoUrl: outputImageUrl,
          completedAt: new Date().toISOString(),
          durationMs: 2000,
        },
      }
    );

    return NextResponse.json({
      jobId,
      status: "completed",
      message: "Image generation successfully completed.",
    });
  } catch (error: any) {
    console.error("Error in /api/transform:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to trigger transformation" },
      { status: 500 }
    );
  }
}
