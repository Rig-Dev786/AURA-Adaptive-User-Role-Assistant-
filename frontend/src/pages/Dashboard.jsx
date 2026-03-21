import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Sidebar from "../components/Sidebar";
import UploadPanel from "../components/UploadPanel";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const SEV = (s) => s > 0.8
  ? { color:"#ef4444", bg:"rgba(239,68,68,0.08)", label:"Critical" }
  : s > 0.5
  ? { color:"#f97316", bg:"rgba(249,115,22,0.08)", label:"Moderate" }
  : { color:"#eab308", bg:"rgba(234,179,8,0.08)",  label:"Minor" };

// ── Metric card
function MetricCard({ label, value, sub, accent="#0891b2", delay=0 }) {
  return (
    <div style={{
      background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16,
      padding:"20px 24px", position:"relative", overflow:"hidden",
      animation:`fadeUp 0.5s ease ${delay}s both`,
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${accent},${accent}88)`, borderRadius:"16px 16px 0 0" }}/>
      <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:30, fontWeight:800, color:"var(--text-primary)", letterSpacing:"-1px", lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:6 }}>{sub}</div>}
    </div>
  );
}

// ── Skill pill
function SkillPill({ name, type }) {
  const C = {
    strong:  { bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.3)",  text:"#065f46" },
    missing: { bg:"rgba(239,68,68,0.08)",  border:"rgba(239,68,68,0.25)",  text:"#991b1b" },
    weak:    { bg:"rgba(249,115,22,0.08)", border:"rgba(249,115,22,0.25)", text:"#9a3412" },
    jd:      { bg:"var(--brand-light)",    border:"var(--brand-border)",   text:"var(--brand)" },
  }[type] || {};
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      background:C.bg, border:`1px solid ${C.border}`,
      borderRadius:20, padding:"4px 12px",
      fontSize:12, fontWeight:600, color:C.text,
    }}>
      {type==="strong" && <span style={{fontSize:9}}>✓</span>}
      {type==="missing" && <span style={{fontSize:9}}>✕</span>}
      {name}
    </span>
  );
}

// ── Gap table row
function GapRow({ gap, index }) {
  const sev = SEV(gap.gap_severity);
  const pct = Math.round(gap.gap_severity * 100);
  return (
    <div style={{
      display:"grid", gridTemplateColumns:"28px 1fr 120px 90px 1fr",
      alignItems:"center", gap:16, padding:"13px 20px",
      background: index%2===0 ? "var(--bg-card)" : "var(--bg-main)",
      borderBottom:"1px solid var(--border)",
      animation:`fadeUp 0.4s ease ${0.04*index}s both`,
    }}>
      <span style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)" }}>{String(index+1).padStart(2,"0")}</span>
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)" }}>{gap.skill}</div>
        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:1 }}>{gap.reason}</div>
      </div>
      {/* Severity bar */}
      <div>
        <div style={{ height:6, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:sev.color, borderRadius:3, transition:"width 0.8s ease" }}/>
        </div>
        <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:3 }}>{pct}% severity</div>
      </div>
      <span style={{
        display:"inline-flex", alignItems:"center", justifyContent:"center",
        background:sev.bg, border:`1px solid ${sev.color}44`,
        borderRadius:20, padding:"3px 10px",
        fontSize:11, fontWeight:700, color:sev.color,
      }}>{sev.label}</span>
      {/* Course with link */}
      <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
        <span style={{ fontSize:12, color:"var(--text-muted)", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {gap.recommended_course?.title}
        </span>
        {gap.recommended_course?.url && (
          <a href={gap.recommended_course.url} target="_blank" rel="noreferrer" style={{
            flexShrink:0, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)",
            borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:600, color:"#059669",
            textDecoration:"none", whiteSpace:"nowrap",
          }}>Free ↗</a>
        )}
      </div>
    </div>
  );
}

// ── Pathway step
function PathwayStep({ step, total, index }) {
  return (
    <div style={{ display:"flex", gap:20, alignItems:"flex-start", animation:`fadeUp 0.4s ease ${0.05*index}s both` }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
        <div style={{
          width:38, height:38, borderRadius:"50%",
          background:"linear-gradient(135deg,#0891b2,#06b6d4)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13, fontWeight:800, color:"#fff",
          boxShadow:"0 4px 12px rgba(8,145,178,0.3)", zIndex:1,
        }}>{step.order}</div>
        {index < total-1 && <div style={{ width:1, flex:1, minHeight:20, background:"var(--brand-border)", marginTop:4 }}/>}
      </div>
      <div style={{
        flex:1, background:"var(--bg-card)", border:"1px solid var(--border)",
        borderRadius:14, padding:"15px 20px", marginBottom:12, transition:"all 0.2s",
      }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--brand)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(8,145,178,0.1)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.boxShadow="none"; }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:4 }}>{step.title}</div>
            <div style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.6 }}>{step.why}</div>
          </div>
          <div style={{ display:"flex", gap:8, flexShrink:0, marginLeft:12 }}>
            <span style={{ background:"var(--brand-light)", border:"1px solid var(--brand-border)", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:600, color:"var(--brand)" }}>⏱ {step.duration_hours}h</span>
            {step.url && (
              <a href={step.url} target="_blank" rel="noreferrer" style={{
                background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)",
                borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:600,
                color:"#059669", textDecoration:"none",
              }}>Free ↗</a>
            )}
          </div>
        </div>
        <div style={{ marginTop:10, height:3, background:"var(--border)", borderRadius:2 }}>
          <div style={{ height:"100%", width:`${Math.round((index+1)/total*100)}%`, background:"linear-gradient(90deg,#0891b2,#06b6d4)", borderRadius:2 }}/>
        </div>
        <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:4 }}>Step {step.order} of {total}</div>
      </div>
    </div>
  );
}

// ── Custom pie label
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
  if (value === 0) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {value}
    </text>
  );
};

export default function Dashboard() {
  const [user, setUser]         = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [activeTab, setActiveTab] = useState("gaps");
  const resultRef = useRef();
  const navigate  = useNavigate();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => { if (!u) navigate("/"); else setUser(u); });
  }, []);

  const handleSave = async () => {
    if (!result) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${BACKEND}/save`, { analysis_id: result.analysis_id }, { headers:{ Authorization:`Bearer ${token}` } });
      setSaved(true);
    } catch(e) { console.error(e); }
  };

  const handleExportPDF = async () => {
    if (!resultRef.current) return;
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor    = isDarkMode ? '#0a0f1e' : '#f0f4f8';

    // Temporarily force light background for clean PDF capture
    const el = resultRef.current;
    const prevBg = el.style.background;
    if (isDarkMode) el.style.background = '#0a0f1e';

    try {
      const canvas = await html2canvas(el, {
        backgroundColor: bgColor,
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
        scrollX: 0, scrollY: 0,
        onclone: (doc) => {
          // copy CSS vars into cloned doc so styles resolve
          const root = doc.documentElement;
          const vars = ['--bg-main','--bg-card','--border','--text-primary','--text-muted','--brand','--brand-light','--brand-border','--input-bg'];
          vars.forEach(v => {
            root.style.setProperty(v, getComputedStyle(document.documentElement).getPropertyValue(v));
          });
        }
      });

      const A4_W = 595, A4_H = 842;
      const pdf  = new jsPDF({ orientation:"portrait", unit:"pt", format:"a4" });

      const imgW  = canvas.width;
      const imgH  = canvas.height;
      const ratio = A4_W / imgW;
      const scaledH = imgH * ratio;

      const pageCount = Math.ceil(scaledH / A4_H);
      const imgData   = canvas.toDataURL("image/jpeg", 0.92);

      for (let page = 0; page < pageCount; page++) {
        if (page > 0) pdf.addPage();
        const yOffset = -page * A4_H;
        pdf.addImage(imgData, "JPEG", 0, yOffset, A4_W, scaledH);

        // Add page number
        pdf.setFontSize(9);
        pdf.setTextColor(150);
        pdf.text(`AURA Analysis · Page ${page+1} of ${pageCount}`, A4_W/2, A4_H - 12, { align:"center" });
      }

      pdf.save(`AURA_Analysis_${new Date().toISOString().slice(0,10)}.pdf`);
    } finally {
      el.style.background = prevBg;
    }
  };

  // Derived data
  const gaps         = result?.gaps        ?? [];
  const pathway      = result?.pathway     ?? [];
  const userSkills   = result?.user_skills ?? [];
  const jdSkills     = result?.jd_skills   ?? [];
  const totalHours   = result?.total_hours ?? 0;
  const matchScore   = result?.match_score ?? 0;
  const strongSkills = jdSkills.filter(s => !gaps.find(g => g.skill === s));
  const criticalCount = gaps.filter(g => g.gap_severity > 0.8).length;
  const moderateCount = gaps.filter(g => g.gap_severity > 0.5 && g.gap_severity <= 0.8).length;
  const minorCount    = gaps.filter(g => g.gap_severity <= 0.5).length;
  const scoreColor    = matchScore > 60 ? "#10b981" : matchScore > 30 ? "#f97316" : "#ef4444";
  // Recharts can't resolve CSS vars — use hardcoded theme-aware colors
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  // Always use high-contrast white tooltip — works in both modes
  const ttStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: "#0d1b2a",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
    padding: "8px 14px",
  };

  // ── Accurate pie chart data: Strong vs Critical vs Moderate vs Minor
  const pieData = [
    { name:"Strong match", value:strongSkills.length, color:"#10b981" },
    { name:"Critical gap", value:criticalCount,        color:"#ef4444" },
    { name:"Moderate gap", value:moderateCount,        color:"#f97316" },
    { name:"Minor gap",    value:minorCount,           color:"#eab308" },
  ].filter(d => d.value > 0);

  // ── Bar chart: real gap_severity values 0-100
  const barData = gaps.slice(0,10).map(g => ({
    name:     g.skill.length > 10 ? g.skill.slice(0,10)+"…" : g.skill,
    severity: Math.round(g.gap_severity * 100),
    fill:     SEV(g.gap_severity).color,
  }));

  const tabs      = ["gaps","pathway","skills","reasoning"];
  const tabLabels = { gaps:"Gap Analysis", pathway:"Learning Pathway", skills:"Skill Map", reasoning:"AI Reasoning" };

  const ActionBtn = ({ onClick, children, accent=false, disabled=false }) => (
    <button onClick={onClick} disabled={disabled} style={{
      background: accent ? "linear-gradient(135deg,#0891b2,#06b6d4)" : "var(--bg-card)",
      border: accent ? "none" : "1px solid var(--border)",
      color: accent ? "#fff" : "var(--text-muted)",
      padding:"8px 18px", borderRadius:10, fontSize:13, fontWeight:600,
      cursor: disabled ? "default" : "pointer", fontFamily:"var(--font-body)",
      transition:"all 0.2s", opacity: disabled ? 0.7 : 1,
    }}
      onMouseEnter={e => { if(!disabled) e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}
    >{children}</button>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg-main)" }}>
      <Sidebar user={user}/>
      <main style={{ marginLeft:240, flex:1, padding:"36px 40px" }}>

        {/* ── Upload state */}
        {!result && !loading && (
          <div style={{ animation:"fadeUp 0.5s ease both" }}>
            <div style={{ marginBottom:32 }}>
              <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.8px", color:"var(--text-primary)", margin:0, fontFamily:"var(--font-display)" }}>Dashboard</h1>
              <p style={{ fontSize:14, color:"var(--text-muted)", marginTop:6 }}>Analyse your resume against a job description and get a personalised learning pathway.</p>
            </div>
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:20, padding:"36px 40px", boxShadow:"0 2px 12px rgba(15,23,42,0.04)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"var(--brand-light)", border:"1px solid var(--brand-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, color:"var(--brand)" }}>◈</div>
                <div>
                  <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:"var(--text-primary)" }}>New Analysis</h2>
                  <p style={{ margin:0, fontSize:13, color:"var(--text-muted)" }}>Upload resume + paste job description to begin</p>
                </div>
              </div>
              <UploadPanel onResult={(r)=>{ setResult(r); setSaved(false); setActiveTab("gaps"); }} onLoading={setLoading}/>
            </div>
          </div>
        )}

        {/* ── Loading state */}
        {loading && (
          <div style={{ textAlign:"center", padding:"80px 0", animation:"fadeUp 0.4s ease both" }}>
            <div style={{ position:"relative", width:64, height:64, margin:"0 auto 24px" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", border:"3px solid var(--border)", borderTopColor:"var(--brand)", animation:"spin 0.9s linear infinite" }}/>
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"var(--brand)" }}>◈</div>
            </div>
            <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 8px", color:"var(--text-primary)" }}>Analysing your profile</h3>
            <p style={{ color:"var(--text-muted)", fontSize:14 }}>Running NLP · Scoring gaps · Building pathway</p>
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:20 }}>
              {["Extracting skills","Scoring gaps","Building pathway"].map((s,i)=>(
                <span key={s} style={{ background:"var(--brand-light)", border:"1px solid var(--brand-border)", borderRadius:20, padding:"4px 14px", fontSize:12, fontWeight:600, color:"var(--brand)", animation:`pulse-op 1.5s ease ${i*0.4}s infinite` }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Results */}
        {result && !loading && (
          <div ref={resultRef}>

            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, animation:"fadeUp 0.4s ease both" }}>
              <div>
                <h1 style={{ margin:0, fontSize:24, fontWeight:800, letterSpacing:"-0.8px", color:"var(--text-primary)", fontFamily:"var(--font-display)" }}>Analysis Results</h1>
                <p style={{ margin:0, fontSize:13, color:"var(--text-muted)", marginTop:4 }}>
                  {gaps.length} gap{gaps.length!==1?"s":""} · {totalHours}h learning time · {pathway.length} courses
                </p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <ActionBtn onClick={()=>{ setResult(null); setSaved(false); }}>↩ New</ActionBtn>
                <ActionBtn onClick={handleExportPDF}>⬇ PDF</ActionBtn>
                <ActionBtn onClick={handleSave} disabled={saved} accent>{saved ? "✓ Saved" : "💾 Save"}</ActionBtn>
              </div>
            </div>

            {/* Metric cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:20 }}>
              <MetricCard label="Match Score"   value={`${matchScore}%`} sub={matchScore>60?"Strong":matchScore>30?"Partial":"Low"} accent={scoreColor} delay={0}/>
              <MetricCard label="Your Skills"   value={userSkills.length}  sub="Extracted from resume" accent="#10b981" delay={0.05}/>
              <MetricCard label="Role Requires" value={jdSkills.length}    sub="From job description"  accent="#0891b2" delay={0.1}/>
              <MetricCard label="Gaps Found"    value={gaps.length}        sub={`${criticalCount} critical · ${moderateCount} moderate`} accent="#ef4444" delay={0.15}/>
              <MetricCard label="Learning Time" value={`${totalHours}h`}   sub={`${pathway.length} courses`} accent="#8b5cf6" delay={0.2}/>
            </div>

            {/* Charts row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>

              {/* ── Accurate Pie chart */}
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"22px 24px", animation:"fadeUp 0.5s ease 0.1s both" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:4 }}>Skill Coverage Breakdown</div>
                <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:16 }}>
                  {jdSkills.length} required skills · {strongSkills.length} matched · {gaps.length} gaps
                </div>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        outerRadius={90}
                        innerRadius={45}
                        dataKey="value"
                        labelLine={false}
                        label={PieLabel}
                        strokeWidth={2}
                        stroke="var(--bg-card)"
                      >
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                      </Pie>
                      <Tooltip
                        contentStyle={ttStyle}
                        formatter={(v, n) => [`${v} skill${v!==1?"s":""}`, n]}
                      />
                      <Legend
                        iconType="circle" iconSize={8}
                        wrapperStyle={{ fontSize:12, fontWeight:600, color: isDark ? "#8eaac8" : "#5a7184", paddingTop:8, fontFamily:"'Plus Jakarta Sans',sans-serif" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height:220, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", fontSize:14 }}>
                    No data yet
                  </div>
                )}
              </div>

              {/* ── Accurate Bar chart */}
              <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"22px 24px 12px", animation:"fadeUp 0.5s ease 0.15s both" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:4 }}>Gap Severity per Skill</div>
                <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:16 }}>
                  100% = complete gap · 0% = fully covered
                </div>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart data={barData} barSize={22} margin={{ top:0, right:8, bottom:20, left:-10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize:10, fill: isDark ? "#8eaac8" : "#5a7184", fontFamily:"'Plus Jakarta Sans',sans-serif" }}
                        axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0}
                      />
                      <YAxis
                        tick={{ fontSize:10, fill: isDark ? "#8eaac8" : "#5a7184" }}
                        axisLine={false} tickLine={false}
                        domain={[0,100]} tickFormatter={v=>`${v}%`}
                      />
                      <Tooltip
                        contentStyle={ttStyle}
                        formatter={(v) => [`${v}%`, "Severity"]}
                        cursor={{ fill:"var(--input-bg)" }}
                      />
                      <Bar dataKey="severity" radius={[4,4,0,0]}>
                        {barData.map((e,i) => <Cell key={i} fill={e.fill} fillOpacity={0.9}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height:210, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", fontSize:14 }}>
                    No gaps to display
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden", animation:"fadeUp 0.5s ease 0.2s both" }}>
              <div style={{ display:"flex", borderBottom:"1px solid var(--border)", padding:"0 8px" }}>
                {tabs.map(t => (
                  <button key={t} onClick={()=>setActiveTab(t)} style={{
                    background:"none", border:"none", cursor:"pointer",
                    padding:"14px 20px", fontSize:13, fontWeight:600,
                    color: activeTab===t ? "var(--brand)" : "var(--text-muted)",
                    borderBottom: activeTab===t ? "2px solid var(--brand)" : "2px solid transparent",
                    marginBottom:-1, fontFamily:"var(--font-body)", transition:"all 0.2s",
                  }}>{tabLabels[t]}</button>
                ))}
              </div>

              {/* Gap Analysis tab */}
              {activeTab==="gaps" && (
                <div>
                  <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 120px 90px 1fr", gap:16, padding:"10px 20px", background:"var(--bg-main)", borderBottom:"1px solid var(--border)" }}>
                    {["#","Skill","Severity","Level","Recommended Course + Link"].map(h => (
                      <span key={h} style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.07em", textTransform:"uppercase" }}>{h}</span>
                    ))}
                  </div>
                  {gaps.length === 0
                    ? <div style={{ padding:48, textAlign:"center", color:"#10b981", fontSize:15, fontWeight:600 }}>✓ No gaps found — great match!</div>
                    : gaps.map((g,i) => <GapRow key={g.skill} gap={g} index={i}/>)
                  }
                </div>
              )}

              {/* Pathway tab */}
              {activeTab==="pathway" && (
                <div style={{ padding:"28px 32px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                    <div>
                      <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:"var(--text-primary)" }}>Your Learning Pathway</h3>
                      <p style={{ margin:0, fontSize:13, color:"var(--text-muted)", marginTop:3 }}>{pathway.length} courses · {totalHours}h total · All free resources</p>
                    </div>
                  </div>
                  {pathway.map((step,i) => <PathwayStep key={step.course_id} step={step} total={pathway.length} index={i}/>)}
                </div>
              )}

              {/* Skill Map tab */}
              {activeTab==="skills" && (
                <div style={{ padding:"28px 32px" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24, marginBottom:28 }}>
                    {[
                      { title:`Your Skills (${userSkills.length})`, color:"#10b981", skills:userSkills, type:"strong" },
                      { title:`Skill Gaps (${gaps.length})`, color:"#ef4444", skills:gaps.map(g=>g.skill), type:"missing" },
                      { title:`Role Requires (${jdSkills.length})`, color:"var(--brand)", skills:jdSkills, type:"jd" },
                    ].map(({ title, color, skills, type }) => (
                      <div key={title}>
                        <div style={{ fontSize:11, fontWeight:700, color, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block" }}/>{title}
                        </div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                          {skills.map(s => <SkillPill key={s} name={s} type={type}/>)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Coverage breakdown */}
                  <div style={{ padding:"18px 22px", background:"var(--bg-main)", borderRadius:12, border:"1px solid var(--border)" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:12 }}>Coverage Breakdown</div>
                    <div style={{ display:"flex", height:10, borderRadius:5, overflow:"hidden", gap:1 }}>
                      {[
                        { v:strongSkills.length, c:"#10b981" },
                        { v:minorCount,           c:"#eab308" },
                        { v:moderateCount,        c:"#f97316" },
                        { v:criticalCount,        c:"#ef4444" },
                      ].map(({ v, c }, i) => v > 0 && <div key={i} style={{ flex:v, background:c }}/>)}
                    </div>
                    <div style={{ display:"flex", gap:20, marginTop:10 }}>
                      {[
                        { label:"Strong",   value:strongSkills.length, color:"#10b981" },
                        { label:"Minor",    value:minorCount,           color:"#eab308" },
                        { label:"Moderate", value:moderateCount,        color:"#f97316" },
                        { label:"Critical", value:criticalCount,        color:"#ef4444" },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ width:8, height:8, borderRadius:2, background:color, display:"inline-block" }}/>
                          <span style={{ fontSize:12, color:"var(--text-muted)" }}>{label}: <strong style={{ color:"var(--text-primary)" }}>{value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reasoning tab */}
              {activeTab==="reasoning" && (
                <div style={{ padding:"28px 32px" }}>
                  <div style={{ borderLeft:"3px solid var(--brand)", paddingLeft:20, marginBottom:28 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--brand)", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:10 }}>AI Reasoning Summary</div>
                    <p style={{ fontSize:15, color:"var(--text-primary)", lineHeight:1.8, margin:0 }}>{result.reasoning}</p>
                  </div>
                  <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:14 }}>Per-Course Justification</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {pathway.map((step,i) => (
                      <div key={step.course_id} style={{
                        display:"flex", gap:14, alignItems:"flex-start",
                        padding:"14px 18px", background:"var(--bg-main)",
                        border:"1px solid var(--border)", borderRadius:12,
                        animation:`fadeUp 0.4s ease ${0.04*i}s both`,
                      }}>
                        <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:"linear-gradient(135deg,#0891b2,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff" }}>{step.order}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                            <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>{step.title}</div>
                            {step.url && (
                              <a href={step.url} target="_blank" rel="noreferrer" style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:600, color:"#059669", textDecoration:"none", flexShrink:0, marginLeft:8 }}>Free ↗</a>
                            )}
                          </div>
                          <div style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.6 }}>{step.why}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
