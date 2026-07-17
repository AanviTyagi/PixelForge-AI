"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Menu, X, Video } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", label: "Transform", icon: <Video size={15} /> },
  { href: "/history", label: "History", icon: <History size={15} /> },
];

/** MeaTech wordmark logo */
function MeaTechLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const teal = "var(--color-logo-teal)";
  const light = "var(--color-text-primary)";
  const scale = size === "sm" ? 0.75 : 1;
  const height = 32 * scale;
  const fontSize = 26 * scale;
  const dotSize = 5 * scale;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: `${height}px`,
        userSelect: "none",
        transition: "filter var(--transition-base)",
      }}
    >
      {/* MEA in teal */}
      <span
        style={{
          fontFamily: "'Space Grotesk', 'Raleway', sans-serif",
          fontWeight: 900,
          fontSize: `${fontSize}px`,
          color: teal,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        M
      </span>
      {/* Dot between M and E */}
      <span
        style={{
          display: "inline-block",
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: "50%",
          background: teal,
          margin: `0 ${1.5 * scale}px`,
          flexShrink: 0,
          alignSelf: "center",
          marginBottom: `${2 * scale}px`,
        }}
      />
      <span
        style={{
          fontFamily: "'Space Grotesk', 'Raleway', sans-serif",
          fontWeight: 900,
          fontSize: `${fontSize}px`,
          color: teal,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        A
      </span>
      {/* tec in light */}
      <span
        style={{
          fontFamily: "'Space Grotesk', 'Raleway', sans-serif",
          fontWeight: 700,
          fontSize: `${fontSize * 0.88}px`,
          color: light,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          marginLeft: `${2 * scale}px`,
          opacity: 0.9,
        }}
      >
        tec
      </span>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "var(--color-bg-overlay)" : "rgba(10, 15, 30, 0.72)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: scrolled
          ? "1px solid rgba(26, 110, 255, 0.22)"
          : "1px solid var(--color-border-subtle)",
        boxShadow: scrolled
          ? "0 4px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(26, 110, 255, 0.08)"
          : "none",
        transition: "background var(--transition-base), border-color var(--transition-base), box-shadow var(--transition-slow)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            filter: "none",
            transition: "filter var(--transition-base)",
          }}
          aria-label="MeaTech AI Home"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.filter =
              "drop-shadow(0 0 8px rgba(0, 212, 170, 0.5))";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.filter = "none";
          }}
        >
          <MeaTechLogo size="md" />
          <span
            style={{
              marginLeft: "0.5rem",
              fontSize: "0.62rem",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              paddingLeft: "0.5rem",
              borderLeft: "1px solid var(--color-border-default)",
              lineHeight: 1,
            }}
          >
            AI Studio
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          className="hidden sm:flex"
        >
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.875rem",
                  fontWeight: active ? 700 : 500,
                  color: active ? "var(--color-highlight)" : "var(--color-text-secondary)",
                  background: active
                    ? "rgba(255, 181, 71, 0.10)"
                    : "transparent",
                  textDecoration: "none",
                  transition: "all var(--transition-fast)",
                  border: active
                    ? "1px solid rgba(255, 181, 71, 0.28)"
                    : "1px solid transparent",
                  letterSpacing: "0.01em",
                  position: "relative",
                }}
              >
                <span style={{ opacity: active ? 1 : 0.7 }}>{link.icon}</span>
                {link.label}
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: "-1px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60%",
                      height: "2px",
                      background: "linear-gradient(90deg, transparent, var(--color-highlight), transparent)",
                      borderRadius: "1px",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: menuOpen ? "var(--color-bg-glass-light)" : "transparent",
            border: "1px solid",
            borderColor: menuOpen ? "var(--color-border-accent)" : "transparent",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            padding: "0.5rem",
            display: "none",
            borderRadius: "var(--radius-sm)",
            transition: "all var(--transition-fast)",
          }}
          className="flex sm:hidden"
          aria-label="Toggle navigation"
          id="nav-menu-toggle"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            background: "var(--color-bg-secondary)",
            borderTop: "1px solid var(--color-border-default)",
            padding: "1rem 1.5rem",
            animation: "fade-in-up 0.18s ease forwards",
          }}
          className="sm:hidden"
        >
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  color: active ? "var(--color-highlight)" : "var(--color-text-secondary)",
                  fontWeight: active ? 700 : 500,
                  textDecoration: "none",
                  background: active ? "rgba(255, 181, 71, 0.10)" : "transparent",
                  marginBottom: "0.25rem",
                  fontSize: "0.95rem",
                  border: active ? "1px solid rgba(255, 181, 71, 0.22)" : "1px solid transparent",
                  transition: "all var(--transition-fast)",
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
