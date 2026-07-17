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

const geminiKey = process.env.GEMINI_API_KEY;
console.log("Using API Key:", geminiKey);

async function testKey() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

testKey();
