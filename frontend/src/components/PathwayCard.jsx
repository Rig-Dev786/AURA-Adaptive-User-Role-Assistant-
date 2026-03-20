export default function PathwayCard({ pathway = [], totalHours = 0 }) {
  return (
    <div style={{ fontFamily: "'Sora', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ color: "#0f172a", margin: 0, fontSize: 18, fontWeight: 700 }}>
          Your Learning Pathway
        </h3>
        <div style={{
          background: "rgba(3,105,161,0.15)",
          border: "1px solid rgba(3,105,161,0.3)",
          borderRadius: 20, padding: "6px 16px",
          color: "var(--accent)", fontSize: 13, fontWeight: 600,
        }}>
          ⏱ {totalHours}h total
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute", left: 20, top: 0, bottom: 0,
          width: 2,
          background: "linear-gradient(to bottom, var(--primary), var(--accent), transparent)",
        }} />

        {pathway.map((step, i) => (
          <div key={step.course_id} style={{
            display: "flex", gap: 24, marginBottom: 20,
            animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
          }}>
            {/* Step number bubble */}
            <div style={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, var(--primary), var(--accent))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: "#1a160e",
              boxShadow: "0 4px 16px var(--primary-glow)",
              position: "relative", zIndex: 1,
            }}>{step.order}</div>

            {/* Card */}
            <div className="glass-panel hover-scale" style={{
              flex: 1, borderRadius: "var(--radius-md)", padding: "16px 20px",
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary-glow)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--glass-border)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h4 style={{ color: "#0f172a", margin: 0, fontSize: 15, fontWeight: 600 }}>
                  {step.title}
                </h4>
                <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                  <span style={{
                    background: "rgba(3,105,161,0.15)",
                    border: "1px solid rgba(3,105,161,0.3)",
                    color: "var(--primary)", fontSize: 11,
                    padding: "2px 10px", borderRadius: 20, fontWeight: 600,
                  }}>⏱ {step.duration_hours}h</span>
                  {step.url && (
                    <a href={step.url} target="_blank" rel="noreferrer" style={{
                      background: "rgba(2,132,199,0.15)",
                      border: "1px solid rgba(2,132,199,0.3)",
                      color: "var(--accent)", fontSize: 11,
                      padding: "2px 10px", borderRadius: 20, fontWeight: 600,
                      textDecoration: "none",
                    }}>↗ Link</a>
                  )}
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                {step.why}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
