import React from "react";

export const palette = {
  ink: "#0F1B2A",
  panel: "#15233A",
  raised: "#1C2D49",
  hairline: "#2A3B57",
  gold: "#C9A24B",
  green: "#2E6B4F",
  red: "#B3491F",
  parchment: "#EDE6D6",
  slate: "#93A1B8",
};

export const fontDisplay = "'Source Serif 4', Georgia, 'Times New Roman', serif";
export const fontBody = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
export const fontMono = "'IBM Plex Mono', 'Courier New', monospace";

export function formatClock(ms) {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      * { box-sizing: border-box; }
      ::selection { background: ${palette.gold}; color: ${palette.ink}; }
      .focus-ring:focus-visible { outline: 2px solid ${palette.gold}; outline-offset: 2px; }
      @media (prefers-reduced-motion: reduce) { *{ animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  );
}

export function Stamp({ children, tone = "slate" }) {
  const tones = {
    green: { c: palette.green, bg: "rgba(46,107,79,0.16)" },
    gold: { c: palette.gold, bg: "rgba(201,162,75,0.14)" },
    red: { c: palette.red, bg: "rgba(179,73,31,0.16)" },
    slate: { c: palette.slate, bg: "rgba(147,161,184,0.12)" },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        fontFamily: fontMono,
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: t.c,
        background: t.bg,
        border: `1px solid ${t.c}55`,
        borderRadius: 4,
        padding: "3px 7px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function statusTone(status) {
  if (["SCORED", "ANSWERED", "COMPLETED"].includes(status)) return "green";
  if (["OPEN", "SCHEDULED", "IN_PROGRESS", "PENDING"].includes(status)) return "gold";
  if (["FAILED", "EXPIRED", "CLOSED"].includes(status)) return "red";
  return "slate";
}

export function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="12" cy="12" r="9" stroke={palette.gold} strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke={palette.gold} strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function PageShell({ eyebrow, title, subtitle, children }) {
  return (
    <div style={{ background: palette.ink, color: palette.parchment, fontFamily: fontBody, minHeight: "100%" }}>
      <GlobalStyle />
      <div style={{ borderBottom: `1px solid ${palette.hairline}`, background: palette.panel }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "22px 20px 18px" }}>
          {eyebrow && (
            <div
              style={{
                color: palette.gold,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {eyebrow}
            </div>
          )}
          <h1 style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 600, margin: 0, lineHeight: 1.15 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: palette.slate, fontSize: 13.5, margin: "4px 0 0" }}>{subtitle}</p>
          )}
        </div>
      </div>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 20px 64px" }}>{children}</div>
    </div>
  );
}

export function CenteredNotice({ icon, title, body }) {
  return (
    <div style={{ paddingTop: 64, maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
      {icon}
      <h2 style={{ fontFamily: fontDisplay, fontSize: 20, margin: "14px 0 8px" }}>{title}</h2>
      <p style={{ color: palette.slate, fontSize: 13.5, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}
