import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload raw buffer stream to Cloudinary
function uploadStream(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "meatech/sources",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const isMock = !cloudName || cloudName.includes("your_cloud_name") || !apiKey || apiKey.includes("your_api_key");

    // Case 1: Form Multipart File Upload (Direct client upload fallback)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
      }

      console.log(`Processing direct multipart upload for file: ${file.name}`);

      // Mock fallback — Vercel has no writable filesystem, just return what we have
      if (isMock) {
        console.warn("Cloudinary not configured. Returning placeholder URL.");
        return NextResponse.json({
          cloudinaryUrl: "",
          publicId: "mock_local_upload",
        });
      }

      // Convert file stream to buffer for Cloudinary upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadResult = await uploadStream(buffer);

      return NextResponse.json({
        cloudinaryUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      });
    }

    // Case 2: JSON remote URL payload (Uploadcare CDN transfer)
    const body = await request.json();
    const { sourceVideoUrl } = body;

    if (!sourceVideoUrl) {
      return NextResponse.json(
        { error: "Missing sourceVideoUrl in request body" },
        { status: 400 }
      );
    }

    if (isMock) {
      console.warn("Cloudinary not configured. Returning source video URL directly.");
      return NextResponse.json({
        cloudinaryUrl: sourceVideoUrl,
        publicId: "mock_source_cloudinary_id",
      });
    }

    console.log(`Uploading source video from URL to Cloudinary: ${sourceVideoUrl}`);

    const uploadResult = await cloudinary.uploader.upload(sourceVideoUrl, {
      resource_type: "auto",
      folder: "meatech/sources",
    });

    return NextResponse.json({
      cloudinaryUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error: any) {
    console.error("Error in /api/upload:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload video to Cloudinary" },
      { status: 500 }
    );
  }
}
