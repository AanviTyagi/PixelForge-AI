"use client";

import { useState } from "react";
import {
  Sliders,
  Type,
  Gauge,
  Layers,
  Hash,
  Monitor,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import type { TransformationParams } from "@/types";
import { DEFAULT_PARAMS } from "@/lib/mock-data";

interface ParametersFormProps {
  params: TransformationParams;
  onChange: (params: TransformationParams) => void;
}

interface SliderFieldProps {
  label: string;
  id: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  tooltip?: string;
  displayValue?: string;
}

function SliderField({
  label,
  id,
  icon,
  value,
  min,
  max,
  step,
  onChange,
  tooltip,
  displayValue,
}: SliderFieldProps) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <label
          htmlFor={id}
          className="form-label"
          style={{ display: "flex", alignItems: "center", gap: "0.375rem", margin: 0 }}
        >
          <span style={{ color: "var(--color-text-accent)" }}>{icon}</span>
          {label}
          {tooltip && (
            <span
              title={tooltip}
              style={{ cursor: "help", color: "var(--color-text-muted)" }}
            >
              <Info size={13} />
            </span>
          )}
        </label>
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--color-text-accent)",
            minWidth: "3rem",
            textAlign: "right",
          }}
        >
          {displayValue ?? value}
        </span>
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "0.25rem",
        }}
      >
        <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{min}</span>
        <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{max}</span>
      </div>
    </div>
  );
}

export function ParametersForm({ params, onChange }: ParametersFormProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const update = <K extends keyof TransformationParams>(
    key: K,
    value: TransformationParams[K]
  ) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Prompt */}
      <div>
        <label htmlFor="prompt-input" className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <Type size={15} style={{ color: "var(--color-text-accent)" }} />
          Transformation Prompt
        </label>
        <textarea
          id="prompt-input"
          className="form-input"
          placeholder="Describe how you want to transform the video… e.g. 'Convert to cyberpunk neon cityscape at night'"
          value={params.prompt}
          onChange={(e) => update("prompt", e.target.value)}
          rows={3}
          style={{ resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
        />
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.375rem" }}>
          Be descriptive — mention style, mood, colors, and atmosphere
        </p>
      </div>

      {/* Strength */}
      <SliderField
        label="Transformation Strength"
        id="strength-slider"
        icon={<Sliders size={14} />}
        value={params.strength}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => update("strength", v)}
        tooltip="Controls how much the original video changes. Higher = more dramatic transformation."
        displayValue={params.strength.toFixed(2)}
      />

      {/* Resolution & Video Length side by side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        {/* Resolution */}
        <div>
          <label htmlFor="resolution-select" className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Monitor size={14} style={{ color: "var(--color-text-accent)" }} />
            Resolution
          </label>
          <select
            id="resolution-select"
            className="form-input"
            value={params.resolution}
            onChange={(e) =>
              update("resolution", e.target.value as TransformationParams["resolution"])
            }
          >
            <option value="480p" style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-primary)" }}>480p — Fast</option>
            <option value="720p" style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-primary)" }}>720p — Balanced</option>
            <option value="1080p" style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-primary)" }}>1080p — Best Quality</option>
          </select>
        </div>

        {/* Video Length */}
        <div>
          <label htmlFor="video-length-select" className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Clock size={14} style={{ color: "var(--color-text-accent)" }} />
            Output Length
          </label>
          <select
            id="video-length-select"
            className="form-input"
            value={params.videoLength}
            onChange={(e) =>
              update("videoLength", e.target.value as TransformationParams["videoLength"])
            }
          >
            <option value="short" style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-primary)" }}>Short (~5s)</option>
            <option value="medium" style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-primary)" }}>Medium (~10s)</option>
            <option value="long" style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-primary)" }}>Long (~20s)</option>
          </select>
        </div>
      </div>

      {/* Advanced Settings toggle */}
      <button
        type="button"
        onClick={() => setAdvancedOpen(!advancedOpen)}
        id="advanced-settings-toggle"
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
          fontWeight: 500,
          fontFamily: "inherit",
          transition: "all var(--transition-fast)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sliders size={15} />
          Advanced Settings
        </span>
        {advancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Advanced Settings Panel */}
      {advancedOpen && (
        <div
          className="animate-fade-in-up"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            padding: "1.25rem",
            background: "var(--color-bg-glass-light)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          {/* Guidance Scale */}
          <SliderField
            label="Guidance Scale (CFG)"
            id="guidance-scale-slider"
            icon={<Gauge size={14} />}
            value={params.guidanceScale}
            min={1}
            max={20}
            step={0.5}
            onChange={(v) => update("guidanceScale", v)}
            tooltip="How closely the output follows your prompt. Higher = more faithful but less creative."
            displayValue={params.guidanceScale.toFixed(1)}
          />

          {/* Inference Steps */}
          <SliderField
            label="Inference Steps"
            id="inference-steps-slider"
            icon={<Layers size={14} />}
            value={params.numInferenceSteps}
            min={1}
            max={50}
            step={1}
            onChange={(v) => update("numInferenceSteps", Math.round(v))}
            tooltip="More steps = higher quality but longer processing time."
          />

          {/* Seed */}
          <div>
            <label htmlFor="seed-input" className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <Hash size={14} style={{ color: "var(--color-text-accent)" }} />
              Seed
              <span
                style={{
                  fontSize: "0.7rem",
                  background: "var(--color-bg-glass-light)",
                  border: "1px solid var(--color-border-default)",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "4px",
                  color: "var(--color-text-muted)",
                }}
              >
                Optional
              </span>
            </label>
            <input
              type="number"
              id="seed-input"
              className="form-input"
              placeholder="Leave blank for random"
              value={params.seed ?? ""}
              onChange={(e) =>
                update("seed", e.target.value ? parseInt(e.target.value) : undefined)
              }
              min={0}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.375rem" }}>
              Set a seed for reproducible results
            </p>
          </div>
        </div>
      )}

      {/* Reset to defaults */}
      <button
        type="button"
        id="reset-params-btn"
        onClick={() => onChange(DEFAULT_PARAMS)}
        style={{
          alignSelf: "flex-start",
          padding: "0.375rem 0.875rem",
          background: "transparent",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-sm)",
          color: "var(--color-text-muted)",
          cursor: "pointer",
          fontSize: "0.8rem",
          fontFamily: "inherit",
          transition: "all var(--transition-fast)",
        }}
      >
        Reset to defaults
      </button>
    </div>
  );
}
