import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import AuraLogo from "./AuraLogo";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="glass-panel" style={{
      borderBottom: "1px solid var(--glass-border)",
      padding: "0 32px",
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onClick={() => navigate("/dashboard")}>
        <div className="aura-nav-logo">
          <AuraLogo size={34} spin={true} />
        </div>
        <span className="aura-heading-sm">AURA</span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { label: "Analyze", path: "/dashboard" },
          { label: "History", path: "/history" },
        ].map(({ label, path }) => (
          <button key={path} onClick={() => navigate(path)} style={{
            background: location.pathname === path
              ? "rgba(99,102,241,0.2)"
              : "transparent",
            border: location.pathname === path
              ? "1px solid rgba(99,102,241,0.4)"
              : "1px solid transparent",
            color: location.pathname === path ? "#a5b4fc" : "rgba(255,255,255,0.5)",
            padding: "6px 16px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "'Sora', sans-serif",
          }}>{label}</button>
        ))}
      </div>

      {/* User + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user?.photoURL && (
          <img src={user.photoURL} alt="avatar" style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "2px solid rgba(99,102,241,0.5)",
          }} />
        )}
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          {user?.displayName?.split(" ")[0]}
        </span>
        <button className="btn-secondary" onClick={handleLogout} style={{
          padding: "6px 14px",
          borderRadius: "var(--radius-sm)",
          fontSize: 13,
        }}>Logout</button>
      </div>
    </nav>
  );
}
