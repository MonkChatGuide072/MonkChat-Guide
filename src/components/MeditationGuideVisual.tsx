import type { MeditationScene } from '../content/meditationGuide'

interface Props { base?: number; still?: boolean; scene?: MeditationScene; meditationTime?: boolean; breathLabels?: readonly [string, string]; label: string }

/** Original vector artwork. Positions follow the cited guide; the drawing is schematic. */
export function MeditationGuideVisual({ base, still = false, scene = 'sit', meditationTime = false, breathLabels = ['Breathe in', 'Breathe out'], label }: Props) {
  const points = [[208, 91], [188, 65], [139, 65], [169, 102], [141, 154], [132, 259], [132, 220]]
  return (
    <svg viewBox={base ? '85 5 145 285' : '0 0 320 220'} role="img" aria-label={label} className="h-full w-full" fill="none">
      <rect width="320" height={base ? 300 : 220} rx="20" fill={base ? '#EDF3F4' : '#EDF3E9'} />
      {meditationTime && <>
        <path d="M38 172V69q-9-35 20-52" stroke="#947253" strokeWidth="8" strokeLinecap="round" />
        <path d="M38 91 71 62m-33 7L18 48" stroke="#947253" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="50" cy="32" rx="48" ry="26" fill="#B9CAA3" /><ellipse cx="78" cy="50" rx="31" ry="21" fill="#CCDBB7" />
        <path d="M239 172h47v-56l-10-21-10 21v56m-27 0v-35l-10-17-10 17v35" fill="#DAB99C" />
      </>}
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
        {(still || scene === 'center') && <><circle cx="161" cy="133" r="15" fill="#FFFDF7" stroke="#B77A24" strokeWidth="2" /><circle cx="156" cy="128" r="4" fill="#DAEDF1" /></>}
        {scene === 'crystal' && <g>
          <circle cx="160" cy="133" r="21" fill="#E6F3F5" stroke="#7498A4" strokeWidth="1.5" />
          <path d="m160 112-14 11 5 23h18l5-23Zm-14 11h28m-23 23 9-34 9 34" stroke="#97B8C3" strokeWidth="1.2" />
          <path d="m150 119 7-3" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </g>}
        {scene === 'breathe' && <g>
          <path d="M23 83q30-25 77 0m-10-14 11 14-17 3" stroke="#7498A4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M219 83q32 26 77 0m-15-3 16 3-8 14" stroke="#A43D1D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="62" y="123" textAnchor="middle" fontFamily="sans-serif" fontSize="18" fill="#426572">{breathLabels[0]}</text>
          <text x="258" y="123" textAnchor="middle" fontFamily="sans-serif" fontSize="18" fill="#A43D1D">{breathLabels[1]}</text>
        </g>}
        {scene === 'relax' && <g stroke="#7498A4" strokeWidth="3" strokeLinecap="round">
          <path d="M31 93q13-10 26 0t26 0M26 108q16-10 32 0t32 0M36 123q12-8 24 0t24 0" />
          <path d="m102 105-7 12m11 0-11 0m119-12 7 12m-11 0h11" stroke="#97AD83" />
        </g>}
        {scene === 'let-go' && <g>
          <ellipse cx="58" cy="67" rx="25" ry="32" fill="#D8E8ED" stroke="#7498A4" strokeWidth="2" />
          <path d="m58 99-4 6h8Zm0 6q-13 14 0 30t0 22" stroke="#7498A4" strokeWidth="2" />
          <path d="M242 47h31m-31 10h20m-20 10h26" stroke="#A59682" strokeWidth="3" strokeLinecap="round" />
          <path d="m280 48 10-5m-10 14h14m-14 10 10 5" stroke="#DAB99C" strokeWidth="2" />
        </g>}
        {scene === 'wandering' && <g fill="#FFFDF7" stroke="#A59682" strokeWidth="1.5">
          <circle cx="115" cy="35" r="4" /><circle cx="102" cy="24" r="6" />
          <path d="M25 17h59q15 0 15 15v22q0 15-15 15H25q-15 0-15-15V32q0-15 15-15Z" />
          <path d="m27 38 11-9 9 19 13-19 15 15 8-9" fill="none" stroke="#7498A4" strokeWidth="2" />
          <circle cx="265" cy="48" r="20" /><path d="M265 36v13l9 5" stroke="#B77A24" strokeWidth="2" />
        </g>}
        {scene === 'straining' && <g stroke="#A43D1D" strokeWidth="2" strokeLinecap="round">
          <path d="m140 52 11 3m18 0 11-3M105 82q-10 16-5 30m115-30q10 16 5 30M83 129l-7 9 9 9m151-18 7 9-9 9" />
        </g>}
        {scene === 'lightness' && <g stroke="#97AD83" strokeWidth="2" strokeLinecap="round">
          <path d="M63 119q-20-26 0-46m194 46q20-26 0-46M46 148q-20-20-11-43m239 43q20-20 11-43" />
          <path d="M54 75q-20-12-15-28 21 6 15 28m202 0q20-12 15-28-21 6-15 28" fill="#CCDBB7" />
        </g>}
        {scene === 'small-self' && <g>
          <ellipse cx="160" cy="135" rx="27" ry="30" fill="#FFF8E8" stroke="#D1B890" strokeWidth="1.5" />
          <circle cx="160" cy="124" r="6" fill="#F7D3AE" stroke="#A66C36" />
          <path d="M153 132h14l5 18q-12 7-24 0Z" fill="#E9A64F" stroke="#A66C36" />
          <path d="M145 153q15-11 30 0" stroke="#A66C36" strokeWidth="3" strokeLinecap="round" />
        </g>}
        {scene === 'buddha' && <g>
          <ellipse cx="160" cy="134" rx="28" ry="33" fill="#FFF8E8" stroke="#D1B890" strokeWidth="1.5" />
          <circle cx="160" cy="113" r="3" fill="#C59B57" /><circle cx="160" cy="121" r="7" fill="#DAB56F" />
          <path d="M153 130h14l6 18q-13 6-26 0Z" fill="#DAB56F" />
          <path d="M145 155q15-16 30 0m-27-20 8 10h8l8-10" stroke="#B0874A" strokeWidth="2.5" strokeLinecap="round" />
        </g>}
        {scene === 'brightness' && <g stroke="#C59B57" strokeWidth="2" strokeLinecap="round">
          <circle cx="63" cy="73" r="22" fill="#FFF1CD" /><path d="M63 38v-8m0 86v-8m35-35h8m-86 0h8m10-25-6-6m56 56 6 6m-6-56 6-6m-56 56-6 6" />
          <ellipse cx="160" cy="133" rx="23" ry="24" fill="#FFF1CD" fillOpacity=".85" stroke="none" />
        </g>}
        {scene === 'other' && <g fill="#FFFDF7" stroke="#A59682" strokeWidth="1.5">
          <path d="M29 32h54q13 0 13 13v23q0 13-13 13H55L41 93V81H29q-13 0-13-13V45q0-13 13-13Z" />
          {[38, 56, 74].map(cx => <circle key={cx} cx={cx} cy="57" r="3" fill="#7498A4" stroke="none" />)}
        </g>}
      </>}
    </svg>
  )
}
