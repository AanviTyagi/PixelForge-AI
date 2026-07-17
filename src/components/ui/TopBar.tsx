"use client";
import Link from "next/link";
import { History } from "lucide-react";

interface TopBarProps {
  onHistoryOpen?: () => void;
  historyCount?: number;
  /** When true, shows a "← Back" link instead of the history button */
  backHref?: string;
}

/** Minimal 52 px application top bar — replaces the traditional Navbar. */
export function TopBar({ onHistoryOpen, historyCount = 0, backHref }: TopBarProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.25rem",
        background: "var(--color-bg-primary)",
        borderBottom: "1px solid rgba(2, 195, 154, 0.1)",
      }}
    >
      {/* ── Logo ── */}
      <Link
        href="/"
        aria-label="MeaTech AI Studio — home"
        style={{ display: "flex", alignItems: "center", gap: "0.2rem", textDecoration: "none" }}
      >
        <span style={{ fontWeight: 900, fontSize: "1.2rem", color: "var(--color-logo-teal)", letterSpacing: "-0.05em", lineHeight: 1 }}>
          M
        </span>
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: "var(--color-logo-teal)",
            flexShrink: 0,
            marginBottom: "2px",
          }}
        />
        <span style={{ fontWeight: 900, fontSize: "1.2rem", color: "var(--color-logo-teal)", letterSpacing: "-0.05em", lineHeight: 1 }}>
          A
        </span>
        <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginLeft: "3px" }}>
          tec
        </span>
        <span
          style={{
            fontSize: "0.58rem",
            fontWeight: 600,
            color: "var(--color-text-muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginLeft: "0.625rem",
            paddingLeft: "0.625rem",
            borderLeft: "1px solid rgba(2, 195, 154, 0.18)",
            lineHeight: 1,
          }}
        >
          AI Studio
        </span>
      </Link>

      {/* ── Right actions ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
        {backHref && (
          <Link
            href={backHref}
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              textDecoration: "none",
            }}
          >
            ← Back
          </Link>
        )}

        {onHistoryOpen && (
          <button
            id="open-history-btn"
            onClick={onHistoryOpen}
            aria-label="View transformation history"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              background: "transparent",
              border: "1px solid rgba(2, 195, 154, 0.18)",
              borderRadius: "0.5rem",
              color: "rgba(240, 243, 189, 0.6)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              padding: "0.3rem 0.75rem",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={e => {
              const b = e.currentTarget;
              b.style.borderColor = "rgba(2, 195, 154, 0.45)";
              b.style.color = "var(--color-text-primary)";
            }}
            onMouseLeave={e => {
              const b = e.currentTarget;
              b.style.borderColor = "rgba(2, 195, 154, 0.18)";
              b.style.color = "rgba(240, 243, 189, 0.6)";
            }}
          >
            <History size={14} strokeWidth={2} />
            <span>History</span>
            {historyCount > 0 && (
              <span
                style={{
                  background: "var(--color-accent-primary)",
                  color: "var(--color-text-on-accent)",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  borderRadius: "999px",
                  padding: "0.05rem 0.35rem",
                  lineHeight: 1.5,
                  minWidth: "16px",
                  textAlign: "center",
                }}
              >
                {historyCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
