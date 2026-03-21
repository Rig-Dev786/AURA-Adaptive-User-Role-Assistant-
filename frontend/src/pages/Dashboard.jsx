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


// SmartLink — internal /roadmap/ routes use navigate, external use <a>
function SmartLink({ url, label="View Roadmap →" }) {
  const navigate = useNavigate();
  const isInternal = url && url.startsWith("/roadmap/");
  if (!url) return null;
  if (isInternal) {
    return (
      <button onClick={() => navigate(url)} style={{
        flexShrink:0, background:"var(--brand-light)", border:"1px solid var(--brand-border)",
        borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:700,
        color:"var(--brand)", cursor:"pointer", fontFamily:"var(--font-body)",
        whiteSpace:"nowrap", transition:"all 0.15s",
      }}
        onMouseEnter={e=>{e.currentTarget.style.background="var(--brand)";e.currentTarget.style.color="#fff";}}
        onMouseLeave={e=>{e.currentTarget.style.background="var(--brand-light)";e.currentTarget.style.color="var(--brand)";}}
      >{label}</button>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{
      flexShrink:0, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)",
      borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:700,
      color:"#34d399", textDecoration:"none", whiteSpace:"nowrap",
    }}>↗ Open</a>
  );
}

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
        {gap.recommended_course?.url && <SmartLink url={gap.recommended_course.url}/>}
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
            {step.url && <SmartLink url={step.url}/>}
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
  const [saving, setSaving]     = useState(false);
  const [activeTab, setActiveTab] = useState("gaps");
  const resultRef = useRef();
  const navigate  = useNavigate();

  useEffect(() => {
    // Restore last result from sessionStorage when navigating back from roadmap
    const saved = sessionStorage.getItem("aura-last-result");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResult(parsed);
        setSaved(false);
      } catch(e) {}
    }
    return onAuthStateChanged(auth, (u) => { if (!u) navigate("/"); else setUser(u); });
  }, []);

  const handleSave = async () => {
    if (!result || saved) return;
    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        alert("Please sign in to save analyses.");
        setSaving(false);
        return;
      }
      // Send the FULL result so backend can store it
      await axios.post(
        `${BACKEND}/save`,
        { analysis_id: result.analysis_id, result },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
    } catch(e) {
      console.error("Save failed:", e);
      alert("Save failed — check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (!result) return;

    const pdf = new jsPDF({ orientation:"portrait", unit:"pt", format:"a4" });
    const W=595, H=842, ML=44, MR=44, MT=52;
    const TW = W - ML - MR;
    let y = MT;

    // ── Colors ──
    const C = {
      brand:  [8, 145, 178],
      brand2: [6, 182, 212],
      dark:   [13, 27, 42],
      muted:  [90, 113, 132],
      light:  [240, 244, 248],
      white:  [255, 255, 255],
      red:    [239, 68, 68],
      orange: [249, 115, 22],
      yellow: [234, 179, 8],
      green:  [16, 185, 129],
      purple: [139, 92, 246],
      bg:     [247, 250, 253],
      border: [226, 232, 240],
    };

    const sev = (s) => s > 0.8 ? C.red : s > 0.5 ? C.orange : C.yellow;
    const sevLabel = (s) => s > 0.8 ? "Critical" : s > 0.5 ? "Moderate" : "Minor";

    const newPage = () => { pdf.addPage(); y = MT; };
    const checkY  = (n=30) => { if (y + n > H - 48) newPage(); };

    const font = (size, weight="normal", color=C.dark) => {
      pdf.setFontSize(size);
      pdf.setFont("helvetica", weight);
      pdf.setTextColor(...color);
    };

    const rect = (x, ry, w, h, fill, r=3) => {
      pdf.setFillColor(...fill);
      if (r) pdf.roundedRect(x, ry, w, h, r, r, "F");
      else   pdf.rect(x, ry, w, h, "F");
    };

    const border = (x, ry, w, h, stroke, r=3, lw=0.5) => {
      pdf.setDrawColor(...stroke);
      pdf.setLineWidth(lw);
      if (r) pdf.roundedRect(x, ry, w, h, r, r, "S");
      else   pdf.rect(x, ry, w, h, "S");
    };

    const line = (x1, ly, x2, col=C.border, lw=0.5) => {
      pdf.setDrawColor(...col);
      pdf.setLineWidth(lw);
      pdf.line(x1, ly, x2, ly);
    };

    const chip = (x, cy, label, fill, textCol) => {
      const tw = pdf.getTextWidth(label);
      const cw = tw + 12, ch = 14;
      rect(x, cy, cw, ch, fill, 3);
      font(7, "bold", textCol);
      pdf.text(label, x + 6, cy + 10);
      return cw;
    };

    const sectionTitle = (title) => {
      checkY(36);
      // Left accent bar
      rect(ML, y, 3, 18, C.brand, 1);
      font(12, "bold", C.dark);
      pdf.text(title, ML + 10, y + 13);
      y += 24;
    };

    // ══════════════════════════════════════════════
    // PAGE 1
    // ══════════════════════════════════════════════

    // Header band
    rect(0, 0, W, 78, C.brand, 0);
    rect(0, 0, W, 78, [6,182,212,30], 0); // subtle overlay

    // AURA logo text
    font(20, "bold", C.white);
    pdf.text("AURA", ML, 28);
    font(9, "normal", [180,225,240]);
    pdf.text("AI-Adaptive Onboarding Engine", ML, 42);

    // Date + score on right
    const scoreCol = result.match_score > 60 ? C.green : result.match_score > 30 ? C.orange : C.red;
    rect(W - MR - 80, 10, 80, 56, [255,255,255,20], 6);
    font(28, "bold", C.white);
    pdf.text(`${result.match_score}%`, W - MR - 40, 40, { align:"center" });
    font(7.5, "normal", [200,230,240]);
    pdf.text("MATCH SCORE", W - MR - 40, 54, { align:"center" });

    font(8, "normal", [180,220,235]);
    pdf.text(`Generated ${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}`, ML, 58);
    y = 96;

    // ── Metric cards row ──
    const cards = [
      { label:"Your Skills",   val:`${result.user_skills?.length ?? 0}`, col:C.green  },
      { label:"Role Requires", val:`${result.jd_skills?.length ?? 0}`,   col:C.brand  },
      { label:"Gaps Found",    val:`${result.gaps?.length ?? 0}`,         col:C.red    },
      { label:"Learning Time", val:`${result.total_hours}h`,              col:C.purple },
    ];
    const cw4 = (TW - 12) / 4;
    cards.forEach((c,i) => {
      const cx = ML + i*(cw4+4);
      rect(cx, y, cw4, 52, C.bg, 4);
      border(cx, y, cw4, 52, C.border, 4);
      // top accent
      pdf.setDrawColor(...c.col);
      pdf.setLineWidth(2.5);
      pdf.line(cx, y, cx+cw4, y);
      font(7, "bold", C.muted);
      pdf.text(c.label.toUpperCase(), cx+cw4/2, y+16, { align:"center" });
      font(20, "bold", c.col);
      pdf.text(c.val, cx+cw4/2, y+38, { align:"center" });
    });
    y += 62;

    line(ML, y, W-MR, C.border, 0.5);
    y += 16;

    // ── Gap Analysis ──
    sectionTitle("Skill Gap Analysis");

    if (!result.gaps?.length) {
      rect(ML, y, TW, 36, [240,253,244], 6);
      border(ML, y, TW, 36, C.green, 6);
      font(10, "bold", C.green);
      pdf.text("No skill gaps found — strong match for this role!", ML + TW/2, y+22, { align:"center" });
      y += 44;
    } else {
      // Table header
      rect(ML, y, TW, 20, [235,242,248], 3);
      font(7, "bold", C.muted);
      pdf.text("#",          ML+6,        y+13);
      pdf.text("Skill",      ML+22,       y+13);
      pdf.text("Severity",   ML+TW*0.44,  y+13);
      pdf.text("Level",      ML+TW*0.60,  y+13);
      pdf.text("Course",     ML+TW*0.72,  y+13);
      y += 22;

      result.gaps.forEach((gap, i) => {
        checkY(22);
        rect(ML, y, TW, 20, i%2===0 ? C.white : C.bg, 2);

        const pct = Math.round(gap.gap_severity * 100);
        const sc  = sev(gap.gap_severity);
        const sl  = sevLabel(gap.gap_severity);

        font(7.5, "bold", C.dark);
        pdf.text(String(i+1).padStart(2,"0"), ML+6, y+13);

        font(8, "bold", C.dark);
        const sk = gap.skill.length > 24 ? gap.skill.slice(0,22)+"…" : gap.skill;
        pdf.text(sk, ML+22, y+13);

        // Severity bar
        const bx = ML+TW*0.44, bw = TW*0.12;
        rect(bx, y+7, bw, 6, C.border, 2);
        rect(bx, y+7, bw*pct/100, 6, sc, 2);
        font(7, "normal", C.muted);
        pdf.text(`${pct}%`, bx+bw+4, y+13);

        // Level chip
        rect(ML+TW*0.60, y+4, 44, 13, [...sc, 25], 3);
        font(7, "bold", sc);
        pdf.text(sl, ML+TW*0.60+22, y+13, { align:"center" });

        // Course name
        const ct = (gap.recommended_course?.title||"").slice(0,30);
        font(7, "normal", C.brand);
        pdf.text(ct, ML+TW*0.72, y+13);

        y += 22;
      });
    }

    y += 8; line(ML, y, W-MR); y += 16;

    // ── Learning Pathway ──
    checkY(50);
    sectionTitle("Personalised Learning Pathway");

    font(8, "normal", C.muted);
    pdf.text(`${result.total_hours}h total  ·  ${result.pathway?.length||0} courses  ·  All free`, ML, y);
    y += 16;

    (result.pathway||[]).forEach((step, i) => {
      checkY(50);

      // Circle
      pdf.setFillColor(...C.brand);
      pdf.circle(ML+10, y+12, 9, "F");
      font(8, "bold", C.white);
      pdf.text(String(step.order), ML+10, y+15, { align:"center" });

      // Connector line
      if (i < (result.pathway?.length||0)-1) {
        pdf.setDrawColor(...C.brand, 60);
        pdf.setLineWidth(1);
        pdf.line(ML+10, y+22, ML+10, y+50);
      }

      // Card
      rect(ML+26, y, TW-26, 44, C.bg, 5);
      border(ML+26, y, TW-26, 44, C.border, 5);

      // Left accent
      rect(ML+26, y, 3, 44, C.brand, 0);

      font(9, "bold", C.dark);
      const titleText = step.title.length > 55 ? step.title.slice(0,53)+"…" : step.title;
      pdf.text(titleText, ML+36, y+14);

      font(7.5, "normal", C.muted);
      const whyText = (step.why||"").slice(0,85);
      pdf.text(whyText, ML+36, y+26, { maxWidth: TW-80 });

      // Hours badge + URL
      font(7.5, "bold", C.brand);
      pdf.text(`${step.duration_hours}h`, W-MR-4, y+14, { align:"right" });

      if (step.url) {
        const urlDisplay = step.url.startsWith("/roadmap/")
          ? `roadmap.sh${step.url.replace("/roadmap/","/")}` : step.url;
        font(6.5, "normal", C.brand);
        pdf.text(urlDisplay.slice(0,60), ML+36, y+38);
      }

      y += 52;
    });

    y += 8; line(ML, y, W-MR); y += 16;

    // ── AI Reasoning ──
    checkY(60);
    sectionTitle("AI Reasoning");

    rect(ML, y, TW, 8, C.brand, 0);
    y += 14;

    font(9, "normal", C.dark);
    const rLines = pdf.splitTextToSize(result.reasoning||"", TW);
    rLines.forEach(l => { checkY(14); pdf.text(l, ML, y); y += 14; });

    y += 12; line(ML, y, W-MR); y += 16;

    // ── Skills ──
    checkY(40);
    sectionTitle("Your Skills vs Role Requirements");

    const half = (TW - 8) / 2;

    // Your skills header
    rect(ML, y, half, 18, C.green, 4);
    font(8, "bold", C.white);
    pdf.text(`Your Skills  (${result.user_skills?.length||0})`, ML+8, y+12);

    // Gaps header
    rect(ML+half+8, y, half, 18, C.red, 4);
    font(8, "bold", C.white);
    pdf.text(`Gaps  (${result.gaps?.length||0})`, ML+half+16, y+12);
    y += 22;

    const maxRows = Math.max(
      Math.ceil((result.user_skills?.length||0)/2),
      result.gaps?.length||0
    );

    for (let row = 0; row < maxRows; row++) {
      checkY(16);

      // Your skills — 2 per row
      [0,1].forEach(col => {
        const idx = row*2+col;
        const s = (result.user_skills||[])[idx];
        if (!s) return;
        const sx = ML + col*(half/2);
        rect(sx, y, half/2-4, 13, [240,250,244], 2);
        font(7, "normal", [20,80,60]);
        pdf.text(s.length>14?s.slice(0,12)+"…":s, sx+4, y+9);
      });

      // Gap
      const g = (result.gaps||[])[row];
      if (g) {
        const sc = sev(g.gap_severity);
        rect(ML+half+8, y, half-4, 13, [...sc, 20], 2);
        font(7, "bold", sc);
        pdf.text(g.skill.length>22?g.skill.slice(0,20)+"…":g.skill, ML+half+12, y+9);
      }

      y += 17;
    }

    // ── Footer on all pages ──
    const total = pdf.internal.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      pdf.setPage(p);
      rect(0, H-28, W, 28, C.light, 0);
      line(0, H-28, W, C.border, 0.5);
      font(7, "normal", C.muted);
      pdf.text("AURA — AI-Adaptive Onboarding Engine", ML, H-12);
      pdf.text(`Page ${p} of ${total}`, W-MR, H-12, { align:"right" });
      font(7, "normal", [...C.brand]);
      pdf.text("aura.ai", W/2, H-12, { align:"center" });
    }

    pdf.save(`AURA_Analysis_${new Date().toISOString().slice(0,10)}.pdf`);
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
              <UploadPanel onResult={(r)=>{ setResult(r); setSaved(false); setActiveTab("gaps"); sessionStorage.setItem("aura-last-result", JSON.stringify(r)); }} onLoading={setLoading}/>
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
                <ActionBtn onClick={()=>{ setResult(null); setSaved(false); sessionStorage.removeItem("aura-last-result"); }}>↩ New</ActionBtn>
                <ActionBtn onClick={handleExportPDF}>⬇ PDF</ActionBtn>
                <ActionBtn onClick={handleSave} disabled={saved||saving} accent>
                  {saving ? "Saving…" : saved ? "✓ Saved" : "Save"}
                </ActionBtn>
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
                              <SmartLink url={step.url}/>
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
