import { useState } from "react";

export default function ReasoningPanel({ reasoning }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass-panel" style={{
      background: "rgba(168,85,247,0.05)",
      borderColor: "rgba(168,85,247,0.2)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
    }}>
      {/* Accordion header */}
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "16px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "transparent", border: "none", cursor: "pointer",
        fontFamily: "'Sora', sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>🧠</span>
          <span style={{
            color: "#d8b4fe", fontSize: 13, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase"
          }}>
            Reasoning Trace
          </span>
        </div>
        <span style={{
          color: "rgba(255,255,255,0.4)", fontSize: 18,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s",
          display: "inline-block",
        }}>⌄</span>
      </button>

      {/* Content */}
      {open && (
        <div style={{ padding: "0 20px 20px" }}>
          <p style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 14, lineHeight: 1.8, margin: 0,
            borderLeft: "3px solid rgba(168,85,247,0.4)",
            paddingLeft: 16,
          }}>
            {reasoning}
          </p>
        </div>
      )}
    </div>
  );
}
