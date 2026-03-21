import { useState, useRef, useEffect } from "react";
import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const JD_LIBRARY = [
  // ── Data & Engineering
  { key:"de",      cat:"Data",        emoji:"👨‍💻", label:"Data Engineer",              jd:"Senior Data Engineer with expertise in Apache Spark, Kafka, Airflow, dbt, Docker, Kubernetes, AWS/GCP, SQL, and distributed data pipeline design. Experience with data warehousing and stream processing essential." },
  { key:"da",      cat:"Data",        emoji:"📈", label:"Data Analyst",               jd:"Data Analyst skilled in Python, SQL, Tableau, Power BI, Excel, statistical modelling, A/B testing, Google Analytics, and ETL pipelines. Strong business intelligence and data storytelling required." },
  { key:"ds",      cat:"Data",        emoji:"🔬", label:"Data Scientist",             jd:"Data Scientist with expertise in Python, R, machine learning, scikit-learn, statistical analysis, Jupyter, SQL, feature engineering, and model evaluation. Experience deploying models to production required." },
  { key:"bi",      cat:"Data",        emoji:"📊", label:"BI Developer",               jd:"BI Developer proficient in Power BI, Tableau, SQL Server, DAX, data modelling, ETL processes, Excel, and stakeholder reporting. Experience with Azure Synapse or Snowflake a plus." },
  { key:"de2",     cat:"Data",        emoji:"🗄️", label:"Database Administrator",      jd:"DBA with strong skills in PostgreSQL, MySQL, Oracle, performance tuning, backup/recovery, query optimisation, indexing, and database security. Experience with cloud-managed databases required." },
  { key:"darch",   cat:"Data",        emoji:"🏗️", label:"Data Architect",             jd:"Data Architect with expertise in data modelling, schema design, cloud data platforms (Snowflake, BigQuery, Redshift), data governance, metadata management, and enterprise data strategy." },
  { key:"mlops",   cat:"Data",        emoji:"⚙️", label:"MLOps Engineer",             jd:"MLOps Engineer with expertise in MLflow, Kubeflow, Docker, Kubernetes, CI/CD, Python, model monitoring, feature stores, and cloud ML platforms (AWS SageMaker, GCP Vertex AI)." },

  // ── AI & ML
  { key:"mle",     cat:"AI/ML",       emoji:"🤖", label:"ML Engineer",               jd:"Machine Learning Engineer with expertise in PyTorch, TensorFlow, scikit-learn, Hugging Face, Python, MLflow, SQL, and cloud ML deployment. NLP and computer vision experience preferred." },
  { key:"nlp",     cat:"AI/ML",       emoji:"💬", label:"NLP Engineer",              jd:"NLP Engineer with expertise in Hugging Face transformers, spaCy, BERT/GPT fine-tuning, text classification, Python, PyTorch, and deploying NLP models via REST APIs." },
  { key:"cv",      cat:"AI/ML",       emoji:"👁️", label:"Computer Vision Engineer",  jd:"Computer Vision Engineer proficient in OpenCV, PyTorch, YOLO, image segmentation, object detection, Python, and deploying CV models on edge and cloud platforms." },
  { key:"aie",     cat:"AI/ML",       emoji:"🧠", label:"AI Research Scientist",     jd:"AI Research Scientist with expertise in deep learning, reinforcement learning, PyTorch, TensorFlow, paper implementation, Python, CUDA, and publishing research. Strong maths background required." },
  { key:"llm",     cat:"AI/ML",       emoji:"✨", label:"LLM / GenAI Engineer",      jd:"GenAI Engineer skilled in LangChain, LlamaIndex, OpenAI API, prompt engineering, RAG pipelines, vector databases (Pinecone, Weaviate), Python, and deploying LLM-based applications." },

  // ── Software Engineering
  { key:"be",      cat:"Engineering", emoji:"💻", label:"Backend Engineer",           jd:"Backend Engineer proficient in Python, FastAPI, PostgreSQL, Redis, Docker, Kubernetes, REST APIs, GraphQL, and CI/CD pipelines. Microservices architecture and AWS Lambda experience required." },
  { key:"fe",      cat:"Engineering", emoji:"🎨", label:"Frontend Engineer",          jd:"Frontend Engineer with expertise in React, TypeScript, Tailwind CSS, Redux, REST APIs, Jest, Webpack/Vite, accessibility standards, and responsive design. Experience with Next.js preferred." },
  { key:"fs",      cat:"Engineering", emoji:"🔧", label:"Full Stack Engineer",        jd:"Full Stack Engineer skilled in React, Node.js, Python, PostgreSQL, MongoDB, Docker, AWS, REST APIs, GraphQL, and CI/CD. Experience building scalable SaaS applications required." },
  { key:"mob",     cat:"Engineering", emoji:"📱", label:"Mobile Developer",           jd:"Mobile Developer with expertise in React Native, Flutter, iOS (Swift), Android (Kotlin), REST APIs, Firebase, App Store deployment, and mobile UI/UX best practices." },
  { key:"emb",     cat:"Engineering", emoji:"🔌", label:"Embedded Engineer",          jd:"Embedded Systems Engineer with expertise in C/C++, RTOS, ARM architecture, hardware debugging, I2C/SPI/UART protocols, PCB design, and IoT firmware development." },
  { key:"java",    cat:"Engineering", emoji:"☕", label:"Java Developer",             jd:"Java Developer proficient in Spring Boot, Hibernate, Maven, microservices, JUnit, REST APIs, PostgreSQL, Docker, and CI/CD pipelines. Experience with Kafka and distributed systems preferred." },
  { key:"go",      cat:"Engineering", emoji:"🐹", label:"Go / Golang Developer",      jd:"Go Developer with expertise in Golang, gRPC, REST APIs, Docker, Kubernetes, PostgreSQL, Redis, and building high-performance distributed systems. Open source contributions a plus." },
  { key:"sre",     cat:"Engineering", emoji:"🛠️", label:"Site Reliability Engineer",  jd:"SRE with expertise in Kubernetes, Terraform, Prometheus, Grafana, incident management, SLO/SLI definition, Python, Go, and cloud platforms (AWS/GCP/Azure). On-call experience required." },

  // ── DevOps & Cloud
  { key:"devops",  cat:"DevOps",      emoji:"🚀", label:"DevOps Engineer",            jd:"DevOps Engineer with hands-on experience in Terraform, Ansible, Jenkins, GitHub Actions, Docker, Kubernetes, AWS/GCP/Azure, Linux, Prometheus, Grafana, and security best practices." },
  { key:"cloud",   cat:"DevOps",      emoji:"☁️", label:"Cloud Architect",            jd:"Cloud Architect with expertise in AWS, GCP, Azure, infrastructure as code (Terraform), cloud-native design patterns, cost optimisation, security, and multi-cloud strategy." },
  { key:"sec",     cat:"DevOps",      emoji:"🔒", label:"Platform Engineer",          jd:"Platform Engineer skilled in Kubernetes, Helm, ArgoCD, Terraform, GitHub Actions, Python, observability tooling, and developer experience. Experience building internal developer platforms required." },

  // ── Security
  { key:"cyber",   cat:"Security",    emoji:"🛡️", label:"Cybersecurity Analyst",     jd:"Cybersecurity Analyst with experience in penetration testing, SIEM tools, network security, incident response, OWASP, Python scripting, firewall management, and ISO 27001 / SOC 2 compliance." },
  { key:"seceng",  cat:"Security",    emoji:"🔐", label:"Security Engineer",          jd:"Security Engineer proficient in application security, threat modelling, SAST/DAST tools, cloud security (AWS, GCP), zero-trust architecture, Python, and security automation." },
  { key:"appsec",  cat:"Security",    emoji:"🧱", label:"AppSec Specialist",          jd:"Application Security Specialist with expertise in OWASP Top 10, code review, SAST/DAST, API security, bug bounty experience, and integrating security into CI/CD pipelines." },

  // ── Product & Design
  { key:"pm",      cat:"Product",     emoji:"📋", label:"Product Manager",            jd:"Product Manager with experience in Agile/Scrum, JIRA, product roadmap planning, A/B testing, SQL for data analysis, Figma wireframing, and stakeholder management. SaaS experience preferred." },
  { key:"ux",      cat:"Product",     emoji:"🎭", label:"UX Designer",               jd:"UX Designer with expertise in Figma, user research, wireframing, usability testing, design systems, prototyping, accessibility, and collaborating closely with engineering teams." },
  { key:"uiux",    cat:"Product",     emoji:"🎨", label:"UI/UX Engineer",             jd:"UI/UX Engineer combining design skills (Figma, design systems) with frontend expertise (React, CSS, animations) to build beautiful, accessible, and performant user interfaces." },
  { key:"growth",  cat:"Product",     emoji:"📣", label:"Growth Manager",             jd:"Growth Manager skilled in SEO, SEM, Google Analytics, A/B testing, funnel optimisation, CRM tools, SQL, email marketing, and data-driven growth experimentation." },

  // ── Finance & Quant
  { key:"quant",   cat:"Finance",     emoji:"📐", label:"Quantitative Analyst",       jd:"Quantitative Analyst with expertise in Python, R, financial modelling, time series analysis, derivatives pricing, Monte Carlo simulation, SQL, and Bloomberg Terminal." },
  { key:"fa",      cat:"Finance",     emoji:"💰", label:"Financial Analyst",          jd:"Financial Analyst skilled in Excel, financial modelling, DCF analysis, SQL, Power BI, accounting principles, budgeting, and forecasting. CFA certification preferred." },
  { key:"risk",    cat:"Finance",     emoji:"⚖️", label:"Risk Analyst",               jd:"Risk Analyst with expertise in quantitative risk modelling, Python, SQL, VaR calculations, credit risk, regulatory reporting (Basel III), and financial data analysis." },

  // ── Operations & Field
  { key:"ops",     cat:"Operations",  emoji:"🔧", label:"Field Ops Technician",       jd:"Field Operations Technician proficient in SAP ERP, IoT sensor management, predictive maintenance, Six Sigma, AutoCAD, SCADA systems, PLC programming, and equipment maintenance." },
  { key:"scm",     cat:"Operations",  emoji:"📦", label:"Supply Chain Manager",       jd:"Supply Chain Manager with expertise in SAP, logistics planning, inventory management, procurement, Lean/Six Sigma, ERP systems, supplier negotiation, and demand forecasting." },
  { key:"proj",    cat:"Operations",  emoji:"📅", label:"Project Manager",            jd:"Project Manager (PMP) with expertise in Agile, Scrum, JIRA, MS Project, risk management, stakeholder communication, budgeting, and cross-functional team leadership." },
  { key:"ops2",    cat:"Operations",  emoji:"🏭", label:"Manufacturing Engineer",     jd:"Manufacturing Engineer with expertise in CAD/CAM, Six Sigma, Lean manufacturing, CNC programming, quality control, AutoCAD, GD&T, and process improvement methodologies." },

  // ── Healthcare & Science
  { key:"bio",     cat:"Science",     emoji:"🧬", label:"Bioinformatics Engineer",    jd:"Bioinformatics Engineer with expertise in Python, R, genomic data analysis, NGS pipelines, BLAST, sequence alignment, machine learning, and cloud computing for large-scale biology." },
  { key:"clin",    cat:"Science",     emoji:"🏥", label:"Clinical Data Scientist",    jd:"Clinical Data Scientist with expertise in R, Python, SAS, clinical trial analysis, survival analysis, biostatistics, FDA regulatory submissions, and medical data governance." },

  // ── Management & Leadership
  { key:"cto",     cat:"Leadership",  emoji:"👔", label:"CTO / VP Engineering",       jd:"CTO with expertise in engineering org design, system architecture, cloud infrastructure, Agile at scale, technical roadmap planning, stakeholder management, and team hiring." },
  { key:"em",      cat:"Leadership",  emoji:"🧑‍💼", label:"Engineering Manager",       jd:"Engineering Manager with experience leading distributed teams, Agile/Scrum, career development, system design reviews, cross-functional collaboration, and technical decision-making." },

  // ── Emerging Tech
  { key:"block",   cat:"Emerging",    emoji:"⛓️", label:"Blockchain Developer",       jd:"Blockchain Developer with expertise in Solidity, Ethereum, Web3.js, smart contracts, DeFi protocols, Hardhat/Truffle, IPFS, and Layer 2 scaling solutions." },
  { key:"ar",      cat:"Emerging",    emoji:"🥽", label:"AR/VR Developer",            jd:"AR/VR Developer with expertise in Unity, Unreal Engine, C#, C++, ARKit/ARCore, spatial computing, 3D modelling, and deploying experiences on Quest and HoloLens platforms." },
  { key:"iot",     cat:"Emerging",    emoji:"🌐", label:"IoT Solutions Engineer",     jd:"IoT Solutions Engineer with expertise in MQTT, AWS IoT, edge computing, embedded C, Python, Raspberry Pi, Arduino, sensor integration, and cloud connectivity protocols." },
  { key:"rob",     cat:"Emerging",    emoji:"🦾", label:"Robotics Engineer",          jd:"Robotics Engineer with expertise in ROS/ROS2, C++, Python, computer vision, motion planning, sensor fusion, SLAM, simulation tools (Gazebo), and embedded systems." },

  // ── Support & QA
  { key:"qa",      cat:"QA",          emoji:"🧪", label:"QA / Test Engineer",         jd:"QA Engineer proficient in Selenium, Cypress, pytest, API testing (Postman), CI/CD integration, test planning, regression testing, and performance testing with JMeter/k6." },
  { key:"tech",    cat:"QA",          emoji:"💡", label:"Technical Writer",           jd:"Technical Writer skilled in API documentation, developer guides, Markdown, Git, Confluence, Swagger/OpenAPI, DITA, and collaborating with engineering and product teams." },
];

