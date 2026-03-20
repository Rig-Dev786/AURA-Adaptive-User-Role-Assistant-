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
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const resultRef = useRef();
  const navigate = useNavigate();

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
    const canvas = await html2canvas(resultRef.current, { backgroundColor: "#0f0c29", scale: 1.5 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 1.5, canvas.height / 1.5] });
    pdf.addImage(img, "PNG", 0, 0, canvas.width / 1.5, canvas.height / 1.5);
    pdf.save(`AURA_Analysis_${result.analysis_id}.pdf`);
  };

  return (
    <div className="dashboard-container">

      <Navbar user={user} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Upload Section */}
        <section className="glass-panel animate-fade-up" style={{
          borderRadius: "var(--radius-lg)", padding: 32, marginBottom: 32,
        }}>
          <h2 style={{ color: "var(--text-main)", margin: "0 0 24px", fontSize: 20, fontWeight: 700 }}>
            ✦ New Analysis
          </h2>
          <UploadPanel onResult={(r) => { setResult(r); setSaved(false); }} onLoading={setLoading} />
        </section>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              border: "3px solid rgba(99,102,241,0.2)",
              borderTopColor: "#6366f1",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 20px",
            }} />
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
              Analyzing your profile...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div ref={resultRef}>
            {/* Actions bar */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 20 }}>
              <button className="btn-secondary" onClick={handleExportPDF} style={{
                padding: "8px 20px", borderRadius: "var(--radius-sm)", fontSize: 13
              }}>⬇ Export PDF</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving || saved} style={{
                background: saved ? "var(--success)" : undefined,
                padding: "8px 20px", borderRadius: "var(--radius-sm)", fontSize: 13,
                opacity: (saving || saved) ? 0.7 : 1, cursor: (saving || saved) ? "default" : "pointer"
              }}>
                {saved ? "✓ Saved" : saving ? "Saving..." : "💾 Save Analysis"}
              </button>
            </div>

            {/* Gap Display */}
            <section className="glass-panel animate-fade-up" style={{
              borderRadius: "var(--radius-lg)", padding: 32, marginBottom: 24,
              animationDelay: "0.1s"
            }}>
              <GapDisplay result={result} />
            </section>

            {/* Reasoning */}
            <section style={{ marginBottom: 24 }}>
              <ReasoningPanel reasoning={result.reasoning} />
            </section>

            {/* Pathway */}
            <section className="glass-panel animate-fade-up" style={{
              borderRadius: "var(--radius-lg)", padding: 32,
              animationDelay: "0.3s"
            }}>
              <PathwayCard pathway={result.pathway} totalHours={result.total_hours} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
