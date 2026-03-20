import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import AuraLogo from "../components/AuraLogo";

const FEATURES = [
  { icon: "🎯", text: "Skill Gap Analysis" },
  { icon: "🗺️", text: "Personalized Pathways" },
  { icon: "⚡", text: "AI-Powered Reasoning" },
  { icon: "✦",  text: "Real-Time Insights" },
];

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch {
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      padding: "24px",
    }}>

      {/* ── Ambient background blobs ── */}
      <div className="animate-float" style={{
        position: "absolute", top: "10%", left: "5%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div className="animate-float" style={{
        position: "absolute", bottom: "5%", right: "5%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
        animationDelay: "3s", animationDirection: "reverse",
      }} />

      {/* ── Dot grid ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04,
        backgroundImage: "radial-gradient(circle, rgba(6,182,212,1) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }} />

      {/* ── Two-panel card ── */}
      <div className="animate-fade-up" style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 960,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid rgba(6,182,212,0.2)",
        boxShadow: "0 0 80px rgba(8,145,178,0.12), 0 40px 80px rgba(0,0,0,0.55)",
      }}>

        {/* ════ LEFT — Branding panel ════ */}
        <div style={{
          padding: "52px 44px",
          background: "linear-gradient(145deg, rgba(8,145,178,0.14) 0%, rgba(6,182,212,0.05) 100%)",
          borderRight: "1px solid rgba(6,182,212,0.14)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          {/* Logo + name */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
              <div className="aura-logo-wrap">
                <AuraLogo size={44} spin={true} />
              </div>
              <span className="aura-heading-sm">AURA</span>
            </div>

            {/* Tagline */}
            <h2 style={{
              color: "var(--text-main)", fontSize: 30, fontWeight: 800,
              lineHeight: 1.3, margin: "0 0 16px",
            }}>
              Bridge the gap between{" "}
              <span style={{
                background: "linear-gradient(135deg, #67e8f9, #0891b2)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                where you are
              </span>{" "}
              and where you want to be.
            </h2>

            <p style={{
              color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7,
              margin: "0 0 36px",
            }}>
              Upload your resume, paste a job description, and AURA maps your exact
              skill gaps with a personalised learning pathway — in seconds.
            </p>

            {/* Feature pills */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {FEATURES.map(({ icon, text }) => (
                <div key={text} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: "var(--radius-sm)",
                  background: "rgba(6,182,212,0.07)",
                  border: "1px solid rgba(6,182,212,0.18)",
                }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ color: "rgba(6,182,212,0.4)", fontSize: 12, marginTop: 32 }}>
            Powered by cutting-edge NLP &amp; LLM reasoning
          </p>
        </div>

        {/* ════ RIGHT — Login form ════ */}
        <div style={{
          padding: "52px 44px",
          background: "rgba(5,13,20,0.95)",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <h3 style={{ color: "var(--text-main)", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>
            Welcome back
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 36px" }}>
            Sign in to your AURA account to continue
          </p>

          {/* Google sign-in button */}
          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: "15px 24px",
              borderRadius: "var(--radius-md)",
              fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "default" : "pointer",
              marginBottom: 12,
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  animation: "login-spin 0.8s linear infinite",
                }} />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.4 1.582l3.509-3.49A11.8 11.8 0 0 0 12 0C7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                  <path fill="#34A853" d="M16.04 18.013A7.1 7.1 0 0 1 12 19.09c-3.133 0-5.781-2.013-6.723-4.822L1.238 17.335C3.193 21.293 7.265 24 12 24c2.933 0 5.735-1.043 7.834-3L16.04 18.013z"/>
                  <path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.081-1.474-.244-2.182H12v4.637h6.436a5.517 5.517 0 0 1-2.395 3.558L19.834 21z"/>
                  <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.91 12c0-.782.135-1.533.367-2.235L1.24 6.65A11.9 11.9 0 0 0 0 12c0 1.92.444 3.73 1.238 5.335l4.039-3.067z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <p style={{
              color: "#f87171", fontSize: 13, textAlign: "center",
              margin: "0 0 12px",
              animation: "fadeUp 0.3s ease",
            }}>{error}</p>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "monospace" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, textAlign: "center", margin: 0 }}>
            By signing in, you agree to our Terms &amp; Privacy Policy.
          </p>

          {/* Version badge */}
          <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "5px 14px", borderRadius: 99,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "rgba(16,185,129,0.8)", fontSize: 11, fontFamily: "monospace",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              AURA v1.0 — Hackathon Edition
            </span>
          </div>
        </div>
      </div>

      {/* Responsive: stack vertically on small screens */}
      <style>{`
        @keyframes login-spin { to { transform: rotate(360deg); } }
        @media (max-width: 720px) {
          [data-login-grid] { grid-template-columns: 1fr !important; }
          [data-login-left] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
