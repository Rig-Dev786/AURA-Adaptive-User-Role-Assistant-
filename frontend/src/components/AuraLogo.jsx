/**
 * AuraLogo — animated SVG logo mark for AURA.
 * Props:
 *   size   — pixel size of the logo (default 64)
 *   spin   — whether to add the orbit spin animation (default true)
 */
export default function AuraLogo({ size = 64, spin = true }) {
  const id = `aura-grad-${size}`;
  const orbitId = `orbit-grad-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        {/* Core gradient */}
        <radialGradient id={id} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="60%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </radialGradient>

        {/* Orbit gradient */}
        <linearGradient id={orbitId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
        </linearGradient>

        {/* Drop shadow filter */}
        <filter id="core-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Outer soft glow */}
        <filter id="outer-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer pulsing ring */}
      <circle
        cx="32" cy="32" r="30"
        stroke={`url(#${orbitId})`}
        strokeWidth="1"
        strokeDasharray="4 6"
        opacity="0.4"
        style={spin ? { animation: "orbit-spin 12s linear infinite", transformOrigin: "32px 32px" } : {}}
      />

      {/* Middle orbit ring */}
      <ellipse
        cx="32" cy="32" rx="22" ry="10"
        stroke="#a855f7"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        fill="none"
        style={spin ? { animation: "orbit-spin 7s linear infinite reverse", transformOrigin: "32px 32px" } : {}}
      />

      {/* Core rounded square */}
      <rect
        x="14" y="14" width="36" height="36" rx="10"
        fill={`url(#${id})`}
        filter="url(#core-glow)"
      />

      {/* Inner highlight */}
      <rect
        x="14" y="14" width="36" height="18" rx="10"
        fill="rgba(255,255,255,0.12)"
      />

      {/* "A" letter mark */}
      <text
        x="32" y="39"
        textAnchor="middle"
        fontSize="22"
        fontWeight="800"
        fontFamily="'Sora', sans-serif"
        fill="#fff"
        filter="url(#core-glow)"
      >A</text>

      {/* orbit dot */}
      <circle
        cx="32" cy="2" r="3"
        fill="#a855f7"
        filter="url(#outer-glow)"
        style={spin ? { animation: "orbit-spin 7s linear infinite reverse", transformOrigin: "32px 32px" } : {}}
      />

      <style>{`
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}
