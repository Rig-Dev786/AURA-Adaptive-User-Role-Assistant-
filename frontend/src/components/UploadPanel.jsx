import { useState, useRef } from "react";
import axios from "axios";
import { auth } from "../firebase";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Demo profiles for judges
const DEMO_PROFILES = {
  engineer: {
    label: "👨‍💻 Data Engineer",
    jd: "We are looking for a Data Engineer with expertise in Apache Spark, Kafka, Airflow, dbt, Docker, Kubernetes, and cloud platforms (AWS/GCP). Experience with distributed systems and data pipelines is essential.",
  },
  ops: {
    label: "🔧 Field Operations Technician",
    jd: "Role requires proficiency in SAP ERP, IoT sensor management, predictive maintenance methodologies, Six Sigma certification, and AutoCAD. Knowledge of SCADA systems and equipment maintenance is a plus.",
  },
};

export default function UploadPanel({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (f && (f.name.endsWith(".pdf") || f.name.endsWith(".docx"))) {
      setFile(f);
    }
  };

  const loadDemo = (profile) => {
    setJdText(DEMO_PROFILES[profile].jd);
  };

  const handleSubmit = async () => {
    if (!file || !jdText.trim()) return;
    onLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const form = new FormData();
      form.append("resume_file", file);
      form.append("jd_text", jdText);
      const { data } = await axios.post(`${BACKEND}/analyze`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onResult(data);
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Is the backend running?");
    } finally {
      onLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, fontFamily: "'Sora', sans-serif" }}>
      {/* Resume Upload */}
      <div>
        <label style={{
          color: "var(--text-muted)", fontSize: 12, fontWeight: 600,
          letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 10
        }}>
          Resume (PDF or DOCX)
        </label>
        <div
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          style={{
            border: `2px dashed ${dragging ? "var(--brand)" : file ? "var(--success)" : "var(--border)"}`,
            borderRadius: 14,
            padding: "40px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "var(--brand-light)" : file ? "rgba(16,185,129,0.06)" : "var(--input-bg)",
            minHeight: 160,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
            boxShadow: dragging ? "0 0 40px rgba(8,145,178,0.15)" : "none",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={e => { if(!dragging && !file) e.currentTarget.style.borderColor = "var(--brand-border)"; }}
          onMouseLeave={e => { if(!dragging && !file) e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          <div style={{ 
            fontSize: 36, 
            transform: dragging ? "scale(1.2) translateY(-10px)" : "scale(1)", 
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}>{file ? "📄" : "⬆️"}</div>
          {file ? (
            <>
              <p style={{ color: "var(--brand)", fontWeight: 600, margin: 0 }}>{file.name}</p>
              <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>Click to change</p>
            </>
          ) : (
            <>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>
                Drop your resume here
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0, opacity: 0.6 }}>
                PDF or DOCX supported
              </p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.docx"
          style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {/* JD Input */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <label style={{
            color: "var(--text-muted)", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase"
          }}>
            Job Description
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(DEMO_PROFILES).map(([key, p]) => (
              <button key={key} onClick={() => loadDemo(key)} style={{
                color: "var(--brand)", fontSize: 11, padding: "3px 10px",
                borderRadius: 8, background: "var(--brand-light)",
                border: "1px solid var(--brand-border)", cursor: "pointer",
                fontWeight: 600, fontFamily: "'Sora', sans-serif",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(8,145,178,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--brand-light)"}
              >{p.label}</button>
            ))}
          </div>
        </div>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the job description here, or click a demo profile above..."
          style={{
            width: "100%", height: 180, padding: 16,
            borderRadius: 14, color: "var(--text-primary)", fontSize: 13,
            lineHeight: 1.6, resize: "none", outline: "none",
            boxSizing: "border-box",
            background: "var(--input-bg)",
            border: "1px solid var(--border)",
            fontFamily: "'Sora', sans-serif",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--brand)"}
          onBlur={(e) => e.target.style.borderColor = "var(--border)"}
        />
      </div>

      {/* Submit */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center" }}>
        <button onClick={handleSubmit} disabled={!file || !jdText.trim()} style={{
          padding: "16px 48px",
          borderRadius: 12, fontSize: 16,
          opacity: (!file || !jdText.trim()) ? 0.3 : 1,
          cursor: (!file || !jdText.trim()) ? "not-allowed" : "pointer",
          background: "linear-gradient(135deg,#0891b2,#06b6d4)",
          border: "none", color: "#fff", fontWeight: 700,
          fontFamily: "'Sora', sans-serif",
          boxShadow: "0 4px 16px rgba(8,145,178,0.3)",
          transition: "all 0.25s ease",
        }}
          onMouseEnter={e => { if(file && jdText.trim()) e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          ✦ Analyze My Profile
        </button>
      </div>
    </div>
  );
}
