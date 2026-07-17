import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const ACCEPTED_VIDEO_TYPES = ACCEPTED_IMAGE_TYPES; // alias for compatibility
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const validExtensions = ["png", "jpg", "jpeg", "webp"];
  const isValid = ACCEPTED_IMAGE_TYPES.includes(file.type) || (ext && validExtensions.includes(ext));

  if (!isValid) {
    return `Unsupported format. Please upload PNG, JPG, JPEG, or WebP.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
}
export const validateVideoFile = validateImageFile; // alias for compatibility

export async function downloadImage(url: string | undefined, filename: string = "transformed-image.png") {
  if (!url) return;

  // 1. If it's a Cloudinary URL, use 'fl_attachment' transformation to force download
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    const downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 2. Otherwise, attempt direct blob download, with fallback to open in tab
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("Fetch failed");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Direct fetch download failed, falling back to open in tab:", error);
    window.open(url, "_blank");
  }
}
export const downloadVideo = downloadImage; // alias for compatibility
