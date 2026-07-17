"use client";

import { useState, useRef } from "react";
import {
  Play,
  Clock,
  Zap,
  AlertCircle,
  Loader2,
  CheckCircle,
  Timer,
  Film,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
} from "lucide-react";
import type { TransformationJob, JobStatus } from "@/types";
import { formatDate, formatDuration, downloadVideo } from "@/lib/utils";

interface HistoryCardProps {
  job: TransformationJob;
}

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  completed: {
    label: "Completed",
    icon: <CheckCircle size={12} />,
    className: "badge badge-completed",
  },
  processing: {
    label: "Processing",
    icon: <Loader2 size={12} className="animate-spin" />,
    className: "badge badge-processing",
  },
  pending: {
    label: "Pending",
    icon: <Timer size={12} />,
    className: "badge badge-pending",
  },
  failed: {
    label: "Failed",
    icon: <AlertCircle size={12} />,
    className: "badge badge-failed",
  },
};

export function HistoryCard({ job }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [videoHovered, setVideoHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const status = STATUS_CONFIG[job.status];

  const handleMouseEnter = () => {
    setVideoHovered(true);
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    setVideoHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const paramChips = [
    { label: "Strength", value: job.params.strength.toFixed(2) },
    { label: "CFG", value: job.params.guidanceScale },
    { label: "Steps", value: job.params.numInferenceSteps },
    { label: "Resolution", value: job.params.resolution },
  ];

  return (
    <div
      className="glass-card card-3d"
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Video thumbnail area */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          background: "#000",
          overflow: "hidden",
          cursor: job.outputVideoUrl ? "pointer" : "default",
        }}
        onMouseEnter={job.outputVideoUrl ? handleMouseEnter : undefined}
        onMouseLeave={job.outputVideoUrl ? handleMouseLeave : undefined}
      >
        {job.outputVideoUrl ? (
          <>
            <video
              ref={videoRef}
              src={job.outputVideoUrl}
              muted
              loop
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 0,
                transition: "transform var(--transition-slow)",
                transform: videoHovered ? "scale(1.05)" : "scale(1)",
              }}
            />
            {/* Play overlay */}
            {!videoHovered && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.28)",
                  transition: "background var(--transition-base)",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(26,110,255,0.85), rgba(0,212,170,0.70))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 0 20px rgba(26,110,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Play size={20} fill="white" color="white" style={{ marginLeft: "2px" }} />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Placeholder for non-completed jobs */
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(26,110,255,0.08), rgba(0,212,170,0.06))",
              gap: "0.5rem",
            }}
          >
            <Film size={32} style={{ color: "var(--color-text-muted)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              {job.status === "processing"
                ? "Processing…"
                : job.status === "pending"
                ? "Queued"
                : "Generation failed"}
            </span>
          </div>
        )}

        {/* Status badge overlay */}
        <div style={{ position: "absolute", top: "0.625rem", left: "0.625rem" }}>
          <span className={status.className}>
            {status.icon}
            {status.label}
          </span>
        </div>

        {/* Duration badge */}
        {job.durationMs && (
          <div
            style={{
              position: "absolute",
              top: "0.625rem",
              right: "0.625rem",
              padding: "0.2rem 0.5rem",
              background: "rgba(0,0,0,0.6)",
              borderRadius: "4px",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              backdropFilter: "blur(4px)",
            }}
          >
            {formatDuration(job.durationMs)}
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {/* File name */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <Film size={15} style={{ color: "var(--color-text-muted)", marginTop: "2px", flexShrink: 0 }} />
          <div>
            <p
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "220px",
              }}
            >
              {job.sourceVideoName}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              {formatDate(job.createdAt)}
            </p>
          </div>
        </div>

        {/* Prompt */}
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--color-text-secondary)",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          &ldquo;{job.params.prompt}&rdquo;
        </p>

        {/* Error message */}
        {job.status === "failed" && job.errorMessage && (
          <div
            style={{
              padding: "0.5rem 0.75rem",
              background: "var(--color-status-error-bg)",
              border: "1px solid var(--color-status-error)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              gap: "0.375rem",
              alignItems: "flex-start",
            }}
          >
            <AlertCircle
              size={13}
              style={{ color: "var(--color-status-error)", marginTop: "1px", flexShrink: 0 }}
            />
            <p style={{ fontSize: "0.78rem", color: "var(--color-status-error)", lineHeight: 1.5 }}>
              {job.errorMessage}
            </p>
          </div>
        )}

        {/* Param chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {paramChips.map((chip) => (
            <span
              key={chip.label}
              style={{
                padding: "0.15rem 0.5rem",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "999px",
                fontSize: "0.72rem",
                color: "var(--color-text-muted)",
              }}
            >
              {chip.label}: <strong style={{ color: "var(--color-text-accent)" }}>{chip.value}</strong>
            </span>
          ))}
        </div>

        {/* Actions */}
        {job.outputVideoUrl && (
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
            <button
              type="button"
              onClick={() => downloadVideo(job.outputVideoUrl, `transformed-${job.id}.mp4`)}
              className="btn-primary"
              style={{ flex: 1, fontSize: "0.8rem", padding: "0.5rem 0.75rem", border: "none", cursor: "pointer" }}
            >
              <Download size={14} />
              Download
            </button>
            <a
              href={job.outputVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}
            >
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
