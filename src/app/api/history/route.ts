import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/** Single Magic Hour status check — fast, well under 10 s. */
async function checkAndFinalizeMagicHourJob(db: any, job: any, jobId: string) {
  const { magicHourJobId, magicHourKeyUsed } = job;
  if (!magicHourJobId) return job;

  // Pick the right key
  let key = process.env.MAGIC_HOUR_API_KEY;
  if (magicHourKeyUsed === "secondary") {
    key = process.env.MAGIC_HOUR_API_KEY_SECONDARY;
  } else if (magicHourKeyUsed === "tertiary") {
    key = process.env.MAGIC_HOUR_API_KEY_TERTIARY;
  }

  if (!key) return job;

  try {
    const pollRes = await fetch(
      `https://api.magichour.ai/v1/image-projects/${magicHourJobId}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
          Accept: "application/json",
        },
      }
    );

    if (!pollRes.ok) {
      console.warn(`[History] Magic Hour poll failed (${pollRes.status})`);
      return job;
    }

    const poll = await pollRes.json();
    console.log(`[History] Magic Hour job ${magicHourJobId} status: ${poll.status}`);

    if (poll.status === "complete") {
      const downloadUrl: string = poll.downloads?.[0]?.url || "";
      if (!downloadUrl) {
        await db.collection("jobs").updateOne(
          { _id: new ObjectId(jobId) },
          { $set: { status: "failed", errorMessage: "Magic Hour returned no download URL" } }
        );
        return { ...job, status: "failed" };
      }

      // Upload to Cloudinary for permanent storage
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

      const updates = {
        status: "completed",
        outputVideoUrl: upload.secure_url,
        completedAt: new Date().toISOString(),
        durationMs: job.createdAt
          ? Date.now() - new Date(job.createdAt).getTime()
          : 0,
      };

      await db.collection("jobs").updateOne(
        { _id: new ObjectId(jobId) },
        { $set: updates }
      );

      console.log(`[History] Job ${jobId} completed: ${upload.secure_url}`);
      return { ...job, ...updates };
    }

    if (poll.status === "error" || poll.status === "canceled") {
      const updates = {
        status: "failed",
        errorMessage: `Magic Hour job ${poll.status}: ${JSON.stringify(poll.error)}`,
        completedAt: new Date().toISOString(),
      };
      await db.collection("jobs").updateOne(
        { _id: new ObjectId(jobId) },
        { $set: updates }
      );
      return { ...job, ...updates };
    }

    // Still queued/rendering — return as-is, client will poll again
    return job;
  } catch (err: any) {
    console.error("[History] Error checking Magic Hour status:", err?.message);
    return job;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("id");

    const { db } = await connectToDatabase();

    if (jobId) {
      let job = await db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      // If still processing and has a Magic Hour job ID → check status now
      if (job.status === "processing" && job.magicHourJobId) {
        job = await checkAndFinalizeMagicHourJob(db, job, jobId);
      }

      const { _id, ...rest } = job;
      return NextResponse.json({ id: _id.toString(), ...rest });
    }

    // List all jobs (history page)
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const skip = (page - 1) * pageSize;

    const rawJobs = await db
      .collection("jobs")
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const total = await db.collection("jobs").countDocuments({});

    const jobs = rawJobs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return { id: _id.toString(), ...rest };
    });

    return NextResponse.json({ jobs, total, page, pageSize });
  } catch (error: any) {
    console.error("Error retrieving job history:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve history" },
      { status: 500 }
    );
  }
}
