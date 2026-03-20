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
        {/* Deep midnight ocean hex */}
        <linearGradient id={`${uid}-g1`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#0d2137" />
          <stop offset="50%"  stopColor="#071628" />
          <stop offset="100%" stopColor="#050d14" />
        </linearGradient>

        {/* Icy white → cyan "A" stroke */}
        <linearGradient id={`${uid}-g2`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>

        {/* Teal orbit ring */}
        <linearGradient id={`${uid}-g3`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#06b6d4" stopOpacity="1" />
          <stop offset="50%"  stopColor="#0891b2" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>

        {/* Hex chamfer highlight */}
        <linearGradient id={`${uid}-g4`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(103,232,249,0.22)" />
          <stop offset="60%"  stopColor="rgba(103,232,249,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>

        {/* Glow filter */}
        <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* "A" cyan glow */}
        <filter id={`${uid}-aglow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="0.1 0.5 0.7 0 0  0.3 0.8 0.9 0 0  0.4 0.9 1 0 0  0 0 0 0.8 0"
            result="tealglow" />
          <feMerge>
            <feMergeNode in="tealglow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Outer halo */}
        <filter id={`${uid}-halo`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* Cyan halo glow */}
      <circle
        cx="50" cy="50" r="34"
        fill="rgba(6,182,212,0.22)"
        filter={`url(#${uid}-halo)`}
      />

      {/* Spinning teal orbit ring */}
      <circle
        cx="50" cy="50" r="44"
        stroke={`url(#${uid}-g3)`}
        strokeWidth="1.5"
        strokeDasharray="6 8"
        fill="none"
        style={spin ? {
          animation: "aura-orbit 14s linear infinite",
          transformOrigin: "50px 50px",
        } : {}}
      />

      {/* Orbit dot — top (bright cyan) */}
      <circle
        cx="50" cy="6" r="3.5"
        fill="#06b6d4"
        filter={`url(#${uid}-glow)`}
        style={spin ? {
          animation: "aura-orbit 14s linear infinite",
          transformOrigin: "50px 50px",
        } : {}}
      />
      {/* Orbit dot — bottom (teal) */}
      <circle
        cx="50" cy="94" r="2.5"
        fill="#0891b2"
        filter={`url(#${uid}-glow)`}
        style={spin ? {
          animation: "aura-orbit 14s linear infinite reverse",
          transformOrigin: "50px 50px",
        } : {}}
      />

      {/* Hex plate */}
      <path
        d="M50 12 L82 30 L82 70 L50 88 L18 70 L18 30 Z"
        fill={`url(#${uid}-g1)`}
        filter={`url(#${uid}-glow)`}
      />

      {/* Hex top-face chamfer */}
      <path
        d="M50 12 L82 30 L82 44 L50 26 L18 44 L18 30 Z"
        fill={`url(#${uid}-g4)`}
      />

      {/* Hex border — cyan tinted */}
      <path
        d="M50 12 L82 30 L82 70 L50 88 L18 70 L18 30 Z"
        stroke="rgba(6,182,212,0.5)"
        strokeWidth="1.5"
        fill="none"
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
      <circle cx="50" cy="31" r="4"
        fill="#06b6d4"
        filter={`url(#${uid}-glow)`}
        style={spin ? { animation: "aura-pulse 3s ease-in-out infinite" } : {}}
      />
      {/* Inner apex sparkle */}
      <circle cx="50" cy="31" r="2" fill="#a5f3fc" />

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
