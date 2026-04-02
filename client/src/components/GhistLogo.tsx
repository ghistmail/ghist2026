export function GhistLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Ghist logo"
    >
      {/* Envelope base */}
      <rect
        x="3"
        y="8"
        width="26"
        height="18"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Envelope flap - V shape */}
      <path
        d="M3 11l13 8 13-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Timer/clock circle at top right — transparent fill to show bg */}
      <circle
        cx="25"
        cy="8"
        r="5"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Clock hands */}
      <path
        d="M25 5.5v2.5l1.5 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
