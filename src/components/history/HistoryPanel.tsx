"use client";
import React, { useState, useEffect, memo, useMemo } from "react";
import {
  X, Search, Image as ImageIcon, CheckCircle, Loader2, AlertCircle, Clock, Download,
} from "lucide-react";
import type { TransformationJob, JobStatus } from "@/types";

import { downloadImage } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
type FilterKey = "all" | JobStatus;

// ── Status theme map ─────────────────────────────────────────────────────────
const STATUS_COLOR: Record<JobStatus, string> = {
  completed:  "var(--color-status-success)",
  processing: "var(--color-accent-primary)",
  failed:     "var(--color-status-error)",
  pending:    "var(--color-status-warning)",
};

const STATUS_BG: Record<JobStatus, string> = {
  completed:  "rgba(2, 195, 154, 0.1)",
  processing: "rgba(2, 128, 144, 0.18)",
  failed:     "rgba(255, 107, 122, 0.09)",
  pending:    "rgba(240, 243, 189, 0.08)",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtMs(ms?: number) {
  if (!ms) return null;
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
}

// ── Single job card ───────────────────────────────────────────────────────────
const JobCard = memo(function JobCard({ job }: { job: TransformationJob }) {
  const isComplete = job.status === "completed";
  const isRunning  = job.status === "processing";
  const dur = fmtMs(job.durationMs);

  const StatusIcon =
    isComplete ? CheckCircle :
    isRunning  ? Loader2     :
    job.status === "failed" ? AlertCircle : Clock;

  return (
    <article
      style={{
        background: "rgba(2, 128, 144, 0.08)",
        border: "1px solid rgba(2, 195, 154, 0.13)",
        borderRadius: "0.875rem",
        overflow: "hidden",
        transition: "border-color 0.15s ease",
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(2, 195, 154, 0.28)")}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(2, 195, 154, 0.13)")}
    >
      {/* ── Before → After thumbnail row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr", height: "68px" }}>
        {/* Before */}
        <div style={{
          background: "rgba(1, 20, 28, 0.45)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "0.2rem",
        }}>
          <ImageIcon size={14} color="rgba(2, 195, 154, 0.45)" />
          <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "rgba(240,243,189,0.3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Source
          </span>
        </div>

        {/* Arrow */}
        <div style={{
          background: "rgba(2, 128, 144, 0.22)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--color-accent-primary)", fontWeight: 800, fontSize: "0.8rem",
        }}>
          →
        </div>

        {/* After */}
        <div style={{
          background: isComplete ? "rgba(2, 195, 154, 0.1)" : STATUS_BG[job.status],
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "0.2rem",
        }}>
          <StatusIcon
            size={14}
            color={STATUS_COLOR[job.status]}
            className={isRunning ? "anim-spin" : ""}
          />
          <span style={{
            fontSize: "0.58rem", fontWeight: 700,
            color: STATUS_COLOR[job.status],
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            {isComplete ? "Output" : job.status}
          </span>
        </div>
      </div>

      {/* ── Metadata ── */}
      <div style={{ padding: "0.75rem 0.875rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
          {/* Left: name + prompt + tags */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: "0.8125rem", fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: "0 0 0.1rem",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {job.sourceVideoName}
            </p>
            <p style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              margin: "0 0 0.5rem",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              fontStyle: "italic",
            }}>
              "{job.params.prompt}"
            </p>

            {/* Parameter tags */}
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {[
                `Str ${job.params.strength}`,
                job.params.resolution,
                dur,
              ].filter(Boolean).map(tag => (
                <span key={String(tag)} style={{
                  fontSize: "0.6rem", fontWeight: 600,
                  background: "rgba(2, 128, 144, 0.2)",
                  border: "1px solid rgba(2, 195, 154, 0.1)",
                  borderRadius: "0.3rem",
                  padding: "0.1rem 0.4rem",
                  color: "var(--color-text-muted)",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: status badge + date + download */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "flex-end", gap: "0.3rem", flexShrink: 0,
          }}>
            <span style={{
              display: "flex", alignItems: "center", gap: "0.2rem",
              fontSize: "0.6rem", fontWeight: 700,
              color: STATUS_COLOR[job.status],
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {job.status}
            </span>
            <span style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>
              {fmtDate(job.createdAt)}
            </span>
            {isComplete && job.outputVideoUrl && (
              <button
                type="button"
                onClick={() => downloadImage(job.outputVideoUrl, `transformed-${job.id}.png`)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.2rem",
                  fontSize: "0.68rem", fontWeight: 600,
                  color: "var(--color-highlight)",
                  background: "rgba(240, 243, 189, 0.07)",
                  border: "1px solid rgba(240, 243, 189, 0.18)",
                  borderRadius: "0.35rem",
                  padding: "0.18rem 0.45rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Download size={10} /> Get
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {job.errorMessage && (
          <p style={{
            marginTop: "0.5rem", fontSize: "0.7rem",
            color: "var(--color-status-error)",
            background: "rgba(255,107,122,0.07)",
            border: "1px solid rgba(255,107,122,0.15)",
            borderRadius: "0.45rem",
            padding: "0.3rem 0.5rem",
          }}>
            ⚠ {job.errorMessage}
          </p>
        )}
      </div>
    </article>
  );
});

// ── Panel ─────────────────────────────────────────────────────────────────────
interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

const TABS: Array<{ key: FilterKey; label: string }> = [
  { key: "all",        label: "All" },
  { key: "completed",  label: "Done" },
  { key: "processing", label: "Running" },
  { key: "pending",    label: "Queued" },
  { key: "failed",     label: "Failed" },
];

export function HistoryPanel({ open, onClose }: HistoryPanelProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [jobs, setJobs] = useState<TransformationJob[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchJobs();
    }
  }, [open]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return jobs.filter(job => {
      const matchStatus = filter === "all" || job.status === filter;
      const matchSearch =
        !q ||
        job.params.prompt.toLowerCase().includes(q) ||
        job.sourceVideoName.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [jobs, filter, debouncedSearch]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(1, 20, 28, 0.55)",
          zIndex: 49,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
      />

      {/* ── Slide-over panel ── */}
      <aside
        role="dialog"
        aria-label="Transformation history"
        aria-modal
        style={{
          position: "fixed",
          top: 0, right: 0, bottom: 0,
          width: "min(420px, 100vw)",
          background: "#012d3a",
          borderLeft: "1px solid rgba(2, 195, 154, 0.13)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "-12px 0 48px rgba(1, 20, 28, 0.55)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "1.1rem 1.25rem",
          borderBottom: "1px solid rgba(2, 195, 154, 0.1)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
              Transformation History
            </h2>
            <p style={{ fontSize: "0.725rem", color: "var(--color-text-muted)", margin: "0.125rem 0 0" }}>
              {jobs.length} total jobs
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{
              background: "transparent", border: "none",
              color: "var(--color-text-muted)", cursor: "pointer",
              padding: "0.375rem", borderRadius: "0.5rem",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search + Filter */}
        <div style={{
          padding: "0.875rem 1.25rem",
          borderBottom: "1px solid rgba(2, 195, 154, 0.08)",
          flexShrink: 0,
          display: "flex", flexDirection: "column", gap: "0.6rem",
        }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{
              position: "absolute", left: "0.7rem", top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)", pointerEvents: "none",
            }} />
            <input
              type="search"
              placeholder="Search prompt or filename…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="workflow-input"
              style={{
                width: "100%",
                background: "rgba(2, 128, 144, 0.1)",
                border: "1px solid rgba(2, 195, 154, 0.14)",
                borderRadius: "0.5rem",
                padding: "0.45rem 0.75rem 0.45rem 2rem",
                color: "var(--color-text-primary)",
                fontSize: "0.8rem",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  background: filter === tab.key ? "var(--color-accent-primary)" : "transparent",
                  border: `1px solid ${filter === tab.key ? "var(--color-accent-primary)" : "rgba(2,195,154,0.18)"}`,
                  borderRadius: "999px",
                  color: filter === tab.key ? "var(--color-text-on-accent)" : "var(--color-text-muted)",
                  fontSize: "0.68rem", fontWeight: 600,
                  padding: "0.18rem 0.6rem",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s ease", whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job list */}
        <div
          className="history-scroll"
          style={{
            flex: 1, overflowY: "auto",
            padding: "0.875rem 1.25rem",
            display: "flex", flexDirection: "column", gap: "0.6rem",
          }}
        >
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", gap: "0.5rem" }}>
              <Loader2 size={24} className="anim-spin" color="var(--color-accent-primary)" />
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Loading history...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <ImageIcon size={28} style={{ color: "var(--color-text-muted)", margin: "0 auto 0.75rem", opacity: 0.35 }} />
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
                {search ? "No results" : "No transformations yet"}
              </p>
            </div>
          ) : (
            filtered.map(job => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </aside>
    </>
  );
}

// Re-export for use in full history page
export { JobCard };
