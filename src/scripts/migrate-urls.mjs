import { MongoClient } from "mongodb";

// We load the MONGODB_URI directly from process.env or .env
// To ensure dotenv works, we require it if available, or just read process.env.
// In Next.js/Node.js, process.env is populated by Next.js when running tasks,
// but since this is a standalone script, we can load dotenv or read from .env manually.
import fs from "fs";
import path from "path";

// Simple manual .env parser
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      for (const line of envContent.split("\n")) {
        const parts = line.split("=");
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join("=").trim();
          process.env[key] = value;
        }
      }
    }
  } catch (e) {
    console.warn("Could not read .env file manually:", e);
  }
}

loadEnv();

const uri = process.env.MONGODB_URI;

if (!uri || uri.includes("username:password")) {
  console.error("Error: MONGODB_URI is not configured in your .env file.");
  process.exit(1);
}

async function main() {
  console.log("Connecting to MongoDB to update old/blocked URLs...");
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("jobs");

    // Retrieve all jobs
    const jobs = await collection.find({}).toArray();
    console.log(`Found ${jobs.length} total jobs in database.`);

    let updatedCount = 0;
    for (const job of jobs) {
      let needsUpdate = false;
      const updateFields = {};

      // Check sourceVideoUrl
      if (job.sourceVideoUrl && job.sourceVideoUrl.includes("gtv-videos-bucket")) {
        updateFields.sourceVideoUrl = "https://www.w3schools.com/html/movie.mp4";
        needsUpdate = true;
      }

      // Check outputVideoUrl
      if (job.outputVideoUrl && job.outputVideoUrl.includes("gtv-videos-bucket")) {
        let newUrl = "https://www.w3schools.com/html/movie.mp4";
        if (job.outputVideoUrl.includes("ElephantsDream")) {
          newUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
        } else if (job.outputVideoUrl.includes("SubaruOutback")) {
          newUrl = "https://lorem.video/1080p";
        } else if (job.outputVideoUrl.includes("ForBiggerEscapes")) {
          newUrl = "https://lorem.video/480p";
        } else if (job.outputVideoUrl.includes("ForBiggerBlazes")) {
          newUrl = "https://lorem.video/720p";
        }
        updateFields.outputVideoUrl = newUrl;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await collection.updateOne({ _id: job._id }, { $set: updateFields });
        updatedCount++;
      }
    }

    console.log(`Successfully migrated ${updatedCount} jobs with blocked URLs.`);
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.close();
  }
}

main();
