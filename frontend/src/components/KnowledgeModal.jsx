import React from 'react';

export default function KnowledgeModal({ course, onClose }) {
  if (!course) return null;

  const { official_docs = [], videos = [], courses = [], articles = [] } = course.resources || {};
  const skillName = course.id ? course.id.replace(/-/g, ' ') : course.title;

  const searchGoogle = `https://www.google.com/search?q=${encodeURIComponent('learn ' + skillName)}`;
  const searchRoadmap = `https://roadmap.sh/search?q=${encodeURIComponent(skillName)}`;

  const renderLinks = (links) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {links.map((link, i) => (
        <a key={i} href={link.url} target="_blank" rel="noreferrer" style={{
          fontSize: 13, color: 'var(--text-primary)', textDecoration: 'none',
          padding: '10px 14px', background: 'var(--bg-main)', border: '1px solid var(--border)',
          borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
          fontFamily: 'var(--font-body)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-border)'; e.currentTarget.style.background = 'var(--brand-light)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-main)'; }}
        >
          <span style={{ fontSize: 16 }}>🔗</span>
          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.title}</span>
        </a>
      ))}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        animation: 'scaleIn 0.3s cubic-bezier(0.2,0.8,0.2,1) both'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Skill Resources</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>{course.title || skillName}</h2>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--input-bg)', border: 'none', width: 32, height: 32, borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            fontSize: 16, color: 'var(--text-muted)', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--input-bg)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 24px', fontFamily: 'var(--font-body)' }}>
            {course.description || "Learn everything you need to know about this skill from curated resources."}
          </p>

          {official_docs.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--brand)' }}>📚</span> Official Docs
              </div>
              <div style={{
                background: 'var(--brand-light)', padding: '16px', borderRadius: 12,
                border: '1px solid var(--brand-border)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {official_docs.map((doc, i) => (
                    <a key={i} href={doc.url} target="_blank" rel="noreferrer" style={{
                      fontSize: 13, color: 'var(--brand)', textDecoration: 'none', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <span style={{ fontSize: 14 }}>→</span> {doc.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {videos.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#ef4444' }}>🎥</span> Videos
              </div>
              {renderLinks(videos)}
            </div>
          )}

          {courses.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#8b5cf6' }}>🎓</span> Courses
              </div>
              {renderLinks(courses)}
            </div>
          )}

          {articles.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#f97316' }}>📝</span> Articles
              </div>
              {renderLinks(articles)}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 32px', borderTop: '1px solid var(--border)', background: 'var(--bg-main)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12
        }}>
          <a href={searchGoogle} target="_blank" rel="noreferrer" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)',
            padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'center',
            textDecoration: 'none', transition: 'all 0.2s', fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            🔍 Search on Google
          </a>
          <a href={searchRoadmap} target="_blank" rel="noreferrer" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)',
            padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'center',
            textDecoration: 'none', transition: 'all 0.2s', fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            🗺️ Search on roadmap.sh
          </a>
        </div>

      </div>
    </div>
  );
}
