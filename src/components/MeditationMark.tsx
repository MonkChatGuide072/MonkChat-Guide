interface MeditationMarkProps {
  className?: string
  showCore?: boolean
}

export function MeditationMark({ className = '', showCore = true }: MeditationMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 420 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="210" cy="72" r="50" stroke="currentColor" strokeWidth="16" />
      <ellipse cx="210" cy="260" rx="112" ry="142" stroke="currentColor" strokeWidth="16" />
      <path
        d="M104 230C51 258 31 318 50 365c22 55 83 63 160 13 77 50 138 42 160-13 19-47-1-107-54-135"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M60 407c55-48 108-59 150-29 42-30 95-19 150 29M210 378v109"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {showCore && <circle cx="210" cy="378" r="25" fill="#d7aa55" />}
    </svg>
  )
}
