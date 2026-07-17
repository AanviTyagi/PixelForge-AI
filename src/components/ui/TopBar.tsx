"use client";
import Link from "next/link";
import Image from "next/image";
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
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
      }}
    >
      {/* ── Logo ── */}
      <Link
        href="/"
        aria-label="MEAtec AI Studio — home"
        style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}
      >
        <Image
          src="/logo.svg"
          alt="MEAtec logo"
          width={108}
          height={32}
          priority
          style={{ height: "32px", width: "auto" }}
        />
        <span
          style={{
            fontSize: "0.58rem",
            fontWeight: 600,
            color: "var(--color-text-muted)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            paddingLeft: "0.625rem",
            borderLeft: "1px solid var(--color-border)",
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
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
              color: "var(--color-text-body)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              padding: "0.3rem 0.75rem",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color 0.15s ease, background 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={e => {
              const b = e.currentTarget;
              b.style.borderColor = "var(--color-primary)";
              b.style.background = "var(--color-surface-hover)";
              b.style.color = "var(--color-primary)";
            }}
            onMouseLeave={e => {
              const b = e.currentTarget;
              b.style.borderColor = "var(--color-border)";
              b.style.background = "transparent";
              b.style.color = "var(--color-text-body)";
            }}
          >
            <History size={14} strokeWidth={2} />
            <span>History</span>
            {historyCount > 0 && (
              <span
                style={{
                  background: "var(--color-primary)",
                  color: "#ffffff",
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
