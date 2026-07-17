import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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

    // Create a new job document in MongoDB
    const newJob = {
      status: "pending",
      sourceVideoUrl,
      sourceVideoName,
      params,
      createdAt: new Date().toISOString(),
    };

    const insertResult = await db.collection("jobs").insertOne(newJob);
    const jobId = insertResult.insertedId.toString();

    // Prepare Replicate API details
    const replicateToken = process.env.REPLICATE_API_TOKEN;

    if (!replicateToken) {
      throw new Error("Replicate API token is not configured in environment variables (.env).");
    }

    console.log(`[Replicate API] Initiating Hunyuan-Video prediction for prompt: "${params.prompt}"`);

    const response = await fetch("https://api.replicate.com/v1/models/tencent/hunyuan-video/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt: params.prompt,
          aspect_ratio: "16:9",
          num_frames: 85,
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr;
      try {
        parsedErr = JSON.parse(errText);
      } catch (_) {}
      const errorMsg = parsedErr?.detail || parsedErr?.error || errText || "Failed to call Replicate API";
      throw new Error(errorMsg);
    }

    const prediction = await response.json();
    const predictionId = prediction.id;
    console.log(`[Replicate API] Successfully queued. Prediction ID: ${predictionId}`);

    // Update state in DB to processing with Replicate details
    await db.collection("jobs").updateOne(
      { _id: new ObjectId(jobId) },
      {
        $set: {
          status: "processing",
          replicatePredictionId: predictionId,
          category: "hunyuan",
        },
      }
    );

    return NextResponse.json({
      jobId,
      status: "processing",
      message: "Video generation successfully initiated with Replicate Hunyuan-Video",
    });
  } catch (error: any) {
    console.error("Error in /api/transform:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to trigger transformation" },
      { status: 500 }
    );
  }
}
