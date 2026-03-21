import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const SEV = (s) => s > 0.8 ? { color:"#ef4444", label:"Critical" }
                 : s > 0.5 ? { color:"#f97316", label:"Moderate" }
                           : { color:"#eab308", label:"Minor" };

export default function History() {
  const [user, setUser]         = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
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
        setLoading(false);
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

  const scoreColor = (s) => s > 60 ? "#10b981" : s > 30 ? "#f97316" : "#ef4444";

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg-main)" }}>
      <Sidebar user={user} />

      <main style={{ marginLeft:240, flex:1, padding:"36px 40px" }}>
        {/* Header */}
        <div style={{ marginBottom:32, animation:"fadeUp 0.5s ease both" }}>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.8px", color:"var(--text-primary)", margin:0, fontFamily:"var(--font-display)" }}>History</h1>
          <p style={{ fontSize:14, color:"var(--text-muted)", marginTop:6 }}>View and revisit your past gap analyses and learning pathways.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:24, alignItems:"start" }}>

          {/* Left — list */}
          <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden", animation:"fadeUp 0.5s ease 0.05s both" }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>
              Past Sessions
            </div>
            <div style={{ maxHeight:"calc(100vh - 240px)", overflowY:"auto" }}>
              {loading ? (
                <p style={{ padding:24, color:"var(--text-muted)", fontSize:13 }}>Loading analyses...</p>
              ) : analyses.length === 0 ? (
                <div style={{ padding:"48px 24px", textAlign:"center" }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>📂</div>
                  <p style={{ color:"var(--text-muted)", fontSize:13 }}>No past analyses yet.</p>
                  <p style={{ color:"var(--text-muted)", fontSize:12, marginTop:4 }}>Run an analysis from the Dashboard first.</p>
                </div>
              ) : analyses.map((ana, i) => {
                const isActive = selected?.analysis_id === ana.analysis_id;
                const d = new Date(ana.created_at);
                const score = Math.round(ana.match_score || 0);
                return (
                  <div key={ana.analysis_id || i}
                    onClick={() => loadDetail(ana.analysis_id)}
                    style={{
                      padding:"14px 20px", borderBottom:"1px solid var(--border)",
                      cursor:"pointer", transition:"all 0.2s",
                      background: isActive ? "var(--brand-light)" : "transparent",
                      borderLeft: isActive ? `3px solid var(--brand)` : "3px solid transparent",
                    }}
                    onMouseEnter={e => { if(!isActive) e.currentTarget.style.background="var(--bg-main)"; }}
                    onMouseLeave={e => { if(!isActive) e.currentTarget.style.background="transparent"; }}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>
                          Match: <span style={{ color:scoreColor(score) }}>{score}%</span>
                        </div>
                        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:3 }}>
                          {d.toLocaleDateString()} · {d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                        </div>
                        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:1 }}>
                          {ana.gap_count ?? 0} gaps found
                        </div>
                      </div>
                      <div style={{
                        width:38, height:38, borderRadius:"50%",
                        border:`2px solid ${scoreColor(score)}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:11, fontWeight:800, color:scoreColor(score), flexShrink:0,
                      }}>{score}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — detail */}
          <div style={{ animation:"fadeUp 0.5s ease 0.1s both" }}>
            {!selected ? (
              <div style={{
                background:"var(--bg-card)", border:"1px solid var(--border)",
                borderRadius:16, padding:"80px 24px",
                textAlign:"center", color:"var(--text-muted)",
              }}>
                <div style={{ fontSize:40, marginBottom:16 }}>👈</div>
                <p style={{ fontSize:15, fontWeight:500 }}>Select an analysis to view details</p>
                <p style={{ fontSize:13, marginTop:6, opacity:0.7 }}>Your full gap analysis and learning pathway will appear here.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Score header */}
                <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"24px 28px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <h3 style={{ margin:0, fontSize:18, fontWeight:800, color:"var(--text-primary)", letterSpacing:"-0.5px" }}>Analysis Details</h3>
                      <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:4 }}>ID: {selected.analysis_id}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:36, fontWeight:800, color:scoreColor(selected.match_score), letterSpacing:"-1px" }}>{Math.round(selected.match_score)}%</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:700 }}>MATCH SCORE</div>
                    </div>
                  </div>
                  {/* Mini stat row */}
                  <div style={{ display:"flex", gap:20, marginTop:20, paddingTop:16, borderTop:"1px solid var(--border)" }}>
                    {[
                      { label:"Gaps Found",    value:selected.gaps?.length ?? 0,         color:"#ef4444" },
                      { label:"Total Hours",   value:`${selected.total_hours ?? 0}h`,     color:"var(--brand)" },
                      { label:"Courses",       value:selected.pathway?.length ?? 0,       color:"#8b5cf6" },
                    ].map(({ label, value, color })=>(
                      <div key={label} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:20, fontWeight:800, color }}>{value}</div>
                        <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, marginTop:2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaps */}
                {selected.gaps?.length > 0 && (
                  <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
                    <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>Skill Gaps</div>
                    <div style={{ padding:"16px 20px", display:"flex", flexWrap:"wrap", gap:10 }}>
                      {selected.gaps.map(g => {
                        const sev = SEV(g.gap_severity);
                        return (
                          <span key={g.skill} style={{
                            display:"inline-flex", alignItems:"center", gap:8,
                            background:"var(--bg-main)", border:`1px solid var(--border)`,
                            padding:"7px 14px", borderRadius:10,
                            fontSize:13, fontWeight:500, color:"var(--text-primary)",
                            borderLeft:`3px solid ${sev.color}`,
                          }}>
                            {g.skill}
                            <span style={{ fontSize:11, color:sev.color, fontWeight:600 }}>{Math.round(g.gap_severity*100)}%</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pathway */}
                {selected.pathway?.length > 0 && (
                  <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
                    <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>
                      Learning Pathway · {selected.total_hours}h total
                    </div>
                    <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:10 }}>
                      {selected.pathway.map(step => (
                        <div key={step.course_id} style={{
                          display:"flex", gap:14, alignItems:"flex-start",
                          padding:"12px 16px", background:"var(--bg-main)",
                          border:"1px solid var(--border)", borderRadius:12,
                        }}>
                          <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:"linear-gradient(135deg,#0891b2,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff" }}>{step.order}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                              <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>{step.title}</div>
                              <div style={{ display:"flex", gap:6, flexShrink:0, marginLeft:8 }}>
                                <span style={{ fontSize:11, fontWeight:600, color:"var(--brand)", background:"var(--brand-light)", border:"1px solid var(--brand-border)", borderRadius:20, padding:"2px 10px" }}>⏱ {step.duration_hours}h</span>
                                {step.url && <a href={step.url} target="_blank" rel="noreferrer" style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:600, color:"#059669", textDecoration:"none" }}>Free ↗</a>}
                              </div>
                            </div>
                            <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.6, marginTop:4 }}>{step.why}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                {selected.reasoning && (
                  <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"20px 24px" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--brand)", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:12 }}>AI Reasoning</div>
                    <p style={{ fontSize:14, color:"var(--text-primary)", lineHeight:1.8, margin:0, borderLeft:"3px solid var(--brand)", paddingLeft:16 }}>{selected.reasoning}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
