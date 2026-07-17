import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";

// Simple manual .env parser
function loadEnv() {
  try {
    const envPath = path.resolve(".env");
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
if (!uri) {
  console.error("Error: MONGODB_URI not found in your environment or .env file.");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("jobs");
    const jobs = await collection.find({}).toArray();

    // Filter jobs that used Gemini (category === 'veo' or geminiOperationName present)
    const geminiJobs = jobs.filter(
      (job) => job.category === "veo" || job.geminiOperationName
    );

    console.log("\n==================================================");
    console.log("   GEMINI VEO API CALLS & USAGE REPORT");
    console.log("==================================================");
    console.log(`Total Jobs in Database: ${jobs.length}`);
    console.log(`Total Gemini API Video Generations: ${geminiJobs.length}`);
    console.log("--------------------------------------------------\n");

    if (geminiJobs.length === 0) {
      console.log("No Gemini API calls recorded in the database history yet.");
      console.log("(Note: Some jobs might have run using the Mock Fallback if the API key was missing during those runs.)\n");
      return;
    }

    // Group by date
    const dateCounts = {};
    let completedCount = 0;
    let failedCount = 0;
    let processingCount = 0;
    let pendingCount = 0;

    geminiJobs.forEach((job) => {
      // Group status
      if (job.status === "completed") completedCount++;
      else if (job.status === "failed") failedCount++;
      else if (job.status === "processing") processingCount++;
      else pendingCount++;

      // Group date (YYYY-MM-DD)
      const dateStr = job.createdAt ? job.createdAt.split("T")[0] : "Unknown Date";
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });

    // Print Status Breakdown
    console.log("STATUS BREAKDOWN:");
    console.log(`- Completed:  ${completedCount}`);
    console.log(`- Processing: ${processingCount}`);
    console.log(`- Failed:     ${failedCount}`);
    console.log(`- Pending:    ${pendingCount}`);
    console.log("--------------------------------------------------\n");

    // Print ASCII Graph
    console.log("API CALLS OVER TIME (DAILY GRAPH):");
    const sortedDates = Object.keys(dateCounts).sort();
    const maxCalls = Math.max(...Object.values(dateCounts));

    sortedDates.forEach((date) => {
      const count = dateCounts[date];
      // Draw bar using solid blocks '█'
      const bar = "█".repeat(count);
      const padding = " ".repeat(12 - date.length);
      console.log(`${date}${padding} | ${bar} (${count})`);
    });

    console.log("\n==================================================");
  } catch (err) {
    console.error("\nError connecting to MongoDB database:");
    console.error(err.message || err);
    console.log("\n--------------------------------------------------");
    console.log("TIP: If you are seeing an SSL/TLS alert 80 or network timeout,");
    console.log("please ensure that your outbound IP address is whitelisted");
    console.log("in your MongoDB Atlas Network Access configuration.");
    console.log("--------------------------------------------------\n");
  } finally {
    await client.close();
  }
}

main();
