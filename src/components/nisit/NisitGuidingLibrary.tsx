import { useState } from 'react'
import { nisitGuidingScripts, type GuidingParagraph } from '../../content/nisitGuidingScripts'
import { MeditationGuideVisual } from '../MeditationGuideVisual'
import { NisitVocabCards } from './NisitVocabCards'
import './NisitGuidingLibrary.css'

interface Props { isEnglish: boolean; studentProfileId?: string; progressScope?: string }

/** One library for whole-script rehearsal and the existing illustrated vocabulary cards. */
export function NisitGuidingLibrary({ isEnglish, studentProfileId, progressScope }: Props) {
  const [scriptId, setScriptId] = useState('basic')
  const [view, setView] = useState<'cards' | 'full'>('cards')
  const [showReadings, setShowReadings] = useState(false)
  const script = nisitGuidingScripts.find(item => item.id === scriptId)!
  const label = (th: string, en: string) => isEnglish ? en : th
  function paragraphContent(paragraph: GuidingParagraph) {
    return <>
      <p className="guiding-line-en" lang="en">{paragraph.en}</p>
      {showReadings && <p className="guiding-reading" data-reading lang="th">{paragraph.readingTh}</p>}
      <p className="guiding-meaning" lang="th">{paragraph.th}</p>
      {paragraph.pause && <p className="guiding-pause">{label('เว้นช่วงเงียบ ให้ผู้ฝึกพักอยู่กับความสบาย', 'Leave a quiet pause to rest with this ease.')}</p>}
    </>
  }

  return <section className="guiding-library" aria-label={label('คลังบทฝึกนำนั่งสมาธิ', 'Meditation guiding script library')}>
    <header className="guiding-library-heading"><div><p className="guiding-kicker">GUIDING SCRIPTS</p><h2>{label('เลือกบทที่อยากฝึกนำ', 'Choose a guiding script')}</h2><p>{label('เลือกบท แล้วฝึกจากการ์ดหรืออ่านต่อเนื่องในหน้าเดียว', 'Choose a script, then rehearse with cards or read it all on one page.')}</p></div></header>
    <div className="guiding-script-choices" role="group" aria-label={label('เลือกบทนำนั่ง', 'Choose a meditation script')}>
      {nisitGuidingScripts.map((item,index) => <button key={item.id} type="button" className="guiding-script-choice" aria-pressed={scriptId === item.id} onClick={() => setScriptId(item.id)}>
        <span className="guiding-script-picture" aria-hidden="true"><MeditationGuideVisual scene={index === 0 ? 'sit' : 'crystal'} still label="" /></span>
        <span className="guiding-script-copy"><small>{label(`บทฝึก ${index + 1}`, `SCRIPT ${index + 1}`)}</small><strong>{isEnglish ? item.titleEn : item.titleTh}</strong><span>{isEnglish ? item.descriptionEn : item.descriptionTh}</span></span>
      </button>)}
    </div>
    <div className="guiding-controls">
      <div className="guiding-view-buttons" role="group" aria-label={label('รูปแบบการอ่านบท', 'Script reading format')}>
        <button type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')}>{label('การ์ดฝึกทีละช่วง', 'Practice cards')}</button>
        <button type="button" aria-pressed={view === 'full'} onClick={() => setView('full')}>{label('บทเต็มในหน้าเดียว', 'Full script on one page')}</button>
      </div>
      <button type="button" role="switch" aria-checked={showReadings} onClick={() => setShowReadings(!showReadings)} className="guiding-reading-switch"><span aria-hidden="true" className="guiding-switch-knob" />{label('แสดงคำอ่านไทย', 'Show Thai reading cues')}</button>
    </div>
    {showReadings && <p className="guiding-reading-note">{label('คำอ่านไทยเป็นตัวช่วยโดยประมาณ ควรฟังเสียงภาษาอังกฤษประกอบเพื่อฝึกจังหวะและการออกเสียง', 'Thai reading cues are approximate. Listen to English speech as well to practise rhythm and pronunciation.')}</p>}

    {view === 'cards' && scriptId === 'basic' ? <NisitVocabCards isEnglish={isEnglish} studentProfileId={studentProfileId} progressScope={progressScope} showReadings={showReadings} />
      : view === 'full' ? <article className="guiding-full-script" aria-label={label('บทนำนั่งฉบับเต็ม', 'Complete meditation script')}>
        <header><p className="guiding-kicker">{label('อ่านต่อเนื่อง', 'CONTINUOUS READING')}</p><h3>{isEnglish ? script.titleEn : script.titleTh}</h3></header>
        {script.paragraphs.map(paragraph => <section key={paragraph.id} className="guiding-full-paragraph"><h4>{isEnglish ? paragraph.titleEn : paragraph.titleTh}</h4>{paragraphContent(paragraph)}</section>)}
      </article> : <div className="guiding-alternative-cards">{script.paragraphs.map(paragraph => <article key={paragraph.id} className="guiding-alternative-card">
        <div className="guiding-paragraph-picture"><MeditationGuideVisual scene={paragraph.scene} still label={isEnglish ? paragraph.titleEn : paragraph.titleTh} /></div>
        <div><h3>{isEnglish ? paragraph.titleEn : paragraph.titleTh}</h3>{paragraphContent(paragraph)}</div>
      </article>)}</div>}
  </section>
}
