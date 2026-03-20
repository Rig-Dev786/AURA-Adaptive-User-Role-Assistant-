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
          color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600,
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
            border: `2px dashed ${dragging ? "#6366f1" : file ? "#a855f7" : "rgba(255,255,255,0.15)"}`,
            borderRadius: 16,
            padding: "40px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "rgba(99,102,241,0.05)" : file ? "rgba(168,85,247,0.05)" : "rgba(255,255,255,0.02)",
            transition: "all 0.2s",
            minHeight: 160,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
          }}>
          <div style={{ fontSize: 36 }}>{file ? "📄" : "⬆️"}</div>
          {file ? (
            <>
              <p style={{ color: "#a5b4fc", fontWeight: 600, margin: 0 }}>{file.name}</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>Click to change</p>
            </>
          ) : (
            <>
              <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: 14 }}>
                Drop your resume here
              </p>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, margin: 0 }}>
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
            color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase"
          }}>
            Job Description
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(DEMO_PROFILES).map(([key, p]) => (
              <button key={key} onClick={() => loadDemo(key)} style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "#a5b4fc", fontSize: 11, padding: "3px 10px",
                borderRadius: 6, cursor: "pointer", fontFamily: "'Sora', sans-serif",
              }}>{p.label}</button>
            ))}
          </div>
        </div>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the job description here, or click a demo profile above..."
          style={{
            width: "100%", height: 180, padding: 16,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16, color: "#fff", fontSize: 13,
            lineHeight: 1.6, resize: "none", outline: "none",
            fontFamily: "'Sora', sans-serif",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
        />
      </div>

      {/* Submit */}
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center" }}>
        <button onClick={handleSubmit} disabled={!file || !jdText.trim()} style={{
          background: (!file || !jdText.trim())
            ? "rgba(99,102,241,0.3)"
            : "linear-gradient(135deg, #6366f1, #a855f7)",
          border: "none",
          color: (!file || !jdText.trim()) ? "rgba(255,255,255,0.3)" : "#fff",
          padding: "14px 48px",
          borderRadius: 12, fontSize: 15, fontWeight: 600,
          cursor: (!file || !jdText.trim()) ? "not-allowed" : "pointer",
          fontFamily: "'Sora', sans-serif",
          transition: "all 0.3s",
          boxShadow: (!file || !jdText.trim()) ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
        }}>
          ✦ Analyze My Profile
        </button>
      </div>
    </div>
  );
}
