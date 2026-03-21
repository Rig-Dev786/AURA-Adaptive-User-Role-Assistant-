import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import AuraLogo from "./AuraLogo";
import { applyTheme, getTheme } from "../theme";
import { useState } from "react";

const IconDash   = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>;
const IconHist   = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 3"/></svg>;
const IconLogout = () => <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

export default function Sidebar({ user }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [theme, setTheme] = useState(getTheme());
  const isDark = theme === "dark";

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const firstName = user?.displayName?.split(" ")[0] || "User";

  const NavItem = ({ path, label, Icon }) => {
    const active = location.pathname === path;
    return (
      <div onClick={() => navigate(path)} style={{
        display:"flex", alignItems:"center", gap:11,
        padding:"9px 12px", borderRadius:10, cursor:"pointer",
        marginBottom:3,
        background: active ? "var(--brand-light)" : "transparent",
        border: `1px solid ${active ? "var(--brand-border)" : "transparent"}`,
        color: active ? "var(--brand)" : "var(--text-muted)",
        fontSize:13, fontWeight:600,
        fontFamily:"var(--font-body)",
        transition:"all 0.18s",
      }}
        onMouseEnter={e => { if(!active){ e.currentTarget.style.background="var(--input-bg)"; e.currentTarget.style.color="var(--text-primary)"; }}}
        onMouseLeave={e => { if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--text-muted)"; }}}
      >
        <Icon/>{label}
        {active && <div style={{ marginLeft:"auto", width:5, height:5, borderRadius:"50%", background:"var(--brand)" }}/>}
      </div>
    );
  };

  return (
    <aside style={{
      width:232, position:"fixed", top:0, bottom:0, left:0, zIndex:50,
      background:"var(--bg-sidebar)",
      backdropFilter:"blur(24px)",
      borderRight:"1px solid var(--border)",
      display:"flex", flexDirection:"column",
      padding:"22px 14px",
    }}>
      {/* Brand — click to go home */}
      <div
        onClick={() => navigate("/")}
        style={{ display:"flex", alignItems:"center", gap:10, marginBottom:36, paddingLeft:4, cursor:"pointer" }}
      >
        <AuraLogo size={30} clickable={false}/>
        <div>
          <div style={{ fontFamily:"var(--font-display)", fontWeight:800, fontSize:16, letterSpacing:"-0.6px", color:"var(--text-primary)", lineHeight:1.1 }}>AURA</div>
          <div style={{ fontFamily:"var(--font-body)", fontSize:9, fontWeight:600, letterSpacing:"0.12em", color:"var(--text-muted)", textTransform:"uppercase" }}>AI Engine</div>
        </div>
      </div>

      {/* Nav section */}
      <div style={{ marginBottom:8 }}>
        <div style={{ fontSize:9.5, fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8, paddingLeft:12, fontFamily:"var(--font-body)" }}>Navigation</div>
        <NavItem path="/dashboard" label="Dashboard" Icon={IconDash}/>
        <NavItem path="/history"   label="History"   Icon={IconHist}/>
      </div>

      <div style={{ flex:1 }}/>

      {/* Bottom controls */}
      <div style={{ borderTop:"1px solid var(--border)", paddingTop:14, display:"flex", flexDirection:"column", gap:7 }}>

        {/* Theme toggle */}
        <div onClick={toggleTheme} style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"9px 12px", borderRadius:10, cursor:"pointer",
          background:"var(--input-bg)", border:"1px solid var(--border)",
          transition:"all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor="var(--brand-border)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; }}
        >
          <span style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", display:"flex", alignItems:"center", gap:8, fontFamily:"var(--font-body)" }}>
            <span style={{ fontSize:14 }}>{isDark ? "🌙" : "☀️"}</span>
            {isDark ? "Dark" : "Light"} mode
          </span>
          <div style={{
            width:32, height:18,
            background: isDark ? "var(--brand)" : "var(--border)",
            borderRadius:9, position:"relative", transition:"background 0.3s", flexShrink:0,
          }}>
            <div style={{
              width:14, height:14, background:"#fff", borderRadius:"50%",
              position:"absolute", top:2, left: isDark ? 16 : 2,
              transition:"left 0.3s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)",
            }}/>
          </div>
        </div>

        {/* User card */}
        <div onClick={handleLogout} style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"9px 12px", borderRadius:10, cursor:"pointer",
          background:"var(--input-bg)", border:"1px solid var(--border)",
          transition:"all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(239,68,68,0.35)"; e.currentTarget.style.background="rgba(239,68,68,0.04)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="var(--input-bg)"; }}
        >
          {user?.photoURL
            ? <img src={user.photoURL} alt="avatar" style={{ width:28, height:28, borderRadius:8, flexShrink:0 }}/>
            : <div style={{ width:28, height:28, borderRadius:8, background:"var(--brand-light)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"var(--brand)", flexShrink:0 }}>{firstName[0]}</div>
          }
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"var(--font-body)" }}>{firstName}</div>
            <div style={{ fontSize:10, color:"var(--text-muted)", display:"flex", alignItems:"center", gap:3, marginTop:1 }}><IconLogout/> Sign out</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
