interface Props { base?: number; still?: boolean; label: string }

/** Original vector artwork. Positions follow the cited guide; the drawing is schematic. */
export function MeditationGuideVisual({ base, still = false, label }: Props) {
  const points = [[208, 91], [188, 65], [139, 65], [169, 102], [141, 154], [132, 259], [132, 220]]
  return (
    <svg viewBox={base ? '85 5 145 285' : '0 0 320 220'} role="img" aria-label={label} className="h-full w-full" fill="none">
      <rect width="320" height={base ? 300 : 220} rx="20" fill={base ? '#EDF3F4' : '#EDF3E9'} />
      {base ? <>
        <path d="M106 288 99 187Q99 162 124 155L123 123Q98 117 99 79 98 22 148 22 184 22 189 52L191 73 210 86Q214 94 198 98L194 113Q185 126 159 126L157 156Q182 161 191 187L202 288" fill="#FAE0C5" stroke="#825A48" strokeWidth="2" strokeLinejoin="round" />
        <path d="M99 187Q99 162 124 155L157 156Q182 161 191 187L202 288H106Z" fill="#F1B46B" fillOpacity=".75" />
        <path d="M184 64q-7-5-14 0" stroke="#825A48" strokeWidth="2" strokeLinecap="round" />
        <path d="m208 91-20-26H139L169 102 141 154 132 259V220" stroke="#B8A591" strokeWidth="2" strokeDasharray="4 5" />
        <path d="M107 259h95" stroke="#A0907A" strokeDasharray="4 4" />
        <circle cx="195" cy="259" r="3" fill="#825A48" />
        {base === 7 && <path d="M168 220h12m-6 0v39m-6 0h12" stroke="#A43D1D" strokeWidth="2" />}
        {points.map(([cx, cy], index) => <g key={index} opacity={base === index + 1 ? 1 : .85}>
          <circle cx={cx} cy={cy} r={base === index + 1 ? 17 : 14} fill={base === index + 1 ? '#A43D1D' : '#FFFDF7'} stroke={base === index + 1 ? '#A43D1D' : '#A0907A'} strokeWidth="1.5" />
          <text x={cx} y={cy + 7} textAnchor="middle" fontFamily="sans-serif" fontSize="20" fontWeight="500" fill={base === index + 1 ? '#FFFFFF' : '#685B4D'}>{index + 1}</text>
        </g>)}
      </> : <>
        <path d="M18 172h58v-32h28v32h31m120 0h48v-47h-25v47" stroke="#DAB99C" strokeWidth="6" strokeLinejoin="round" />
        <path d="M28 193q41-19 72 0m121 0q32-16 72 0" stroke="#B9CAA3" strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="160" cy="196" rx="82" ry="12" fill="#D4DFCA" />
        <path d="M115 138q-42 18-37 45 6 17 81 8 74 9 83-8 4-27-36-45" fill="#E9A64F" stroke="#A66C36" strokeWidth="2" />
        <path d="M130 90q-24 10-26 52l20 25h74l19-25q-4-41-27-52Z" fill="#F4C18E" stroke="#A66C36" strokeWidth="2" />
        <path d="m170 90 21 0q22 15 25 51l-21 26h-72l-6-19Z" fill="#DC8C35" />
        <path d="m173 104-31 45m49-33-32 36" stroke="#B7742D" strokeWidth="2" strokeLinecap="round" />
        <circle cx="128" cy="62" r="6" fill="#F4C18E" /><circle cx="192" cy="62" r="6" fill="#F4C18E" />
        <path d="M160 25q-31 0-31 35v11q4 26 31 27 26-1 31-27V60q0-35-31-35Z" fill="#F7D3AE" stroke="#A66C36" strokeWidth="2" />
        <path d="M140 62q6 5 12 0m16 0q6 5 12 0m-24 15q4 3 8 0" stroke="#825A48" strokeWidth="2" strokeLinecap="round" />
        <path d="M115 131q2 29 28 31m63-31q-5 30-33 31" stroke="#F7D3AE" strokeWidth="13" strokeLinecap="round" />
        <path d="M141 159q12-6 23 1 10-7 18-1-9 12-22 9-12 2-19-9Z" fill="#F7D3AE" stroke="#A66C36" strokeWidth="1.5" />
        <path d="M126 177q20 5 48 10m-7-11 35-5" stroke="#A66C36" strokeWidth="2" strokeLinecap="round" />
        {still && <><circle cx="161" cy="133" r="15" fill="#FFFDF7" stroke="#B77A24" strokeWidth="2" /><circle cx="156" cy="128" r="4" fill="#DAEDF1" /></>}
      </>}
    </svg>
  )
}
