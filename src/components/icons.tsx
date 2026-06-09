import type { SVGProps } from 'react';

export function BoltIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M13 2 4.5 13.2c-.4.5 0 1.3.7 1.3H10l-1.6 7.3c-.2.8.8 1.3 1.3.7L19.5 10.8c.4-.5 0-1.3-.7-1.3H13.6L15 2.7c.2-.8-.8-1.3-1.3-.7Z"
      />
    </svg>
  );
}

export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...props}>
      <path
        d="M3 8h8.5M8 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
