import { forwardRef } from 'react'

import { postcardPalettes, wrapPostcardText, type PostcardPaletteId } from '../../content/thankYouPostcard'

interface PostcardProps {
  visitor: string
  monk: string
  date: string
  message: string
  translation?: string
  palette: PostcardPaletteId
}

/** A single SVG is used for the live preview and PNG export so both stay identical. */
export const ThankYouPostcard = forwardRef<SVGSVGElement, PostcardProps>(function ThankYouPostcard(
  { visitor, monk, date, message, translation, palette }, ref,
) {
  const p = postcardPalettes.find((item) => item.id === palette) ?? postcardPalettes[0]
  const nameLines = wrapPostcardText(visitor, 30)
  const englishLines = wrapPostcardText(message, 53)
  const thaiLines = translation ? wrapPostcardText(translation, 64) : []
  const guideLines = monk.trim() ? wrapPostcardText(`Guided by ${monk.trim()}`, 42) : []
  const nameFont = Math.min(nameLines.length > 2 ? 38 : 60, 900 / Math.max(...nameLines.map((line) => Array.from(line).length * .95), 1))
  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1500" width="1200" height="1500"
      className="monkchat-postcard" role="img" aria-label={`Ayutthaya Monk Chat thank-you postcard for ${visitor}`}
      style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
      <rect width="1200" height="1500" rx="46" fill={p.paper} />
      <rect x="30" y="30" width="1140" height="1440" rx="34" fill="#fffdf6" />
      <rect x="48" y="48" width="1104" height="1404" rx="26" fill="none" stroke={p.leaf} strokeWidth="2" strokeDasharray="3 12" opacity=".5" />
      <path d="M59 252q44-34 18-92-15-33 15-65 43 3 68-28" fill="none" stroke={p.leaf} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="78" cy="180" rx="12" ry="27" fill={p.leaf} transform="rotate(-30 78 180)" />
      <ellipse cx="99" cy="123" rx="12" ry="24" fill={p.leaf} transform="rotate(30 99 123)" />
      <ellipse cx="134" cy="84" rx="11" ry="22" fill={p.leaf} transform="rotate(56 134 84)" />
      <text x="600" y="115" textAnchor="middle" fill={p.dark} fontSize="22" letterSpacing="5">AYUTTHAYA MONK CHAT</text>
      <text x="600" y="238" textAnchor="middle" fill={p.dark} fontFamily="Georgia, serif" fontStyle="italic" fontSize="110">Thank you,</text>
      <text x="600" y="294" textAnchor="middle" fill={p.dark} fontSize="29">for a little moment of peace.</text>

      {/* An illustrated temple garden, not a photograph or a record of participation. */}
      <g transform="translate(110 327)">
        <path d="M40 380V184C40-34 940-34 940 184v196Z" fill={p.sky} />
        <circle cx="741" cy="104" r="56" fill="#edc570" />
        <path d="M256 80q-22-26-41-3-32-13-38 15h118q-6-27-39-12M545 69q-21-22-39-2-28-11-34 14h105q-7-24-32-12" fill="#fffdf6" opacity=".9" />
        <g fill="#ce9a7d" stroke="#b77d61" strokeWidth="2" strokeLinejoin="round">
          <path d="M417 318V169h86v149Z" /><path d="m410 170 50-94 50 94Z" />
          <path d="m435 126 25-92 25 92Z" /><path d="M450 62h20V17h-20Z" />
          <path d="M404 233h112v17H404Zm-7 59h126v26H397Z" />
        </g>
        <path d="M443 295v-54q17-24 34 0v54Z" fill="#835a49" />
        <path d="M436 182h47m-47 19h47m-55 67h19m32 0h19m-44-111h12" stroke="#e5bda2" strokeWidth="5" strokeLinecap="round" />
        <path d="M154 344q16-104 11-193M853 345q-14-106-11-204" stroke="#9b8561" strokeWidth="17" fill="none" strokeLinecap="round" />
        <path d="m163 222-47-47m48 20 48-57m630 69-44-52m44 78 42-42" stroke="#9b8561" strokeWidth="8" fill="none" strokeLinecap="round" />
        <g fill={p.leaf}>
          <ellipse cx="116" cy="138" rx="76" ry="64" /><ellipse cx="200" cy="111" rx="75" ry="73" />
          <ellipse cx="111" cy="220" rx="58" ry="50" /><ellipse cx="224" cy="188" rx="58" ry="62" />
          <ellipse cx="815" cy="116" rx="65" ry="67" /><ellipse cx="887" cy="165" rx="54" ry="65" />
        </g>
        <g fill="#fffdf6" opacity=".22"><ellipse cx="194" cy="82" rx="41" ry="25" /><ellipse cx="804" cy="95" rx="28" ry="20" /></g>
        <ellipse cx="490" cy="365" rx="451" ry="52" fill="#c4d9b1" />
        <path d="M60 376q43-73 80 0m625 4q43-87 86 0m-668 0q28-55 59 0" fill={p.leaf} opacity=".65" />
        {/* Gentle, respectful seated figures at the conversation table. */}
        <path d="M293 350v-97q0-33 41-33t41 33v97Z" fill="#6b9b96" />
        <circle cx="334" cy="200" r="35" fill="#eac6a5" />
        <path d="M301 196q-9-53 33-44 42-3 34 44l-16-24q-29 17-51 24Z" fill="#67615a" />
        <path d="M323 206q10 9 21 0" stroke="#a37960" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="m321 270 62 18 23-23" stroke="#eac6a5" strokeWidth="15" fill="none" strokeLinecap="round" />
        <path d="M628 350v-94q0-37 41-37t41 37v94Z" fill="#db9453" />
        <path d="m651 226 47 123h-70v-94q0-22 23-29Z" fill="#edb16f" />
        <circle cx="670" cy="199" r="35" fill="#eac6a5" />
        <path d="M659 204q10 9 21 0" stroke="#a37960" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="m653 271-59 17-23-24" stroke="#eac6a5" strokeWidth="15" fill="none" strokeLinecap="round" />
        <path d="M280 310h100m-91 0v52m82-52v52m243-52h100m-91 0v52m82-52v52" stroke="#a88c67" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M433 291h114m-57 0v73" stroke="#a88c67" strokeWidth="9" strokeLinecap="round" />
        <rect x="455" y="267" width="17" height="23" rx="5" fill="#fffdf6" /><rect x="514" y="267" width="17" height="23" rx="5" fill="#fffdf6" />
        <path d="M400 194q35-43 70-5" fill="none" stroke={p.accent} strokeWidth="4" strokeLinecap="round" strokeDasharray="3 10" />
        <path d="m460 178 12 12-16 4" stroke={p.accent} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <g fill={p.petal}><circle cx="188" cy="354" r="9" /><circle cx="788" cy="350" r="8" /><circle cx="745" cy="374" r="7" /></g>
        <path d="m218 362 4-19m-8 10h16m535-33 4-19m-8 10h16" stroke="#fffdf6" strokeWidth="4" strokeLinecap="round" />
      </g>

      <text x="600" y="805" textAnchor="middle" fontSize="20" letterSpacing="3" fill={p.accent}>THIS LITTLE MEMORY IS FOR</text>
      <text x="600" y={nameLines.length > 2 ? 834 : nameLines.length > 1 ? 863 : 887} textAnchor="middle" fontSize={nameFont} fontWeight="600" fill={p.dark}>
        {nameLines.map((line,i)=><tspan key={i} x="600" dy={i ? (nameLines.length > 2 ? 43 : 58) : 0}>{line}</tspan>)}
      </text>
      <path d="M445 951h111m88 0h111" stroke={p.petal} strokeWidth="3" strokeLinecap="round" />
      <path d="M600 960q-23-14 0-34 23 20 0 34Zm0 0q-28 2-34-24 28 1 34 24Zm0 0q28 2 34-24-28 1-34 24Z" fill={p.petal} stroke={p.accent} strokeWidth="2" />
      <text x="600" y="1012" textAnchor="middle" fill="#4b635b" fontSize="32">
        {englishLines.map((line,i)=><tspan key={i} x="600" dy={i ? 46 : 0}>{line}</tspan>)}
      </text>
      {thaiLines.length > 0 && <text x="600" y="1181" textAnchor="middle" fill="#768377" fontSize="26">
        {thaiLines.map((line,i)=><tspan key={i} x="600" dy={i ? 38 : 0}>{line}</tspan>)}
      </text>}
      <text x="600" y="1303" textAnchor="middle" fill={p.dark} fontSize="22">
        {guideLines.map((line,i)=><tspan key={i} x="600" dy={i ? 27 : 0}>{line}</tspan>)}
      </text>
      <text x="600" y="1390" textAnchor="middle" fill={p.accent} fontSize="23">Wat Mahathat, Ayutthaya · {date}</text>
      <path d="m1030 1315 15 22 26 2-20 18 4 26-24-13-23 13 5-26-20-18 26-2Z" fill={p.petal} />
      <circle cx="128" cy="1364" r="32" fill="none" stroke={p.leaf} strokeWidth="2" strokeDasharray="3 5" opacity=".7" />
      <path d="M111 1367q16 16 33-9m-32-14h1m29 0h1" stroke={p.leaf} strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
})
