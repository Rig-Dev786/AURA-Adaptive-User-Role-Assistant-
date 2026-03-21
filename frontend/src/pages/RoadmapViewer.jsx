import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuraLogo from "../components/AuraLogo";

const TYPE_COLOR = {
  official: { bg:"rgba(16,185,129,0.15)", border:"rgba(16,185,129,0.4)", text:"#34d399", label:"Official" },
  article:  { bg:"rgba(8,145,178,0.12)",  border:"rgba(8,145,178,0.35)", text:"#22d3ee", label:"Article"  },
  video:    { bg:"rgba(239,68,68,0.12)",  border:"rgba(239,68,68,0.35)", text:"#f87171", label:"Video"    },
  course:   { bg:"rgba(139,92,246,0.12)", border:"rgba(139,92,246,0.35)",text:"#a78bfa", label:"Course"   },
};

// Group topics into logical sections of ~6-8 items each
function groupTopics(topics) {
  const groups = [];
  const size = 7;
  for (let i = 0; i < topics.length; i += size) {
    groups.push(topics.slice(i, i + size));
  }
  return groups;
}

function ResourcePanel({ topic, onClose }) {
  return (
    <div style={{
      position:"fixed", right:0, top:0, bottom:0, width:400, zIndex:200,
      background:"var(--bg-card)", borderLeft:"1px solid var(--border)",
      boxShadow:"-8px 0 40px rgba(0,0,0,0.35)",
      display:"flex", flexDirection:"column",
      animation:"slideIn 0.25s cubic-bezier(0.2,0.8,0.2,1) both",
    }}>
      <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

      {/* Header */}
      <div style={{
        padding:"20px 24px", borderBottom:"1px solid var(--border)",
        background:"var(--brand-light)", flexShrink:0,
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ flex:1, marginRight:12 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--brand)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Topic</div>
            <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:"var(--text-primary)", fontFamily:"var(--font-display)", lineHeight:1.3 }}>{topic.name}</h3>
          </div>
          <button onClick={onClose} style={{
            background:"var(--bg-card)", border:"1px solid var(--border)",
            width:32, height:32, borderRadius:8, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--text-muted)", fontSize:16, flexShrink:0,
          }}>✕</button>
        </div>
      </div>

      {/* Description */}
      <div style={{ padding:"20px 24px", flex:1, overflowY:"auto" }}>
        {topic.description && (
          <p style={{ fontSize:14, color:"var(--text-muted)", lineHeight:1.75, margin:"0 0 24px", fontFamily:"var(--font-body)" }}>
            {topic.description}
          </p>
        )}

        {/* Resources */}
        {topic.links.length > 0 ? (
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>
              {topic.links.length} Learning Resource{topic.links.length !== 1 ? "s" : ""}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {topic.links.map((link, i) => {
                const C = TYPE_COLOR[link.type] || TYPE_COLOR.article;
                return (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer" style={{
                    display:"flex", alignItems:"flex-start", gap:12,
                    padding:"14px 16px",
                    background: C.bg, border:`1px solid ${C.border}`,
                    borderRadius:12, textDecoration:"none",
                    transition:"all 0.18s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateX(4px)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform="translateX(0)"; e.currentTarget.style.boxShadow="none"; }}
                  >
                    <div style={{
                      flexShrink:0, width:28, height:28, borderRadius:8,
                      background:`${C.text}22`, border:`1px solid ${C.border}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:13,
                    }}>
                      {link.type === "video" ? "▶" : link.type === "official" ? "★" : link.type === "course" ? "🎓" : "📄"}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", lineHeight:1.4, marginBottom:4 }}>{link.title}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:C.text, textTransform:"uppercase", letterSpacing:"0.08em" }}>{C.label}</div>
                    </div>
                    <span style={{ color:C.text, fontSize:14, flexShrink:0, marginTop:2 }}>↗</span>
                  </a>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"32px 0", color:"var(--text-muted)", fontSize:14 }}>
            No resources available for this topic yet.
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding:"16px 24px", borderTop:"1px solid var(--border)", flexShrink:0 }}>
        <button onClick={onClose} style={{
          width:"100%", padding:"10px", background:"var(--bg-main)",
          border:"1px solid var(--border)", borderRadius:10, cursor:"pointer",
          color:"var(--text-muted)", fontSize:13, fontWeight:600,
          fontFamily:"var(--font-body)", transition:"all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor="var(--brand)"; e.currentTarget.style.color="var(--brand)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-muted)"; }}
        >← Back to Roadmap</button>
      </div>
    </div>
  );
}

function RoadmapNode({ topic, index, isActive, onClick }) {
  const hasLinks = topic.links.length > 0;
  const typeColors = {
    official:"#10b981", article:"#0891b2", video:"#ef4444", course:"#8b5cf6"
  };
  const dotColor = topic.links[0] ? (typeColors[topic.links[0].type] || "#0891b2") : "#0891b2";

  return (
    <div
      onClick={() => hasLinks || topic.description ? onClick(topic) : null}
      style={{
        position:"relative",
        background: isActive ? "var(--brand)" : "var(--bg-card)",
        border:`2px solid ${isActive ? "var(--brand)" : "var(--border)"}`,
        borderRadius:12, padding:"14px 18px",
        cursor: (hasLinks || topic.description) ? "pointer" : "default",
        transition:"all 0.2s",
        boxShadow: isActive ? "0 4px 20px rgba(8,145,178,0.4)" : "none",
        userSelect:"none",
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.borderColor = "var(--brand)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(8,145,178,0.2)";
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:24, height:24, borderRadius:6, flexShrink:0,
          background: isActive ? "rgba(255,255,255,0.2)" : "var(--brand-light)",
          border:`1px solid ${isActive ? "rgba(255,255,255,0.3)" : "var(--brand-border)"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:9, fontWeight:800,
          color: isActive ? "#fff" : "var(--brand)",
        }}>{String(index+1).padStart(2,"0")}</div>

        <span style={{
          fontSize:13, fontWeight:600, flex:1,
          color: isActive ? "#fff" : "var(--text-primary)",
        }}>{topic.name}</span>

        {hasLinks && (
          <div style={{ display:"flex", gap:3, flexShrink:0 }}>
            {topic.links.slice(0,3).map((l, i) => (
              <div key={i} style={{
                width:6, height:6, borderRadius:"50%",
                background: isActive ? "rgba(255,255,255,0.7)" : (typeColors[l.type] || "#0891b2"),
              }}/>
            ))}
          </div>
        )}

        {(hasLinks || topic.description) && (
          <span style={{ fontSize:11, color: isActive ? "rgba(255,255,255,0.7)" : "var(--text-muted)", flexShrink:0 }}>›</span>
        )}
      </div>
    </div>
  );
}

export default function RoadmapViewer() {
  const { roadmapId } = useParams();
  const navigate     = useNavigate();
  const [roadmap,    setRoadmap]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [active,     setActive]     = useState(null);
  const [progress,   setProgress]   = useState({});

  useEffect(() => {
    setLoading(true); setError(null); setActive(null); setSearch("");
    fetch(`/roadmaps/${roadmapId}.json`)
      .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(d  => { setRoadmap(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [roadmapId]);

  // Load saved progress from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`aura-progress-${roadmapId}`) || "{}");
      setProgress(saved);
    } catch {}
  }, [roadmapId]);

  const toggleDone = (slug, e) => {
    e.stopPropagation();
    setProgress(prev => {
      const next = { ...prev, [slug]: !prev[slug] };
      localStorage.setItem(`aura-progress-${roadmapId}`, JSON.stringify(next));
      return next;
    });
  };

  const filtered = roadmap?.topics?.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const groups = groupTopics(filtered);
  const doneCount = Object.values(progress).filter(Boolean).length;
  const totalCount = roadmap?.topics?.length ?? 0;
  const pct = totalCount ? Math.round(doneCount / totalCount * 100) : 0;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-main)", fontFamily:"var(--font-body)" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .roadmap-node-done { opacity: 0.45; text-decoration: line-through; }
      `}</style>

      {/* Top navbar */}
      <div style={{
        position:"sticky", top:0, zIndex:100,
        background:"var(--bg-card)", borderBottom:"1px solid var(--border)",
        backdropFilter:"blur(20px)", padding:"0 40px", height:60,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <AuraLogo size={28} clickable={false}/>
          <div style={{ width:1, height:24, background:"var(--border)" }}/>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background:"none", border:"none", cursor:"pointer",
              color:"var(--brand)", fontSize:13, fontWeight:700,
              fontFamily:"var(--font-body)", display:"flex", alignItems:"center", gap:6,
              padding:"6px 12px", borderRadius:8,
              transition:"all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="var(--brand-light)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}
          >← Back to Dashboard</button>
          {roadmap && (
            <>
              <div style={{ width:1, height:24, background:"var(--border)" }}/>
              <span style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>{roadmap.title}</span>
            </>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {roadmap && (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:120, height:5, background:"var(--border)", borderRadius:3 }}>
                <div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#0891b2,#06b6d4)", borderRadius:3, transition:"width 0.4s ease" }}/>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:"var(--brand)", minWidth:36 }}>{pct}%</span>
            </div>
          )}
          <span style={{ background:"var(--brand-light)", border:"1px solid var(--brand-border)", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700, color:"var(--brand)" }}>AURA Dataset</span>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"36px 40px" }}>

        {loading && (
          <div style={{ textAlign:"center", padding:"100px 0" }}>
            <div style={{ width:44, height:44, border:"3px solid var(--border)", borderTopColor:"var(--brand)", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
            <p style={{ color:"var(--text-muted)", fontSize:14 }}>Loading roadmap from dataset…</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🗺️</div>
            <h3 style={{ color:"var(--text-primary)", fontFamily:"var(--font-display)", marginBottom:8 }}>Roadmap not in dataset</h3>
            <p style={{ color:"var(--text-muted)", fontSize:13 }}>This roadmap hasn't been loaded yet.</p>
            <button onClick={() => navigate("/dashboard")} style={{ marginTop:20, background:"linear-gradient(135deg,#0891b2,#06b6d4)", border:"none", color:"#fff", padding:"10px 24px", borderRadius:10, cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:700 }}>← Back to Dashboard</button>
          </div>
        )}

        {roadmap && !loading && (
          <>
            {/* Hero */}
            <div style={{ marginBottom:32, animation:"fadeUp 0.4s ease both" }}>
              <h1 style={{ margin:"0 0 8px", fontSize:30, fontWeight:800, letterSpacing:"-1px", color:"var(--text-primary)", fontFamily:"var(--font-display)" }}>{roadmap.title}</h1>
              {roadmap.description && <p style={{ margin:"0 0 20px", fontSize:14, color:"var(--text-muted)", lineHeight:1.7 }}>{roadmap.description}</p>}

              {/* Stats row */}
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                {[
                  { val: totalCount, label:"Topics", color:"var(--brand)" },
                  { val: roadmap.topics.reduce((a,t) => a+t.links.length, 0), label:"Resources", color:"#10b981" },
                  { val: `${doneCount}/${totalCount}`, label:"Completed", color:"#8b5cf6" },
                ].map(({ val, label, color }) => (
                  <div key={label} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, padding:"12px 20px", textAlign:"center", minWidth:90 }}>
                    <div style={{ fontSize:22, fontWeight:800, color, fontFamily:"var(--font-display)" }}>{val}</div>
                    <div style={{ fontSize:10, color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:3 }}>{label}</div>
                  </div>
                ))}

                {/* Legend */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:8, flexWrap:"wrap" }}>
                  {Object.entries(TYPE_COLOR).map(([type, C]) => (
                    <span key={type} style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.bg, border:`1px solid ${C.border}`, borderRadius:20, padding:"4px 10px", fontSize:11, fontWeight:600, color:C.text }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:C.text }}/>
                      {C.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Search */}
            <div style={{ position:"relative", marginBottom:32, animation:"fadeUp 0.4s ease 0.1s both" }}>
              <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, opacity:0.4 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search all ${totalCount} topics…`}
                style={{ width:"100%", padding:"12px 16px 12px 44px", background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:12, color:"var(--text-primary)", fontSize:14, outline:"none", fontFamily:"var(--font-body)", boxSizing:"border-box", transition:"border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor="var(--brand)"}
                onBlur={e => e.target.style.borderColor="var(--border)"}
              />
              {search && <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"var(--text-muted)", fontWeight:600 }}>{filtered.length} results</span>}
            </div>

            {/* Tip */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24, padding:"10px 16px", background:"var(--brand-light)", border:"1px solid var(--brand-border)", borderRadius:10, animation:"fadeUp 0.4s ease 0.15s both" }}>
              <span style={{ fontSize:14 }}>💡</span>
              <span style={{ fontSize:12, color:"var(--brand)", fontWeight:600 }}>Click any node to see learning resources. Check ✓ to track your progress.</span>
            </div>

            {/* ROADMAP — visual node layout */}
            {groups.length === 0 ? (
              <div style={{ textAlign:"center", padding:48, color:"var(--text-muted)", fontSize:14 }}>No topics match "{search}"</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:0, animation:"fadeUp 0.5s ease 0.2s both" }}>
                {groups.map((group, gi) => (
                  <div key={gi}>
                    {/* Section header */}
                    <div style={{ display:"flex", alignItems:"center", gap:12, margin:"8px 0 12px", padding:"0 4px" }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#0891b2,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff", flexShrink:0, boxShadow:"0 4px 12px rgba(8,145,178,0.4)" }}>
                        {gi + 1}
                      </div>
                      <div style={{ flex:1, height:1.5, background:`linear-gradient(90deg, var(--brand-border), transparent)` }}/>
                      <span style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", flexShrink:0 }}>
                        Phase {gi + 1} · {group.length} topics
                      </span>
                      <div style={{ flex:1, height:1.5, background:`linear-gradient(270deg, var(--brand-border), transparent)` }}/>
                    </div>

                    {/* Node grid for this group */}
                    <div style={{ position:"relative", marginBottom:8 }}>
                      {/* Vertical connector line */}
                      <div style={{ position:"absolute", left:20, top:0, bottom:0, width:2, background:"linear-gradient(to bottom, var(--brand-border), transparent)", zIndex:0 }}/>

                      <div style={{ display:"flex", flexDirection:"column", gap:6, paddingLeft:50, position:"relative", zIndex:1 }}>
                        {group.map((topic, ti) => {
                          const globalIdx = gi * 7 + ti;
                          const isDone = !!progress[topic.slug];
                          const isActive = active?.slug === topic.slug;

                          return (
                            <div key={topic.slug} style={{ display:"flex", alignItems:"center", gap:10 }}>
                              {/* Node dot on the line */}
                              <div style={{
                                position:"absolute", left:13,
                                width:16, height:16, borderRadius:"50%",
                                background: isDone ? "#10b981" : isActive ? "var(--brand)" : "var(--bg-card)",
                                border:`2px solid ${isDone ? "#10b981" : isActive ? "var(--brand)" : "var(--border)"}`,
                                flexShrink:0, zIndex:2,
                                transition:"all 0.2s",
                                display:"flex", alignItems:"center", justifyContent:"center",
                              }}>
                                {isDone && <span style={{ fontSize:8, color:"#fff", fontWeight:800 }}>✓</span>}
                              </div>

                              {/* Topic card */}
                              <div style={{ flex:1 }}>
                                <div
                                  onClick={() => setActive(isActive ? null : topic)}
                                  style={{
                                    display:"flex", alignItems:"center", gap:10,
                                    background: isActive ? "linear-gradient(135deg,var(--brand),#06b6d4)" : isDone ? "rgba(16,185,129,0.06)" : "var(--bg-card)",
                                    border:`1.5px solid ${isActive ? "var(--brand)" : isDone ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                                    borderRadius:10, padding:"12px 16px",
                                    cursor:"pointer", transition:"all 0.2s",
                                  }}
                                  onMouseEnter={e => { if(!isActive) { e.currentTarget.style.borderColor="var(--brand)"; e.currentTarget.style.transform="translateX(4px)"; }}}
                                  onMouseLeave={e => { if(!isActive) { e.currentTarget.style.borderColor=isDone?"rgba(16,185,129,0.3)":"var(--border)"; e.currentTarget.style.transform="translateX(0)"; }}}
                                >
                                  <span style={{ fontSize:13, fontWeight:600, flex:1, color: isActive ? "#fff" : isDone ? "var(--text-muted)" : "var(--text-primary)", textDecoration: isDone ? "line-through" : "none" }}>
                                    {topic.name}
                                  </span>

                                  {/* Resource type dots */}
                                  {topic.links.length > 0 && (
                                    <div style={{ display:"flex", gap:3 }}>
                                      {topic.links.slice(0,4).map((l,i) => {
                                        const C = TYPE_COLOR[l.type] || TYPE_COLOR.article;
                                        return <div key={i} style={{ width:7, height:7, borderRadius:"50%", background: isActive ? "rgba(255,255,255,0.7)" : C.text }}/>
                                      })}
                                    </div>
                                  )}

                                  {/* Resource count */}
                                  <span style={{ fontSize:11, color: isActive ? "rgba(255,255,255,0.7)" : "var(--text-muted)", fontWeight:600, flexShrink:0 }}>
                                    {topic.links.length > 0 ? `${topic.links.length} res` : ""}
                                  </span>

                                  {/* Done toggle */}
                                  <button
                                    onClick={e => toggleDone(topic.slug, e)}
                                    title="Mark as done"
                                    style={{
                                      width:22, height:22, borderRadius:6, flexShrink:0,
                                      background: isDone ? "#10b981" : "transparent",
                                      border:`1.5px solid ${isDone ? "#10b981" : isActive ? "rgba(255,255,255,0.4)" : "var(--border)"}`,
                                      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                                      fontSize:10, color: isDone ? "#fff" : "transparent",
                                      transition:"all 0.15s",
                                    }}
                                    onMouseEnter={e => { if(!isDone) { e.currentTarget.style.borderColor="#10b981"; e.currentTarget.style.color="#10b981"; }}}
                                    onMouseLeave={e => { if(!isDone) { e.currentTarget.style.borderColor=isActive?"rgba(255,255,255,0.4)":"var(--border)"; e.currentTarget.style.color="transparent"; }}}
                                  >✓</button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Arrow between sections */}
                    {gi < groups.length - 1 && (
                      <div style={{ display:"flex", justifyContent:"flex-start", paddingLeft:16, margin:"8px 0", color:"var(--brand)", fontSize:18, opacity:0.5 }}>↓</div>
                    )}
                  </div>
                ))}

                {/* Completion banner */}
                {pct === 100 && (
                  <div style={{ marginTop:24, padding:"20px 24px", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:16, textAlign:"center" }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>🎉</div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#10b981", fontFamily:"var(--font-display)" }}>Roadmap Complete!</div>
                    <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:4 }}>You've covered all {totalCount} topics in this roadmap.</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Side panel */}
      {active && <ResourcePanel topic={active} onClose={() => setActive(null)}/>}
      {active && <div onClick={() => setActive(null)} style={{ position:"fixed", inset:0, zIndex:199, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(2px)" }}/>}
    </div>
  );
}
