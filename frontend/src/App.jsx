import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing       from "./pages/Landing";
import Login         from "./pages/Login";
import Dashboard     from "./pages/Dashboard";
import History       from "./pages/History";
import RoadmapViewer from "./pages/RoadmapViewer";
import { applyTheme, getTheme } from "./theme";

export default function App() {
  useEffect(() => { applyTheme(getTheme()); }, []);
  return (
    <Routes>
      <Route path="/"                  element={<Landing />} />
      <Route path="/login"             element={<Login />} />
      <Route path="/dashboard"         element={<Dashboard />} />
      <Route path="/history"           element={<History />} />
      <Route path="/roadmap/:roadmapId" element={<RoadmapViewer />} />
      <Route path="*"                  element={<Navigate to="/" />} />
    </Routes>
  );
}
