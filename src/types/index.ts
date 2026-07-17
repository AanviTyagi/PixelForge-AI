// ─── Transformation Job ────────────────────────────────────────────────────
export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface TransformationParams {
  prompt: string;
  strength: number;          // 0.0 – 1.0
  guidanceScale: number;     // 1 – 20
  numInferenceSteps: number; // 1 – 50
  seed?: number;
  resolution: "480p" | "720p" | "1080p";
  videoLength: "short" | "medium" | "long";
}

export interface TransformationJob {
  id: string;
  status: JobStatus;
  sourceVideoUrl: string;
  sourceVideoName: string;
  sourceThumbnail?: string;
  params: TransformationParams;
  outputVideoUrl?: string;
  outputCloudinaryId?: string;
  errorMessage?: string;
  createdAt: string;        // ISO date string
  completedAt?: string;
  durationMs?: number;
}

// ─── API Response shapes (for later backend integration) ──────────────────
export interface ApiUploadResponse {
  cloudinaryUrl: string;
  publicId: string;
}

export interface ApiTransformResponse {
  jobId: string;
  status: JobStatus;
  message: string;
}

export interface ApiHistoryResponse {
  jobs: TransformationJob[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── UI State ─────────────────────────────────────────────────────────────
export type AppStep = "upload" | "configure" | "generating" | "result";

export interface GenerationProgress {
  step: "uploading" | "processing" | "finalizing" | "complete";
  message: string;
  percent: number;
}

export interface LocalFile {
  name: string;
  size: number;
  type: string;
  url: string;
}
