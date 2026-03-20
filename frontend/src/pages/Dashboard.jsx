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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Sora', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
      `}</style>

      <Navbar user={user} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Upload Section */}
        <section style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24, padding: 32, marginBottom: 32,
        }}>
          <h2 style={{ color: "#fff", margin: "0 0 24px", fontSize: 20, fontWeight: 700 }}>
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
              <button onClick={handleExportPDF} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)", padding: "8px 20px",
                borderRadius: 10, fontSize: 13, cursor: "pointer",
                fontFamily: "'Sora', sans-serif",
              }}>⬇ Export PDF</button>
              <button onClick={handleSave} disabled={saving || saved} style={{
                background: saved ? "rgba(34,197,94,0.15)" : "linear-gradient(135deg, #6366f1, #a855f7)",
                border: saved ? "1px solid rgba(34,197,94,0.4)" : "none",
                color: saved ? "#86efac" : "#fff",
                padding: "8px 20px", borderRadius: 10, fontSize: 13,
                cursor: saving || saved ? "default" : "pointer",
                fontFamily: "'Sora', sans-serif",
              }}>
                {saved ? "✓ Saved" : saving ? "Saving..." : "💾 Save Analysis"}
              </button>
            </div>

            {/* Gap Display */}
            <section style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: 32, marginBottom: 24,
            }}>
              <GapDisplay result={result} />
            </section>

            {/* Reasoning */}
            <section style={{ marginBottom: 24 }}>
              <ReasoningPanel reasoning={result.reasoning} />
            </section>

            {/* Pathway */}
            <section style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24, padding: 32,
            }}>
              <PathwayCard pathway={result.pathway} totalHours={result.total_hours} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