const CATEGORIES = ["All", ...Array.from(new Set(JD_LIBRARY.map(j => j.cat)))];

export default function UploadPanel({ onResult, onLoading }) {
  const [file,        setFile]        = useState(null);
  const [jdText,      setJdText]      = useState("");
  const [dragging,    setDragging]    = useState(false);
  const [activeDemo,  setActiveDemo]  = useState(null);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [search,      setSearch]      = useState("");
  const [activeCat,   setActiveCat]   = useState("All");
  const fileRef   = useRef();
  const dropRef   = useRef();
  const searchRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (dropOpen && searchRef.current) setTimeout(() => searchRef.current?.focus(), 50);
  }, [dropOpen]);

  const handleFile = (f) => {
    if (f && (f.name.endsWith(".pdf") || f.name.endsWith(".docx"))) setFile(f);
  };

  const selectProfile = (profile) => {
    setJdText(profile.jd);
    setActiveDemo(profile.key);
    setDropOpen(false);
    setSearch("");
  };

  const handleSubmit = async () => {
    if (!file || !jdText.trim()) return;
    onLoading(true);
    try {
      const form = new FormData();
      form.append("resume_file", file);
      form.append("jd_text", jdText);
      const { data } = await axios.post(`${BACKEND}/analyze`, form);
      onResult(data);
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Is the Flask backend running on port 5000?");
    } finally {
      onLoading(false);
    }
  };

  const filtered = JD_LIBRARY.filter(p => {
    const matchCat = activeCat === "All" || p.cat === activeCat;
    const q = search.toLowerCase();
    const matchQ = !q || p.label.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.jd.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const activeProfile = JD_LIBRARY.find(p => p.key === activeDemo);
  const canSubmit = file && jdText.trim();

  return (
    <div style={{ fontFamily:"var(--font-body)" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

        {/* ── LEFT: Resume upload ── */}
        <div>
          <label style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", display:"block", marginBottom:10 }}>
            Resume (PDF or DOCX)
          </label>
          <div
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            style={{
              border:`2px dashed ${dragging ? "var(--brand)" : file ? "var(--success)" : "var(--border)"}`,
              borderRadius:14, padding:"36px 20px", textAlign:"center", cursor:"pointer",
              background: dragging ? "var(--brand-light)" : file ? "rgba(16,185,129,0.06)" : "var(--input-bg)",
              transition:"all 0.2s", minHeight:200,
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10,
            }}>
            <div style={{ fontSize:34 }}>{file ? "📄" : "⬆️"}</div>
            {file ? (
              <>
                <p style={{ color:"var(--success)", fontWeight:700, margin:0, fontSize:13 }}>{file.name}</p>
                <p style={{ color:"var(--text-muted)", fontSize:11, margin:0 }}>Click to change</p>
              </>
            ) : (
              <>
                <p style={{ color:"var(--text-muted)", margin:0, fontSize:14, fontWeight:500 }}>Drop your resume here</p>
                <p style={{ color:"var(--text-muted)", fontSize:11, margin:0, opacity:0.6 }}>PDF or DOCX supported</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.docx"
            style={{ display:"none" }} onChange={(e) => handleFile(e.target.files[0])}/>
        </div>

        {/* ── RIGHT: JD section ── */}
        <div>
          {/* Header row: label + dropdown trigger */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <label style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
              Job Description
            </label>

            {/* Dropdown trigger */}
            <div ref={dropRef} style={{ position:"relative" }}>
              <button
                onClick={() => setDropOpen(o => !o)}
                style={{
                  display:"flex", alignItems:"center", gap:7,
                  background: activeProfile ? "var(--brand-light)" : "var(--input-bg)",
                  border:`1px solid ${activeProfile ? "var(--brand)" : "var(--border)"}`,
                  color: activeProfile ? "var(--brand)" : "var(--text-muted)",
                  borderRadius:9, padding:"6px 12px",
                  fontSize:12, fontWeight:600, cursor:"pointer",
                  fontFamily:"var(--font-body)", transition:"all 0.18s",
                  maxWidth:200, overflow:"hidden",
                }}>
                <span style={{ fontSize:14 }}>{activeProfile ? activeProfile.emoji : "📋"}</span>
                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {activeProfile ? activeProfile.label : "Select JD template"}
                </span>
                <span style={{
                  fontSize:10, marginLeft:2, flexShrink:0,
                  transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition:"transform 0.2s", display:"inline-block",
                }}>▾</span>
              </button>

              {/* ── DROPDOWN PANEL ── */}
              {dropOpen && (
                <div style={{
                  position:"absolute", top:"calc(100% + 8px)", right:0,
                  width:360, zIndex:999,
                  background:"var(--bg-card)",
                  border:"1px solid var(--border)",
                  borderRadius:14,
                  boxShadow:"0 16px 48px rgba(0,0,0,0.25)",
                  overflow:"hidden",
                }}>
                  {/* Search */}
                  <div style={{ padding:"12px 12px 8px", borderBottom:"1px solid var(--border)" }}>
                    <div style={{
                      display:"flex", alignItems:"center", gap:8,
                      background:"var(--input-bg)", border:"1px solid var(--border)",
                      borderRadius:9, padding:"7px 12px",
                    }}>
                      <span style={{ fontSize:14, opacity:0.5 }}>🔍</span>
                      <input
                        ref={searchRef}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search roles..."
                        style={{
                          flex:1, background:"none", border:"none", outline:"none",
                          fontSize:13, color:"var(--text-primary)",
                          fontFamily:"var(--font-body)",
                        }}
                      />
                      {search && (
                        <button onClick={() => setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:14, padding:0 }}>✕</button>
                      )}
                    </div>
                  </div>

                  {/* Category pills */}
                  <div style={{
                    display:"flex", gap:5, padding:"8px 12px",
                    overflowX:"auto", borderBottom:"1px solid var(--border)",
                    scrollbarWidth:"none",
                  }}>
                    {CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => setActiveCat(cat)} style={{
                        flexShrink:0,
                        background: activeCat === cat ? "var(--brand)" : "var(--input-bg)",
                        border: `1px solid ${activeCat === cat ? "var(--brand)" : "var(--border)"}`,
                        color: activeCat === cat ? "#fff" : "var(--text-muted)",
                        borderRadius:20, padding:"3px 10px",
                        fontSize:11, fontWeight:600, cursor:"pointer",
                        fontFamily:"var(--font-body)", transition:"all 0.15s",
                        whiteSpace:"nowrap",
                      }}>{cat}</button>
                    ))}
                  </div>

                  {/* Results count */}
                  <div style={{ padding:"6px 14px 4px", fontSize:10, color:"var(--text-muted)", fontWeight:600, letterSpacing:"0.06em" }}>
                    {filtered.length} ROLE{filtered.length !== 1 ? "S" : ""}
                  </div>

                  {/* List */}
                  <div style={{ maxHeight:280, overflowY:"auto" }}>
                    {filtered.length === 0 ? (
                      <div style={{ padding:"24px", textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>
                        No roles match "{search}"
                      </div>
                    ) : filtered.map(p => (
                      <div
                        key={p.key}
                        onClick={() => selectProfile(p)}
                        style={{
                          display:"flex", alignItems:"center", gap:12,
                          padding:"10px 14px", cursor:"pointer",
                          background: activeDemo === p.key ? "var(--brand-light)" : "transparent",
                          borderLeft:`3px solid ${activeDemo === p.key ? "var(--brand)" : "transparent"}`,
                          transition:"all 0.15s",
                        }}
                        onMouseEnter={e => { if(activeDemo !== p.key) e.currentTarget.style.background="var(--input-bg)"; }}
                        onMouseLeave={e => { if(activeDemo !== p.key) e.currentTarget.style.background="transparent"; }}
                      >
                        <span style={{ fontSize:20, flexShrink:0 }}>{p.emoji}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{p.label}</div>
                          <div style={{ fontSize:10, color:"var(--text-muted)", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", marginTop:1 }}>{p.cat}</div>
                        </div>
                        {activeDemo === p.key && (
                          <span style={{ color:"var(--brand)", fontSize:14, flexShrink:0 }}>✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={jdText}
            onChange={(e) => { setJdText(e.target.value); setActiveDemo(null); }}
            placeholder="Paste a job description here, or pick a template from the dropdown above..."
            style={{
              width:"100%", height:200, padding:14,
              background:"var(--input-bg)", border:"1px solid var(--border)",
              borderRadius:14, color:"var(--text-primary)", fontSize:13,
              lineHeight:1.65, resize:"none", outline:"none",
              fontFamily:"var(--font-body)", boxSizing:"border-box",
              transition:"border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--brand)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border)"}
          />
          {jdText && (
            <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:5, display:"flex", justifyContent:"space-between" }}>
              <span>{jdText.split(/\s+/).filter(Boolean).length} words</span>
              <button onClick={() => { setJdText(""); setActiveDemo(null); }} style={{
                background:"none", border:"none", cursor:"pointer",
                color:"var(--text-muted)", fontSize:11, fontFamily:"var(--font-body)", padding:0,
              }}>Clear ✕</button>
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <div style={{ gridColumn:"1 / -1", display:"flex", justifyContent:"center", paddingTop:4 }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              background: canSubmit ? "linear-gradient(135deg,#0891b2,#06b6d4)" : "var(--input-bg)",
              border: canSubmit ? "none" : "1px solid var(--border)",
              color: canSubmit ? "#fff" : "var(--text-muted)",
              padding:"13px 52px", borderRadius:12, fontSize:15, fontWeight:700,
              cursor: canSubmit ? "pointer" : "not-allowed",
              fontFamily:"var(--font-body)", transition:"all 0.25s",
              boxShadow: canSubmit ? "0 4px 20px rgba(8,145,178,0.38)" : "none",
              display:"flex", alignItems:"center", gap:10,
            }}
            onMouseEnter={e => { if(canSubmit) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(8,145,178,0.5)"; }}}
            onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=canSubmit?"0 4px 20px rgba(8,145,178,0.38)":"none"; }}
          >
            {canSubmit
              ? <><span>✦</span> Analyze My Profile</>
              : "Upload resume + select a JD to begin"
            }
          </button>
        </div>
      </div>
    </div>
  );
}
