"use client";

import { useState } from "react";
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Zap,
  Monitor,
  Film,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { TransformationJob } from "@/types";
import { formatDate, formatDuration, downloadVideo } from "@/lib/utils";

interface ResultPreviewProps {
  job: TransformationJob;
  onTransformAnother: () => void;
}

export function ResultPreview({ job, onTransformAnother }: ResultPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [paramsOpen, setParamsOpen] = useState(false);

  const handleCopy = async () => {
    if (!job.outputVideoUrl) return;
    await navigator.clipboard.writeText(job.outputVideoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paramChips = [
    { label: "Strength", value: job.params.strength.toFixed(2) },
    { label: "CFG", value: job.params.guidanceScale },
    { label: "Steps", value: job.params.numInferenceSteps },
    { label: "Resolution", value: job.params.resolution },
    { label: "Length", value: job.params.videoLength },
    ...(job.params.seed !== undefined
      ? [{ label: "Seed", value: job.params.seed }]
      : []),
  ];

  return (
    <div className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Success banner with animated gradient border */}
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "var(--color-status-success-bg)",
          border: "1px solid var(--color-status-success)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle shimmer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(0,212,170,0.08) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2.5s infinite",
          }}
          aria-hidden="true"
        />
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "rgba(0, 212, 170, 0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Zap size={18} style={{ color: "var(--color-status-success)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "var(--color-status-success)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Transformation Complete!
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            Completed in {job.durationMs ? formatDuration(job.durationMs) : "—"} · {formatDate(job.completedAt ?? job.createdAt)}
          </p>
        </div>
      </div>

      {/* Video player */}
      <div
        className="glass-card"
        style={{ padding: "1rem" }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "0.75rem",
          }}
        >
          Transformed Output
        </p>
        <video
          src={job.outputVideoUrl}
          controls
          style={{
            width: "100%",
            borderRadius: "var(--radius-lg)",
            background: "#000",
            maxHeight: "360px",
          }}
          id="result-video-player"
        />

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => downloadVideo(job.outputVideoUrl, `transformed-${job.id}.mp4`)}
            className="btn-primary"
            style={{ flex: "1", minWidth: "140px", border: "none", cursor: "pointer" }}
            id="download-result-btn"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={handleCopy}
            className="btn-secondary"
            style={{ flex: "1", minWidth: "140px" }}
            id="copy-url-btn"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy URL"}
          </button>
          <a
            href={job.outputVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: "0.75rem" }}
            id="open-external-btn"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Prompt used */}
      <div
        style={{
          padding: "1rem",
          background: "linear-gradient(135deg, rgba(26,110,255,0.07), rgba(0,212,170,0.05))",
          border: "1px solid var(--color-border-blue)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.375rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Prompt used
        </p>
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", fontStyle: "italic", lineHeight: 1.65 }}>
          &ldquo;{job.params.prompt}&rdquo;
        </p>
      </div>

      {/* Params summary toggle */}
      <button
        type="button"
        onClick={() => setParamsOpen(!paramsOpen)}
        id="params-summary-toggle"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "0.75rem 1rem",
          background: "var(--color-bg-glass-light)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-sm)",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontFamily: "inherit",
          transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-accent)";
          (e.currentTarget as HTMLElement).style.color = "var(--color-text-accent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-default)";
          (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
        }}
      >
        <span style={{ fontWeight: 500 }}>Generation Parameters</span>
        {paramsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {paramsOpen && (
        <div
          className="animate-fade-in-up"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            padding: "1rem",
            background: "var(--color-bg-glass-light)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          {paramChips.map((chip) => (
            <span
              key={chip.label}
              style={{
                display: "inline-flex",
                gap: "0.375rem",
                padding: "0.3rem 0.75rem",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "999px",
                fontSize: "0.8rem",
                transition: "all var(--transition-fast)",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-accent)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 8px var(--color-accent-glow)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-default)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>{chip.label}:</span>
              <span style={{ fontWeight: 600, color: "var(--color-text-accent)" }}>
                {chip.value}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Transform another */}
      <button
        onClick={onTransformAnother}
        className="btn-secondary"
        id="transform-another-btn"
        style={{ width: "100%" }}
      >
        <RotateCcw size={16} />
        Transform Another Video
      </button>
    </div>
  );
}
