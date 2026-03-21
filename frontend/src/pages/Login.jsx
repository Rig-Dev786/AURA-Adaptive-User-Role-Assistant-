import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import AuraLogo from "../components/AuraLogo";

const FEATURES = [
  { icon:"◈", text:"Skill Gap Analysis" },
  { icon:"⬡", text:"Personalized Pathways" },
  { icon:"◎", text:"AI-Powered Reasoning" },
  { icon:"❋", text:"Real-Time Insights" },
];

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", background:"var(--bg-main)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24, position:"relative", overflow:"hidden",
    }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .login-card { animation: fadeUp 0.55s cubic-bezier(0.2,0.8,0.2,1) both; }
        .login-btn:hover { transform:translateY(-2px) !important; box-shadow:0 14px 36px rgba(8,145,178,0.38) !important; }
        .login-btn { transition: all 0.22s ease !important; }
        .feat-item:hover { border-color:var(--brand-border) !important; background:var(--bg-card) !important; }
        .feat-item { transition: all 0.18s !important; }
      `}</style>

      {/* Ambient blobs */}
      <div style={{ position:"absolute", top:"5%", left:"3%", width:560, height:560, borderRadius:"50%", background:"radial-gradient(circle, rgba(8,145,178,0.07) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"3%", right:"3%", width:440, height:440, borderRadius:"50%", background:"radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)", pointerEvents:"none" }}/>

      <div className="login-card" style={{
        zIndex:1, width:"100%", maxWidth:940,
        display:"grid", gridTemplateColumns:"1fr 1fr",
        background:"var(--bg-card)",
        border:"1px solid var(--border)",
        borderRadius:24, overflow:"hidden",
        boxShadow:"0 32px 80px rgba(15,23,42,0.1), 0 0 0 1px rgba(15,23,42,0.04)",
      }}>
        {/* LEFT — branding */}
        <div style={{
          padding:"52px 44px",
          background:"var(--input-bg)",
          borderRight:"1px solid var(--border)",
          display:"flex", flexDirection:"column", justifyContent:"space-between",
        }}>
          <div>
            {/* Logo lockup */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:40 }}>
              <AuraLogo size={40} clickable={false}/>
              <div>
                <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:22, letterSpacing:"-1px", color:"var(--text-primary)", lineHeight:1 }}>AURA</div>
                <div style={{ fontFamily:"var(--font-body)", fontSize:10, fontWeight:600, letterSpacing:"0.15em", color:"var(--text-muted)", textTransform:"uppercase", marginTop:2 }}>AI Onboarding Engine</div>
              </div>
            </div>

            <h2 style={{ fontFamily:"var(--font-display)", color:"var(--text-primary)", fontSize:27, fontWeight:800, lineHeight:1.28, margin:"0 0 16px", letterSpacing:"-0.8px" }}>
              Bridge the gap between{" "}
              <span style={{ color:"var(--brand)" }}>where you are</span>{" "}
              and where you want to be.
            </h2>
            <p style={{ fontFamily:"var(--font-body)", color:"var(--text-muted)", fontSize:14, lineHeight:1.75, margin:"0 0 30px", fontWeight:400 }}>
              Upload your resume, paste a job description, and AURA maps your exact skill gaps with a personalised learning pathway — in seconds.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
              {FEATURES.map(({ icon, text }) => (
                <div key={text} className="feat-item" style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"10px 13px", borderRadius:10,
                  background:"var(--bg-card)", border:"1px solid var(--border)",
                }}>
                  <span style={{ color:"var(--brand)", fontSize:16 }}>{icon}</span>
                  <span style={{ fontFamily:"var(--font-body)", color:"var(--text-muted)", fontSize:12, fontWeight:600 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontFamily:"var(--font-mono)", color:"var(--text-muted)", fontSize:10, marginTop:32, opacity:0.45, letterSpacing:"0.04em" }}>
            spaCy · sentence-transformers · React · Firebase
          </p>
        </div>

        {/* RIGHT — sign in */}
        <div style={{ padding:"52px 44px", display:"flex", flexDirection:"column", justifyContent:"center", background:"var(--bg-card)" }}>
          <h3 style={{ fontFamily:"var(--font-display)", color:"var(--text-primary)", fontSize:26, fontWeight:800, margin:"0 0 6px", letterSpacing:"-0.6px" }}>Welcome back</h3>
          <p style={{ fontFamily:"var(--font-body)", color:"var(--text-muted)", fontSize:14, margin:"0 0 36px", fontWeight:400 }}>Sign in to your AURA workspace to continue</p>

          <button className="login-btn" onClick={handleLogin} disabled={loading} style={{
            width:"100%", padding:"14px 24px",
            background:"linear-gradient(135deg,#0891b2,#06b6d4)",
            border:"none", borderRadius:12,
            color:"#fff", fontSize:14, fontWeight:700,
            cursor: loading ? "default" : "pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:12,
            boxShadow:"0 4px 20px rgba(8,145,178,0.3)",
            fontFamily:"var(--font-body)",
            letterSpacing:"0.01em",
          }}>
            {loading ? (
              <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                Authenticating…
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.4 1.582l3.509-3.49A11.8 11.8 0 0 0 12 0C7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                  <path fill="#34A853" d="M16.04 18.013A7.1 7.1 0 0 1 12 19.09c-3.133 0-5.781-2.013-6.723-4.822L1.238 17.335C3.193 21.293 7.265 24 12 24c2.933 0 5.735-1.043 7.834-3L16.04 18.013z"/>
                  <path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.081-1.474-.244-2.182H12v4.637h6.436a5.517 5.517 0 0 1-2.395 3.558L19.834 21z"/>
                  <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.91 12c0-.782.135-1.533.367-2.235L1.24 6.65A11.9 11.9 0 0 0 0 12c0 1.92.444 3.73 1.238 5.335l4.039-3.067z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {error && (
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:12, padding:"10px 14px", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10 }}>
              <span style={{ fontSize:14 }}>⚠</span>
              <p style={{ fontFamily:"var(--font-body)", color:"#ef4444", fontSize:13, margin:0 }}>{error}</p>
            </div>
          )}

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"28px 0" }}>
            <div style={{ flex:1, height:1, background:"var(--border)" }}/>
            <span style={{ fontFamily:"var(--font-mono)", color:"var(--text-muted)", fontSize:10, fontWeight:500, letterSpacing:"0.06em" }}>AURA V2.0</span>
            <div style={{ flex:1, height:1, background:"var(--border)" }}/>
          </div>

          <p style={{ fontFamily:"var(--font-body)", color:"var(--text-muted)", fontSize:12, textAlign:"center", lineHeight:1.6 }}>
            By signing in, you agree to our Terms &amp; Privacy Policy.<br/>
            <span style={{ fontFamily:"var(--font-mono)", fontSize:10, opacity:0.6 }}>No data sold. Ever.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
