export const LIGHT = {
  '--bg-main':     '#f8fafc',
  '--bg-card':     '#ffffff',
  '--bg-sidebar':  'rgba(248,250,252,0.95)',
  '--border':      '#e2e8f0',
  '--text-primary':'#0f172a',
  '--text-muted':  '#64748b',
  '--brand':       '#0891b2',
  '--brand-light': 'rgba(8,145,178,0.08)',
  '--brand-border':'rgba(8,145,178,0.2)',
  '--input-bg':    '#f1f5f9',
  '--btn-bg':      'linear-gradient(135deg,#0891b2,#06b6d4)',
  '--btn-text':    '#ffffff',
  '--success':     '#10b981',
  '--warning':     '#f97316',
  '--danger':      '#ef4444',
};

export const DARK = {
  '--bg-main':     '#0a0f1e',
  '--bg-card':     '#111827',
  '--bg-sidebar':  'rgba(10,15,30,0.95)',
  '--border':      'rgba(255,255,255,0.08)',
  '--text-primary':'#f1f5f9',
  '--text-muted':  '#94a3b8',
  '--brand':       '#06b6d4',
  '--brand-light': 'rgba(6,182,212,0.1)',
  '--brand-border':'rgba(6,182,212,0.25)',
  '--input-bg':    'rgba(255,255,255,0.05)',
  '--btn-bg':      'linear-gradient(135deg,#0891b2,#06b6d4)',
  '--btn-text':    '#ffffff',
  '--success':     '#10b981',
  '--warning':     '#f97316',
  '--danger':      '#ef4444',
};

export function applyTheme(theme) {
  const vars = theme === 'dark' ? DARK : LIGHT;
  Object.entries(vars).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v);
  });
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('aura-theme', theme);
}

export function getTheme() {
  return localStorage.getItem('aura-theme') || 'light';
}
