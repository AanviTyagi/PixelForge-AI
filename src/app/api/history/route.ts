import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("id");

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    if (jobId) {
      // Find single job details
      const ObjectId = require("mongodb").ObjectId;
      let job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      // Check if we need to poll Replicate operation
      if (job.status === "processing" && job.replicatePredictionId) {
        const replicateToken = process.env.REPLICATE_API_TOKEN;
        if (replicateToken) {
          try {
            console.log(`[History API] Polling status for Replicate prediction: ${job.replicatePredictionId}`);
            const res = await fetch(`https://api.replicate.com/v1/predictions/${job.replicatePredictionId}`, {
              headers: {
                "Authorization": `Token ${replicateToken}`,
              }
            });
            
            if (res.ok) {
              const prediction = await res.json();
              if (prediction.status === "succeeded") {
                console.log(`[History API] Replicate prediction completed successfully.`);
                
                let outputUrl = "";
                if (Array.isArray(prediction.output)) {
                  outputUrl = prediction.output[0];
                } else if (typeof prediction.output === "string") {
                  outputUrl = prediction.output;
                } else if (prediction.output?.url) {
                  outputUrl = prediction.output.url;
                }

                if (outputUrl) {
                  const proxyUrl = `/api/video-proxy?predictionId=${prediction.id}`;
                  
                  await db.collection("jobs").updateOne(
                    { _id: new ObjectId(jobId) },
                    {
                      $set: {
                        status: "completed",
                        outputVideoUrl: proxyUrl,
                        completedAt: new Date().toISOString(),
                        durationMs: job.createdAt ? new Date().getTime() - new Date(job.createdAt).getTime() : 0,
                      }
                    }
                  );
                } else {
                  console.error("[History API] Could not find output URL in finished Replicate response:", prediction);
                  await db.collection("jobs").updateOne(
                    { _id: new ObjectId(jobId) },
                    {
                      $set: {
                        status: "failed",
                        errorMessage: "Could not find generated video URL in response.",
                        completedAt: new Date().toISOString(),
                      }
                    }
                  );
                }
              } else if (prediction.status === "failed" || prediction.status === "canceled") {
                console.error(`[History API] Replicate prediction failed or canceled:`, prediction.error);
                await db.collection("jobs").updateOne(
                  { _id: new ObjectId(jobId) },
                  {
                    $set: {
                      status: "failed",
                      errorMessage: prediction.error || "Replicate video generation failed",
                      completedAt: new Date().toISOString(),
                    }
                  }
                );
              }
              
              // Fetch updated job from MongoDB
              job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
            } else {
              const errText = await res.text();
              console.warn(`[History API] Failed to poll Replicate. Status: ${res.status}. Error:`, errText);
            }
          } catch (err) {
            console.error("[History API] Error polling Replicate operation:", err);
          }
        }
      }

      const { _id, ...rest } = job;
      return NextResponse.json({
        id: _id.toString(),
        ...rest,
      });
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const skip = (page - 1) * pageSize;



    // Fetch jobs from DB sorted by createdAt desc
    const rawJobs = await db
      .collection("jobs")
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const total = await db.collection("jobs").countDocuments({});

    // Map _id object to id string for frontend compatibility
    const jobs = rawJobs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return {
        id: _id.toString(),
        ...rest,
      };
    });

    return NextResponse.json({
      jobs,
      total,
      page,
      pageSize,
    });
  } catch (error: any) {
    console.error("Error retrieving job history:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve history" },
      { status: 500 }
    );
  }
}
