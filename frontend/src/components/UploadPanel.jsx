import { useState, useRef } from "react";
import axios from "axios";
import { auth } from "../firebase";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ─── Comprehensive Demo Profiles across all major domains ───────────────────
const DEMO_CATEGORIES = [
  {
    category: "💻 Technology",
    color: "#0891b2",
    profiles: [
      {
        key: "data_engineer",
        label: "Data Engineer",
        icon: "🗄️",
        jd: "We are looking for a Data Engineer with expertise in Apache Spark, Kafka, Airflow, dbt, Docker, Kubernetes, and cloud platforms (AWS/GCP). Experience with distributed systems, data pipelines, and data warehousing (Snowflake/BigQuery) is essential. Python and SQL proficiency required.",
      },
      {
        key: "ml_engineer",
        label: "ML Engineer",
        icon: "🤖",
        jd: "Seeking a Machine Learning Engineer with hands-on experience in TensorFlow, PyTorch, Scikit-learn, MLflow, and model deployment via REST APIs. Deep understanding of NLP, computer vision, feature engineering, and A/B testing. Familiarity with AWS SageMaker or GCP Vertex AI preferred.",
      },
      {
        key: "fullstack_dev",
        label: "Full-Stack Developer",
        icon: "🌐",
        jd: "Full-Stack Developer needed with strong proficiency in React, Node.js, TypeScript, REST APIs, and GraphQL. Experience with PostgreSQL, MongoDB, Redis, Docker, and CI/CD pipelines (GitHub Actions). Knowledge of system design, microservices architecture, and performance optimization required.",
      },
      {
        key: "devops_engineer",
        label: "DevOps Engineer",
        icon: "⚙️",
        jd: "DevOps Engineer role requires expertise in Kubernetes, Terraform, Ansible, Jenkins, GitHub Actions, Docker, and cloud infrastructure (AWS/Azure/GCP). Strong knowledge of monitoring tools (Prometheus, Grafana), logging (ELK stack), and security best practices. Linux administration skills essential.",
      },
      {
        key: "cybersecurity",
        label: "Cybersecurity Analyst",
        icon: "🔐",
        jd: "Cybersecurity Analyst with experience in penetration testing, SIEM tools (Splunk/QRadar), vulnerability assessment, network security, incident response, and OWASP standards. Certifications like CEH, CISSP, or CompTIA Security+ preferred. Familiarity with firewalls, IDS/IPS, and zero-trust architecture.",
      },
      {
        key: "cloud_architect",
        label: "Cloud Architect",
        icon: "☁️",
        jd: "Cloud Architect with deep expertise in AWS/Azure/GCP services, multi-cloud strategy, infrastructure as code (Terraform/CDK), serverless computing, cost optimization, and enterprise cloud migration. AWS Solutions Architect or Azure Solutions Expert certification preferred.",
      },
      {
        key: "mobile_dev",
        label: "Mobile App Developer",
        icon: "📱",
        jd: "Mobile Developer proficient in React Native or Flutter for cross-platform apps, Swift/Kotlin for native iOS/Android development. Experience with Firebase, RESTful APIs, App Store/Play Store deployment, push notifications, and offline-first architectures. UI/UX sensibility required.",
      },
      {
        key: "blockchain_dev",
        label: "Blockchain Developer",
        icon: "⛓️",
        jd: "Blockchain Developer with expertise in Solidity, Ethereum, Hardhat/Truffle, Web3.js/Ethers.js, smart contract auditing, DeFi protocols, and NFT standards (ERC-20, ERC-721). Knowledge of Layer-2 solutions (Polygon, Arbitrum) and IPFS storage is a strong plus.",
      },
    ],
  },
  {
    category: "🏥 Healthcare & Life Sciences",
    color: "#10b981",
    profiles: [
      {
        key: "clinical_data_analyst",
        label: "Clinical Data Analyst",
        icon: "🧬",
        jd: "Clinical Data Analyst with proficiency in SAS, R, clinical trial data management (EDC systems), CDISC standards (SDTM/ADaM), FDA regulatory submissions, and statistical analysis plans. Experience with biostatistics, patient data privacy (HIPAA), and pharmacovigilance preferred.",
      },
      {
        key: "health_informatics",
        label: "Health Informatics Specialist",
        icon: "🏥",
        jd: "Health Informatics Specialist with expertise in EHR systems (Epic, Cerner), HL7/FHIR standards, clinical workflows, ICD-10/CPT coding, data interoperability, and healthcare analytics. Project management (PMP) and HIMSS certification preferred.",
      },
      {
        key: "biomedical_engineer",
        label: "Biomedical Engineer",
        icon: "⚕️",
        jd: "Biomedical Engineer with knowledge of medical device design, FDA 510(k) regulatory process, ISO 13485, CAD software (SolidWorks), biomaterials, signal processing, and clinical testing protocols. Experience with wearable health tech, implantable devices, or diagnostics is highly desirable.",
      },
    ],
  },
  {
    category: "💰 Finance & Business",
    color: "#8b5cf6",
    profiles: [
      {
        key: "financial_analyst",
        label: "Financial Analyst",
        icon: "📊",
        jd: "Financial Analyst with proficiency in financial modeling, DCF valuation, Excel/VBA, Bloomberg Terminal, GAAP/IFRS accounting standards, budgeting, and variance analysis. CFA Level 1 or CFA charter preferred. Experience with ERP systems (SAP, Oracle) and Power BI reporting.",
      },
      {
        key: "investment_banker",
        label: "Investment Banking Analyst",
        icon: "🏦",
        jd: "Investment Banking Analyst with strong financial modeling skills, M&A transaction experience, LBO modeling, pitch deck preparation, due diligence coordination, and capital markets knowledge. Proficiency in Excel, PowerPoint, FactSet, and Bloomberg. Series 7/63 license preferred.",
      },
      {
        key: "risk_analyst",
        label: "Risk Analyst",
        icon: "⚖️",
        jd: "Risk Analyst with expertise in credit risk modeling, Basel III/IV frameworks, VaR calculations, stress testing, Python/R for quantitative analysis, and regulatory reporting (FRTB). CFA, FRM, or PRM certification preferred. Experience with SAS Risk or Moody's Analytics.",
      },
      {
        key: "data_analyst_biz",
        label: "Business Data Analyst",
        icon: "📈",
        jd: "Business Data Analyst with proficiency in SQL, Python, Tableau/Power BI, Excel, and A/B testing. Experience translating business requirements into analytical frameworks, creating executive dashboards, performing cohort analysis, and presenting insights to non-technical stakeholders.",
      },
    ],
  },
  {
    category: "🎨 Design & Creative",
    color: "#f97316",
    profiles: [
      {
        key: "ux_designer",
        label: "UX/UI Designer",
        icon: "🎨",
        jd: "UX/UI Designer with expertise in Figma, Adobe XD, user research, wireframing, prototyping, usability testing, design systems, and accessibility (WCAG 2.1). Portfolio demonstrating end-to-end product design process required. Knowledge of HTML/CSS and interaction design principles is a plus.",
      },
      {
        key: "product_designer",
        label: "Product Designer",
        icon: "🖌️",
        jd: "Product Designer with experience in human-centered design, Figma, Sketch, motion design (Principle/After Effects), end-to-end product lifecycle, design critique facilitation, and cross-functional collaboration with engineering and product teams. Strong portfolio showcasing shipped products.",
      },
      {
        key: "creative_director",
        label: "Creative Director",
        icon: "✨",
        jd: "Creative Director with a track record leading brand strategy, visual identity systems, campaign development, team leadership, Adobe Creative Suite mastery, and cross-channel creative execution. Experience with digital marketing, content production, and brand narrative development.",
      },
    ],
  },
  {
    category: "⚙️ Engineering & Manufacturing",
    color: "#eab308",
    profiles: [
      {
        key: "field_ops_tech",
        label: "Field Operations Technician",
        icon: "🔧",
        jd: "Role requires proficiency in SAP ERP, IoT sensor management, predictive maintenance methodologies, Six Sigma certification, and AutoCAD. Knowledge of SCADA systems, PLC programming, equipment maintenance, and safety regulations (OSHA, ISO 9001) is essential.",
      },
      {
        key: "mechanical_engineer",
        label: "Mechanical Engineer",
        icon: "🔩",
        jd: "Mechanical Engineer with proficiency in SolidWorks/CATIA, FEA analysis (ANSYS), GD&T, thermodynamics, fluid mechanics, manufacturing processes (CNC/3D printing), and product lifecycle management (PLM). Experience with DFMEA, design reviews, and cross-functional team collaboration.",
      },
      {
        key: "electrical_engineer",
        label: "Electrical Engineer",
        icon: "⚡",
        jd: "Electrical Engineer with expertise in PCB design (Altium/Eagle), embedded systems programming (C/C++), power electronics, motor drives, signal processing, circuit simulation (SPICE), and compliance testing (UL, CE, FCC). Experience with FPGA or ASIC design is a strong plus.",
      },
      {
        key: "civil_engineer",
        label: "Civil & Structural Engineer",
        icon: "🏗️",
        jd: "Civil Engineer with expertise in structural analysis (STAAD.Pro/SAP2000), AutoCAD, Revit BIM modeling, project management, geotechnical assessment, material testing, and construction supervision. PE licensure preferred. Knowledge of ACI, AISC, and ASCE codes required.",
      },
    ],
  },
  {
    category: "📚 Education & Research",
    color: "#06b6d4",
    profiles: [
      {
        key: "data_scientist_research",
        label: "Research Data Scientist",
        icon: "🔬",
        jd: "Research Data Scientist with strong background in statistical modeling, R/Python, experiment design, hypothesis testing, machine learning, academic writing, and grant application support. Experience publishing peer-reviewed research and working with IRB-compliant datasets preferred.",
      },
      {
        key: "instructional_designer",
        label: "Instructional Designer",
        icon: "📖",
        jd: "Instructional Designer with expertise in eLearning authoring tools (Articulate 360/Lectora), LMS platforms (Moodle/Canvas/Blackboard), ADDIE/SAM instructional models, HTML5, multimedia production, curriculum mapping, and learner analytics. ATD or CPTD certification preferred.",
      },
    ],
  },
  {
    category: "🚀 Product & Management",
    color: "#ec4899",
    profiles: [
      {
        key: "product_manager",
        label: "Product Manager",
        icon: "🗺️",
        jd: "Product Manager with experience in product roadmap development, Agile/Scrum methodology, Jira, user story writing, market analysis, stakeholder management, OKR frameworks, and go-to-market strategy. Technical background preferred. MBA or CSPO certification is a plus.",
      },
      {
        key: "project_manager",
        label: "Project Manager",
        icon: "📋",
        jd: "Project Manager with PMP certification, expertise in MS Project/Jira, Agile and Waterfall methodologies, risk management, budget control, cross-team coordination, and executive stakeholder reporting. Strong communication and problem-solving skills required.",
      },
      {
        key: "scrum_master",
        label: "Scrum Master / Agile Coach",
        icon: "🔄",
        jd: "Certified Scrum Master (CSM or PSM) with experience facilitating sprint ceremonies, removing impediments, coaching teams on Agile practices (SAFe/LeSS), using Jira/Confluence, and driving continuous improvement. Experience scaling Agile across multiple teams preferred.",
      },
    ],
  },
  {
    category: "🌿 Science & Environment",
    color: "#22c55e",
    profiles: [
      {
        key: "environmental_scientist",
        label: "Environmental Scientist",
        icon: "🌍",
        jd: "Environmental Scientist with expertise in EIA/EMP preparation, GIS (ArcGIS/QGIS), environmental compliance (EPA, ISO 14001), water/air quality analysis, soil sampling, ecological assessment, and sustainability reporting (GRI standards). Lab techniques and field sampling experience required.",
      },
      {
        key: "sustainability_analyst",
        label: "Sustainability Analyst",
        icon: "♻️",
        jd: "Sustainability Analyst with experience in ESG reporting (GRI, SASB, TCFD), carbon footprint analysis, life cycle assessment (LCA), supply chain sustainability, energy auditing, and stakeholder engagement. Knowledge of CDP disclosures and net-zero frameworks preferred.",
      },
    ],
  },
];

