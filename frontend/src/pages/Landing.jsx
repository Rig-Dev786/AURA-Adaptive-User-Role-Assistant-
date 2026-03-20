import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

const SKILL_LABELS = ['Python','SQL','Docker','Spark','React','Kafka','Git','AWS','ML','NLP','dbt','Airflow','K8s','CI/CD','Tableau','Flask','Redis','PyTorch'];

function HeroBg({ scrollY }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const opacityRef = useRef(1);

  useEffect(() => {
    opacityRef.current = Math.max(0, 1 - scrollY / 500);
  }, [scrollY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      initNodes();
    }

    function initNodes() {
      nodesRef.current = Array.from({ length: 65 }, (_, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2.5 + 1,
        label: i < SKILL_LABELS.length ? SKILL_LABELS[i] : null,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.012 + Math.random() * 0.018,
        type: i < SKILL_LABELS.length ? 'skill' : i < 28 ? 'core' : 'dot',
        alpha: 0.4 + Math.random() * 0.5,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const op = opacityRef.current;

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.pulse += n.pulseSpeed;
      });

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const base = (1 - dist / 140) * 0.18 * op;
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            const mdx = mx - mouse.x, mdy = my - mouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            const boost = mDist < 180 ? (1 - mDist / 180) * 0.3 : 0;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(8,145,178,${base + boost * op})`;
            ctx.lineWidth = 0.5 + boost * 0.6;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        const hover = mDist < 120;
        const pf = 1 + Math.sin(n.pulse) * 0.22;

        if (n.type === 'skill') {
          ctx.font = `600 10.5px 'Sora', system-ui`;
          const tw = ctx.measureText(n.label).width;
          const pad = 7, bw = tw + pad * 2, bh = 21;
          const bx = n.x - bw / 2, by = n.y - bh / 2;
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 5);
          ctx.fillStyle = hover
            ? `rgba(8,145,178,${0.12 * op})`
            : `rgba(8,145,178,${0.07 * n.alpha * op})`;
          ctx.fill();
          ctx.strokeStyle = hover
            ? `rgba(8,145,178,${0.55 * op})`
            : `rgba(8,145,178,${0.22 * n.alpha * op})`;
          ctx.lineWidth = hover ? 0.8 : 0.5;
          ctx.stroke();
          ctx.fillStyle = hover
            ? `rgba(8,145,178,${op})`
            : `rgba(15,23,42,${0.35 * n.alpha * op})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(n.label, n.x, n.y);
        } else if (n.type === 'core') {
          const r = n.r * 2.2 * pf;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = hover
            ? `rgba(8,145,178,${0.4 * op})`
            : `rgba(8,145,178,${0.15 * n.alpha * op})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * pf, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(8,145,178,${0.12 * n.alpha * op})`;
          ctx.fill();
        }
      });

      animRef.current = requestAnimationFrame(draw);
    }

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => { mouseRef.current = { x: -999, y: -999 }; };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', resize);

    resize();
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
      opacity: opacityRef.current,
      transition: 'opacity 0.1s linear',
    }} />
  );
}

