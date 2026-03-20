import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Sora', sans-serif",
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: "absolute", top: "15%", left: "10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
        animation: "pulse 6s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "10%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)",
        animation: "pulse 8s ease-in-out infinite reverse",
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.1);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .login-card { animation: fadeUp 0.8s ease forwards; }
        .google-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(99,102,241,0.5) !important; }
        .google-btn { transition: all 0.3s ease; }
      `}</style>

      <div className="login-card" style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: "56px 48px",
        textAlign: "center",
        maxWidth: 420,
        width: "90%",
        boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo mark */}
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: 28, fontWeight: 800, color: "#fff",
          boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
        }}>A</div>

        <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          AURA
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: "0 0 40px", letterSpacing: "0.05em" }}>
          AI-ADAPTIVE ONBOARDING ENGINE
        </p>

        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, margin: "0 0 32px", lineHeight: 1.6 }}>
          Upload your resume. Paste a job description.<br />
          Get your personalized learning pathway in seconds.
        </p>

        <button className="google-btn" onClick={handleLogin} style={{
          width: "100%",
          padding: "14px 24px",
          background: "linear-gradient(135deg, #6366f1, #a855f7)",
          border: "none",
          borderRadius: 12,
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
          fontFamily: "'Sora', sans-serif",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="rgba(255,255,255,0.8)" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="rgba(255,255,255,0.6)" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="rgba(255,255,255,0.4)" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 24 }}>
          Your data is private and never sold.
        </p>
      </div>
    </div>
  );
}