// Flatten all profiles for lookup
const ALL_PROFILES = DEMO_CATEGORIES.flatMap((cat) =>
  cat.profiles.map((p) => ({ ...p, categoryColor: cat.color }))
);

export default function UploadPanel({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (f && (f.name.endsWith(".pdf") || f.name.endsWith(".docx"))) {
      setFile(f);
    }
  };

  const loadDemo = (profile) => {
    setJdText(profile.jd);
    setSelectedProfile(profile.key);
    setDropdownOpen(false);
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

  const currentProfile = ALL_PROFILES.find((p) => p.key === selectedProfile);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, fontFamily: "var(--font-body)" }}>
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

          {/* ── Demo Profile Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                color: "var(--brand)", fontSize: 11, padding: "5px 12px",
                borderRadius: 8, background: "var(--brand-light)",
                border: "1px solid var(--brand-border)", cursor: "pointer",
                fontWeight: 700, fontFamily: "var(--font-body)",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(8,145,178,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--brand-light)"}
            >
              {currentProfile ? (
                <span>{currentProfile.icon} {currentProfile.label}</span>
              ) : (
                <span>🎯 Demo Profiles</span>
              )}
              <span style={{
                display: "inline-block",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                fontSize: 9,
              }}>▼</span>
            </button>

            {/* Dropdown Panel */}
            {dropdownOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 999,
                width: 480, maxHeight: 420,
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                overflow: "hidden", display: "flex",
                animation: "fadeUp 0.2s ease both",
              }}>
                {/* Left: category tabs */}
                <div style={{
                  width: 160, borderRight: "1px solid var(--border)",
                  overflowY: "auto", flexShrink: 0,
                  background: "var(--bg-main)",
                }}>
                  {DEMO_CATEGORIES.map((cat, i) => (
                    <button
                      key={cat.category}
                      onClick={() => setActiveCategory(i)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        width: "100%", padding: "10px 14px",
                        background: activeCategory === i ? "var(--bg-card)" : "transparent",
                        border: "none", borderLeft: activeCategory === i ? `3px solid ${cat.color}` : "3px solid transparent",
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.15s",
                        color: activeCategory === i ? "var(--text-primary)" : "var(--text-muted)",
                        fontSize: 11.5, fontWeight: activeCategory === i ? 700 : 500,
                        fontFamily: "var(--font-body)",
                        lineHeight: 1.3,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>
                        {cat.category.split(" ")[0]}
                      </span>
                      <span>{cat.category.split(" ").slice(1).join(" ")}</span>
                    </button>
                  ))}
                </div>

                {/* Right: profile list */}
                <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700,
                    color: DEMO_CATEGORIES[activeCategory].color,
                    letterSpacing: "0.09em", textTransform: "uppercase",
                    padding: "8px 16px 4px",
                  }}>
                    {DEMO_CATEGORIES[activeCategory].category}
                  </div>
                  {DEMO_CATEGORIES[activeCategory].profiles.map((profile) => (
                    <button
                      key={profile.key}
                      onClick={() => loadDemo(profile)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 10,
                        width: "100%", padding: "10px 16px",
                        background: selectedProfile === profile.key
                          ? `${DEMO_CATEGORIES[activeCategory].color}15`
                          : "transparent",
                        border: "none",
                        borderLeft: selectedProfile === profile.key
                          ? `3px solid ${DEMO_CATEGORIES[activeCategory].color}`
                          : "3px solid transparent",
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.15s",
                        fontFamily: "var(--font-body)",
                      }}
                      onMouseEnter={e => {
                        if (selectedProfile !== profile.key)
                          e.currentTarget.style.background = "var(--input-bg)";
                      }}
                      onMouseLeave={e => {
                        if (selectedProfile !== profile.key)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span style={{ fontSize: 18, lineHeight: 1 }}>{profile.icon}</span>
                      <div>
                        <div style={{
                          fontSize: 13, fontWeight: 600,
                          color: selectedProfile === profile.key
                            ? DEMO_CATEGORIES[activeCategory].color
                            : "var(--text-primary)",
                          marginBottom: 2,
                        }}>
                          {profile.label}
                        </div>
                        <div style={{
                          fontSize: 11, color: "var(--text-muted)",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {profile.jd.substring(0, 90)}…
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Backdrop to close dropdown */}
        {dropdownOpen && (
          <div
            onClick={() => setDropdownOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 998 }}
          />
        )}

        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the job description here, or pick a demo profile above…"
          style={{
            width: "100%", height: 180, padding: 16,
            borderRadius: 14, color: "var(--text-primary)", fontSize: 13,
            lineHeight: 1.6, resize: "none", outline: "none",
            boxSizing: "border-box",
            background: "var(--input-bg)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-body)",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--brand)"}
          onBlur={(e) => e.target.style.borderColor = "var(--border)"}
        />

        {/* Quick-select chips (most popular) */}
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
          {[
            { key: "data_engineer",   icon: "🗄️", label: "Data Engineer"      },
            { key: "fullstack_dev",   icon: "🌐", label: "Full-Stack Dev"     },
            { key: "ux_designer",     icon: "🎨", label: "UX/UI Designer"     },
            { key: "product_manager", icon: "🗺️", label: "Product Manager"    },
            { key: "financial_analyst", icon: "📊", label: "Finance Analyst"  },
          ].map((quick) => {
            const profile = ALL_PROFILES.find(p => p.key === quick.key);
            const isActive = selectedProfile === quick.key;
            const cat = DEMO_CATEGORIES.find(c => c.profiles.some(p => p.key === quick.key));
            return (
              <button
                key={quick.key}
                onClick={() => profile && loadDemo(profile)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "3px 9px", borderRadius: 20,
                  fontSize: 10.5, fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.15s",
                  background: isActive ? `${cat?.color}22` : "var(--input-bg)",
                  border: `1px solid ${isActive ? cat?.color + "66" : "var(--border)"}`,
                  color: isActive ? cat?.color : "var(--text-muted)",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--brand-light)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "var(--input-bg)"; }}
              >
                <span>{quick.icon}</span>
                <span>{quick.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setDropdownOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "3px 9px", borderRadius: 20,
              fontSize: 10.5, fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              transition: "all 0.15s",
              background: "var(--input-bg)",
              border: "1px solid var(--border)",
              color: "var(--brand)",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--brand-light)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--input-bg)"}
          >
            + More roles
          </button>
        </div>
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
          fontFamily: "var(--font-body)",
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