function AuraLogo({ size = 32 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="url(#aura-lg)"/>
      <defs>
        <linearGradient id="aura-lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0891b2"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
      </defs>
      <circle cx="9"  cy="16" r="2.2" fill="white" fillOpacity="0.95"/>
      <circle cx="16" cy="9"  r="2.2" fill="white" fillOpacity="0.95"/>
      <circle cx="16" cy="23" r="2.2" fill="white" fillOpacity="0.95"/>
      <circle cx="23" cy="16" r="2.2" fill="white"/>
      <line x1="11" y1="15.4" x2="14.2" y2="10.4" stroke="white" strokeOpacity="0.75" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="11" y1="16.6" x2="14.2" y2="21.6" stroke="white" strokeOpacity="0.75" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="18" y1="9.5"  x2="21"   y2="14.8" stroke="white" strokeOpacity="0.75" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="18" y1="22.5" x2="21"   y2="17.2" stroke="white" strokeOpacity="0.75" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="16" y1="11.2" x2="16"   y2="20.8" stroke="white" strokeOpacity="0.25" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
    </svg>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const canvasOpacity = Math.max(0, 1 - scrollY / 480);
  // Hero bg transitions from white → slate as user scrolls
  const heroBlend = Math.min(1, scrollY / 600);
  const heroBg = `rgba(${Math.round(248 - heroBlend * 28)}, ${Math.round(250 - heroBlend * 24)}, ${Math.round(252 - heroBlend * 20)}, 1)`;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setChecking(false); });
    return unsub;
  }, []);

  const handleCTA = async () => {
    if (user) { navigate("/dashboard"); return; }
    try { await signInWithPopup(auth, provider); navigate("/dashboard"); }
    catch (err) { console.error(err); }
  };

  if (checking) return null;

  const features = [
    { icon: "◈", title: "Smart Skill Extraction", desc: "spaCy NLP + taxonomy matching parses your resume and JD to identify every skill automatically." },
    { icon: "⬡", title: "Gap Analysis Engine", desc: "Sentence-transformer embeddings + cosine similarity score each gap by severity — pure ML, no LLM." },
    { icon: "◎", title: "Personalized Pathway", desc: "Severity-ranked learning plan from 50 curated free courses, grounded in data not guesswork." },
    { icon: "❋", title: "Reasoning Trace", desc: "Every course recommendation includes a plain-English explanation of exactly why it was added." },
    { icon: "▣", title: "Cross-Domain Support", desc: "Works for technical roles (Data Engineer, SWE) and operational roles (Field Technician, Ops Manager)." },
    { icon: "⊕", title: "Zero Hallucinations", desc: "Template-based pathway generation — our algorithm never invents courses or fabricates resources." },
  ];

  const steps = [
    { num: "01", title: "Upload Resume", desc: "Drop your PDF or DOCX resume" },
    { num: "02", title: "Paste JD", desc: "Add the job description text" },
    { num: "03", title: "Get Pathway", desc: "Receive your personalized roadmap in seconds" },
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Sora', sans-serif", color: "#0f172a", overflowX: "hidden", background: heroBg, transition: "background 0.3s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        .fade1 { animation: fadeUp 0.7s ease 0.1s both; }
        .fade2 { animation: fadeUp 0.7s ease 0.25s both; }
        .fade3 { animation: fadeUp 0.7s ease 0.38s both; }
        .fade4 { animation: fadeUp 0.7s ease 0.5s both; }
        .fade5 { animation: fadeUp 0.7s ease 0.62s both; }
        .cta-btn:hover  { transform:translateY(-2px); box-shadow:0 16px 40px rgba(8,145,178,0.38) !important; }
        .cta-btn  { transition: all 0.25s ease !important; }
        .ghost-btn:hover { background:rgba(8,145,178,0.06) !important; border-color:rgba(8,145,178,0.3) !important; color:#0891b2 !important; }
        .ghost-btn { transition: all 0.2s ease !important; }
        .feat-card:hover { transform:translateY(-5px); border-color:rgba(8,145,178,0.3) !important; box-shadow:0 16px 40px rgba(8,145,178,0.09) !important; }
        .feat-card { transition: all 0.28s ease !important; }
        .nav-link:hover { color:#0891b2 !important; }
        .nav-link { transition:color 0.2s; }
        .aura-word {
          font-family:'Sora',sans-serif;
          font-weight:800;
          font-size:88px;
          letter-spacing:-5px;
          line-height:1;
          background: linear-gradient(120deg,#0c4a6e 0%,#0891b2 45%,#06b6d4 100%);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }
      `}</style>

      {/* Full-page canvas — fixed, fades on scroll */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: canvasOpacity, transition: 'opacity 0.08s linear', pointerEvents: 'none' }}>
        <HeroBg scrollY={scrollY} />
      </div>

      {/* NAVBAR */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrollY > 40 ? "rgba(248,250,252,0.95)" : "rgba(248,250,252,0.75)",
        backdropFilter: "blur(20px)",
        borderBottom: scrollY > 40 ? "1px solid #e2e8f0" : "1px solid rgba(226,232,240,0.5)",
        padding: "0 48px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>
          <AuraLogo size={34} />
          <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.8px", color: "#0f172a" }}>AURA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {['Features','How it works','Tech stack'].map((l,i) => (
            <a key={l} href={['#features','#how','#tech'][i]} className="nav-link"
              style={{ color:"#64748b", fontSize:14, textDecoration:"none", fontWeight:500 }}>{l}</a>
          ))}
          <button className="cta-btn" onClick={handleCTA} style={{
            background:"linear-gradient(135deg,#0891b2,#06b6d4)",
            border:"none", color:"#fff", padding:"9px 22px",
            borderRadius:10, fontSize:14, fontWeight:600,
            cursor:"pointer", fontFamily:"'Sora',sans-serif",
            boxShadow:"0 4px 16px rgba(8,145,178,0.3)",
          }}>{user ? "Dashboard →" : "Get Started"}</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        position: "relative", zIndex: 1,
        minHeight: "calc(100vh - 64px)",
        maxWidth: 760, margin: "0 auto",
        padding: "0 48px",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "flex-start",
      }}>
        {/* Badge */}
        <div className="fade1" style={{
          display:"inline-flex", alignItems:"center", gap:8,
          background:"rgba(8,145,178,0.08)", border:"1px solid rgba(8,145,178,0.2)",
          borderRadius:20, padding:"5px 14px",
          fontSize:11, fontWeight:700, color:"#0891b2",
          letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:28,
        }}>✦ AI-Powered Onboarding Engine</div>

        {/* AURA big word */}
        <div className="fade2" style={{ marginBottom: 8 }}>
          <span className="aura-word">AURA</span>
        </div>

        {/* Tagline */}
        <h1 className="fade2" style={{
          fontSize:40, fontWeight:800, lineHeight:1.18,
          letterSpacing:"-1.2px", margin:"0 0 24px", color:"#0f172a",
        }}>
          Stop training everyone<br/>
          <span style={{ color:"#0891b2" }}>the same way.</span>
        </h1>

        <p className="fade3" style={{
          fontSize:17, lineHeight:1.8, color:"#475569",
          margin:"0 0 44px", maxWidth:500,
        }}>
          Upload your resume. Paste a job description.
          Get a personalized learning pathway built by real ML —
          not a GPT prompt. Zero hallucinations, every time.
        </p>

        <div className="fade4" style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
          <button className="cta-btn" onClick={handleCTA} style={{
            background:"linear-gradient(135deg,#0891b2,#06b6d4)",
            border:"none", color:"#fff", padding:"15px 36px",
            borderRadius:12, fontSize:15, fontWeight:700,
            cursor:"pointer", fontFamily:"'Sora',sans-serif",
            boxShadow:"0 6px 24px rgba(8,145,178,0.35)",
          }}>{user ? "Go to Dashboard →" : "Try AURA Free →"}</button>
          <a href="#how" className="ghost-btn" style={{
            background:"rgba(255,255,255,0.7)", border:"1px solid #e2e8f0",
            color:"#475569", padding:"15px 24px", borderRadius:12,
            fontSize:15, fontWeight:500, cursor:"pointer",
            textDecoration:"none", fontFamily:"'Sora',sans-serif",
            backdropFilter:"blur(8px)",
          }}>See how it works</a>
        </div>

        {/* Stats */}
        <div className="fade5" style={{ display:"flex", gap:40, marginTop:56 }}>
          {[
            { val:"50+",   label:"Curated courses" },
            { val:"100%",  label:"Local ML pipeline" },
            { val:"0",     label:"Hallucinations" },
          ].map(({ val, label }) => (
            <div key={label}>
              <div style={{ fontSize:28, fontWeight:800, color:"#0891b2", letterSpacing:"-1px" }}>{val}</div>
              <div style={{ fontSize:12, color:"#94a3b8", marginTop:3, fontWeight:500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{
          position:"absolute", bottom:40, left:"50%", transform:"translateX(-50%)",
          display:"flex", flexDirection:"column", alignItems:"center", gap:6,
          opacity: Math.max(0, 1 - scrollY / 120),
          transition:"opacity 0.2s",
        }}>
          <span style={{ fontSize:11, color:"#94a3b8", fontWeight:500, letterSpacing:"0.08em" }}>SCROLL</span>
          <div style={{
            width:1, height:32,
            background:"linear-gradient(to bottom, #94a3b8, transparent)",
          }}/>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{
        position:"relative", zIndex:1,
        background:"#fff", borderTop:"1px solid #e2e8f0",
        borderBottom:"1px solid #e2e8f0", padding:"88px 48px",
      }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={{
              display:"inline-block", background:"rgba(8,145,178,0.08)",
              border:"1px solid rgba(8,145,178,0.2)", borderRadius:20,
              padding:"5px 14px", fontSize:11, fontWeight:700, color:"#0891b2",
              letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16,
            }}>How it works</div>
            <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:"-1px", color:"#0f172a", margin:0 }}>
              Three steps to your pathway
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:24 }}>
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} style={{ textAlign:"center", position:"relative" }}>
                {i < steps.length - 1 && (
                  <div style={{
                    position:"absolute", top:27, left:"58%", width:"84%",
                    height:1, background:"linear-gradient(to right, #e2e8f0, transparent)", zIndex:0,
                  }}/>
                )}
                <div style={{
                  width:56, height:56, borderRadius:"50%",
                  background:"linear-gradient(135deg,#0891b2,#06b6d4)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:15, fontWeight:800, color:"#fff",
                  margin:"0 auto 20px",
                  boxShadow:"0 8px 24px rgba(8,145,178,0.3)",
                  position:"relative", zIndex:1,
                }}>{num}</div>
                <h3 style={{ fontSize:18, fontWeight:700, color:"#0f172a", margin:"0 0 10px" }}>{title}</h3>
                <p style={{ fontSize:14, color:"#64748b", lineHeight:1.7, margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ position:"relative", zIndex:1, padding:"88px 48px", background:"#f8fafc" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={{
              display:"inline-block", background:"rgba(8,145,178,0.08)",
              border:"1px solid rgba(8,145,178,0.2)", borderRadius:20,
              padding:"5px 14px", fontSize:11, fontWeight:700, color:"#0891b2",
              letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16,
            }}>Features</div>
            <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:"-1px", color:"#0f172a", margin:0 }}>
              Built different from day one
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="feat-card" style={{
                background:"#fff", border:"1px solid #e2e8f0",
                borderRadius:18, padding:"28px 24px",
                boxShadow:"0 2px 8px rgba(15,23,42,0.04)",
              }}>
                <div style={{
                  width:44, height:44, borderRadius:12,
                  background:"rgba(8,145,178,0.08)", border:"1px solid rgba(8,145,178,0.15)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:20, color:"#0891b2", marginBottom:16,
                }}>{icon}</div>
                <h3 style={{ fontSize:16, fontWeight:700, color:"#0f172a", margin:"0 0 10px" }}>{title}</h3>
                <p style={{ fontSize:13, color:"#64748b", lineHeight:1.75, margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STRIP */}
      <section id="tech" style={{
        position:"relative", zIndex:1,
        background:"#fff", borderTop:"1px solid #e2e8f0",
        borderBottom:"1px solid #e2e8f0", padding:"36px 48px",
      }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontSize:11, color:"#94a3b8", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", textAlign:"center", marginBottom:20 }}>
            Powered by
          </div>
          <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", gap:10 }}>
            {["spaCy NLP","sentence-transformers","scikit-learn","rapidfuzz","Flask","React 18","Firebase","O*NET Dataset","all-MiniLM-L6-v2"].map((tech) => (
              <span key={tech} style={{
                background:"#f8fafc", border:"1px solid #e2e8f0",
                borderRadius:20, padding:"6px 16px",
                fontSize:13, fontWeight:500, color:"#475569",
              }}>{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        position:"relative", zIndex:1,
        padding:"100px 48px", textAlign:"center",
        background:"linear-gradient(180deg,#f0fdfe 0%,#e0f7fa 100%)",
      }}>
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          <AuraLogo size={72} />
          <h2 style={{ fontSize:40, fontWeight:800, letterSpacing:"-1.5px", color:"#0f172a", margin:"28px 0 16px" }}>
            Ready to close your gaps?
          </h2>
          <p style={{ fontSize:16, color:"#64748b", lineHeight:1.8, margin:"0 0 40px" }}>
            Upload your resume, paste a job description, and get your
            personalized learning pathway in under 10 seconds.
          </p>
          <button className="cta-btn" onClick={handleCTA} style={{
            background:"linear-gradient(135deg,#0891b2,#06b6d4)",
            border:"none", color:"#fff", padding:"16px 52px",
            borderRadius:14, fontSize:16, fontWeight:700,
            cursor:"pointer", fontFamily:"'Sora',sans-serif",
            boxShadow:"0 8px 32px rgba(8,145,178,0.35)",
          }}>{user ? "Go to Dashboard →" : "Start for Free →"}</button>
          <p style={{ color:"#94a3b8", fontSize:13, marginTop:16 }}>
            No credit card · Free forever · Demo mode available
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        position:"relative", zIndex:1,
        background:"#0f172a", padding:"32px 48px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <AuraLogo size={28} />
          <span style={{ fontWeight:800, fontSize:15, color:"#fff", letterSpacing:"-0.5px" }}>AURA</span>
        </div>
        <p style={{ color:"#475569", fontSize:13, margin:0 }}>Built for IISc Hackathon · AI-Adaptive Onboarding Engine</p>
        <p style={{ color:"#334155", fontSize:13, margin:0 }}>spaCy · sentence-transformers · React</p>
      </footer>
    </div>
  );
}
