export default function CupIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 310"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cup-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#881411" />
          <stop offset="38%" stopColor="#C8201B" />
          <stop offset="100%" stopColor="#6e1010" />
        </linearGradient>
        <linearGradient id="cup-sleeve" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0A0908" />
          <stop offset="50%" stopColor="#252018" />
          <stop offset="100%" stopColor="#0A0908" />
        </linearGradient>
        <linearGradient id="cup-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7F3EC" />
          <stop offset="100%" stopColor="#D4CABА" />
        </linearGradient>
        <linearGradient id="cup-gleam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="straw-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1B1813" />
          <stop offset="60%" stopColor="#2a2420" />
          <stop offset="100%" stopColor="#1B1813" />
        </linearGradient>
      </defs>

      {/* Straw */}
      <rect x="96" y="20" width="8" height="68" rx="4" fill="url(#straw-grad)" />
      {/* Straw stripe */}
      <rect x="96" y="20" width="8" height="12" rx="4" fill="#C8201B" />
      <rect x="96" y="44" width="8" height="8" fill="#C8201B" />
      <rect x="96" y="68" width="8" height="8" fill="#C8201B" />

      {/* Cup body */}
      <path
        d="M 22 84 L 178 84 L 153 272 Q 151 282 100 282 Q 49 282 47 272 Z"
        fill="url(#cup-body)"
      />

      {/* Sleeve */}
      <path
        d="M 33 158 L 167 158 L 158 234 Q 156 242 100 242 Q 44 242 42 234 Z"
        fill="url(#cup-sleeve)"
      />

      {/* Gold bolt on sleeve */}
      <path
        d="M 104 170 L 90 192 Q 89 195 92 195 L 100 195 L 96 208 Q 95 211 98 209 L 114 186 Q 115 183 112 183 L 104 183 L 107 171 Q 108 168 105 170 Z"
        fill="#D99000"
      />

      {/* Lid ring */}
      <path
        d="M 15 84 Q 100 77 185 84 L 183 74 Q 100 66 17 74 Z"
        fill="#BFB09C"
      />

      {/* Lid dome */}
      <path
        d="M 17 74 Q 100 64 183 74 L 176 58 Q 100 46 24 58 Z"
        fill="#EDE7DA"
      />

      {/* Dome upper curve */}
      <path
        d="M 24 58 Q 100 46 176 58 L 168 48 Q 100 35 32 48 Z"
        fill="#F2EDE4"
      />

      {/* Dome peak */}
      <path
        d="M 32 48 Q 100 34 168 48 L 160 42 Q 100 28 40 42 Z"
        fill="#F7F3EC"
      />

      {/* Drink port */}
      <path
        d="M 83 42 Q 100 38 117 42 L 115 46 Q 100 43 85 46 Z"
        fill="#C4B6A0"
      />

      {/* Gleam on left of cup body */}
      <path
        d="M 28 90 L 24 264 Q 23 270 30 270 L 40 270 L 45 90 Z"
        fill="url(#cup-gleam)"
      />

      {/* Subtle shine on lid */}
      <path
        d="M 30 54 Q 60 44 90 48 Q 60 48 32 58 Z"
        fill="white"
        opacity="0.25"
      />

      {/* Bottom ellipse (depth) */}
      <ellipse cx="100" cy="280" rx="54" ry="8" fill="#4a0c0a" opacity="0.5" />

      {/* "RUSH" lettering on sleeve - small, bold */}
      <text
        x="100"
        y="224"
        textAnchor="middle"
        fontFamily="'Clash Display', sans-serif"
        fontWeight="700"
        fontSize="11"
        letterSpacing="4"
        fill="rgba(247,243,236,0.55)"
      >
        RUSH
      </text>
    </svg>
  );
}
