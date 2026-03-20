import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";
import HistoryList from "../components/HistoryList";
import GapDisplay from "../components/GapDisplay";
import PathwayCard from "../components/PathwayCard";
import ReasoningPanel from "../components/ReasoningPanel";
import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function History() {
  const [user, setUser] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { navigate("/"); return; }
      setUser(u);
      try {
        const token = await u.getIdToken();
        const { data } = await axios.get(`${BACKEND}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalyses(data.analyses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingList(false);
      }
    });
  }, []);

  const loadDetail = async (analysisId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const { data } = await axios.get(`${BACKEND}/history/${analysisId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelected(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="history-container">
      <Navbar user={user} />

      <main style={{
        maxWidth: 1100, margin: "0 auto", padding: "40px 24px",
        display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start"
      }}>

        {/* Left — list */}
        <section className="glass-panel" style={{
          borderRadius: "var(--radius-lg)", padding: 24,
          position: "sticky", top: 80,
        }}>
          <h2 style={{ color: "#fff", margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>
            📂 Past Analyses
          </h2>
          {loadingList ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading...</p>
          ) : (
            <HistoryList analyses={analyses} onSelect={loadDetail} />
          )}
        </section>

        {/* Right — detail */}
        <div>
          {!selected ? (
            <div style={{
              textAlign: "center", padding: "80px 24px",
              color: "rgba(255,255,255,0.25)", fontSize: 14,
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
              Select an analysis from the list to view details.
            </div>
          ) : (
            <>
              <section className="glass-panel animate-fade-up" style={{
                borderRadius: "var(--radius-lg)", padding: 32, marginBottom: 24,
              }}>
                <GapDisplay result={selected} />
              </section>
              <section style={{ marginBottom: 24 }}>
                <ReasoningPanel reasoning={selected.reasoning} />
              </section>
              <section className="glass-panel animate-fade-up" style={{
                borderRadius: "var(--radius-lg)", padding: 32,
                animationDelay: "0.2s"
              }}>
                <PathwayCard pathway={selected.pathway} totalHours={selected.total_hours} />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
