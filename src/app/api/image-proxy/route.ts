import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get("predictionId");
    const replicateToken = process.env.REPLICATE_API_TOKEN;

    if (!predictionId) {
      return new Response("Missing predictionId parameter", { status: 400 });
    }

    if (!replicateToken) {
      return new Response("Replicate API token is not configured", { status: 500 });
    }

    console.log(`[Image Proxy] Querying Replicate prediction: ${predictionId}`);
    const predRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        "Authorization": `Token ${replicateToken}`,
      }
    });

    if (!predRes.ok) {
      const errText = await predRes.text();
      console.error(`[Image Proxy] Failed to fetch prediction details for ${predictionId}:`, errText);
      return new Response("Failed to fetch prediction from Replicate", { status: predRes.status });
    }

    const prediction = await predRes.json();
    let outputUrl = "";
    if (Array.isArray(prediction.output)) {
      outputUrl = prediction.output[0];
    } else if (typeof prediction.output === "string") {
      outputUrl = prediction.output;
    } else if (prediction.output?.url) {
      outputUrl = prediction.output.url;
    }

    if (!outputUrl) {
      return new Response("Prediction output image URL not found", { status: 404 });
    }

    console.log(`[Image Proxy] Streaming image from Replicate URL: ${outputUrl}`);
    const response = await fetch(outputUrl);

    if (!response.ok) {
      console.error(`[Image Proxy] Failed to stream image from Replicate storage:`, response.status);
      return new Response("Failed to stream image from storage source", { status: response.status });
    }

    // Pipe the response headers and body
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "image/png");
    headers.set("Content-Length", response.headers.get("Content-Length") || "");
    headers.set("Cache-Control", "public, max-age=3600");
    // Enable CORS and download attachment header to facilitate browser download
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Content-Disposition", `attachment; filename="transformed-${predictionId}.png"`);

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("[Image Proxy] Exception in image proxy:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
