import { useNavigate } from "react-router-dom";

export default function HistoryList({ analyses = [] }) {
  const navigate = useNavigate();

  if (analyses.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "60px 24px",
        color: "rgba(255,255,255,0.3)", fontFamily: "'Sora', sans-serif",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
        <p style={{ fontSize: 15 }}>No saved analyses yet.</p>
        <p style={{ fontSize: 13 }}>Run an analysis from the Dashboard to see it here.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", display: "flex", flexDirection: "column", gap: 12 }}>
      {analyses.map((a) => {
        const score = a.match_score || 0;
        const color = score > 60 ? "#10b981" : score > 30 ? "#f59e0b" : "#0891b2";
        return (
          <div key={a.analysis_id}
            onClick={() => navigate(`/history/${a.analysis_id}`)}
            className="glass-panel hover-scale"
            style={{
              borderRadius: "var(--radius-md)", padding: "16px 20px", display: "flex", 
              alignItems: "center", justifyContent: "space-between", cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Score circle */}
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                border: `3px solid ${color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color,
              }}>{score}%</div>

              <div>
                <p style={{ color: "#fff", margin: 0, fontWeight: 600, fontSize: 14 }}>
                  {a.job_title_guess || "Analysis"}
                </p>
                <p style={{ color: "rgba(255,255,255,0.35)", margin: 0, fontSize: 12, marginTop: 2 }}>
                  {new Date(a.created_at).toLocaleDateString()} ·{" "}
                  {a.gap_count} gap{a.gap_count !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>

            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}>→</span>
          </div>
        );
      })}
    </div>
  );
}
