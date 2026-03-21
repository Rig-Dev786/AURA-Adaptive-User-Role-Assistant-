import { useNavigate } from "react-router-dom";

export default function AuraLogo({ size = 32, clickable = true, animate = true }) {
  const navigate = useNavigate();
  const s  = size;
  const cx = s / 2, cy = s / 2;
  const id = `al-${s}`;

  return (
    <svg
      width={s} height={s} viewBox="0 0 72 72" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={() => clickable && navigate("/")}
      style={{ cursor: clickable ? "pointer" : "default", flexShrink: 0, display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`${id}-g1`} x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0891b2"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
        <linearGradient id={`${id}-g2`} x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0c4a6e"/>
          <stop offset="100%" stopColor="#0e7490"/>
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {animate && <style>{`
        @keyframes aura-spin  { to { transform: rotate(360deg); } }
        @keyframes aura-rspin { to { transform: rotate(-360deg); } }
        @keyframes aura-dp1   { 0%,100%{opacity:.95;r:3.5} 50%{opacity:1;r:4.4} }
        @keyframes aura-dp2   { 0%,100%{opacity:.9;r:3.2}  50%{opacity:1;r:4.2} }
        @keyframes aura-cp    { 0%,100%{opacity:.9;r:3}    50%{opacity:1;r:3.8} }
        @keyframes aura-glow  { 0%,100%{opacity:.35} 50%{opacity:.65} }
        .aura-ro  { animation: aura-spin  14s linear infinite; transform-origin: 36px 36px; }
        .aura-ri  { animation: aura-rspin 9s  linear infinite; transform-origin: 36px 36px; }
        .aura-d1  { animation: aura-dp1   2.4s ease-in-out        infinite; }
        .aura-d2  { animation: aura-dp2   2.4s ease-in-out  0.6s  infinite; }
        .aura-d3  { animation: aura-dp1   2.4s ease-in-out  1.2s  infinite; }
        .aura-d4  { animation: aura-dp2   2.4s ease-in-out  1.8s  infinite; }
        .aura-c   { animation: aura-cp    2s   ease-in-out        infinite; }
        .aura-gl  { animation: aura-glow  3s   ease-in-out        infinite; }
      `}</style>}

      {/* Ambient glow */}
      <circle cx="36" cy="36" r="36" fill={`url(#${id}-glow)`} className={animate ? "aura-gl" : ""}/>

      {/* Outer orbit ring */}
      <circle cx="36" cy="36" r="33" fill="none"
        stroke={`url(#${id}-g1)`} strokeWidth="0.9"
        strokeDasharray="5 4" opacity="0.4"
        className={animate ? "aura-ro" : ""}/>

      {/* Inner orbit ring */}
      <circle cx="36" cy="36" r="24" fill="none"
        stroke="#06b6d4" strokeWidth="0.7"
        strokeDasharray="3 6" opacity="0.25"
        className={animate ? "aura-ri" : ""}/>

      {/* Main square */}
      <rect x="14" y="14" width="44" height="44" rx="13" fill={`url(#${id}-g1)`}/>

      {/* Shine */}
      <rect x="14" y="14" width="44" height="21" rx="13" fill="white" fillOpacity="0.07"/>

      {/* Inner diamond */}
      <rect x="25" y="25" width="22" height="22" rx="5"
        fill={`url(#${id}-g2)`} transform="rotate(45 36 36)"/>

      {/* Diamond shine */}
      <rect x="28" y="28" width="16" height="8" rx="3"
        fill="white" fillOpacity="0.08" transform="rotate(45 36 36)"/>

      {/* 4 satellite dots */}
      <circle cx="36" cy="6"  r="3.5" fill="white" fillOpacity="0.95" className={animate ? "aura-d1" : ""}/>
      <circle cx="66" cy="36" r="3.5" fill="white" fillOpacity="0.95" className={animate ? "aura-d2" : ""}/>
      <circle cx="36" cy="66" r="3.5" fill="white" fillOpacity="0.95" className={animate ? "aura-d3" : ""}/>
      <circle cx="6"  cy="36" r="3.5" fill="white" fillOpacity="0.95" className={animate ? "aura-d4" : ""}/>

      {/* Connector lines */}
      <line x1="36" y1="9.5"  x2="36" y2="20"   stroke="white" strokeOpacity="0.52" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="62.5" y1="36" x2="52" y2="36"   stroke="white" strokeOpacity="0.52" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="36" y1="62.5" x2="36" y2="52"   stroke="white" strokeOpacity="0.52" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="9.5" y1="36"  x2="20" y2="36"   stroke="white" strokeOpacity="0.52" strokeWidth="1.3" strokeLinecap="round"/>

      {/* Center dot */}
      <circle cx="36" cy="36" r="3" fill="white" fillOpacity="0.95" className={animate ? "aura-c" : ""}/>
    </svg>
  );
}
