"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Upload, Cpu, Sparkles } from "lucide-react";
import type { GenerationProgress } from "@/types";

interface LoadingStateProps {
  progress: GenerationProgress;
}

const STEPS: { key: GenerationProgress["step"]; label: string; icon: React.ReactNode; description: string }[] = [
  {
    key: "uploading",
    label: "Uploading Image",
    icon: <Upload size={18} />,
    description: "Sending your image to cloud storage…",
  },
  {
    key: "processing",
    label: "AI Processing",
    icon: <Cpu size={18} />,
    description: "AI model is transforming your image…",
  },
  {
    key: "finalizing",
    label: "Finalizing",
    icon: <Sparkles size={18} />,
    description: "Uploading result and saving to your history…",
  },
  {
    key: "complete",
    label: "Complete!",
    icon: <CheckCircle2 size={18} />,
    description: "Your image has been transformed.",
  },
];

const STEP_ORDER: GenerationProgress["step"][] = ["uploading", "processing", "finalizing", "complete"];

export function LoadingState({ progress }: LoadingStateProps) {
  const currentIndex = STEP_ORDER.indexOf(progress.step);

  return (
    <div
      className="glass-card animate-fade-in-up"
      style={{ padding: "2.25rem", textAlign: "center" }}
    >
      {/* 3-ring orbital animation */}
      <div
        style={{
          position: "relative",
          width: "110px",
          height: "110px",
          margin: "0 auto 2rem",
        }}
      >
        {/* Outer ring — blue CW */}
        <div
          className="animate-spin-slow"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "var(--color-accent-secondary)",
            borderRightColor: "rgba(26,110,255,0.4)",
            animationDuration: "3.5s",
          }}
        />
        {/* Middle ring — teal CCW */}
        <div
          style={{
            position: "absolute",
            inset: "12px",
            borderRadius: "50%",
            border: "2px solid transparent",
            borderBottomColor: "var(--color-accent-primary)",
            borderLeftColor: "rgba(0,212,170,0.4)",
            animation: "spin-slow 2.2s linear infinite reverse",
          }}
        />
        {/* Inner ring — amber CW, fast */}
        <div
          style={{
            position: "absolute",
            inset: "26px",
            borderRadius: "50%",
            border: "1.5px solid transparent",
            borderTopColor: "var(--color-highlight)",
            borderRightColor: "rgba(255,181,71,0.3)",
            animation: "spin-slow 1.6s linear infinite",
          }}
        />
        {/* Core glow */}
        <div
          className="animate-pulse-glow-teal"
          style={{
            position: "absolute",
            inset: "38px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-accent-secondary), var(--color-accent-primary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <Sparkles size={16} />
        </div>
      </div>

      {/* Status text */}
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginBottom: "0.5rem",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {progress.message}
      </h3>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
          marginBottom: "2rem",
        }}
      >
        This may take 2–5 minutes. Please keep this tab open.
      </p>

      {/* Progress bar with shimmer */}
      <div
        style={{
          height: "5px",
          background: "rgba(26,110,255,0.12)",
          borderRadius: "3px",
          marginBottom: "2rem",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress.percent}%`,
            background: "linear-gradient(90deg, var(--color-accent-secondary), var(--color-accent-primary), var(--color-highlight))",
            borderRadius: "3px",
            transition: "width 1.1s cubic-bezier(0.23, 1, 0.32, 1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Shimmer overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s infinite",
            }}
          />
        </div>
        {/* Glow dot at leading edge */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: `${progress.percent}%`,
            transform: "translate(-50%, -50%)",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "var(--color-highlight)",
            boxShadow: "0 0 10px var(--color-highlight-glow)",
            transition: "left 1.1s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </div>

      {/* Step indicators */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          textAlign: "left",
        }}
      >
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div
              key={step.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-sm)",
                background: isActive
                  ? "linear-gradient(135deg, rgba(26,110,255,0.10), rgba(0,212,170,0.07))"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(0, 212, 170, 0.28)"
                  : "1px solid transparent",
                transition: "all var(--transition-base)",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDone
                    ? "var(--color-status-success-bg)"
                    : isActive
                    ? "rgba(0, 212, 170, 0.14)"
                    : "var(--color-bg-glass-light)",
                  border: `1px solid ${
                    isDone
                      ? "var(--color-status-success)"
                      : isActive
                      ? "var(--color-border-accent)"
                      : "var(--color-border-default)"
                  }`,
                  color: isDone
                    ? "var(--color-status-success)"
                    : isActive
                    ? "var(--color-text-accent)"
                    : "var(--color-text-muted)",
                  transition: "all var(--transition-base)",
                }}
              >
                {isDone ? <CheckCircle2 size={16} /> : isActive ? <Loader2 size={16} className="animate-spin" /> : step.icon}
              </div>

              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 600 : 400,
                    color: isDone
                      ? "var(--color-status-success)"
                      : isActive
                      ? "var(--color-text-primary)"
                      : "var(--color-text-muted)",
                    transition: "color var(--transition-base)",
                  }}
                >
                  {step.label}
                </p>
                {isActive && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-text-muted)",
                      marginTop: "0.125rem",
                      animation: "slide-in-right 0.3s ease forwards",
                    }}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
