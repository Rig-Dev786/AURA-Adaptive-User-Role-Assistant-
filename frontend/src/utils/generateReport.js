// Generates a full HTML report matching the demo PDF design
// Opens in new tab → user presses Ctrl+P to save as PDF

export function generateHTMLReport(result, userName) {
  const name = userName || "Candidate";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
  const date = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
  const gaps = result.gaps || [];
  const pathway = result.pathway || [];
  const userSkills = result.user_skills || [];
  const jdSkills = result.jd_skills || [];
  const matchScore = result.match_score || 0;
  const totalHours = result.total_hours || 0;
  const strongSkills = jdSkills.filter(s => !gaps.find(g => g.skill === s));

  const scoreColor = matchScore > 60 ? "#059669" : matchScore > 30 ? "#d97706" : "#dc2626";
  const sevColor = s => s > 0.8 ? "#dc2626" : s > 0.5 ? "#d97706" : "#2563eb";
  const sevLabel = s => s > 0.8 ? "P1 — Critical" : s > 0.5 ? "P2 — High" : "P3 — Moderate";

  const catLabel = (skill) => {
    const s = skill.toLowerCase();
    if (["aws","gcp","azure","cloud"].some(x=>s.includes(x))) return "Cloud";
    if (["docker","kubernetes","k8s","container"].some(x=>s.includes(x))) return "Containers";
    if (["terraform","ansible","pulumi","iac"].some(x=>s.includes(x))) return "IaC";
    if (["jenkins","github actions","ci/cd","gitlab"].some(x=>s.includes(x))) return "CI/CD";
    if (["prometheus","grafana","elk","datadog","monitoring"].some(x=>s.includes(x))) return "Monitoring";
    if (["python","java","javascript","typescript","go","rust","cpp"].some(x=>s.includes(x))) return "Language";
    if (["react","angular","vue","frontend","next"].some(x=>s.includes(x))) return "Frontend";
    if (["sql","postgres","mongodb","redis","database"].some(x=>s.includes(x))) return "Database";
    if (["spark","kafka","airflow","dbt","data engineer"].some(x=>s.includes(x))) return "Data Eng";
    if (["machine learning","pytorch","tensorflow","nlp","deep learning"].some(x=>s.includes(x))) return "ML/AI";
    if (["solidity","ethereum","blockchain","web3","defi"].some(x=>s.includes(x))) return "Web3";
    return "DevOps";
  };

  // Phase grouping
  const phase1 = gaps.filter(g=>g.gap_severity > 0.75);
  const phase2 = gaps.filter(g=>g.gap_severity > 0.55 && g.gap_severity <= 0.75);
  const phase3 = gaps.filter(g=>g.gap_severity <= 0.55);
  const phase1h = phase1.reduce((a,g)=>a+(g.recommended_course?.duration_hours||0),0);
  const phase2h = phase2.reduce((a,g)=>a+(g.recommended_course?.duration_hours||0),0);
  const phase3h = phase3.reduce((a,g)=>a+(g.recommended_course?.duration_hours||0),0);

  // Radar chart (pentagon)
  const radarCats = ["Cloud","Containers","IaC","CI/CD","Monitoring"];
  const radarData = radarCats.map(cat => {
    const catGaps = gaps.filter(g => catLabel(g.skill) === cat);
    const catJD   = jdSkills.filter(s => catLabel(s) === cat);
    const coverage = catJD.length > 0
      ? Math.round((catJD.length - catGaps.length) / catJD.length * 100)
      : Math.max(20, 85 - catGaps.length*15);
    return { cat, coverage: Math.max(8, Math.min(coverage, 95)) };
  });

  const radarSVG = (() => {
    const cx=145, cy=118, r=78;
    const n = radarCats.length;
    const ang = i => (i * 2 * Math.PI / n) - Math.PI/2;
    const pt  = (i, pct) => [cx + (pct/100*r)*Math.cos(ang(i)), cy + (pct/100*r)*Math.sin(ang(i))];
    const poly = pts => pts.map(p=>p.join(",")).join(" ");

    const grid = [20,40,60,80,100].map(pct =>
      `<polygon points="${poly(radarCats.map((_,i)=>pt(i,pct)))}" fill="none" stroke="#e5e7eb" stroke-width="0.8"/>`
    ).join("");
    const axes = radarCats.map((_,i) => {
      const [x,y]=pt(i,100);
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e5e7eb" stroke-width="0.8"/>`;
    }).join("");
    const reqPts = radarCats.map((_,i)=>pt(i,100));
    const curPts = radarData.map((d,i)=>pt(i,d.coverage));
    const lbls = radarCats.map((c,i) => {
      const [x,y]=pt(i,106);
      return `<text x="${x}" y="${y}" text-anchor="middle" font-size="9" fill="#374151" font-family="Arial">${c}</text>`;
    }).join("");
    return `<svg width="290" height="240" xmlns="http://www.w3.org/2000/svg">
      ${grid}${axes}
      <polygon points="${poly(reqPts)}" fill="rgba(209,213,219,0.2)" stroke="#9ca3af" stroke-width="1.2"/>
      <polygon points="${poly(curPts)}" fill="rgba(220,38,38,0.15)" stroke="#dc2626" stroke-width="1.8"/>
      ${curPts.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="#dc2626"/>`).join("")}
      ${lbls}
      <g transform="translate(50,258)">
        <rect width="10" height="7" fill="rgba(209,213,219,0.5)" stroke="#9ca3af" stroke-width="0.8"/>
        <text x="14" y="7" font-size="8" fill="#6b7280" font-family="Arial">Required</text>
        <rect x="60" width="10" height="7" fill="rgba(220,38,38,0.3)" stroke="#dc2626" stroke-width="0.8"/>
        <text x="74" y="7" font-size="8" fill="#6b7280" font-family="Arial">Current</text>
      </g>
    </svg>`;
  })();

  // Gap bar chart
  const gapBarSVG = (() => {
    const w=330, h=170, ml=12, mr=8, mt=14, mb=40;
    const n = Math.min(gaps.length,8);
    if(!n) return `<svg width="${w}" height="${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" font-size="11" fill="#9ca3af" font-family="Arial">No gaps</text></svg>`;
    const bw = Math.floor((w-ml-mr)/n - 5);
    const bars = gaps.slice(0,8).map((g,i) => {
      const x = ml + i*((w-ml-mr)/n);
      const bh = Math.round(g.gap_severity*(h-mt-mb));
      const y = h-mb-bh;
      const col = sevColor(g.gap_severity);
      const lbl = g.skill.length>10 ? g.skill.slice(0,9)+"." : g.skill;
      return `<rect x="${x+2}" y="${y}" width="${bw}" height="${bh}" fill="${col}" rx="2" opacity="0.85"/>
        <text x="${x+2+bw/2}" y="${h-mb+13}" text-anchor="end" font-size="8" fill="#9ca3af" font-family="Arial"
          transform="rotate(-30,${x+2+bw/2},${h-mb+10})">${lbl}</text>`;
    }).join("");
    const yLines = [0,25,50,75,100].map(v => {
      const y = h-mb-v*(h-mt-mb)/100;
      return `<text x="${ml+18}" y="${y+3}" font-size="8" fill="#d1d5db" text-anchor="middle" font-family="Arial">${v}</text>
              <line x1="${ml+28}" y1="${y}" x2="${w-mr}" y2="${y}" stroke="#f3f4f6" stroke-width="0.8"/>`;
    }).join("");
    return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${yLines}${bars}</svg>`;
  })();

  // Gantt
  const ganttSVG = (() => {
    const W=680, rh=18, mt=20, ml=175, mr=16;
    const rows = pathway.slice(0,10);
    const H = mt + rows.length*rh + 24;
    const scale = (W-ml-mr)/4; // 4 months
    const phCol = {1:"#dc2626",2:"#d97706",3:"#059669"};
    const monthLbls = ["Month 1","Month 2","Month 3","Month 4"];

    // Calculate start positions
    let cumHours = 0;
    const rowData = rows.map((step,i) => {
      const ph = i<phase1.length?1:i<phase1.length+phase2.length?2:3;
      const startMonth = Math.min(cumHours/totalHours*4, 3.5);
      const durMonths  = Math.max((step.duration_hours||0)/totalHours*4, 0.3);
      cumHours += (step.duration_hours||0);
      return { step, ph, startMonth, durMonths };
    });

    const headers = monthLbls.map((m,i) =>
      `<rect x="${ml+i*scale}" y="0" width="${scale}" height="${mt}" fill="${i%2===0?'#f9fafb':'#f3f4f6'}" stroke="#e5e7eb" stroke-width="0.5"/>
       <text x="${ml+i*scale+scale/2}" y="14" text-anchor="middle" font-size="9" fill="#6b7280" font-family="Arial">${m}</text>`
    ).join("");

    const ganttRows = rowData.map(({step,ph,startMonth,durMonths},i) => {
      const y = mt+i*rh;
      const x = ml+startMonth*scale;
      const bw2 = Math.max(durMonths*scale, 12);
      const nm = step.title.length>26?step.title.slice(0,25)+"…":step.title;
      return `<rect x="${ml}" y="${y+1}" width="${W-ml-mr}" height="${rh-2}" fill="${i%2===0?'#fff':'#f9fafb'}"/>
        <text x="${ml-4}" y="${y+rh/2+3.5}" text-anchor="end" font-size="8.5" fill="#374151" font-family="Arial">${nm}</text>
        <rect x="${x}" y="${y+4}" width="${bw2}" height="${rh-8}" fill="${phCol[ph]}" rx="3" opacity="0.82"/>`;
    }).join("");

    const legend = [1,2,3].map((p,i)=>
      `<rect x="${ml+i*180}" y="${H-12}" width="10" height="8" fill="${phCol[p]}" rx="1.5"/>
       <text x="${ml+i*180+14}" y="${H-4}" font-size="8" fill="#6b7280" font-family="Arial">Phase ${p} — ${['Foundation','Core Skills','Advanced'][i]}</text>`
    ).join("");

    return `<svg width="${W}" height="${H+16}" xmlns="http://www.w3.org/2000/svg">${headers}${ganttRows}${legend}</svg>`;
  })();

  // Role fit bars
  const roleFitData = [
    { role: (jdSkills.slice(0,2).join("+") || "Target Role").slice(0,22), pct: matchScore, col:"#dc2626" },
    { role: "Cloud Engineer",          pct: Math.min(matchScore+8,95),  col:"#d97706" },
    { role: "Site Reliability Eng.",   pct: Math.min(matchScore+5,90),  col:"#d97706" },
    { role: "Backend Developer",       pct: Math.min(matchScore+35,99), col:"#059669" },
  ];

  const topStrengths = strongSkills.slice(0,5).map((s,i) => ({
    name: s, pct: Math.min(95, 55 + (5-i)*8)
  }));

  const salaryBefore = matchScore < 30 ? "₹4–6 LPA" : matchScore < 60 ? "₹6–10 LPA" : "₹10–15 LPA";
  const salaryMid    = matchScore < 30 ? "₹7–10 LPA" : matchScore < 60 ? "₹12–16 LPA" : "₹18–22 LPA";
  const salaryAfter  = matchScore < 30 ? "₹12–18 LPA" : matchScore < 60 ? "₹18–25 LPA" : "₹25–35 LPA";

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8"/>
<title>AURA — ${name} — Candidate Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{font-family:Arial,sans-serif;font-size:11px;color:#111827;background:#fff}
/* Each page is exactly A4 — no min-height that causes blank space */
.page{
  width:210mm;
  height:297mm;
  padding:12mm 14mm 14mm 14mm;
  position:relative;
  overflow:hidden;
  page-break-after:always;
  page-break-inside:avoid;
}
.page:last-child{page-break-after:auto}
/* On screen show pages with shadow so user can see boundaries */
@media screen{
  body{background:#e5e7eb;display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px 0}
  .page{box-shadow:0 4px 24px rgba(0,0,0,0.18);background:#fff}
}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:9px;border-bottom:2.5px solid #111827;margin-bottom:12px}
.hdr-left{display:flex;gap:11px;align-items:center}
.av{width:42px;height:42px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#374151}
.bx{display:flex;align-items:center;gap:5px;margin-bottom:3px}
.ba{width:17px;height:17px;background:#111827;color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;border-radius:3px}
.bn{font-size:11px;font-weight:700;letter-spacing:1px}
.bs{font-size:8.5px;color:#6b7280;margin-left:3px}
.cn{font-size:20px;font-weight:700;letter-spacing:-0.3px}
.cs{font-size:8.5px;color:#6b7280;letter-spacing:1px;text-transform:uppercase;margin-top:2px}
.pg{font-size:8.5px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;text-align:right}
.mc{width:56px;height:56px;border-radius:50%;border:2.5px solid ${scoreColor};display:flex;flex-direction:column;align-items:center;justify-content:center;margin-left:auto}
.mp{font-size:17px;font-weight:700;color:${scoreColor};line-height:1}
.ml{font-size:6.5px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase}
.rb{height:4px;width:100%;display:flex;margin-bottom:10px}
.rb div{flex:1}
.sr{display:flex;gap:0;border:1px solid #e5e7eb;margin-bottom:10px}
.sc{flex:1;padding:9px 11px;border-right:1px solid #e5e7eb}
.sc:last-child{border-right:none}
.sv{font-size:22px;font-weight:700;color:#111827;line-height:1}
.sl{font-size:7.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-top:3px}
.lbl{font-size:8px;font-weight:700;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;margin-top:9px}
.eb{border:1px solid #e5e7eb;border-left:3px solid #111827;padding:9px 12px;border-radius:3px;margin-bottom:10px}
.et{font-size:10px;line-height:1.7;color:#374151}
.tc{display:flex;gap:10px;margin-bottom:8px}
.ch{flex:1;min-width:0}
.str{margin-bottom:8px}
.sn{font-size:10px;color:#374151;margin-bottom:3px;display:flex;justify-content:space-between}
.sb{height:5px;background:#f3f4f6;border-radius:2px}
.sf{height:5px;background:#059669;border-radius:2px}
.rf{display:flex;align-items:center;gap:7px;margin-bottom:7px}
.rn{font-size:9px;color:#374151;width:105px;flex-shrink:0}
.rb2{flex:1;height:9px;background:#f3f4f6;border-radius:2px}
.rbf{height:9px;border-radius:2px}
.p2h{display:flex;justify-content:space-between;align-items:center;padding-bottom:7px;border-bottom:1px solid #e5e7eb;margin-bottom:12px}
.p2l{display:flex;align-items:center;gap:5px}
.p2m{font-size:9px;color:#9ca3af}
.gt{width:100%;border-collapse:collapse}
.gt th{font-size:7.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;padding:7px 7px;border-bottom:1.5px solid #111827;text-align:left}
.gt td{padding:6px 7px;border-bottom:1px solid #f3f4f6;vertical-align:middle}
.nc{width:28px;font-size:9px}
.nci{width:21px;height:21px;border-radius:50%;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:600;color:#374151}
.cc{display:inline-block;padding:2px 6px;border-radius:10px;font-size:7.5px;font-weight:600;border:1px solid #e5e7eb;color:#374151;white-space:nowrap}
.bc{min-width:110px}
.ibb{height:5px;background:#f3f4f6;border-radius:2px;display:inline-block;width:84px;vertical-align:middle}
.pc{white-space:nowrap;font-size:9px;font-weight:700}
.pr{display:flex;gap:8px;margin-bottom:8px}
.pcc{flex:1;border:1px solid #e5e7eb;border-radius:5px;padding:9px 11px;border-top:3px solid}
.pt{font-size:7.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}
.pn{font-size:15px;font-weight:700;margin-bottom:2px}
.pm{font-size:8px;color:#9ca3af;margin-bottom:8px}
.pi{font-size:9px;color:#374151;padding:2px 0;border-bottom:1px solid #f3f4f6}
.pi:last-child{border-bottom:none}
.pg2{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:9px}
.pca{border:1px solid #e5e7eb;border-radius:4px;padding:10px 12px}
.stl{font-size:7.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}
.stt{font-size:11.5px;font-weight:700;margin-bottom:5px}
.stb{display:inline-block;background:#111827;color:#fff;font-size:7.5px;font-weight:700;padding:2px 7px;border-radius:2px;margin-bottom:4px}
.stw{font-size:8.5px;color:#6b7280;line-height:1.5}
.sar{display:flex;gap:8px;margin-bottom:8px}
.sac{flex:1;border:1px solid #e5e7eb;border-radius:4px;padding:11px;text-align:center}
.sal{font-size:7.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px}
.sav{font-size:19px;font-weight:700;margin-bottom:2px}
.sar2{font-size:8px;color:#9ca3af}
.ft{position:absolute;bottom:8mm;left:14mm;right:14mm;display:flex;justify-content:space-between;font-size:7.5px;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;border-top:1px solid #e5e7eb;padding-top:4px}
@media print{body{background:#fff!important;display:block!important;padding:0!important;gap:0!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{box-shadow:none!important}}
</style>
</head><body>

<!-- PAGE 1 -->
<div class="page">
<div class="hdr">
  <div class="hdr-left">
    <div class="av">${initials}</div>
    <div>
      <div class="bx"><div class="ba">A</div><span class="bn">AURA</span><span class="bs">Adaptive User Role Assistant</span></div>
      <div class="cn">${name}</div>
      <div class="cs">Candidate Profile Analysis · ${date}</div>
    </div>
  </div>
  <div>
    <div class="pg">PAGE 1 OF 4</div>
    <div style="font-size:7.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;text-align:right">OVERALL MATCH</div>
    <div class="mc"><div class="mp">${matchScore}%</div><div class="ml">SCORE</div></div>
  </div>
</div>
<div class="rb"><div style="background:#dc2626"></div><div style="background:#d97706"></div><div style="background:#2563eb"></div><div style="background:#059669"></div></div>
<div class="sr">
  <div class="sc"><div class="sv" style="color:${scoreColor}">${matchScore}%</div><div class="sl">MATCH SCORE</div></div>
  <div class="sc"><div class="sv">${gaps.length}</div><div class="sl">GAPS FOUND</div></div>
  <div class="sc"><div class="sv">${totalHours}h</div><div class="sl">LEARNING TIME</div></div>
  <div class="sc"><div class="sv">${pathway.length}</div><div class="sl">COURSES</div></div>
</div>
<div class="lbl">EXECUTIVE SUMMARY</div>
<div class="eb"><div class="et">${result.reasoning || `${name} demonstrates foundational knowledge and has partial exposure across key technical areas. The target role requires deeper expertise in ${gaps.slice(0,3).map(g=>g.skill).join(", ")}. With a structured ${totalHours}-hour learning pathway across ${pathway.length} targeted courses, ${name.split(" ")[0]} can close these gaps within <strong>3–4 months</strong> and become a competitive candidate.`}</div></div>
<div class="tc">
  <div class="ch">
    <div class="lbl">CURRENT STRENGTHS</div>
    ${topStrengths.length>0 ? topStrengths.map(s=>`
    <div class="str">
      <div class="sn"><span>${s.name}</span><span style="color:#059669;font-weight:700">${s.pct}%</span></div>
      <div class="sb"><div class="sf" style="width:${s.pct}%"></div></div>
    </div>`).join("") : '<div style="color:#9ca3af;font-size:10px;margin-top:6px">Strong foundational skills extracted from resume</div>'}
  </div>
  <div class="ch">
    <div class="lbl">ROLE FIT COMPARISON</div>
    ${roleFitData.map(r=>`
    <div class="rf">
      <div class="rn">${r.role}</div>
      <div class="rb2"><div class="rbf" style="width:${r.pct}%;background:${r.col}"></div></div>
    </div>`).join("")}
  </div>
</div>
<div class="tc">
  <div class="ch">
    <div class="lbl">SKILL COVERAGE RADAR</div>
    ${radarSVG}
  </div>
  <div class="ch">
    <div class="lbl">GAP BY CATEGORY</div>
    ${gapBarSVG}
  </div>
</div>
<div class="ft"><span>AURA RESUME ANALYSIS · AI-GENERATED REPORT · CONFIDENTIAL</span><span>PAGE 1 OF 4</span></div>
</div>

<!-- PAGE 2 -->
<div class="page">
<div class="p2h">
  <div class="p2l"><div class="ba">A</div><span class="bn">AURA</span></div>
  <div class="p2m">Page 2 of 4 &nbsp;|&nbsp; ${name} &nbsp;|&nbsp; ${date}</div>
</div>
<div class="lbl">SKILL IMPACT SCORE — HIGHER = MORE CRITICAL TO ADDRESS</div>
<div style="border:1px solid #e5e7eb;border-radius:4px;padding:10px;margin-bottom:14px">
${(() => {
  const w=640,h=110,ml=28,mr=8,mt=6,mb=32;
  const n=Math.min(gaps.length,13);
  if(!n) return `<svg width="${w}" height="${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" font-size="11" fill="#9ca3af" font-family="Arial">No gaps found</text></svg>`;
  const bw=Math.max(18,(w-ml-mr)/n-5);
  const maxH=h-mt-mb;
  const bars=gaps.slice(0,13).map((g,i)=>{
    const x=ml+i*((w-ml-mr)/n);
    const pct=Math.round(g.gap_severity*100);
    const bh=Math.round(g.gap_severity*maxH);
    const y=h-mb-bh;
    const col=sevColor(g.gap_severity);
    const lbl=g.skill.length>12?g.skill.slice(0,11)+".":g.skill;
    return `<rect x="${x+2}" y="${y}" width="${bw}" height="${bh}" fill="${col}" rx="2" opacity="0.88"/>
      <text x="${x+2+bw/2}" y="${y-3}" text-anchor="middle" font-size="8" fill="${col}" font-weight="700" font-family="Arial">${pct}%</text>
      <text x="${x+2+bw/2}" y="${h-mb+13}" text-anchor="end" font-size="7.5" fill="#9ca3af" font-family="Arial" transform="rotate(-35,${x+2+bw/2},${h-mb+10})">${lbl}</text>`;
  }).join("");
  const yLines=[50,60,70,80,85].map(v=>{
    const y=h-mb-(v-45)*maxH/55;
    return `<text x="${ml-3}" y="${y+3}" text-anchor="end" font-size="8" fill="#d1d5db" font-family="Arial">${v}</text>
            <line x1="${ml}" y1="${y}" x2="${w-mr}" y2="${y}" stroke="#f3f4f6" stroke-width="0.8"/>`;
  }).join("");
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${yLines}${bars}</svg>`;
})()}
</div>
<div class="lbl">SKILL GAP ANALYSIS</div>
<table class="gt">
  <thead><tr>
    <th style="width:28px">#</th>
    <th>SKILL</th>
    <th>CATEGORY</th>
    <th>IMPACT SCORE</th>
    <th>CURRENT MATCH</th>
    <th>PRIORITY</th>
  </tr></thead>
  <tbody>
  ${gaps.map((g,i)=>{
    const pct=Math.round(g.gap_severity*100);
    const cur=100-pct;
    const col=sevColor(g.gap_severity);
    const lbl=sevLabel(g.gap_severity);
    return `<tr>
      <td class="nc"><div class="nci">${i+1}</div></td>
      <td style="font-size:10.5px;font-weight:600">${g.skill}</td>
      <td><span class="cc">${catLabel(g.skill)}</span></td>
      <td class="bc">
        <div style="display:flex;align-items:center;gap:5px">
          <div class="ibb"><div style="height:5px;width:${pct}%;background:${col};border-radius:2px"></div></div>
          <span style="font-size:9.5px;font-weight:700;color:${col}">${pct}%</span>
        </div>
      </td>
      <td class="bc">
        <div style="display:flex;align-items:center;gap:5px">
          <div class="ibb"><div style="height:5px;width:${cur}%;background:#d1d5db;border-radius:2px"></div></div>
          <span style="font-size:9.5px;color:#9ca3af">${cur}%</span>
        </div>
      </td>
      <td class="pc" style="color:${col}">${lbl}</td>
    </tr>`;
  }).join("")}
  </tbody>
</table>
<div class="ft"><span>AURA RESUME ANALYSIS · AI-GENERATED REPORT · CONFIDENTIAL</span><span>PAGE 2 OF 4</span></div>
</div>

<!-- PAGE 3 -->
<div class="page">
<div class="p2h">
  <div class="p2l"><div class="ba">A</div><span class="bn">AURA</span></div>
  <div class="p2m">Page 3 of 4 &nbsp;|&nbsp; ${name} &nbsp;|&nbsp; ${date}</div>
</div>
<div class="lbl">PRIORITY LEARNING PHASES</div>
<div class="pr">
  <div class="pcc" style="border-top-color:#dc2626">
    <div class="pt" style="color:#dc2626">PHASE 1</div>
    <div class="pn">Foundation</div>
    <div class="pm">${phase1h}h · Month 1</div>
    ${phase1.slice(0,4).map(g=>`<div class="pi">→ ${(g.recommended_course?.title||g.skill).slice(0,30)}</div>`).join("")}
  </div>
  <div class="pcc" style="border-top-color:#d97706">
    <div class="pt" style="color:#d97706">PHASE 2</div>
    <div class="pn">Core Skills</div>
    <div class="pm">${phase2h}h · Month 2–3</div>
    ${phase2.slice(0,4).map(g=>`<div class="pi">→ ${(g.recommended_course?.title||g.skill).slice(0,30)}</div>`).join("")}
  </div>
  <div class="pcc" style="border-top-color:#059669">
    <div class="pt" style="color:#059669">PHASE 3</div>
    <div class="pn">Advanced</div>
    <div class="pm">${phase3h}h · Month 3–4</div>
    ${phase3.slice(0,4).map(g=>`<div class="pi">→ ${(g.recommended_course?.title||g.skill).slice(0,30)}</div>`).join("")}
  </div>
</div>
<div class="lbl">4-MONTH LEARNING ROADMAP (GANTT)</div>
<div style="border:1px solid #e5e7eb;border-radius:4px;padding:9px;margin-bottom:12px;overflow:hidden">${ganttSVG}</div>
<div class="lbl">LEARNING HOURS DISTRIBUTION</div>
<div style="border:1px solid #e5e7eb;border-radius:4px;padding:9px;margin-bottom:12px">
${(() => {
  const w=640,h=82,ml=18,mr=8,mt=5,mb=30;
  const n=Math.min(pathway.length,13);
  if(!n) return "";
  const bw=Math.max(14,(w-ml-mr)/n-5);
  const maxHr=pathway.reduce((a,s)=>Math.max(a,s.duration_hours||0),0)||8;
  const bars=pathway.slice(0,13).map((step,i)=>{
    const ph=i<phase1.length?1:i<phase1.length+phase2.length?2:3;
    const col={1:"#dc2626",2:"#d97706",3:"#059669"}[ph];
    const x=ml+i*((w-ml-mr)/n);
    const bh=Math.max(2,Math.round((step.duration_hours||0)/maxHr*(h-mt-mb)));
    const y=h-mb-bh;
    const lbl=(step.title||"").slice(0,12)+"…";
    return `<rect x="${x+2}" y="${y}" width="${bw}" height="${bh}" fill="${col}" rx="2" opacity="0.82"/>
      <text x="${x+2+bw/2}" y="${h-mb+12}" text-anchor="end" font-size="7" fill="#9ca3af" font-family="Arial" transform="rotate(-30,${x+2+bw/2},${h-mb+9})">${lbl}</text>`;
  }).join("");
  const yLn=[0,4,8].map(v=>{
    const y=h-mb-v/maxHr*(h-mt-mb);
    return `<text x="${ml-3}" y="${y+3}" text-anchor="end" font-size="8" fill="#d1d5db" font-family="Arial">${v}</text>
            <line x1="${ml}" y1="${y}" x2="${w-mr}" y2="${y}" stroke="#f9fafb" stroke-width="0.8"/>`;
  }).join("");
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <text x="9" y="${h/2}" text-anchor="middle" font-size="8" fill="#d1d5db" font-family="Arial" transform="rotate(-90,9,${h/2})">Hours</text>
    ${yLn}${bars}</svg>`;
})()}
</div>
<div class="ft"><span>AURA RESUME ANALYSIS · AI-GENERATED REPORT · CONFIDENTIAL</span><span>PAGE 3 OF 4</span></div>
</div>

<!-- PAGE 4 -->
<div class="page">
<div class="p2h">
  <div class="p2l"><div class="ba">A</div><span class="bn">AURA</span></div>
  <div class="p2m">Page 4 of 4 &nbsp;|&nbsp; ${name} &nbsp;|&nbsp; ${date}</div>
</div>
<div class="lbl">RECOMMENDED LEARNING PATHWAY</div>
<div class="pg2">
  ${pathway.map(step=>`
  <div class="pca">
    <div class="stl">STEP ${step.order}</div>
    <div class="stt">${step.title}</div>
    <div><span class="stb">${step.duration_hours}h</span></div>
    <div class="stw">${(step.why||"").slice(0,88)}</div>
  </div>`).join("")}
</div>
<div class="lbl">ESTIMATED SALARY IMPACT (ILLUSTRATIVE)</div>
<div class="sar">
  <div class="sac"><div class="sal">CURRENT EST. RANGE</div><div class="sav" style="color:#6b7280">${salaryBefore}</div><div class="sar2">Current Profile</div></div>
  <div class="sac"><div class="sal">AFTER PHASE 1</div><div class="sav" style="color:#d97706">${salaryMid}</div><div class="sar2">Cloud + Core Skills</div></div>
  <div class="sac"><div class="sal">AFTER ALL PHASES</div><div class="sav" style="color:#059669">${salaryAfter}</div><div class="sar2">Mid-Level ${(jdSkills[0]||"Developer").split(" ").slice(-1)[0]}</div></div>
</div>
<div style="border:1px solid #e5e7eb;border-radius:4px;padding:11px;margin-bottom:11px">
  <div style="display:flex;align-items:center;gap:9px;margin-bottom:7px">
    <div style="font-size:9px;width:125px;color:#374151">Current (Backend Dev)</div>
    <div style="flex:1;height:13px;background:#f3f4f6;border-radius:2px"><div style="height:13px;width:${Math.max(15,matchScore*0.45+15)}%;background:#d97706;border-radius:2px"></div></div>
  </div>
  <div style="display:flex;align-items:center;gap:9px">
    <div style="font-size:9px;width:125px;color:#374151">After All Phases</div>
    <div style="flex:1;height:13px;background:#f3f4f6;border-radius:2px"><div style="height:13px;width:82%;background:#059669;border-radius:2px"></div></div>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:4px;padding-left:134px">
    ${["0L","2L","4L","6L","8L","10L","12L","14L","16L","18L","20L"].map(l=>`<span style="font-size:7px;color:#9ca3af">₹${l}</span>`).join("")}
  </div>
  <div style="font-size:7.5px;color:#9ca3af;margin-top:7px;font-style:italic">* Salary figures are illustrative estimates based on industry benchmarks. Actual compensation may vary.</div>
</div>
<div style="border:1px solid #e5e7eb;border-radius:4px;padding:11px">
  <div style="display:flex;justify-content:space-between;margin-bottom:7px">
    <span style="font-size:11px;color:#374151">Total learning time</span>
    <span style="font-size:11px;font-weight:700">${totalHours} hours</span>
  </div>
  <div style="display:flex;justify-content:space-between;margin-bottom:9px">
    <span style="font-size:11px;color:#374151">Estimated completion</span>
    <span style="font-size:11px;font-weight:700">3–4 months (part-time)</span>
  </div>
  <div style="height:7px;background:#f3f4f6;border-radius:3px"><div style="height:7px;width:100%;background:#111827;border-radius:3px"></div></div>
  <div style="display:flex;justify-content:space-between;margin-top:3px">
    <span style="font-size:7.5px;color:#9ca3af">0h</span>
    <span style="font-size:7.5px;color:#9ca3af">${Math.round(totalHours/2)}h</span>
    <span style="font-size:7.5px;color:#9ca3af">${totalHours}h</span>
  </div>
</div>
<div class="ft"><span>AURA RESUME ANALYSIS · AI-GENERATED REPORT · CONFIDENTIAL</span><span>PAGE 4 OF 4</span></div>
</div>

<script>window.onload=function(){window.print()}</script>
</body></html>`;
}
