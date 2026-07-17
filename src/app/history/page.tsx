"use client";

import { useState, useEffect } from "react";
import { Loader2, Film } from "lucide-react";
import { TopBar } from "@/components/ui/TopBar";
import { HistoryGrid } from "@/components/history/HistoryGrid";
import type { TransformationJob } from "@/types";

export default function HistoryPage() {
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
    fetchJobs();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)" }}>
      <TopBar backHref="/" />

      <main
        className="animate-reveal-up"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)", margin: "0 0 0.35rem", letterSpacing: "-0.025em" }}>
            Transformation History
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", margin: 0 }}>
            {jobs.length} jobs · Quick-access side panel is also available on the main page.
          </p>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 1rem", gap: "0.5rem" }}>
            <Loader2 size={32} className="animate-spin" color="var(--color-accent-primary)" />
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>Loading history from database...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
            <Film size={36} style={{ color: "var(--color-text-muted)", margin: "0 auto 1rem", opacity: 0.3 }} />
            <p style={{ color: "var(--color-text-muted)", fontSize: "1rem", margin: 0 }}>
              No transformations yet.
            </p>
          </div>
        ) : (
          <HistoryGrid jobs={jobs} />
        )}
      </main>
    </div>
  );
}
