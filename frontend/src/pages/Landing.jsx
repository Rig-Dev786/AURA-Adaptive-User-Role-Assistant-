import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import AuraLogo from "../components/AuraLogo";
import { useTheme } from "../ThemeContext";

const SKILL_LABELS = ['Python','SQL','Docker','Spark','React','Kafka','Git','AWS','ML','NLP','dbt','Airflow','K8s','CI/CD','Tableau','Flask','Redis','PyTorch','Java','Linux'];

/* ── Canvas background ─────────────────────────────────────── */
function HeroBg({ scrollY, isDark }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const nodesRef  = useRef([]);
  const mouseRef  = useRef({ x:-999, y:-999 });
  const opRef     = useRef(1);
  const darkRef   = useRef(isDark);

  useEffect(() => { opRef.current = Math.max(0, 1 - scrollY / 520); }, [scrollY]);
  useEffect(() => { darkRef.current = isDark; }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      nodesRef.current = Array.from({ length: 68 }, (_, i) => ({
        x: Math.random()*W, y: Math.random()*H,
        vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3,
        r: Math.random()*2.5+1,
        label: i < SKILL_LABELS.length ? SKILL_LABELS[i] : null,
        pulse: Math.random()*Math.PI*2, ps: 0.012+Math.random()*0.016,
        type: i < SKILL_LABELS.length ? 'skill' : i < 28 ? 'core' : 'dot',
        alpha: 0.45+Math.random()*0.5,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const nodes = nodesRef.current, mouse = mouseRef.current;
      const op = opRef.current, dark = darkRef.current;
      const lineRGB  = dark ? "6,182,212"   : "8,145,178";
      const labelRGB = dark ? "200,230,255" : "13,27,42";

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += n.ps;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) for (let j = i+1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dist = Math.hypot(a.x-b.x, a.y-b.y);
        if (dist < 135) {
          const base  = (1-dist/135)*0.15*op;
          const mDist = Math.hypot((a.x+b.x)/2-mouse.x, (a.y+b.y)/2-mouse.y);
          const boost = mDist < 170 ? (1-mDist/170)*0.28 : 0;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${lineRGB},${base+boost*op})`;
          ctx.lineWidth = 0.5+boost*0.5; ctx.stroke();
        }
      }

      nodes.forEach(n => {
        const mDist = Math.hypot(n.x-mouse.x, n.y-mouse.y);
        const hover = mDist < 110, pf = 1+Math.sin(n.pulse)*0.22;
        if (n.type === 'skill') {
          ctx.font = `600 10.5px 'Plus Jakarta Sans',system-ui`;
          const tw = ctx.measureText(n.label).width, pad=7, bw=tw+pad*2, bh=21;
          ctx.beginPath(); ctx.roundRect(n.x-bw/2, n.y-bh/2, bw, bh, 5);
          ctx.fillStyle = hover?`rgba(8,145,178,${0.13*op})`:`rgba(8,145,178,${0.055*n.alpha*op})`; ctx.fill();
          ctx.strokeStyle = hover?`rgba(${lineRGB},${0.55*op})`:`rgba(${lineRGB},${0.2*n.alpha*op})`;
          ctx.lineWidth = hover?0.9:0.5; ctx.stroke();
          ctx.fillStyle = hover?`rgba(${lineRGB},${op})`:`rgba(${labelRGB},${0.32*n.alpha*op})`;
          ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(n.label, n.x, n.y);
        } else if (n.type==='core') {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r*2.2*pf, 0, Math.PI*2);
          ctx.fillStyle = hover?`rgba(8,145,178,${0.4*op})`:`rgba(8,145,178,${0.13*n.alpha*op})`; ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r*pf, 0, Math.PI*2);
          ctx.fillStyle = `rgba(8,145,178,${0.1*n.alpha*op})`; ctx.fill();
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };

    const onMove  = (e) => { mouseRef.current = { x:e.clientX, y:e.clientY }; };
    const onLeave = ()  => { mouseRef.current = { x:-999, y:-999 }; };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', resize);
    resize(); draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}/>;
}

/* ── Main Landing ──────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [checking,  setChecking]  = useState(true);
  const [user,      setUser]      = useState(null);
  const [scrollY,   setScrollY]   = useState(0);
  const [phase,     setPhase]     = useState("hidden"); // hidden → flying → colliding → settled

  const canvasOp = Math.max(0, 1 - scrollY / 500);

  /* scroll listener */
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* auth */
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => { setUser(u); setChecking(false); });
  }, []);

  /* animation sequence */
  useEffect(() => {
    // small delay so page is painted first
    const t1 = setTimeout(() => setPhase("flying"),    120);
    const t2 = setTimeout(() => setPhase("colliding"), 900);
    const t3 = setTimeout(() => setPhase("settled"),   1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleCTA = async () => {
    if (user) { navigate("/dashboard"); return; }
    try { await signInWithPopup(auth, provider); navigate("/dashboard"); }
    catch (err) { console.error(err); }
  };

  if (checking) return null;

  const settled    = phase === "settled";
  const colliding  = phase === "colliding" || settled;
  const sectionBg  = isDark ? "rgba(15,24,41,0.98)" : "rgba(255,255,255,0.98)";
  const navBg      = scrollY > 40
    ? (isDark ? "rgba(7,12,24,0.94)"  : "rgba(240,244,248,0.94)")
    : (isDark ? "rgba(7,12,24,0.35)"  : "rgba(240,244,248,0.35)");

  /* scroll-based blur for below-hero content
     0px blur at scrollY=200, fully clear at scrollY=500 */
  const belowBlur = scrollY < 200 ? 12 : Math.max(0, 12 - ((scrollY-200)/300)*12);
  const belowOp   = scrollY < 200 ? 0.4 : Math.min(1, 0.4 + ((scrollY-200)/300)*0.6);

  const features = [
    { icon:"◈", title:"Smart Skill Extraction",  desc:"spaCy NLP + 200-skill taxonomy parses your resume and JD automatically." },
    { icon:"⬡", title:"Gap Analysis Engine",      desc:"Sentence-transformer cosine similarity scores each gap by severity — pure ML." },
    { icon:"◎", title:"Personalized Pathway",     desc:"Severity-ranked plan from 50 curated free courses. Zero guesswork." },
    { icon:"❋", title:"Reasoning Trace",          desc:"Every recommendation includes a plain-English justification of why it was added." },
    { icon:"▣", title:"Cross-Domain Support",     desc:"Technical and operational roles — same pipeline, same accuracy." },
    { icon:"⊕", title:"Zero Hallucinations",      desc:"Template-based generation — the algorithm never invents courses." },
  ];
  const steps = [
    { num:"01", title:"Upload Resume", desc:"Drop your PDF or DOCX resume" },
    { num:"02", title:"Paste JD",      desc:"Add the job description text" },
    { num:"03", title:"Get Pathway",   desc:"Personalised roadmap in seconds" },
  ];

  return (
    <div style={{
      minHeight:"100vh", background:"var(--bg-main)",
      fontFamily:"var(--font-body)", color:"var(--text-primary)",
      overflowX:"hidden", transition:"background 0.35s ease, color 0.35s ease",
    }}>
      <style>{`
        /* ─── Letter fly-in from sides ─── */
        @keyframes fly-left {
          0%   { opacity:0; transform:translateX(-200px) scale(0.7) rotate(-8deg); }
          65%  { opacity:1; transform:translateX(18px)   scale(1.08) rotate(1.5deg); }
          80%  { transform:translateX(-8px) scale(0.97) rotate(-0.5deg); }
          90%  { transform:translateX(4px)  scale(1.01) rotate(0.3deg); }
          100% { opacity:1; transform:translateX(0)     scale(1)    rotate(0deg); }
        }
        @keyframes fly-right {
          0%   { opacity:0; transform:translateX(200px)  scale(0.7) rotate(8deg); }
          65%  { opacity:1; transform:translateX(-18px)  scale(1.08) rotate(-1.5deg); }
          80%  { transform:translateX(8px)  scale(0.97) rotate(0.5deg); }
          90%  { transform:translateX(-4px) scale(1.01) rotate(-0.3deg); }
          100% { opacity:1; transform:translateX(0)     scale(1)    rotate(0deg); }
        }
        @keyframes fly-top {
          0%   { opacity:0; transform:translateY(-160px) scale(0.75); }
          65%  { opacity:1; transform:translateY(14px)   scale(1.06); }
          80%  { transform:translateY(-6px) scale(0.98); }
          90%  { transform:translateY(3px)  scale(1.01); }
          100% { opacity:1; transform:translateY(0)      scale(1); }
        }
        @keyframes fly-bottom {
          0%   { opacity:0; transform:translateY(160px)  scale(0.75); }
          65%  { opacity:1; transform:translateY(-14px)  scale(1.06); }
          80%  { transform:translateY(6px)  scale(0.98); }
          90%  { transform:translateY(-3px) scale(1.01); }
          100% { opacity:1; transform:translateY(0)      scale(1); }
        }
        @keyframes settle-in {
          0%   { opacity:0; transform:translateY(28px) scale(0.94); filter:blur(8px); }
          100% { opacity:1; transform:translateY(0)    scale(1);    filter:blur(0px); }
        }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20% { transform:translateX(-6px) rotate(-1deg); }
          40% { transform:translateX(5px)  rotate(0.8deg); }
          60% { transform:translateX(-3px) rotate(-0.5deg); }
          80% { transform:translateX(2px)  rotate(0.3deg); }
        }
        @keyframes flash-glow {
          0%   { text-shadow:none; }
          30%  { text-shadow:0 0 40px rgba(6,182,212,0.8), 0 0 80px rgba(6,182,212,0.4); }
          100% { text-shadow:none; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes pulse-op { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* Letter classes */
        .letter-A1 { animation: fly-left   0.78s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
        .letter-U  { animation: fly-top    0.78s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
        .letter-R  { animation: fly-right  0.78s cubic-bezier(0.22,1,0.36,1) 0.18s both; }
        .letter-A2 { animation: fly-bottom 0.78s cubic-bezier(0.22,1,0.36,1) 0.26s both; }

        /* Collision shake — plays once when letters meet */
        .word-collide { animation: shake 0.38s ease 0.88s both, flash-glow 0.6s ease 0.88s both; }

        /* Settled state */
        .settled-badge   { animation: settle-in 0.55s cubic-bezier(0.22,1,0.36,1) 1.52s both; }
        .settled-sub     { animation: settle-in 0.55s cubic-bezier(0.22,1,0.36,1) 1.64s both; }
        .settled-tagline { animation: settle-in 0.55s cubic-bezier(0.22,1,0.36,1) 1.76s both; }
        .settled-p       { animation: settle-in 0.55s cubic-bezier(0.22,1,0.36,1) 1.88s both; }
        .settled-btns    { animation: settle-in 0.55s cubic-bezier(0.22,1,0.36,1) 2.00s both; }
        .settled-stats   { animation: settle-in 0.55s cubic-bezier(0.22,1,0.36,1) 2.14s both; }

        .cta-btn:hover   { transform:translateY(-2px) !important; box-shadow:0 16px 40px rgba(8,145,178,0.42) !important; }
        .cta-btn         { transition:all 0.22s ease !important; }
        .ghost-btn:hover { border-color:var(--brand) !important; color:var(--brand) !important; background:var(--brand-light) !important; }
        .ghost-btn       { transition:all 0.2s !important; }
        .feat-card:hover { transform:translateY(-5px) !important; border-color:var(--brand-border) !important; box-shadow:0 16px 40px rgba(8,145,178,0.1) !important; }
        .feat-card       { transition:all 0.25s ease !important; }
        .nav-link:hover  { color:var(--brand) !important; }
        .nav-link        { transition:color 0.2s; }
        .theme-btn:hover { border-color:var(--brand-border) !important; }
        .theme-btn       { transition:all 0.2s; }
      `}</style>

      {/* Canvas */}
      <div style={{ position:'fixed', inset:0, zIndex:0, opacity:canvasOp, transition:'opacity 0.1s linear', pointerEvents:'none' }}>
        <HeroBg scrollY={scrollY} isDark={isDark}/>
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        background:navBg, backdropFilter:"blur(20px)",
        borderBottom: scrollY > 40 ? "1px solid var(--border)" : "1px solid transparent",
        padding:"0 48px", height:68,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        transition:"all 0.3s",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:11, cursor:"pointer" }} onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>
          <AuraLogo size={32} clickable={false}/>
          <div>
            <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:17, letterSpacing:"-0.7px", color:"var(--text-primary)", lineHeight:1 }}>AURA</div>
            <div style={{ fontFamily:"var(--font-body)", fontSize:9, fontWeight:600, letterSpacing:"0.12em", color:"var(--text-muted)", textTransform:"uppercase" }}>AI Engine</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:24 }}>
          {['Features','How it works','Tech'].map((l,i) => (
            <a key={l} href={['#features','#how','#tech'][i]} className="nav-link"
              style={{ fontFamily:"var(--font-body)", color:"var(--text-muted)", fontSize:13, textDecoration:"none", fontWeight:600 }}>{l}</a>
          ))}
          <button className="theme-btn" onClick={toggleTheme} style={{
            width:36, height:36, borderRadius:10, background:"var(--input-bg)",
            border:"1px solid var(--border)", display:"flex", alignItems:"center",
            justifyContent:"center", cursor:"pointer", fontSize:16,
          }}>{isDark ? "☀️" : "🌙"}</button>
          <button className="cta-btn" onClick={handleCTA} style={{
            background:"linear-gradient(135deg,#0891b2,#06b6d4)", border:"none",
            color:"#fff", padding:"9px 22px", borderRadius:10, fontSize:13, fontWeight:700,
            cursor:"pointer", fontFamily:"var(--font-body)", boxShadow:"0 4px 16px rgba(8,145,178,0.3)",
          }}>{user ? "Dashboard →" : "Get Started"}</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position:"relative", zIndex:1,
        minHeight:"calc(100vh - 68px)",
        maxWidth:820, margin:"0 auto", padding:"0 48px",
        display:"flex", flexDirection:"column",
        justifyContent:"center", alignItems:"flex-start",
      }}>
        {/* ── Badge (settles in after collision) */}
        <div className="settled-badge" style={{
          display:"inline-flex", alignItems:"center", gap:8,
          background:"var(--brand-light)", border:"1px solid var(--brand-border)",
          borderRadius:20, padding:"5px 14px", marginBottom:24,
          fontSize:10, fontWeight:700, color:"var(--brand)",
          letterSpacing:"0.12em", textTransform:"uppercase",
          fontFamily:"var(--font-body)",
        }}>✦ AI-Powered Onboarding Engine</div>

        {/* ── Logo + AURA letters flying in ── */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
          <AuraLogo size={72} clickable={false}/>

          {/* Each letter flies from a different direction */}
          <div className="word-collide" style={{ display:"flex", alignItems:"baseline", gap:0, lineHeight:1 }}>
            {/* A — flies from left */}
            <span className="letter-A1" style={{
              fontFamily:"var(--font-display)", fontWeight:800,
              fontSize:88, letterSpacing:"-4px", lineHeight:1, display:"inline-block",
              background:"linear-gradient(120deg,#0c4a6e 0%,#0891b2 45%,#06b6d4 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>A</span>
            {/* U — flies from top */}
            <span className="letter-U" style={{
              fontFamily:"var(--font-display)", fontWeight:800,
              fontSize:88, letterSpacing:"-4px", lineHeight:1, display:"inline-block",
              background:"linear-gradient(120deg,#0891b2 0%,#06b6d4 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>U</span>
            {/* R — flies from right */}
            <span className="letter-R" style={{
              fontFamily:"var(--font-display)", fontWeight:800,
              fontSize:88, letterSpacing:"-4px", lineHeight:1, display:"inline-block",
              background:"linear-gradient(120deg,#0891b2 0%,#22d3ee 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>R</span>
            {/* A — flies from bottom */}
            <span className="letter-A2" style={{
              fontFamily:"var(--font-display)", fontWeight:800,
              fontSize:88, letterSpacing:"-4px", lineHeight:1, display:"inline-block",
              background:"linear-gradient(120deg,#0369a1 0%,#06b6d4 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>A</span>
          </div>
        </div>

        {/* ── Sub headline ── */}
        <div className="settled-sub">
          <h1 style={{
            fontFamily:"var(--font-display)", fontSize:40, fontWeight:800,
            lineHeight:1.18, letterSpacing:"-1.2px", margin:"0 0 20px", color:"var(--text-primary)",
          }}>
            Stop training everyone<br/>
            <span style={{ color:"var(--brand)" }}>the same way.</span>
          </h1>
        </div>

        {/* ── Body ── */}
        <p className="settled-p" style={{
          fontFamily:"var(--font-body)", fontSize:17, lineHeight:1.8,
          color:"var(--text-muted)", margin:"0 0 44px", maxWidth:520, fontWeight:400,
        }}>
          Upload your resume. Paste a job description.
          Get a personalized learning pathway built by real ML —
          not a GPT prompt. Zero hallucinations, every time.
        </p>

        {/* ── CTAs ── */}
        <div className="settled-btns" style={{ display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
          <button className="cta-btn" onClick={handleCTA} style={{
            background:"linear-gradient(135deg,#0891b2,#06b6d4)", border:"none",
            color:"#fff", padding:"15px 36px", borderRadius:12, fontSize:15, fontWeight:700,
            cursor:"pointer", fontFamily:"var(--font-body)", boxShadow:"0 6px 24px rgba(8,145,178,0.35)",
          }}>{user ? "Go to Dashboard →" : "Try AURA Free →"}</button>
          <a href="#how" className="ghost-btn" style={{
            background:"var(--bg-card)", border:"1px solid var(--border)",
            color:"var(--text-muted)", padding:"15px 24px", borderRadius:12,
            fontSize:15, fontWeight:600, cursor:"pointer",
            textDecoration:"none", fontFamily:"var(--font-body)",
          }}>See how it works</a>
        </div>

        {/* ── Stats ── */}
        <div className="settled-stats" style={{ display:"flex", gap:40, marginTop:52 }}>
          {[
            { val:"50+",  label:"Curated courses" },
            { val:"100%", label:"Local ML pipeline" },
            { val:"0",    label:"Hallucinations" },
          ].map(({ val, label }) => (
            <div key={label}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:28, fontWeight:800, color:"var(--brand)", letterSpacing:"-1px" }}>{val}</div>
              <div style={{ fontFamily:"var(--font-body)", fontSize:12, color:"var(--text-muted)", marginTop:3, fontWeight:500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{
          position:"absolute", bottom:36, left:"50%", transform:"translateX(-50%)",
          display:"flex", flexDirection:"column", alignItems:"center", gap:5,
          opacity: Math.max(0, 1 - scrollY/100), transition:"opacity 0.2s", pointerEvents:"none",
        }}>
          <span style={{ fontFamily:"var(--font-body)", fontSize:10, color:"var(--text-muted)", fontWeight:600, letterSpacing:"0.1em" }}>SCROLL</span>
          <div style={{ width:1, height:28, background:`linear-gradient(to bottom, var(--text-muted), transparent)` }}/>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          Everything below hero — blurred until user scrolls
      ═══════════════════════════════════════════════════════════ */}
      <div style={{
        filter: `blur(${belowBlur}px)`,
        opacity: belowOp,
        transition:"filter 0.2s ease, opacity 0.2s ease",
        willChange:"filter, opacity",
      }}>

        {/* HOW IT WORKS */}
        <section id="how" style={{
          position:"relative", zIndex:1,
          background:sectionBg, backdropFilter:"blur(20px)",
          borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)",
          padding:"88px 48px",
        }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <div style={{ display:"inline-block", background:"var(--brand-light)", border:"1px solid var(--brand-border)", borderRadius:20, padding:"5px 14px", fontSize:10, fontWeight:700, color:"var(--brand)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:16, fontFamily:"var(--font-body)" }}>How it works</div>
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:36, fontWeight:800, letterSpacing:"-1px", color:"var(--text-primary)", margin:0 }}>Three steps to your pathway</h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24 }}>
              {steps.map(({ num, title, desc }, i) => (
                <div key={num} style={{ textAlign:"center", position:"relative" }}>
                  {i < 2 && <div style={{ position:"absolute", top:27, left:"58%", width:"84%", height:1, background:"linear-gradient(to right, var(--border), transparent)", zIndex:0 }}/>}
                  <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#0891b2,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontSize:15, fontWeight:800, color:"#fff", margin:"0 auto 20px", boxShadow:"0 8px 24px rgba(8,145,178,0.3)", position:"relative", zIndex:1 }}>{num}</div>
                  <h3 style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:700, color:"var(--text-primary)", margin:"0 0 10px" }}>{title}</h3>
                  <p style={{ fontFamily:"var(--font-body)", fontSize:14, color:"var(--text-muted)", lineHeight:1.7, margin:0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" style={{ position:"relative", zIndex:1, padding:"88px 48px", background:"var(--bg-main)" }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <div style={{ display:"inline-block", background:"var(--brand-light)", border:"1px solid var(--brand-border)", borderRadius:20, padding:"5px 14px", fontSize:10, fontWeight:700, color:"var(--brand)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:16, fontFamily:"var(--font-body)" }}>Features</div>
              <h2 style={{ fontFamily:"var(--font-display)", fontSize:36, fontWeight:800, letterSpacing:"-1px", color:"var(--text-primary)", margin:0 }}>Built different from day one</h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
              {features.map(({ icon, title, desc }) => (
                <div key={title} className="feat-card" style={{
                  background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:18, padding:"28px 24px",
                  boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 8px rgba(13,27,42,0.04)",
                }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:"var(--brand-light)", border:"1px solid var(--brand-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:"var(--brand)", marginBottom:16 }}>{icon}</div>
                  <h3 style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:700, color:"var(--text-primary)", margin:"0 0 10px" }}>{title}</h3>
                  <p style={{ fontFamily:"var(--font-body)", fontSize:13, color:"var(--text-muted)", lineHeight:1.75, margin:0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TECH */}
        <section id="tech" style={{
          position:"relative", zIndex:1,
          background:sectionBg, backdropFilter:"blur(20px)",
          borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)",
          padding:"36px 48px",
        }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div style={{ fontFamily:"var(--font-body)", fontSize:10, color:"var(--text-muted)", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", textAlign:"center", marginBottom:20 }}>Powered by</div>
            <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", gap:10 }}>
              {["spaCy NLP","sentence-transformers","scikit-learn","rapidfuzz","Flask","React 18","Firebase","O*NET Dataset","all-MiniLM-L6-v2"].map(tech => (
                <span key={tech} style={{ fontFamily:"var(--font-mono)", background:"var(--input-bg)", border:"1px solid var(--border)", borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:500, color:"var(--text-muted)" }}>{tech}</span>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ position:"relative", zIndex:1, padding:"100px 48px", textAlign:"center", background:"var(--bg-main)" }}>
          <div style={{ maxWidth:560, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
              <AuraLogo size={80} clickable={false}/>
            </div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:40, fontWeight:800, letterSpacing:"-1.5px", color:"var(--text-primary)", margin:"0 0 16px" }}>Ready to close your gaps?</h2>
            <p style={{ fontFamily:"var(--font-body)", fontSize:16, color:"var(--text-muted)", lineHeight:1.8, margin:"0 0 40px" }}>Upload your resume, paste a job description, and get your personalised learning pathway in under 10 seconds.</p>
            <button className="cta-btn" onClick={handleCTA} style={{
              background:"linear-gradient(135deg,#0891b2,#06b6d4)", border:"none",
              color:"#fff", padding:"16px 52px", borderRadius:14, fontSize:16, fontWeight:700,
              cursor:"pointer", fontFamily:"var(--font-body)", boxShadow:"0 8px 32px rgba(8,145,178,0.35)",
            }}>{user ? "Go to Dashboard →" : "Start for Free →"}</button>
            <p style={{ fontFamily:"var(--font-mono)", color:"var(--text-muted)", fontSize:11, marginTop:16, opacity:0.6 }}>No credit card · Free forever · Demo mode available</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{
          position:"relative", zIndex:1,
          background: isDark ? "#040810" : "#0d1b2a",
          padding:"32px 48px", display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <AuraLogo size={28} clickable={false} animate={false}/>
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:14, color:"#f1f5f9", letterSpacing:"-0.4px" }}>AURA</div>
              <div style={{ fontFamily:"var(--font-body)", fontSize:9, fontWeight:600, letterSpacing:"0.1em", color:"#475569", textTransform:"uppercase" }}>AI Engine</div>
            </div>
          </div>
          <p style={{ fontFamily:"var(--font-body)", color:"#475569", fontSize:12, margin:0 }}>Built for IISc Hackathon · AI-Adaptive Onboarding Engine</p>
          <p style={{ fontFamily:"var(--font-mono)", color:"#334155", fontSize:11, margin:0 }}>spaCy · sentence-transformers · React</p>
        </footer>

      </div>{/* end blur wrapper */}
    </div>
  );
}
