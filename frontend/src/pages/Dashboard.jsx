import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";
import UploadPanel from "../components/UploadPanel";
import GapDisplay from "../components/GapDisplay";
import PathwayCard from "../components/PathwayCard";
import ReasoningPanel from "../components/ReasoningPanel";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function Dashboard() {
  const [user, setUser]     = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const resultRef = useRef();
  const navigate  = useNavigate();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/");
      else setUser(u);
    });
  }, []);

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${BACKEND}/save`,
        { analysis_id: result.analysis_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!resultRef.current) return;
    const canvas = await html2canvas(resultRef.current, { backgroundColor: "#f8fafc", scale: 1.5 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 1.5, canvas.height / 1.5] });
    pdf.addImage(img, "PNG", 0, 0, canvas.width / 1.5, canvas.height / 1.5);
    pdf.save(`AURA_Analysis_${result.analysis_id}.pdf`);
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* ── Decorative background accents ── */}
      <div style={{
        position: "fixed", top: "20%", right: "-10%",
        width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(3,105,161,0.07) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "10%", left: "-8%",
        width: 380, height: 380, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(2,132,199,0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <Navbar user={user} />

      <main style={{ maxWidth: 1140, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1 }}>

        {/* ══════════════ Hero strip ══════════════ */}
        <div className="animate-fade-up" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 32,
        }}>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {user ? `Welcome back, ${user.displayName?.split(" ")[0] || "there"} 👋` : "AI Career Intelligence"}
            </p>
            <h1 style={{ color: "var(--text-main)", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
              Your{" "}
              <span style={{
                background: "linear-gradient(135deg, #0369a1, #0284c7)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Career Intelligence
              </span>{" "}
              Dashboard
            </h1>
          </div>

          {/* Status pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 18px", borderRadius: 99,
            background: "rgba(2,132,199,0.1)",
            border: "1px solid rgba(2,132,199,0.25)",
            color: "rgba(2,132,199,0.85)", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.04em",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0284c7", display: "inline-block", animation: "status-pulse 2s ease-in-out infinite" }} />
            AI Engine Ready
          </div>
        </div>

        {/* ══════════════ Upload card ══════════════ */}
        <section className="glass-panel animate-fade-up" style={{
          borderRadius: "var(--radius-lg)",
          padding: "36px 40px",
          marginBottom: 32,
          position: "relative", overflow: "hidden",
          animationDelay: "0.05s",
        }}>
          {/* Card top-edge glow line */}
          <div style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(3,105,161,0.35), transparent)",
          }} />

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, rgba(3,105,161,0.3), rgba(2,132,199,0.2))",
              border: "1px solid rgba(2,132,199,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>✦</div>
            <div>
              <h2 style={{ color: "var(--text-main)", margin: 0, fontSize: 17, fontWeight: 700 }}>
                New Analysis
              </h2>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 12 }}>
                Upload your resume &amp; paste a job description to begin
              </p>
            </div>
          </div>

          <UploadPanel onResult={(r) => { setResult(r); setSaved(false); }} onLoading={setLoading} />
        </section>

        {/* ══════════════ Loading state ══════════════ */}
        {loading && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "72px 24px",
            gap: 20,
          }}>
            {/* Ripple spinner */}
            <div style={{ position: "relative", width: 64, height: 64 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: "2px solid rgba(2,132,199,0.15)",
                animation: "ripple 1.6s ease-out infinite",
              }} />
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: "2px solid rgba(2,132,199,0.1)",
                animation: "ripple 1.6s ease-out 0.5s infinite",
              }} />
              <div style={{
                position: "absolute", inset: 8, borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: "var(--accent)",
                borderRightColor: "var(--primary)",
                animation: "spin 0.9s linear infinite",
              }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "var(--text-main)", fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>
                Analyzing your profile…
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
                AI is mapping your skill gaps against the role
              </p>
            </div>
          </div>
        )}

        {/* ══════════════ Results ══════════════ */}
        {result && !loading && (
          <div ref={resultRef}>

            {/* ── Action bar ── */}
            <div className="animate-fade-up" style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 24, padding: "16px 20px",
              background: "rgba(3,105,161,0.06)",
              border: "1px solid rgba(2,132,199,0.15)",
              borderRadius: "var(--radius-md)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--accent)", boxShadow: "0 0 8px var(--accent-glow)",
                }} />
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  Analysis complete — <span style={{ color: "var(--accent)", fontWeight: 600 }}>ID: {result.analysis_id?.slice(0, 8)}…</span>
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-secondary" onClick={handleExportPDF} style={{
                  padding: "8px 18px", borderRadius: "var(--radius-sm)", fontSize: 13,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span>⬇</span> Export PDF
                </button>
                <button className="btn-primary" onClick={handleSave} disabled={saving || saved} style={{
                  padding: "8px 18px", borderRadius: "var(--radius-sm)", fontSize: 13,
                  background: saved ? "rgba(2,132,199,0.2)" : undefined,
                  border: saved ? "1px solid rgba(2,132,199,0.4)" : "none",
                  color: saved ? "#0284c7" : undefined,
                  opacity: (saving || saved) ? 0.85 : 1,
                  cursor: (saving || saved) ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {saved ? "✓ Saved" : saving ? "Saving…" : <><span>💾</span> Save Analysis</>}
                </button>
              </div>
            </div>

            {/* ── Gap Display ── */}
            <section className="glass-panel animate-fade-up" style={{
              borderRadius: "var(--radius-lg)", padding: "36px 40px",
              marginBottom: 24, position: "relative", overflow: "hidden",
              animationDelay: "0.1s",
            }}>
              <div style={{
                position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
                background: "linear-gradient(90deg, transparent, rgba(3,105,161,0.3), transparent)",
              }} />
              <SectionHeader icon="📊" title="Skill Gap Analysis" subtitle="Your profile vs. the role requirements" />
              <GapDisplay result={result} />
            </section>

            {/* ── Reasoning ── */}
            <section className="animate-fade-up" style={{ marginBottom: 24, animationDelay: "0.2s" }}>
              <ReasoningPanel reasoning={result.reasoning} />
            </section>

            {/* ── Pathway ── */}
            <section className="glass-panel animate-fade-up" style={{
              borderRadius: "var(--radius-lg)", padding: "36px 40px",
              position: "relative", overflow: "hidden",
              animationDelay: "0.3s",
            }}>
              <div style={{
                position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
                background: "linear-gradient(90deg, transparent, rgba(3,105,161,0.3), transparent)",
              }} />
              <SectionHeader icon="🗺️" title="Your Learning Pathway" subtitle="Personalized steps to close every gap" />
              <PathwayCard pathway={result.pathway} totalHours={result.total_hours} />
            </section>
          </div>
        )}

        {/* ══════════════ Empty state ══════════════ */}
        {!result && !loading && (
          <div className="animate-fade-up glass-panel" style={{
            borderRadius: "var(--radius-lg)", padding: "64px 32px",
            textAlign: "center", animationDelay: "0.2s",
          }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>🌊</div>
            <h3 style={{ color: "var(--text-main)", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
              Ready to chart your path
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0, lineHeight: 1.6, maxWidth: 340, marginInline: "auto" }}>
              Upload your resume and paste a job description above to get your
              personalized skill gap analysis and learning roadmap.
            </p>
          </div>
        )}

      </main>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes ripple  { 0% { transform: scale(0.9); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes status-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

/* Reusable section-header block */
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
      <div style={{
        width: 36, height: 36, borderRadius: "var(--radius-sm)",
        background: "linear-gradient(135deg, rgba(3,105,161,0.3), rgba(2,132,199,0.2))",
        border: "1px solid rgba(2,132,199,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <h2 style={{ color: "var(--text-main)", margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h2>
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 12 }}>{subtitle}</p>
      </div>
    </div>
  );
}
