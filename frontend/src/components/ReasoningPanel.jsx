import { useState } from "react";

export default function ReasoningPanel({ reasoning }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass-panel" style={{
      background: "rgba(3,105,161,0.05)",
      borderColor: "rgba(3,105,161,0.2)",
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
            color: "var(--primary)", fontSize: 13, fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase"
          }}>
            Reasoning Trace
          </span>
        </div>
        <span style={{
          color: "rgba(15,23,42,0.4)", fontSize: 18,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s",
          display: "inline-block",
        }}>⌄</span>
      </button>

      {/* Content */}
      {open && (
        <div style={{ padding: "0 20px 20px" }}>
          <p style={{
            color: "var(--text-muted)",
            fontSize: 14, lineHeight: 1.8, margin: 0,
            borderLeft: "3px solid rgba(3,105,161,0.5)",
            paddingLeft: 16,
          }}>
            {reasoning}
          </p>
        </div>
      )}
    </div>
  );
}
