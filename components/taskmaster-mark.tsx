type TaskmasterMarkProps = {
  className?: string
}

// One shared SVG keeps the landing and workspace marks visually identical while
// each route controls only its responsive size and shadow.
export function TaskmasterMark({ className }: TaskmasterMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mark-gradient" x1="36" y1="30" x2="164" y2="174">
          <stop stopColor="#fff1c2" />
          <stop offset="0.42" stopColor="#f4b38e" />
          <stop offset="1" stopColor="#8f5d4b" />
        </linearGradient>
        <mask id="mark-cutouts">
          <rect width="200" height="200" fill="white" />
          <ellipse cx="100" cy="45" rx="42" ry="43" fill="black" />
          <ellipse cx="62" cy="128" rx="36" ry="47" fill="black" />
          <ellipse cx="138" cy="128" rx="36" ry="47" fill="black" />
        </mask>
      </defs>

      <circle
        cx="100"
        cy="100"
        r="82"
        stroke="url(#mark-gradient)"
        strokeWidth="12"
      />
      <circle
        cx="100"
        cy="100"
        r="70"
        fill="url(#mark-gradient)"
        mask="url(#mark-cutouts)"
      />
    </svg>
  )
}
