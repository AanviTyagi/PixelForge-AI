"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, Film, X, CheckCircle, AlertCircle } from "lucide-react";
import { validateVideoFile, formatFileSize, ACCEPTED_VIDEO_TYPES } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface VideoUploaderProps {
  onVideoSelected: (file: File, previewUrl: string) => void;
  selectedFile: File | null;
  previewUrl: string | null;
  onClear: () => void;
}

export function VideoUploader({
  onVideoSelected,
  selectedFile,
  previewUrl,
  onClear,
}: VideoUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateVideoFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      const url = URL.createObjectURL(file);
      onVideoSelected(file, url);
    },
    [onVideoSelected]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          id="video-upload-zone"
          className={dragging ? "drag-active-border" : ""}
          style={{
            border: `2px dashed ${dragging ? "var(--color-accent-primary)" : "var(--color-border-default)"}`,
            borderRadius: "var(--radius-xl)",
            padding: "3rem 2rem",
            textAlign: "center",
            cursor: "pointer",
            transition: "all var(--transition-base)",
            background: dragging
              ? "linear-gradient(135deg, rgba(26,110,255,0.08), rgba(0,212,170,0.06))"
              : "var(--color-bg-glass-light)",
            transform: dragging ? "scale(1.015)" : "scale(1)",
            boxShadow: dragging ? "var(--shadow-blue)" : "none",
            position: "relative",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_VIDEO_TYPES.join(",")}
            onChange={handleInputChange}
            style={{ display: "none" }}
            id="video-file-input"
          />

          <div
            className={dragging ? "animate-float-3d" : "animate-float"}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(26,110,255,0.16), rgba(0,212,170,0.12))",
              border: "1px solid var(--color-border-blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              boxShadow: dragging ? "var(--shadow-glow)" : "0 0 20px rgba(26,110,255,0.15)",
              transition: "box-shadow var(--transition-base), background var(--transition-base)",
            }}
          >
            <UploadCloud
              size={34}
              style={{ color: dragging ? "var(--color-accent-primary)" : "var(--color-accent-secondary)" }}
            />
          </div>

          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: "0.5rem",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {dragging ? "Release to upload" : "Drop your video here"}
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              marginBottom: "1.375rem",
            }}
          >
            or click to browse files
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            {["MP4", "MOV", "WebM"].map((fmt) => (
              <span
                key={fmt}
                style={{
                  padding: "0.2rem 0.65rem",
                  background: "rgba(0,212,170,0.08)",
                  border: "1px solid rgba(0,212,170,0.20)",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  fontWeight: 500,
                }}
              >
                {fmt}
              </span>
            ))}
            <span
              style={{
                padding: "0.2rem 0.65rem",
                background: "rgba(255,181,71,0.08)",
                border: "1px solid rgba(255,181,71,0.20)",
                borderRadius: "999px",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                fontWeight: 500,
              }}
            >
              Max 500MB
            </span>
          </div>
        </div>
      ) : (
        <div
          className="glass-card"
          style={{ padding: "1.25rem", position: "relative" }}
        >
          <button
            onClick={onClear}
            id="clear-video-btn"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "var(--color-status-error-bg)",
              border: "1px solid var(--color-status-error)",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--color-status-error)",
              zIndex: 1,
              transition: "all var(--transition-fast)",
            }}
            aria-label="Remove video"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <X size={14} />
          </button>

          {/* Preview */}
          <video
            src={previewUrl!}
            controls
            style={{
              width: "100%",
              maxHeight: "280px",
              objectFit: "contain",
              borderRadius: "var(--radius-lg)",
              background: "#000",
              marginBottom: "1rem",
            }}
          />

          {/* File info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              className="animate-pulse-glow-blue"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "var(--radius-sm)",
                background: "linear-gradient(135deg, rgba(26,110,255,0.16), rgba(0,212,170,0.10))",
                border: "1px solid var(--color-border-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Film size={18} style={{ color: "var(--color-accent-secondary)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedFile.name}
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {formatFileSize(selectedFile.size)} ·{" "}
                {selectedFile.type.split("/")[1].toUpperCase()}
              </p>
            </div>
            <CheckCircle
              size={20}
              style={{ color: "var(--color-status-success)", flexShrink: 0 }}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          style={{
            marginTop: "0.75rem",
            padding: "0.75rem 1rem",
            background: "var(--color-status-error-bg)",
            border: "1px solid var(--color-status-error)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            animation: "fade-in-up 0.2s ease forwards",
          }}
        >
          <AlertCircle
            size={16}
            style={{ color: "var(--color-status-error)", flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: "0.875rem",
              color: "var(--color-status-error)",
            }}
          >
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
