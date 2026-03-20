import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import AuraLogo from "../components/AuraLogo";

const SKILL_LABELS = ['Python', 'SQL', 'Docker', 'Spark', 'React', 'Kafka', 'Git', 'AWS', 'ML', 'NLP', 'dbt', 'Airflow', 'K8s', 'CI/CD', 'Tableau', 'Flask', 'Redis', 'PyTorch', 'Java', 'C++', 'C', 'Linux'];

function HeroBg({ scrollY }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const opacityRef = useRef(1);

  useEffect(() => {
    opacityRef.current = Math.max(0, 1 - scrollY / 700);
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
      nodesRef.current = Array.from({ length: 70 }, (_, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.5 + 1.5,
        label: i < SKILL_LABELS.length ? SKILL_LABELS[i] : null,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.012 + Math.random() * 0.018,
        type: i < SKILL_LABELS.length ? 'skill' : i < 28 ? 'core' : 'dot',
        alpha: 0.5 + Math.random() * 0.5,
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
          if (dist < 150) {
            const base = (1 - dist / 150) * 0.25 * op;
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
            const mdx = mx - mouse.x, mdy = my - mouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            const boost = mDist < 200 ? (1 - mDist / 200) * 0.4 : 0;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            // Bright cyan lines for dark mode
            ctx.strokeStyle = `rgba(6,182,212,${base + boost * op})`;
            ctx.lineWidth = 0.8 + boost * 0.8;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        const hover = mDist < 120;
        const pf = 1 + Math.sin(n.pulse) * 0.25;

        if (n.type === 'skill') {
          ctx.font = `600 11px 'Sora', system-ui`;
          const tw = ctx.measureText(n.label).width;
          const pad = 8, bw = tw + pad * 2, bh = 22;
          const bx = n.x - bw / 2, by = n.y - bh / 2;
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 6);
          // Dark badges with cyan border
          ctx.fillStyle = hover
            ? `rgba(6,182,212,${0.25 * op})`
            : `rgba(15,23,42,${0.85 * n.alpha * op})`;
          ctx.fill();
          ctx.strokeStyle = hover
            ? `rgba(6,182,212,${0.8 * op})`
            : `rgba(6,182,212,${0.35 * n.alpha * op})`;
          ctx.lineWidth = hover ? 1.2 : 0.8;
          ctx.stroke();
          ctx.fillStyle = hover
            ? `rgba(255,255,255,${op})`
            : `rgba(226,232,240,${0.8 * n.alpha * op})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(n.label, n.x, n.y);
        } else if (n.type === 'core') {
          const r = n.r * 2.5 * pf;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fillStyle = hover
            ? `rgba(6,182,212,${0.6 * op})`
            : `rgba(6,182,212,${0.25 * n.alpha * op})`;
          ctx.shadowBlur = hover ? 15 : 0;
          ctx.shadowColor = `rgba(6,182,212,1)`;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * pf, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(6,182,212,${0.2 * n.alpha * op})`;
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



export default function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const canvasOpacity = Math.max(0, 1 - scrollY / 600);

  // Dark mode background: fixed dark slate gradient
  const heroBg = `radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)`;

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
    <div style={{ minHeight: "100vh", fontFamily: "'Sora', sans-serif", color: "#f8fafc", overflowX: "hidden", background: "#0f172a", backgroundImage: heroBg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Nunito:wght@800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .fade1 { animation: fadeUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s both; }
        .fade2 { animation: fadeUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.25s both; }
        .fade3 { animation: fadeUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.38s both; }
        .fade4 { animation: fadeUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s both; }
        .fade5 { animation: fadeUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.65s both; }
        .cta-btn:hover  { transform:translateY(-2px); box-shadow:0 12px 36px rgba(14,165,233,0.4) !important; }
        .cta-btn  { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important; }
        .ghost-btn:hover { background:rgba(255,255,255,0.1) !important; border-color:rgba(255,255,255,0.3) !important; color:#fff !important; }
        .ghost-btn { transition: all 0.2s ease !important; }
        .feat-card:hover { transform:translateY(-6px); border-color:rgba(14,165,233,0.5) !important; box-shadow:0 20px 40px rgba(0,0,0,0.4) !important; background:#1e293b !important; }
        .feat-card { transition: all 0.3s ease !important; }
        .nav-link:hover { color:#38bdf8 !important; }
        .nav-link { transition:color 0.2s; }
        
        .aura-word {
          font-family: 'Nunito', 'Sora', sans-serif;
          font-weight: 900;
          font-size: 115px;
          letter-spacing: 2px;
          line-height: 1;
          /* Complex pastel gradient matching the image */
          background: linear-gradient(90deg, 
            #bdf4ff 0%,     /* Icy cyan on left A */
            #8ab4f8 25%,    /* Light blue U */
            #c8a5dc 50%,    /* Violet R */
            #f2b8b5 75%,    /* Warm peach/amber bottom R & right A */
            #fce2ae 100%    /* Golden highlight tip right A */
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          /* Shiny pseudo-3D rim and depth */
          -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.45);
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.5))
                  drop-shadow(0 2px 4px rgba(0,0,0,0.8));
        }
      `}</style>

      {/* Full-page canvas — fixed, fades on scroll */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: canvasOpacity, transition: 'opacity 0.08s linear', pointerEvents: 'none' }}>
        <HeroBg scrollY={scrollY} />
      </div>

      {/* NAVBAR */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrollY > 40 ? "rgba(15,23,42,0.85)" : "transparent",
        backdropFilter: scrollY > 40 ? "blur(20px)" : "none",
        borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        padding: "0 48px", height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <AuraLogo size={36} />
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.8px", color: "#f8fafc" }}>AURA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {['Features', 'How it works', 'Tech stack'].map((l, i) => (
            <a key={l} href={['#features', '#how', '#tech'][i]} className="nav-link"
              style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none", fontWeight: 500 }}>{l}</a>
          ))}
          <button className="cta-btn" onClick={handleCTA} style={{
            background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
            border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px 24px",
            borderRadius: 12, fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Sora',sans-serif",
            boxShadow: "0 4px 16px rgba(2,132,199,0.4)",
          }}>{user ? "Dashboard →" : "Get Started"}</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        position: "relative", zIndex: 1,
        minHeight: "calc(100vh - 72px)",
        maxWidth: 780, margin: "0 auto",
        padding: "0 48px",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "flex-start",
      }}>
        {/* Badge */}
        <div className="fade1" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)",
          borderRadius: 20, padding: "6px 16px",
          fontSize: 11, fontWeight: 700, color: "#38bdf8",
          letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 32,
          boxShadow: "0 0 20px rgba(56,189,248,0.15)",
        }}>✦ AI-Powered Onboarding Engine</div>

        {/* AURA big word */}
        <div className="fade2" style={{ marginBottom: 16 }}>
          <span className="aura-word">AURA</span>
        </div>

        {/* Tagline */}
        <h1 className="fade2" style={{
          fontSize: 44, fontWeight: 800, lineHeight: 1.15,
          letterSpacing: "-1.2px", margin: "0 0 24px", color: "#f8fafc",
        }}>
          Stop training everyone<br />
          <span style={{ color: "#38bdf8" }}>the same way.</span>
        </h1>

        <p className="fade3" style={{
          fontSize: 17, lineHeight: 1.8, color: "#94a3b8",
          margin: "0 0 48px", maxWidth: 520,
        }}>
          Upload your resume. Paste a job description.
          Get a personalized learning pathway built by real ML —
          not a GPT prompt. Zero hallucinations, every time.
        </p>

        <div className="fade4" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <button className="cta-btn" onClick={handleCTA} style={{
            background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
            border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "16px 40px",
            borderRadius: 14, fontSize: 16, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Sora',sans-serif",
            boxShadow: "0 8px 24px rgba(2,132,199,0.35)",
          }}>{user ? "Go to Dashboard →" : "Try AURA Free →"}</button>
          <a href="#how" className="ghost-btn" style={{
            background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#cbd5e1", padding: "16px 28px", borderRadius: 14,
            fontSize: 16, fontWeight: 500, cursor: "pointer",
            textDecoration: "none", fontFamily: "'Sora',sans-serif",
            backdropFilter: "blur(12px)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}>See how it works</a>
        </div>

        {/* Stats */}
        <div className="fade5" style={{ display: "flex", gap: 48, marginTop: 64 }}>
          {[
            { val: "50+", label: "Curated courses" },
            { val: "100%", label: "Local ML pipeline" },
            { val: "0", label: "Hallucinations" },
          ].map(({ val, label }) => (
            <div key={label}>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#38bdf8", letterSpacing: "-1px" }}>{val}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{
          position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          opacity: Math.max(0, 1 - scrollY / 120),
          transition: "opacity 0.2s",
        }}>
          <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: "0.15em" }}>SCROLL</span>
          <div style={{
            width: 1, height: 40,
            background: "linear-gradient(to bottom, #475569, transparent)",
          }} />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{
        position: "relative", zIndex: 1,
        background: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "96px 48px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{
              display: "inline-block", background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.2)", borderRadius: 20,
              padding: "6px 16px", fontSize: 11, fontWeight: 700, color: "#38bdf8",
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20,
            }}>How it works</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1px", color: "#f8fafc", margin: 0 }}>
              Three steps to your pathway
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} style={{ textAlign: "center", position: "relative" }}>
                {i < steps.length - 1 && (
                  <div style={{
                    position: "absolute", top: 32, left: "60%", width: "80%",
                    height: 2, background: "linear-gradient(to right, rgba(56,189,248,0.3), transparent)", zIndex: 0,
                  }} />
                )}
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800, color: "#fff",
                  margin: "0 auto 24px", border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 8px 24px rgba(2,132,199,0.5)",
                  position: "relative", zIndex: 1,
                }}>{num}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", margin: "0 0 12px" }}>{title}</h3>
                <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ position: "relative", zIndex: 1, padding: "96px 48px", background: "#0b1121" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{
              display: "inline-block", background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.2)", borderRadius: 20,
              padding: "6px 16px", fontSize: 11, fontWeight: 700, color: "#38bdf8",
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20,
            }}>Features</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1px", color: "#f8fafc", margin: 0 }}>
              Built different from day one
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="feat-card" style={{
                background: "#0f172a", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20, padding: "32px 28px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, color: "#38bdf8", marginBottom: 20,
                  boxShadow: "0 4px 12px rgba(56,189,248,0.15) inset",
                }}>{icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", margin: "0 0 12px" }}>{title}</h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.75, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STRIP */}
      <section id="tech" style={{
        position: "relative", zIndex: 1,
        background: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "40px 48px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 12, color: "#475569", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center", marginBottom: 24 }}>
            Powered by
          </div>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
            {["spaCy NLP", "sentence-transformers", "scikit-learn", "rapidfuzz", "Flask", "React 18", "Firebase", "O*NET Dataset", "all-MiniLM-L6-v2"].map((tech) => (
              <span key={tech} style={{
                background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 24, padding: "8px 18px",
                fontSize: 13, fontWeight: 600, color: "#94a3b8",
              }}>{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "120px 48px", textAlign: "center",
        background: "radial-gradient(circle at center, #1e293b 0%, #0b1121 100%)",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ filter: "drop-shadow(0 0 16px rgba(56,189,248,0.3))" }}>
            <AuraLogo size={80} />
          </div>
          <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-1.5px", color: "#f8fafc", margin: "32px 0 16px" }}>
            Ready to close your gaps?
          </h2>
          <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.8, margin: "0 0 44px" }}>
            Upload your resume, paste a job description, and get your
            personalized learning pathway in under 10 seconds.
          </p>
          <button className="cta-btn" onClick={handleCTA} style={{
            background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
            border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "18px 56px",
            borderRadius: 16, fontSize: 17, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Sora',sans-serif",
            boxShadow: "0 10px 36px rgba(2,132,199,0.4)",
          }}>{user ? "Go to Dashboard →" : "Start for Free →"}</button>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 20, fontWeight: 500 }}>
            No credit card · Free forever · Demo mode available
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        position: "relative", zIndex: 1,
        background: "#070b14", padding: "36px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AuraLogo size={28} />
          <span style={{ fontWeight: 800, fontSize: 16, color: "#f8fafc", letterSpacing: "-0.5px" }}>AURA</span>
        </div>
        <p style={{ color: "#64748b", fontSize: 13, margin: 0, fontWeight: 500 }}>Built for IISc Hackathon · AI-Adaptive Onboarding Engine</p>
        <p style={{ color: "#475569", fontSize: 13, margin: 0, fontWeight: 500 }}>spaCy · sentence-transformers · React</p>
      </footer>
    </div>
  );
}
