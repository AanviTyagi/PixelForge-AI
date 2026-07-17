import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// No long polling — this route just kicks off the job and returns immediately.
// The frontend polls /api/history?id=<jobId> to check completion.
// Each history poll call makes one fast Magic Hour status check (< 2 s).

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

    const { db } = await connectToDatabase();
    const prompt: string = params.prompt || "Transform this image with artistic style";

    // ── Try Magic Hour Primary Key first ──
    const mhKey = process.env.MAGIC_HOUR_API_KEY;
    const mhKeySecondary = process.env.MAGIC_HOUR_API_KEY_SECONDARY;

    let magicHourJobId: string | null = null;
    let usedKey: string | null = null;

    for (const [key, label] of [
      [mhKey, "primary"],
      [mhKeySecondary, "secondary"],
    ] as [string | undefined, string][]) {
      if (!key || magicHourJobId) continue;
      try {
        const createRes = await fetch("https://api.magichour.ai/v1/ai-image-generator", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            image_count: 1,
            model: "flux-schnell",
            aspect_ratio: "1:1",
            resolution: "640px",
            style: {
              prompt,
              tool: "general",
            },
          }),
        });

        if (!createRes.ok) {
          const errText = await createRes.text();
          console.warn(`[Magic Hour ${label}] Create failed (${createRes.status}): ${errText}`);
          continue;
        }

        const job = await createRes.json();
        if (job.id) {
          magicHourJobId = job.id;
          usedKey = label;
          console.log(`[Magic Hour ${label}] Job created: ${job.id}`);
        }
      } catch (err: any) {
        console.warn(`[Magic Hour ${label}] Error:`, err?.message);
      }
    }

    if (!magicHourJobId) {
      return NextResponse.json(
        { error: "Failed to start image generation. Both Magic Hour API keys failed." },
        { status: 500 }
      );
    }

    // Save job to MongoDB with status "processing" — history route will poll completion
    const newJob = {
      status: "processing",
      sourceVideoUrl,
      sourceVideoName,
      params,
      magicHourJobId,
      magicHourKeyUsed: usedKey,
      createdAt: new Date().toISOString(),
    };

    const insertResult = await db.collection("jobs").insertOne(newJob);
    const jobId = insertResult.insertedId.toString();

    // Return immediately — frontend polls /api/history?id=<jobId>
    return NextResponse.json({
      jobId,
      status: "processing",
      message: "Image generation started. Poll /api/history?id=" + jobId + " for status.",
    });
  } catch (error: any) {
    console.error("Error in /api/transform:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to trigger transformation" },
      { status: 500 }
    );
  }
}
