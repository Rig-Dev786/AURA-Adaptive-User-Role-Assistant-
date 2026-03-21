import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import { useTheme } from "./ThemeContext";

function FloatingThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Hide on pages that have Sidebar (which has its own toggle)
  if (location.pathname === "/dashboard" || location.pathname === "/history") return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 9999,
        width: 48, height: 48, borderRadius: "50%",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--text-primary)", transition: "all 0.3s ease",
        fontSize: 20,
      }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(8,145,178,0.25)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)"; }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history"   element={<History />} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
      <FloatingThemeToggle />
    </>
  );
}
