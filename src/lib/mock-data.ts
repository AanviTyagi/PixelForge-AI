import type { TransformationJob, TransformationParams } from "@/types";

// Default transformation parameters
export const DEFAULT_PARAMS: TransformationParams = {
  prompt: "",
  strength: 0.7,
  guidanceScale: 7.5,
  numInferenceSteps: 30,
  seed: undefined,
  resolution: "720p",
  videoLength: "short",
};

// Sample video URLs (public domain MP4s for demo)
const SAMPLE_SOURCE = "https://www.w3schools.com/html/movie.mp4";
const SAMPLE_OUTPUT = "https://www.w3schools.com/html/mov_bbb.mp4";
const SAMPLE_OUTPUT_2 = "https://lorem.video/1080p";

// Mock history data
export const MOCK_HISTORY: TransformationJob[] = [];

// Mock result placeholder (empty)
export const MOCK_RESULT: TransformationJob = {
  id: "",
  status: "pending",
  sourceVideoUrl: "",
  sourceVideoName: "",
  params: {
    prompt: "",
    strength: 0.7,
    guidanceScale: 7.5,
    numInferenceSteps: 30,
    resolution: "720p",
    videoLength: "short",
  },
  createdAt: "",
};
