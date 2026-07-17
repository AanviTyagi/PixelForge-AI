export function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-bg-secondary)",
        borderTop: "1px solid var(--color-border-subtle)",
        padding: "2.5rem 1.5rem",
        marginTop: "4rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated top divider glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, var(--color-accent-secondary) 40%, var(--color-highlight) 60%, transparent)",
          opacity: 0.5,
        }}
        aria-hidden="true"
      />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.125rem",
          textAlign: "center",
        }}
      >
        {/* Wordmark logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            transition: "filter var(--transition-base)",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.filter =
              "drop-shadow(0 0 10px rgba(0, 212, 170, 0.45))";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.filter = "none";
          }}
        >
          <img
            src="/logo.png"
            alt="MEAtec logo"
            style={{ height: "32px", width: "auto" }}
          />
        </div>

        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
            maxWidth: "480px",
            lineHeight: 1.7,
          }}
        >
          Powered by{" "}
          <a
            href="https://magichour.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--color-text-accent)",
              textDecoration: "none",
              borderBottom: "1px solid transparent",
              transition: "border-color var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderBottomColor =
                "var(--color-text-accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderBottomColor = "transparent";
            }}
          >
            Magic Hour AI
          </a>{" "}
          · Storage via{" "}
          <a
            href="https://cloudinary.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--color-text-accent)",
              textDecoration: "none",
              borderBottom: "1px solid transparent",
              transition: "border-color var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderBottomColor =
                "var(--color-text-accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderBottomColor = "transparent";
            }}
          >
            Cloudinary
          </a>
        </p>

        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", opacity: 0.6 }}>
          © {new Date().getFullYear()} MeaTech · Built with Next.js 15
        </p>
      </div>
    </footer>
  );
}
