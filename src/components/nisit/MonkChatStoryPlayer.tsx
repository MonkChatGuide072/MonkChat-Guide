import { useEffect, useRef, useState } from 'react'
import { type StoryText } from '../../content/monkChatInvitation'
import { monkChatChapterCovers } from '../../content/monkChatChapterCovers'
import { routedChapters as storyChapters, routeArt as storyArt, getRouteConclusion, getRouteEffect } from '../../content/monkChatRoutes'
import './MonkChatStoryPlayer.css'

type Step = { sceneId: string; choiceIndex: number }
interface Props { isEnglish?: boolean; onExit?: () => void; studentCode?: string; studentName?: string; onProgressChange?: (active: boolean) => void }

/** Choices move to the next illustrated event; teaching notes belong to the chapter debrief. */
export function MonkChatStoryPlayer({ isEnglish = false, onExit, studentCode, studentName, onProgressChange }: Props) {
  const [chapterId, setChapterId] = useState('invitation')
  const [completed, setCompleted] = useState<string[]>([])
  const chapter = storyChapters.find(item => item.id === chapterId)!
  const chapterIndex = storyChapters.indexOf(chapter)
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
  const scene = chapter.scenes[sceneId]
  const active = started && !scene.ending
  const read = (value: StoryText) => isEnglish ? value.en : value.th
  const label = (th: string, en: string) => isEnglish ? en : th
  const last = history.at(-1)
  const lastChoice = last ? chapter.scenes[last.sceneId].choices[last.choiceIndex] : undefined
  const conclusion = getRouteConclusion(chapter, history)
  const art = storyArt[scene.ending && history.length ? conclusion.visual : scene.visual]
  const nextId = scene.nextChapterId !== undefined ? scene.nextChapterId : chapter.next
  const nextChapter = storyChapters.find(item => item.id === nextId)

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
    unlock(); setStarted(false); setChapterId('invitation'); setSceneId('arrival'); setHistory([]); setCompleted([])
  }, [studentCode])
  useEffect(() => {
    if (started) heading.current?.focus({ preventScroll: true })
  }, [chapterId, sceneId, started, history.length])
  useEffect(() => {
    if (started && scene.ending) setCompleted(previous => previous.includes(chapterId) ? previous : [...previous, chapterId])
  }, [started, scene.ending, chapterId])
  useEffect(() => {
    if (!started || !eventDialog.current) return
    const dialog = eventDialog.current
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!dialog.open) dialog.showModal()
    return () => { if (dialog.open) dialog.close(); document.body.style.overflow = overflow }
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
    unlock(); setStarted(true); setSceneId(chapter.start); setHistory([])
  }
  function rewind(index: number) { unlock(); setSceneId(history[index].sceneId); setHistory(previous => previous.slice(0, index)) }
  function exit() {
    if (active && !window.confirm(label('ออกจากบทนี้หรือไม่? รอบที่เล่นอยู่จะไม่ถูกบันทึก', 'Leave this chapter? This round will not be saved.'))) return
    unlock(); setStarted(false); setSceneId(chapter.start); setHistory([]); onExit?.()
  }
  function selectChapter(id: string, begin = true) {
    const target = storyChapters.find(item => item.id === id)
    if (!target) return
    if (active && !window.confirm(label('เปลี่ยนบทหรือไม่? รอบที่เล่นอยู่จะถูกเริ่มใหม่', 'Change chapter? The current round will be reset.'))) return
    unlock(); setChapterId(id); setSceneId(target.start); setHistory([]); setStarted(begin)
  }
  function chapterMenu() { unlock(); setStarted(false); setSceneId(chapter.start); setHistory([]) }
  const picture = <figure className="story-art"><img src={art.src} alt={read(art.alt)} width={1672} height={941} decoding="async" /><figcaption>WAT MAHATHAT · AYUTTHAYA</figcaption></figure>

  return <section aria-label={label('บทฝึกสถานการณ์ Monk Chat', 'Monk Chat story practice')} className="monk-story" data-testid="monk-chat-story-player" data-chapter={chapterId} data-route={conclusion.id} onKeyDown={event => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return
    if ((event.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"]')) return
    if (/^[1-3]$/.test(event.key)) { event.preventDefault(); choose(Number(event.key) - 1) }
  }}>
    <header className="story-toolbar" hidden={started}><div><p className="story-eyebrow">MONK CHAT STORIES · 8 CHAPTERS</p><h2>{label('ฝึกเรื่องราว Monk Chat ทั้ง 8 บท', 'Eight Monk Chat story chapters')}</h2></div>
      {started && <div className="story-tools"><button type="button" aria-pressed={translation} onClick={() => setTranslation(!translation)}>{label('คำแปลไทย', 'Thai translation')}: {translation ? label('เปิด', 'on') : label('ปิด', 'off')}</button><button type="button" onClick={reset}>{label('เริ่มใหม่', 'Restart')}</button>{onExit && <button type="button" onClick={exit}>{label('ออกจากบท', 'Leave chapter')}</button>}</div>}
    </header>
    {!started ? <>
      <nav className="story-chapter-menu" aria-label={label('เลือกบทฝึกสถานการณ์', 'Choose a story chapter')}>
        {storyChapters.map((item,index) => <button key={item.id} type="button" aria-pressed={chapterId === item.id} onClick={() => selectChapter(item.id)}>
          <img src={monkChatChapterCovers[item.id] ?? storyArt[item.cover].src} alt="" width={88} height={50} loading="lazy" />
          <span><small>{label(`บทที่ ${index + 1}`, `CHAPTER ${index + 1}`)}</small><strong>{read(item.title)}</strong><em>{completed.includes(item.id) ? label('เคยเล่นจบในครั้งนี้', 'Finished during this visit') : label('พร้อมฝึก', 'Ready to practise')}</em></span>
        </button>)}
      </nav>
      <p className="story-session-progress" role="status">{label(`เคยเล่นจบในครั้งนี้ ${completed.length} / 8 บท · ยังไม่บันทึกบนบัญชี`, `${completed.length} / 8 chapters finished during this visit · not saved to an account`)}</p>
    </> : <dialog ref={eventDialog} className="story-event-dialog" aria-label={label(`สถานการณ์ Monk Chat · บทที่ ${chapterIndex + 1}`, `Monk Chat event · Chapter ${chapterIndex + 1}`)} onCancel={event => { event.preventDefault(); exit() }}>
      <div className="story-event-toolbar"><span>MONK CHAT · {String(chapterIndex + 1).padStart(2, '0')}</span><div className="story-tools">
        <button type="button" aria-pressed={translation} onClick={() => setTranslation(!translation)}>{label('คำแปลไทย', 'Thai translation')}: {translation ? label('เปิด', 'on') : label('ปิด', 'off')}</button>
        <button type="button" onClick={reset}>{label('เริ่มใหม่', 'Restart')}</button><button type="button" onClick={exit}>{label('ปิด', 'Close')}</button>
      </div></div>
      <div key={`${chapterId}-${sceneId}-${history.length}`} className="story-card story-scene-enter" data-scene={sceneId} aria-busy={changing}>{picture}
        <div className="story-dialogue"><h3 ref={heading} tabIndex={-1} className="story-eyebrow">{read(scene.title)}</h3><p className="story-context">{read(scene.setting)}</p>
          {lastChoice && <><p className="story-speaker">{label('สิ่งที่เกิดขึ้นต่อ', 'WHAT HAPPENS NEXT')}</p><p className="story-speech" lang={isEnglish ? 'en' : 'th'}>{read(lastChoice.reaction)}</p>{!isEnglish && translation && <p className="story-translation" lang="en">{lastChoice.reaction.en}</p>}</>}
        </div>
        {!scene.ending && <><p className="story-prompt">{label('คุณจะพูดหรือทำอย่างไร?', 'What will you say or do?')}</p><div className="story-choices" role="group" aria-label={label('คำตอบของคุณ', 'Your response')}>{scene.choices.map((item,index) => <button key={index} type="button" disabled={changing} onClick={() => choose(index)} className="story-choice"><span className="story-choice-index" aria-hidden="true">{index + 1}</span><span className="story-choice-copy">{item.action && <small>{label('การกระทำ', 'ACTION')}</small>}<span lang="en">{item.line.en}</span>{translation && <span lang="th" className="story-translation">{item.line.th}</span>}</span></button>)}</div></>}
        {scene.ending && <div className="story-ending" data-testid="story-ending-view"><p className="story-eyebrow">{label(`จบบทที่ ${chapterIndex + 1} · ${chapter.title.th}`, `CHAPTER ${chapterIndex + 1} COMPLETE · ${chapter.title.en}`)}</p><h3>{read(conclusion.title)}</h3><div className="story-route-aftermath" data-testid="route-epilogue" data-route-state={conclusion.kind}><p className="story-eyebrow">{label('ฉากปลายทางของรูทนี้', 'WHAT THIS ROUTE LEADS TO')}</p><p>{read(conclusion.epilogue)}</p></div><p>{label(`คุณผ่านจุดตัดสินใจ ${history.length} ครั้ง ลองทบทวนคำที่เลือกและสิ่งที่เกิดขึ้น`, `You made ${history.length} decisions. Revisit your words and what happened next.`)}</p>{studentName && <p className="story-footnote">{studentName}</p>}<p className="story-footnote">{label('สรุปเฉพาะรอบนี้ ยังไม่บันทึกประวัติบนบัญชี และไม่ใช่คะแนนความคล่องในการพูด', 'This round only. No account history is saved, and this is not a fluency score.')}</p><button type="button" onClick={reset} className="story-primary">{label('ลองเส้นทางอื่น', 'Try another path')}</button>{nextChapter && <button type="button" className="story-primary story-next-chapter" onClick={() => selectChapter(nextChapter.id, true)}>{label(`ไปต่อบทที่ ${storyChapters.indexOf(nextChapter) + 1} · ${nextChapter.title.th}`, `Continue to chapter ${storyChapters.indexOf(nextChapter) + 1} · ${nextChapter.title.en}`)}</button>}<button type="button" className="story-back" onClick={chapterMenu}>{label('กลับไปเลือกบท', 'Choose another chapter')}</button></div>}
      </div>
      {active && history.length > 0 && <button type="button" className="story-back" disabled={changing} onClick={() => rewind(history.length - 1)}>{label('ย้อนคำตอบล่าสุด', 'Reconsider your last choice')}</button>}
      {scene.ending && <h3 className="story-route-trail-title">{label('ผลที่ตามมาจากทุกการเลือกในรูทนี้', 'Consequences of each choice in this route')}</h3>}
      {scene.ending && <ol className="story-recap">{history.map((step,index) => { const node=chapter.scenes[step.sceneId],item=node.choices[step.choiceIndex];return <li key={`${step.sceneId}-${index}`}><div className="story-recap-header"><h4>{index + 1}. {read(node.title)}</h4><button type="button" className="story-review-action" onClick={() => rewind(index)}>{label('ลองจุดนี้อีกครั้ง', 'Retry from here')}</button></div><p lang="en">{item.line.en}</p>{translation && <p lang="th" className="story-translation">{item.line.th}</p>}<p className="story-route-consequence">{read(getRouteEffect(chapter.id,step).after)}</p><p className="story-takeaway">{read(item.takeaway)}</p></li> })}</ol>}
    </dialog>}
  </section>
}
