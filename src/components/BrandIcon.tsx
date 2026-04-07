type BrandIconProps = {
  className?: string;
  title?: string;
};

export const BrandIcon = ({ className = 'w-10 h-10', title = 'BetterMe' }: BrandIconProps) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    role="img"
    aria-label={title}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="bettermeGradient" x1="0" y1="0" x2="120" y2="120">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#38BDF8" />
      </linearGradient>
      <radialGradient id="bettermeGlow" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>

    <circle cx="60" cy="60" r="58" fill="url(#bettermeGradient)" />
    <circle cx="60" cy="60" r="42" fill="url(#bettermeGlow)" />

    <path
      d="M44 28h14c13 0 24 11 24 24s-11 24-24 24H44V28Z"
      fill="#ffffff"
      opacity="0.95"
    />
    <path
      d="M44 68h14c13 0 24 11 24 24s-11 24-24 24H44V68Z"
      fill="#ffffff"
      opacity="0.95"
    />

    <path
      d="M62.5 37.5 82 24.5l-3 20-20-7Z"
      fill="#ffffff"
      opacity="0.95"
    />
    <path
      d="M67 23.5c-1.1-0.9-2.7-0.7-3.6 0.4l-3 3.8c-0.9 1.1-0.7 2.7 0.4 3.6 1.1 0.9 2.7 0.7 3.6-0.4l3-3.8c0.9-1.1 0.7-2.7-0.4-3.6Z"
      fill="#ffffff"
      opacity="0.92"
    />
  </svg>
);
