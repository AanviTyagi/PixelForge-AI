import { useState, useEffect, useCallback } from "react";
import type { TransformationParams, TransformationJob, AppStep, LocalFile } from "@/types";
import { DEFAULT_PARAMS } from "@/lib/mock-data";
import { validateImageFile } from "@/lib/utils";

export function useImageTransform() {
  const [step, setStep] = useState<AppStep>("upload");
  const [file, setFile] = useState<LocalFile | null>(null);
  const [params, setParams] = useState<TransformationParams>({ ...DEFAULT_PARAMS });
  const [historyJobs, setHistoryJobs] = useState<TransformationJob[]>([]);
  const [resultJob, setResultJob] = useState<TransformationJob | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Generating state
  const [procStep, setProcStep] = useState(0);
  const [procPct, setProcPct] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistoryJobs(data.jobs || []);
      }
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const processFile = useCallback(async (f: File) => {
    const err = validateImageFile(f);
    if (err) {
      setUploadError(err);
      return;
    }
    setUploadError(null);
    setUploading(true);
    setUploadPct(0);

    const pubKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "demopublickey";
    const useUploadcare = pubKey !== "demopublickey";

    try {
      if (useUploadcare) {
        try {
          console.log("Attempting client-side Uploadcare upload...");
          const { uploadFile } = await import("@uploadcare/upload-client");
          const fileData = await uploadFile(f, {
            publicKey: pubKey,
            store: "auto",
            onProgress: (info: any) => {
              const progress = info.value || 0;
              setUploadPct(Math.round(progress * 50));
            }
          });

          const ucareUrl = fileData.cdnUrl || `https://ucarecdn.com/${fileData.uuid}/`;
          console.log("Uploaded successfully to Uploadcare:", ucareUrl);

          setUploadPct(75);
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sourceVideoUrl: ucareUrl })
          });

          if (res.ok) {
            const { cloudinaryUrl } = await res.json();
            setUploadPct(100);
            setUploading(false);
            setFile({
              name: f.name,
              size: f.size,
              type: f.type,
              url: cloudinaryUrl
            });
            setStep("configure");
            return;
          }
          console.warn("Uploadcare CDN copy to Cloudinary failed, falling back to direct server upload...");
        } catch (ucareErr) {
          console.warn("Uploadcare upload failed, falling back to direct server upload...", ucareErr);
        }
      }

      console.log("Running direct multipart form data upload to /api/upload...");
      setUploadPct(30);

      const formData = new FormData();
      formData.append("file", f);

      let progressVal = 30;
      const mockProgressInterval = setInterval(() => {
        progressVal = Math.min(progressVal + 8, 92);
        setUploadPct(Math.round(progressVal));
      }, 200);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      clearInterval(mockProgressInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Direct upload to server failed");
      }

      const { cloudinaryUrl } = await res.json();
      console.log("Uploaded successfully to backend server:", cloudinaryUrl);

      setUploadPct(100);
      setUploading(false);
      setFile({
        name: f.name,
        size: f.size,
        type: f.type,
        url: cloudinaryUrl
      });
      setStep("configure");
    } catch (err: any) {
      console.error("All upload attempts failed:", err);
      setUploadError(err?.message || "Failed to upload image. Please try again.");
      setUploading(false);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!file) return;
    if (!params.prompt.trim()) {
      setFormError("Please describe the transformation style.");
      return;
    }
    setFormError(null);
    setStep("generating");
    setProcStep(1);
    setProcPct(10);

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceVideoUrl: file.url,
          sourceVideoName: file.name,
          params
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to trigger transformation");
      }

      const { jobId } = await res.json();
      console.log("Queued job details successfully:", jobId);
      setProcStep(2);
      setProcPct(30);

      let progressVal = 30;
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/history?id=${jobId}`);
          if (!statusRes.ok) return;

          const job = await statusRes.json();
          if (job.status === "completed") {
            clearInterval(pollInterval);
            setProcStep(4);
            setProcPct(100);
            setResultJob(job);
            fetchHistory();
            setTimeout(() => {
              setStep("result");
            }, 500);
          } else if (job.status === "failed") {
            clearInterval(pollInterval);
            throw new Error(job.errorMessage || "Replicate image transformation failed");
          } else {
            progressVal = Math.min(progressVal + Math.random() * 4 + 1, 95);
            setProcPct(Math.round(progressVal));
            if (job.status === "processing") {
              setProcStep(3);
            }
          }
        } catch (e: any) {
          clearInterval(pollInterval);
          console.error("Polling error:", e);
          setFormError(e?.message || "Generation failed. Please try again.");
          setStep("configure");
        }
      }, 3000);

    } catch (err: any) {
      console.error("Generation submission error:", err);
      setFormError(err?.message || "Failed to submit transformation request.");
      setStep("configure");
    }
  }, [file, params, fetchHistory]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setParams({ ...DEFAULT_PARAMS });
    setUploading(false);
    setUploadPct(0);
    setUploadError(null);
    setFormError(null);
    setProcStep(0);
    setProcPct(0);
    setResultJob(null);
  }, []);

  return {
    step,
    setStep,
    file,
    params,
    setParams,
    historyJobs,
    resultJob,
    uploading,
    uploadPct,
    dragOver,
    setDragOver,
    uploadError,
    procStep,
    procPct,
    formError,
    processFile,
    handleGenerate,
    handleReset,
    fetchHistory,
  };
}
