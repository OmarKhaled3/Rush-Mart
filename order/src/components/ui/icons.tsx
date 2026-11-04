type IconProps = { className?: string };

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const PlusIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M5 12h14" />
  </svg>
);

export const CloseIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/** Points "back" in reading direction: left in LTR, right in RTL. */
export const BackIcon = ({ className = '' }: IconProps) => (
  <svg {...base} className={`rtl:-scale-x-100 ${className}`}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const BagIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M6 7h12l-1 13H7L6 7z" />
    <path d="M9 7a3 3 0 016 0" />
  </svg>
);

export const CheckIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M5 12l5 5 9-10" />
  </svg>
);
