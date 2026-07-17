"use client";

import { useState, useRef } from "react";
import { UploadCloud, Film, X, CheckCircle, Loader2, AlertCircle, Zap } from "lucide-react";
import { TopBar } from "@/components/ui/TopBar";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { ParametersForm } from "@/components/transform/ParametersForm";
import { LoadingState } from "@/components/result/LoadingState";
import { ResultPreview } from "@/components/result/ResultPreview";
import { useVideoTransform } from "@/hooks/useVideoTransform";
import type { GenerationProgress } from "@/types";

// Helper size formatter
const fmtSize = (b: number) =>
  b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1e3).toFixed(0)} KB`;

const cardStyle: React.CSSProperties = {
  background: "rgba(2, 128, 144, 0.1)",
  border: "1px solid rgba(2, 195, 154, 0.16)",
  borderRadius: "1rem",
  padding: "1.75rem 1.875rem",
  boxShadow: "0 2px 12px rgba(1, 20, 28, 0.22)",
};

const mapProcToProgress = (procStep: number, procPct: number): GenerationProgress => {
  let stepKey: GenerationProgress["step"] = "uploading";
  let message = "Initializing...";

  if (procStep === 0 || procStep === 1) {
    stepKey = "uploading";
    message = "Initializing & uploading video...";
  } else if (procStep === 2) {
    stepKey = "processing";
    message = "Processing video frames...";
  } else if (procStep === 3) {
    stepKey = "processing";
    message = "Rendering output...";
  } else if (procStep === 4) {
    stepKey = "finalizing";
    message = "Finalizing output...";
  }

  return {
    step: stepKey,
    percent: procPct,
    message,
  };
};

export default function HomePage() {
  const {
    step,
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
  } = useVideoTransform();

  const [historyOpen, setHistoryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }}>
      <TopBar
        onHistoryOpen={() => setHistoryOpen(true)}
        historyCount={historyJobs.length}
      />

      {/* STATE: upload */}
      {step === "upload" && (
        <main
          id="upload-section"
          className="animate-reveal-up"
          style={{
            minHeight: "calc(100vh - 52px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2.5rem 1.25rem",
          }}
        >
          {/* App tagline */}
          <div style={{ textAlign: "center", marginBottom: "2.75rem", maxWidth: "480px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              background: "rgba(2, 195, 154, 0.08)",
              border: "1px solid rgba(2, 195, 154, 0.2)",
              borderRadius: "999px",
              padding: "0.3rem 0.875rem",
              marginBottom: "1.25rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--color-accent-primary)",
              letterSpacing: "0.02em",
            }}>
              <Zap size={12} />
              Powered by Google GenAI
            </div>
            <h1 style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: 900,
              color: "var(--color-text-primary)",
              margin: "0 0 0.875rem",
              lineHeight: 1.07,
              letterSpacing: "-0.03em",
            }}>
              AI Image<br />
              <span style={{ color: "var(--color-accent-primary)" }}>Transformation</span>
            </h1>
            <p style={{
              fontSize: "1.0625rem",
              color: "var(--color-text-secondary)",
              margin: 0,
              lineHeight: 1.6,
            }}>
              Upload your image, describe the style —<br />
              Google GenAI does the rest in seconds.
            </p>
          </div>

          {/* Upload zone / Progress */}
          {uploading ? (
            <div style={{
              width: "100%",
              maxWidth: "540px",
              background: "rgba(2, 128, 144, 0.08)",
              border: "1px solid rgba(2, 195, 154, 0.22)",
              borderRadius: "1rem",
              padding: "2.5rem 2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
            }}>
              <div style={{
                width: "52px", height: "52px",
                borderRadius: "50%",
                background: "rgba(2, 195, 154, 0.1)",
                border: "1px solid rgba(2, 195, 154, 0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Loader2 size={24} color="var(--color-accent-primary)" className="animate-spin" />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 0.25rem" }}>
                  Uploading your image…
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
                  {Math.round(uploadPct)}% complete
                </p>
              </div>
              <div style={{ width: "100%", height: "4px", background: "rgba(2, 128, 144, 0.2)", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  className="progress-bar-fill"
                  style={{ height: "100%", width: `${uploadPct}%` }}
                />
              </div>
            </div>
          ) : (
            <div
              id="upload-zone"
              className="upload-zone"
              role="button"
              tabIndex={0}
              aria-label="Upload image. Click or drag and drop."
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragEnter={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
              style={{
                width: "100%",
                maxWidth: "540px",
                minHeight: "240px",
                background: dragOver ? "rgba(2, 195, 154, 0.07)" : "rgba(2, 128, 144, 0.05)",
                border: `2px dashed ${dragOver ? "rgba(2, 195, 154, 0.65)" : "rgba(2, 195, 154, 0.25)"}`,
                borderRadius: "1rem",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.875rem",
                padding: "3rem 2rem",
                userSelect: "none",
              }}
            >
              <div style={{
                width: "62px", height: "62px",
                borderRadius: "50%",
                background: dragOver ? "rgba(2, 195, 154, 0.14)" : "rgba(2, 128, 144, 0.12)",
                border: `1px solid ${dragOver ? "rgba(2, 195, 154, 0.4)" : "rgba(2, 195, 154, 0.18)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease",
              }}>
                <UploadCloud
                  size={26}
                  color={dragOver ? "var(--color-accent-primary)" : "rgba(2, 195, 154, 0.65)"}
                  strokeWidth={1.75}
                />
              </div>

              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 0.3rem", letterSpacing: "-0.01em" }}>
                  {dragOver ? "Drop to upload" : "Drop your image here"}
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
                  or{" "}
                  <span style={{ color: "var(--color-accent-primary)", fontWeight: 600 }}>
                    click to browse files
                  </span>
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", justifyContent: "center" }}>
                {["PNG", "JPG", "JPEG", "Max 10 MB"].map(f => (
                  <span key={f} style={{
                    fontSize: "0.6875rem", fontWeight: 600,
                    background: "rgba(2, 128, 144, 0.18)",
                    border: "1px solid rgba(2, 195, 154, 0.13)",
                    borderRadius: "0.375rem",
                    padding: "0.18rem 0.5rem",
                    color: "var(--color-text-muted)",
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Upload error */}
          {uploadError && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              color: "var(--color-status-error)",
              fontSize: "0.875rem",
              marginTop: "0.875rem",
            }}>
              <AlertCircle size={15} />
              {uploadError}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            style={{ display: "none" }}
            aria-hidden
          />

          {/* Trust row */}
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "2.25rem", opacity: 0.45 }}>
            {[
              { icon: "⚡", text: "Hunyuan-Video AI" },
              { icon: "☁", text: "Cloud processing" },
              { icon: "🔒", text: "Secure upload" },
            ].map(b => (
              <div key={b.text} style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.725rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                <span>{b.icon}</span> {b.text}
              </div>
            ))}
          </div>
        </main>
      )}

      {/* STATE: configure */}
      {step === "configure" && file && (
        <main
          id="configure-section"
          className="animate-reveal-up"
          style={{ maxWidth: "660px", margin: "0 auto", padding: "2rem 1.25rem 5rem" }}
        >
          {/* Compact file strip */}
          <div
            className="animate-reveal-up"
            style={{
              display: "flex", alignItems: "center", gap: "0.875rem",
              background: "rgba(2, 195, 154, 0.07)",
              border: "1px solid rgba(2, 195, 154, 0.2)",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              marginBottom: "2rem",
            }}
          >
            <div style={{
              width: "38px", height: "38px",
              borderRadius: "0.5rem",
              background: "rgba(2, 195, 154, 0.13)",
              border: "1px solid rgba(2, 195, 154, 0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <CheckCircle size={18} color="var(--color-accent-primary)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 0.1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {file.name}
              </p>
              <p style={{ fontSize: "0.725rem", color: "var(--color-text-muted)", margin: 0 }}>
                {fmtSize(file.size)} · {file.type.split("/")[1]?.toUpperCase()} · Ready to configure
              </p>
            </div>
            <button
              onClick={handleReset}
              aria-label="Remove file"
              style={{ background: "transparent", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "0.375rem", borderRadius: "0.5rem", display: "flex", flexShrink: 0 }}
            >
              <X size={17} />
            </button>
          </div>

          {/* Section heading */}
          <div className="animate-reveal-up-delay-1" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 0.3rem", letterSpacing: "-0.025em" }}>
              Configure Transformation
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
              Describe the visual style you want to apply.
            </p>
          </div>

          {/* Form card */}
          <div className="animate-reveal-up-delay-2" style={cardStyle}>
            <ParametersForm params={params} onChange={setParams} />

            {/* Form validation error */}
            {formError && (
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                color: "var(--color-status-error)",
                fontSize: "0.8125rem",
                background: "rgba(255, 107, 122, 0.07)",
                border: "1px solid rgba(255, 107, 122, 0.18)",
                borderRadius: "0.5rem",
                padding: "0.625rem 0.75rem",
                marginTop: "1rem",
              }}>
                <AlertCircle size={14} />
                {formError}
              </div>
            )}

            {/* Generate CTA */}
            <div style={{ marginTop: "1.75rem" }}>
              <button
                id="generate-btn"
                onClick={handleGenerate}
                style={{
                  width: "100%",
                  background: "var(--color-highlight)",
                  color: "var(--color-text-on-highlight)",
                  border: "none",
                  borderRadius: "0.75rem",
                  padding: "0.9375rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "opacity 0.15s ease, transform 0.15s ease",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
              >
                <Zap size={18} strokeWidth={2.25} />
                Generate Transformation
              </button>
              <p style={{ textAlign: "center", fontSize: "0.725rem", color: "var(--color-text-muted)", marginTop: "0.75rem" }}>
                Processing takes a few seconds via Gemini · Results saved automatically
              </p>
            </div>
          </div>
        </main>
      )}

      {/* STATE: generating */}
      {step === "generating" && (
        <main
          id="processing-section"
          className="animate-reveal-up"
          style={{
            maxWidth: "540px",
            margin: "0 auto",
            padding: "4rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ width: "100%" }}>
            <LoadingState progress={mapProcToProgress(procStep, procPct)} />
          </div>
        </main>
      )}

      {/* STATE: result */}
      {step === "result" && resultJob && (
        <main
          id="result-section"
          className="animate-reveal-up"
          style={{ maxWidth: "660px", margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}
        >
          <ResultPreview job={resultJob} onTransformAnother={handleReset} />
        </main>
      )}

      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
}
