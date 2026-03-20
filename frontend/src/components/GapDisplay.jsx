import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

const SEVERITY_COLOR = (s) => s > 0.8 ? "#ef4444" : s > 0.5 ? "#f59e0b" : "#10b981";
const SEVERITY_LABEL = (s) => s > 0.8 ? "Critical" : s > 0.5 ? "Moderate" : "Minor";

export default function GapDisplay({ result }) {
  const { user_skills = [], jd_skills = [], gaps = [], match_score = 0 } = result;
  const strong = jd_skills.filter(s => !gaps.find(g => g.skill === s));
  const scoreColor = match_score > 60 ? "#10b981" : match_score > 30 ? "#f59e0b" : "#ef4444";

  return (
    <div>
      {/* Match Score Hero */}
      <div className="glass-panel" style={{
        borderRadius: "var(--radius-lg)", padding: "32px",
        display: "flex", alignItems: "center", gap: 40,
        marginBottom: 24,
      }}>
        <div style={{ width: 140, height: 140, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%"
              data={[{ value: match_score, fill: scoreColor }]}
              startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "rgba(8,145,178,0.08)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ textAlign: "center", marginTop: -80, position: "relative" }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "var(--text-main)" }}>{match_score}%</span>
            <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0 }}>Match Score</p>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ color: "var(--text-main)", margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>
            Role Readiness Overview
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>
            You match <strong style={{ color: "var(--accent)" }}>{strong.length}</strong> of{" "}
            <strong style={{ color: "var(--accent)" }}>{jd_skills.length}</strong> required skills.{" "}
            <strong style={{ color: "var(--primary)" }}>{gaps.length}</strong> gap(s) identified.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Skills You Have", value: user_skills.length, color: "#10b981" },
              { label: "Role Requires",   value: jd_skills.length,  color: "#0891b2" },
              { label: "Gaps Found",      value: gaps.length,        color: "#ef4444" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: `${color}12`,
                border: `1px solid ${color}33`,
                borderRadius: 12, padding: "12px 20px", textAlign: "center",
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Three Column View */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <SkillBox title="✅ You Have"   color="#10b981" skills={user_skills.map(s => ({ name: s }))} />
        <SkillBox title="🎯 Role Needs" color="#0891b2" skills={jd_skills.map(s => ({ name: s }))} />

        {/* Gaps */}
        <div style={{
          background: "rgba(8,145,178,0.06)",
          border: "1px solid rgba(8,145,178,0.22)",
          borderRadius: "var(--radius-md)", padding: 20,
        }}>
          <h4 style={{
            color: "var(--primary)", margin: "0 0 16px", fontSize: 13,
            fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase"
          }}>
            ⚡ Skill Gaps
          </h4>
          {gaps.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No gaps found!</p>
          ) : gaps.map((g) => (
            <div key={g.skill} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 10, padding: "8px 12px",
              background: "rgba(240,249,255,0.03)",
              borderRadius: 8,
              borderLeft: `3px solid ${SEVERITY_COLOR(g.gap_severity)}`,
            }}>
              <span style={{ color: "var(--text-main)", fontSize: 13 }}>{g.skill}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                background: `${SEVERITY_COLOR(g.gap_severity)}20`,
                color: SEVERITY_COLOR(g.gap_severity),
                border: `1px solid ${SEVERITY_COLOR(g.gap_severity)}44`,
              }}>
                {SEVERITY_LABEL(g.gap_severity)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillBox({ title, color, skills }) {
  return (
    <div className="glass-panel" style={{
      background: `${color}0d`,
      borderColor: `${color}28`,
      borderRadius: "var(--radius-md)", padding: 20,
    }}>
      <h4 style={{
        color, margin: "0 0 16px", fontSize: 13,
        fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase"
      }}>
        {title}
      </h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {skills.map(({ name }) => (
          <span key={name} style={{
            background: `${color}18`, color: "var(--text-main)",
            border: `1px solid ${color}30`,
            borderRadius: 20, padding: "4px 12px",
            fontSize: 12, fontWeight: 500,
          }}>{name}</span>
        ))}
      </div>
    </div>
  );
}
