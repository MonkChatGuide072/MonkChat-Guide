import type { NisitTab } from '../../content/nisitTrainingModules'

/** Decorative, code-native study illustrations. No lesson content or progress is encoded here. */
export function NisitModuleArt({ module, compact = false }: { module: NisitTab; compact?: boolean }) {
  const scenes = {
    vocab: <>
      <path d="M48 51q35-12 72 5v91q-37-18-72-5Z" fill="#fffaf0" stroke="#ac652e" strokeWidth="3" />
      <path d="M120 56q37-17 72-5v91q-35-5-72 5Z" fill="white" stroke="#ac652e" strokeWidth="3" />
      <path d="M120 57v90M61 68l39 5m-39 41 38 5m40-8 37-7m-37 21 37-7" fill="none" stroke="#d6ad76" strokeWidth="4" strokeLinecap="round" />
      <text x="60" y="101" fill="#a45721" fontSize="26" fontWeight="600">Aa</text>
      <path d="M153 56V35h28v25l-14-8Z" fill="#e89c38" />
      <circle cx="177" cy="72" r="19" fill="#f9cc72" /><path d="m168 72 6 6 12-13" fill="none" stroke="#88491d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    audio: <>
      <path d="M64 100V78a56 56 0 0 1 112 0v22" fill="none" stroke="#247f73" strokeWidth="15" />
      <path d="M65 88V76a55 55 0 0 1 110 0v12" fill="none" stroke="#a5ddd0" strokeWidth="6" />
      <rect x="49" y="84" width="33" height="57" rx="13" fill="#1c6b63" /><rect x="158" y="84" width="33" height="57" rx="13" fill="#1c6b63" />
      <rect x="58" y="90" width="16" height="43" rx="8" fill="#64b5a3" /><rect x="166" y="90" width="16" height="43" rx="8" fill="#64b5a3" />
      {[24,42,62,44,24].map((h,i)=><rect key={i} x={92+i*12} y={108-h/2} width="6" height={h} rx="3" fill={i===2?'#e0ae52':'#3a9c8c'} />)}
      <path d="M175 139q-6 18-37 18" fill="none" stroke="#247f73" strokeWidth="4" strokeLinecap="round" /><rect x="121" y="150" width="24" height="12" rx="6" fill="#e0ae52" />
    </>,
    qa: <>
      <path d="M47 35h111a15 15 0 0 1 15 15v55a15 15 0 0 1-15 15H83l-25 19v-19H47a15 15 0 0 1-15-15V50a15 15 0 0 1 15-15Z" fill="#4877bc" />
      <path d="M118 79h74a13 13 0 0 1 13 13v43a13 13 0 0 1-13 13h-4v17l-23-17h-47a13 13 0 0 1-13-13V92a13 13 0 0 1 13-13Z" fill="#fffdf7" stroke="#c2d4ec" strokeWidth="3" />
      <text x="84" y="98" fill="white" fontSize="61" fontWeight="600">?</text>
      <path d="m137 113 11 11 24-27" fill="none" stroke="#d39d39" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="188" cy="44" r="6" fill="#e9b95a" />
    </>,
    drills: <>
      <rect x="74" y="23" width="105" height="65" rx="17" fill="white" stroke="#e4b59c" strokeWidth="3" />
      <path d="m98 87-12 15V87" fill="white" stroke="#e4b59c" strokeWidth="3" />
      <path d="M95 46h59m-59 13h39" fill="none" stroke="#d37c55" strokeWidth="5" strokeLinecap="round" />
      <path d="M27 153v-15a33 33 0 0 1 66 0v15Z" fill="#3c777a" /><circle cx="60" cy="102" r="20" fill="#efc39c" />
      <path d="M143 153v-15a33 33 0 0 1 66 0v15Z" fill="#d77a38" /><circle cx="176" cy="102" r="20" fill="#efc39c" />
      <path d="M47 102q13 8 26 0m91 0q12 8 24 0" fill="none" stroke="#b47c5c" strokeWidth="2" strokeLinecap="round" />
      <path d="M105 129h27m-7-7 7 7-7 7" fill="none" stroke="#c6714d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    videos: <>
      <rect x="33" y="33" width="174" height="108" rx="15" fill="#72549e" />
      <rect x="41" y="41" width="158" height="91" rx="9" fill="#e6def4" />
      <circle cx="120" cy="85" r="28" fill="#9674c4" /><path d="m113 71 23 14-23 14Z" fill="white" />
      <path d="M100 142v15h40v-15m-55 16h70" fill="none" stroke="#68547e" strokeWidth="6" strokeLinecap="round" />
      <path d="M57 119h118" stroke="white" strokeWidth="4" strokeLinecap="round" /><path d="M57 119h49" stroke="#d1a34f" strokeWidth="4" strokeLinecap="round" /><circle cx="106" cy="119" r="5" fill="#d1a34f" />
      <path d="m189 26 3-12m12 17 9-6" stroke="#c39c4b" strokeWidth="4" strokeLinecap="round" />
    </>,
    cockpit: <>
      <circle cx="120" cy="88" r="61" fill="white" stroke="#7e9b5f" strokeWidth="7" /><circle cx="120" cy="88" r="47" fill="#eef4df" stroke="#cad7b5" strokeWidth="2" />
      <path d="m143 58-13 42-34 20 13-42Z" fill="#58806a" /><path d="m143 58-13 42-21-22Z" fill="#d6a445" /><circle cx="120" cy="88" r="7" fill="white" />
      <path d="M120 45v5m0 76v5m-43-43h5m76 0h5" stroke="#7e9b5f" strokeWidth="3" strokeLinecap="round" />
      <circle cx="181" cy="141" r="18" fill="#d8ab5b" /><path d="m173 141 5 5 11-12" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    cards: <>
      <path d="m42 74 78-47 78 47v68a13 13 0 0 1-13 13H55a13 13 0 0 1-13-13Z" fill="#c67a90" />
      <rect x="63" y="38" width="114" height="98" rx="9" fill="#fffdf8" stroke="#ecc5ce" strokeWidth="2" />
      <path d="M85 61h70m-70 13h45m-39 19h58" stroke="#d6a4ad" strokeWidth="4" strokeLinecap="round" />
      <path d="m42 76 78 49 78-49v66a13 13 0 0 1-13 13H55a13 13 0 0 1-13-13Z" fill="#e4a4b2" />
      <path d="m43 147 61-44m93 44-61-44" stroke="#cf899b" strokeWidth="2" />
      <circle cx="121" cy="123" r="13" fill="#d8ad5d" /><path d="m115 123 4 4 9-9" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  }
  return <svg viewBox="0 0 240 180" aria-hidden="true" focusable="false" className={`training-module-art ${compact ? 'training-module-art-compact' : ''}`}>
    <circle cx="121" cy="90" r="78" fill="var(--module-art-bg, #fff0d3)" />
    <circle cx="33" cy="41" r="5" fill="var(--module-bright, #d89a3c)" opacity=".55" />
    <path d="m201 110 5 9 10 2-8 7 1 10-8-5-9 5 2-10-8-7 10-2Z" fill="var(--module-bright, #d89a3c)" opacity=".5" />
    <ellipse cx="121" cy="160" rx="77" ry="7" fill="var(--module-ink, #a75d22)" opacity=".1" />
    {scenes[module]}
  </svg>
}
