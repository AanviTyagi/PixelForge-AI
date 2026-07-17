"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, History } from "lucide-react";
import type { TransformationJob, JobStatus } from "@/types";
import { HistoryCard } from "./HistoryCard";

interface HistoryGridProps {
  jobs: TransformationJob[];
}

const STATUS_FILTERS: { value: JobStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "processing", label: "Processing" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

export function HistoryGrid({ jobs }: HistoryGridProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  const filtered = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    return jobs.filter((job) => {
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      const matchesSearch =
        !debouncedSearch ||
        job.params.prompt.toLowerCase().includes(searchLower) ||
        job.sourceVideoName.toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [jobs, statusFilter, debouncedSearch]);

  /* Staggered scroll-reveal for grid cards */
  useEffect(() => {
    const els = document.querySelectorAll(".history-card-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const delay = el.dataset.delay ?? "0";
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "perspective(1200px) translateY(0) rotateX(0deg)";
            }, parseInt(delay));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filtered.length]);

  return (
    <div>
      {/* Filters */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "0.875rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search by prompt or filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.5rem" }}
            id="history-search"
          />
        </div>

        {/* Status filter pills */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={f.value}
                id={`filter-${f.value}`}
                onClick={() => setStatusFilter(f.value)}
                style={{
                  padding: "0.375rem 0.875rem",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all var(--transition-fast)",
                  background: active
                    ? "linear-gradient(135deg, rgba(26,110,255,0.15), rgba(0,212,170,0.10))"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(0,212,170,0.35)"
                    : "1px solid var(--color-border-default)",
                  color: active
                    ? "var(--color-text-accent)"
                    : "var(--color-text-muted)",
                  boxShadow: active ? "0 0 10px rgba(0,212,170,0.12)" : "none",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count */}
      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
          marginBottom: "1.25rem",
        }}
      >
        {filtered.length} {filtered.length === 1 ? "result" : "results"}
        {search && ` for "${search}"`}
      </p>

      {/* Grid with staggered reveal */}
      {filtered.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filtered.map((job, i) => (
            <div
              key={job.id}
              className="history-card-reveal"
              data-delay={String(i * 80)}
              style={{
                opacity: 0,
                transform: "perspective(1200px) translateY(24px) rotateX(5deg)",
                transition: "opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1), transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <HistoryCard job={job} />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            color: "var(--color-text-muted)",
          }}
        >
          <History size={48} style={{ margin: "0 auto 1rem", opacity: 0.35 }} />
          <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-secondary)" }}>No results found</p>
          <p style={{ fontSize: "0.875rem" }}>
            {search ? "Try a different search term" : "No transformations yet"}
          </p>
        </div>
      )}
    </div>
  );
}
