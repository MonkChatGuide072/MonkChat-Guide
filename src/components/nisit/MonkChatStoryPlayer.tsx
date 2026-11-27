import { useEffect, useRef, useState } from 'react'
import { invitationScenes, invitationArt, invitationChapters, type StoryText } from '../../content/monkChatInvitation'
import './MonkChatStoryPlayer.css'

type Step = { sceneId: string; choiceIndex: number }
interface Props { isEnglish?: boolean; onExit?: () => void; studentCode?: string; studentName?: string; onProgressChange?: (active: boolean) => void }

/** Choices move to the next illustrated event; teaching notes belong to the chapter debrief. */
export function MonkChatStoryPlayer({ isEnglish = false, onExit, studentCode, studentName, onProgressChange }: Props) {
  const [started, setStarted] = useState(false)
  const [sceneId, setSceneId] = useState('arrival')
  const [history, setHistory] = useState<Step[]>([])
  const [translation, setTranslation] = useState(!isEnglish)
  const [changing, setChanging] = useState(false)
  const locked = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const eventDialog = useRef<HTMLDialogElement>(null)
  const previousStudent = useRef(studentCode)
  const scene = invitationScenes[sceneId]
  const active = started && !scene.ending
  const read = (value: StoryText) => isEnglish ? value.en : value.th
  const label = (th: string, en: string) => isEnglish ? en : th
  const last = history.at(-1)
  const lastChoice = last ? invitationScenes[last.sceneId].choices[last.choiceIndex] : undefined
  const art = invitationArt[scene.visual]

  useEffect(() => { onProgressChange?.(active); return () => onProgressChange?.(false) }, [active, onProgressChange])
  useEffect(() => {
    if (!active) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    const confirmLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return
      const destination = new URL(link.href, location.href)
      if (destination.pathname === location.pathname && destination.search === location.search && destination.origin === location.origin) return
      if (!window.confirm(isEnglish ? 'Leave this page? This practice round is not saved.' : 'ออกจากหน้านี้หรือไม่? รอบฝึกนี้ยังไม่ได้บันทึก')) { event.preventDefault(); event.stopPropagation() }
    }
    window.addEventListener('beforeunload', warn); document.addEventListener('click', confirmLink, true)
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', confirmLink, true) }
  }, [active, isEnglish])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  useEffect(() => {
    if (previousStudent.current === studentCode) return
    previousStudent.current = studentCode
    setStarted(false); setSceneId('arrival'); setHistory([])
  }, [studentCode])
  useEffect(() => {
    if (started) heading.current?.focus({ preventScroll: true })
  }, [sceneId, started, history.length])
  useEffect(() => {
    if (!started) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    try {
      if (eventDialog.current && !eventDialog.current.open && typeof eventDialog.current.showModal === 'function') {
        eventDialog.current.showModal()
      }
    } catch {
      // Graceful fallback for mobile webviews; dialog has open attribute in JSX
    }
    return () => {
      document.body.style.overflow = overflow
      try {
        if (eventDialog.current?.open && typeof eventDialog.current.close === 'function') {
          eventDialog.current.close()
        }
      } catch {
        // ignore
      }
    }
  }, [started])

  function unlock() { if (timer.current) clearTimeout(timer.current); locked.current = false; setChanging(false) }
  function choose(index: number) {
    if (!active || locked.current || !scene.choices[index]) return
    locked.current = true; setChanging(true)
    setHistory(previous => [...previous, { sceneId, choiceIndex: index }]); setSceneId(scene.choices[index].next)
    timer.current = setTimeout(unlock, 450)
  }
  function reset() {
    if (active && !window.confirm(label('เริ่มบทใหม่หรือไม่? การตัดสินใจในรอบนี้จะถูกล้าง', 'Start again? Decisions in this round will be cleared.'))) return
    unlock(); setStarted(false); setSceneId('arrival'); setHistory([])
  }
  function rewind(index: number) { unlock(); setSceneId(history[index].sceneId); setHistory(previous => previous.slice(0, index)) }
  function exit() {
    if (active && !window.confirm(label('ออกจากบทนี้หรือไม่? รอบที่เล่นอยู่จะไม่ถูกบันทึก', 'Leave this chapter? This round will not be saved.'))) return
    unlock(); setStarted(false); setSceneId('arrival'); setHistory([]); onExit?.()
  }
  const picture = <figure className="story-art"><img src={art.src} alt={read(art.alt)} width={1672} height={941} decoding="async" /><figcaption>WAT MAHATHAT · AYUTTHAYA</figcaption></figure>

  return <section aria-label={label('บทฝึกสถานการณ์ Monk Chat', 'Monk Chat story practice')} className="monk-story" data-testid="monk-chat-story-player" onKeyDown={event => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return
    if ((event.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"]')) return
    if (/^[1-3]$/.test(event.key)) { event.preventDefault(); choose(Number(event.key) - 1) }
  }}>
    <header className="story-toolbar" hidden={started}><div><p className="story-eyebrow">MONK CHAT STORIES · 01</p><h2>{label('เมื่อบทสนทนาเริ่มจากคุณ', 'A conversation begins with you')}</h2></div>
      {started && <div className="story-tools"><button type="button" aria-pressed={translation} onClick={() => setTranslation(!translation)}>{label('คำแปลไทย', 'Thai translation')}: {translation ? label('เปิด', 'on') : label('ปิด', 'off')}</button><button type="button" onClick={reset}>{label('เริ่มใหม่', 'Restart')}</button>{onExit && <button type="button" onClick={exit}>{label('ออกจากบท', 'Leave chapter')}</button>}</div>}
    </header>
    {!started ? <>
      <div className="story-card">{picture}<div className="story-intro"><p className="story-eyebrow">{label('บทที่ 1 · การเชิญชวน', 'CHAPTER 1 · THE INVITATION')}</p><h3>{label('คนที่เดินผ่าน อาจมีเรื่องอยากคุย', 'Every passer-by has a story')}</h3>
        <p>{label('บ่ายวันหนึ่ง ณ วัดมหาธาตุ คุณเป็นพระนิสิตที่จุดกิจกรรม Monk Chat นักท่องเที่ยวสามคนกำลังเดินผ่าน คำแรกของคุณจะพาเรื่องราวไปทางไหน?', 'One afternoon at Wat Mahathat, you are the student monk at the Monk Chat area. Three visitors are walking past. Where will your first words lead?')}</p>
        <button type="button" onClick={() => { unlock(); setStarted(true) }} className="story-primary">{label('เริ่มเรื่องราว', 'Begin the story')} <span aria-hidden="true">&nbsp;→</span></button><p className="story-footnote">{label('เลือกคำพูดแล้วดูเหตุการณ์ต่อไป ไม่มีคะแนนสอบ · ใช้เวลาเล่นตามจังหวะของคุณ', 'Choose what to say and see what happens next. No test score; play at your own pace.')}</p>
      </div></div>
      <details className="story-plan"><summary>{label('เส้นทางการฝึก · พร้อมเล่นบทที่ 1', 'Learning path · Chapter 1 available')}</summary><ol>{invitationChapters.map((chapter,index) => <li key={chapter.en}>{index + 1}. {read(chapter)}<small>{index === 0 ? label('พร้อมทดลองฝึก', 'Available to try') : label('บทถัดไปในแผนพัฒนา', 'Planned next chapter')}</small></li>)}</ol></details>
    </> : <div className="story-modal-overlay" role="presentation" onClick={e => { if (e.target === e.currentTarget) exit() }}><dialog ref={eventDialog} open className="story-event-dialog" aria-label={label('สถานการณ์ Monk Chat · บทที่ 1', 'Monk Chat event · Chapter 1')} onCancel={event => { event.preventDefault(); exit() }} onClick={e => e.stopPropagation()}>
      <div className="story-event-toolbar"><span>MONK CHAT · 01</span><div className="story-tools">
        <button type="button" aria-pressed={translation} onClick={() => setTranslation(!translation)}>{label('คำแปลไทย', 'Thai translation')}: {translation ? label('เปิด', 'on') : label('ปิด', 'off')}</button>
        <button type="button" onClick={reset}>{label('เริ่มใหม่', 'Restart')}</button><button type="button" onClick={exit}>{label('ปิด', 'Close')}</button>
      </div></div>
      <div key={`${sceneId}-${history.length}`} className="story-card story-scene-enter" data-scene={sceneId} aria-busy={changing}>{picture}
        <div className="story-dialogue"><h3 ref={heading} tabIndex={-1} className="story-eyebrow">{read(scene.title)}</h3>{(!lastChoice || scene.ending) && <p className="story-context">{read(scene.setting)}</p>}
          {lastChoice && <><p className="story-speaker">{label('สิ่งที่เกิดขึ้นต่อ', 'WHAT HAPPENS NEXT')}</p><p className="story-speech" lang={isEnglish ? 'en' : 'th'}>{read(lastChoice.reaction)}</p>{!isEnglish && translation && <p className="story-translation" lang="en">{lastChoice.reaction.en}</p>}</>}
        </div>
        {!scene.ending && <><p className="story-prompt">{label('คุณจะพูดหรือทำอย่างไร?', 'What will you say or do?')}</p><div className="story-choices" role="group" aria-label={label('คำตอบของคุณ', 'Your response')}>{scene.choices.map((item,index) => <button key={index} type="button" disabled={changing} onClick={() => choose(index)} className="story-choice"><span className="story-choice-index" aria-hidden="true">{index + 1}</span><span className="story-choice-copy">{item.action && <small>{label('การกระทำ', 'ACTION')}</small>}<span lang="en">{item.line.en}</span>{translation && <span lang="th" className="story-translation">{item.line.th}</span>}</span></button>)}</div></>}
        {scene.ending && <div className="story-ending" data-testid="story-ending-view"><p className="story-eyebrow">{label('จบบทที่ 1 · การเชิญชวน', 'CHAPTER 1 COMPLETE · THE INVITATION')}</p><h3>{label('ทุกคำชวน เปิดพื้นที่ให้เลือก', 'An invitation leaves room to choose')}</h3><p>{label(`คุณผ่านจุดตัดสินใจ ${history.length} ครั้ง ลองทบทวนคำที่เลือกและสิ่งที่เกิดขึ้น`, `You made ${history.length} decisions. Revisit your words and what happened next.`)}</p>{studentName && <p className="story-footnote">{studentName}</p>}<p className="story-footnote">{label('สรุปเฉพาะรอบนี้ ยังไม่บันทึกประวัติบนบัญชี และไม่ใช่คะแนนความคล่องในการพูด', 'This round only. No account history is saved, and this is not a fluency score.')}</p><button type="button" onClick={reset} className="story-primary">{label('ลองเส้นทางอื่น', 'Try another path')}</button></div>}
      </div>
      {active && history.length > 0 && <button type="button" className="story-back" disabled={changing} onClick={() => rewind(history.length - 1)}>{label('ย้อนคำตอบล่าสุด', 'Reconsider your last choice')}</button>}
      {scene.ending && <ol className="story-recap">{history.map((step,index) => { const node=invitationScenes[step.sceneId],item=node.choices[step.choiceIndex];return <li key={`${step.sceneId}-${index}`}><div className="story-recap-header"><h4>{index + 1}. {read(node.title)}</h4><button type="button" className="story-review-action" onClick={() => rewind(index)}>{label('ลองจุดนี้อีกครั้ง', 'Retry from here')}</button></div><p lang="en">{item.line.en}</p>{translation && <p lang="th" className="story-translation">{item.line.th}</p>}<p>{read(item.reaction)}</p><p className="story-takeaway">{read(item.takeaway)}</p></li> })}</ol>}
    </dialog></div>}
  </section>
}
