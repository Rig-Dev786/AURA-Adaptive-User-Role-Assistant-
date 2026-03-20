export default function AuraLogo({ size = 80, spin = true }) {
  const uid = `aura${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        {/* Arctic teal hex gradient */}
        <linearGradient id={`${uid}-g1`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#0369a1" />
          <stop offset="50%"  stopColor="#075985" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>

        {/* White "A" stroke → icy cyan */}
        <linearGradient id={`${uid}-g2`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="100%" stopColor="#a5f3fc" />
        </linearGradient>

        {/* Cyan orbit ring */}
        <linearGradient id={`${uid}-g3`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#0284c7" stopOpacity="1"   />
          <stop offset="50%"  stopColor="#0369a1" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0"   />
        </linearGradient>

        {/* Hex chamfer highlight */}
        <linearGradient id={`${uid}-g4`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.4)" />
          <stop offset="60%"  stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)"         />
        </linearGradient>

        {/* Base glow */}
        <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Icy "A" glow */}
        <filter id={`${uid}-aglow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="0.1 0.6 0.8 0 0  0.3 0.8 1 0 0  0.4 0.9 1 0 0  0 0 0 0.75 0"
            result="icyglow" />
          <feMerge>
            <feMergeNode in="icyglow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Outer halo */}
        <filter id={`${uid}-halo`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* Icy halo glow */}
      <circle cx="50" cy="50" r="34"
        fill="rgba(2,132,199,0.15)"
        filter={`url(#${uid}-halo)`}
      />

      {/* Spinning orbit ring */}
      <circle cx="50" cy="50" r="44"
        stroke={`url(#${uid}-g3)`}
        strokeWidth="1.5" strokeDasharray="6 8" fill="none"
        style={spin ? { animation: "aura-orbit 14s linear infinite", transformOrigin: "50px 50px" } : {}}
      />

      {/* Orbit dot — top (bright cyan) */}
      <circle cx="50" cy="6" r="3.5" fill="#0284c7"
        filter={`url(#${uid}-glow)`}
        style={spin ? { animation: "aura-orbit 14s linear infinite", transformOrigin: "50px 50px" } : {}}
      />
      {/* Orbit dot — bottom (ocean teal) */}
      <circle cx="50" cy="94" r="2.5" fill="#0369a1"
        filter={`url(#${uid}-glow)`}
        style={spin ? { animation: "aura-orbit 14s linear infinite reverse", transformOrigin: "50px 50px" } : {}}
      />

      {/* Hex plate */}
      <path d="M50 12 L82 30 L82 70 L50 88 L18 70 L18 30 Z"
        fill={`url(#${uid}-g1)`} filter={`url(#${uid}-glow)`}
      />

      {/* Hex top chamfer */}
      <path d="M50 12 L82 30 L82 44 L50 26 L18 44 L18 30 Z"
        fill={`url(#${uid}-g4)`}
      />

      {/* Hex border — cyan */}
      <path d="M50 12 L82 30 L82 70 L50 88 L18 70 L18 30 Z"
        stroke="rgba(2,132,199,0.55)" strokeWidth="1.5" fill="none"
      />

      {/* "A" — left leg */}
      <line x1="33" y1="69" x2="50" y2="32"
        stroke={`url(#${uid}-g2)`} strokeWidth="7.5" strokeLinecap="round"
        filter={`url(#${uid}-aglow)`} />
      {/* "A" — right leg */}
      <line x1="67" y1="69" x2="50" y2="32"
        stroke={`url(#${uid}-g2)`} strokeWidth="7.5" strokeLinecap="round"
        filter={`url(#${uid}-aglow)`} />
      {/* "A" — crossbar */}
      <line x1="38.5" y1="57" x2="61.5" y2="57"
        stroke={`url(#${uid}-g2)`} strokeWidth="5.5" strokeLinecap="round"
        filter={`url(#${uid}-aglow)`} />

      {/* Apex jewel — cyan */}
      <circle cx="50" cy="31" r="4" fill="#0284c7"
        filter={`url(#${uid}-glow)`}
        style={spin ? { animation: "aura-pulse 3s ease-in-out infinite" } : {}}
      />
      {/* Apex sparkle — icy white */}
      <circle cx="50" cy="31" r="2" fill="#e0f7fa" />

      <style>{`
        @keyframes aura-orbit {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes aura-pulse {
          0%,100% { opacity: 1;   }
          50%     { opacity: 0.4; }
        }
      `}</style>
    </svg>
  );
}
