import { useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { meditationBases, meditationGuideSources, meditationJourneyCopy, preparationCards, reflectionCards, type MeditationPictureCard } from '../content/meditationGuide'
import { GuideIcon } from './GuideIcon'
import { MeditationGuideVisual } from './MeditationGuideVisual'
import './MeditationGuide.css'

interface CarouselProps {
  cards: { title: string; body: string; note?: string; visual: ReactNode }[]
  previous: string; next: string; swipe: string; cardLabel: string; countLabel: string
  baseShortcut?: string
}

function PictureCarousel({ cards, previous, next, swipe, cardLabel, countLabel, baseShortcut }: CarouselProps) {
  const viewport = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  function goTo(index: number) {
    const nextIndex = Math.max(0, Math.min(cards.length - 1, index))
    setActive(nextIndex)
    const el = viewport.current
    const item = el?.children[nextIndex] as HTMLElement | undefined
    const first = el?.children[0] as HTMLElement | undefined
    if (el && item && first) el.scrollTo?.({ left: item.offsetLeft - first.offsetLeft, behavior: 'instant' })
  }
  return <div aria-roledescription="carousel">
    {baseShortcut && <button type="button" className="mb-3 min-h-11 rounded-lg border border-brand-border px-3 text-sm font-medium text-brand-maroon" onClick={() => goTo(6)}>{baseShortcut}</button>}
    <div ref={viewport} className="meditation-card-viewport" role="group" aria-label={swipe} tabIndex={0}
      onKeyDown={event => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          event.preventDefault()
          goTo(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1))
        }
      }}
      onScroll={event => {
        const el = event.currentTarget
        const children = Array.from(el.children) as HTMLElement[]
        const start = children[0]?.offsetLeft ?? 0
        const nearest = children.reduce((best, item, index) => Math.abs(item.offsetLeft - start - el.scrollLeft) < Math.abs(children[best].offsetLeft - start - el.scrollLeft) ? index : best, 0)
        setActive(nearest)
      }}>
      {cards.map((card, index) => <article key={index} className="meditation-picture-card" role="group" aria-roledescription="slide" aria-label={`${cardLabel} ${index + 1} ${countLabel} ${cards.length}`} aria-hidden={index !== active} inert={index !== active}>
        <div className="meditation-picture-art">{card.visual}</div>
        <div className="meditation-picture-copy">
          <h4 className="text-xl font-medium leading-7 text-brand-maroon sm:text-2xl">{card.title}</h4>
          <p className="mt-2 text-base leading-6 text-brand-text">{card.body}</p>
          {card.note && <p className="mt-2 text-sm leading-5 text-brand-muted">{card.note}</p>}
        </div>
      </article>)}
    </div>
    <div className="mt-3 flex items-center justify-between gap-3">
      <button type="button" aria-label={previous} disabled={active === 0} onClick={() => goTo(active - 1)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-brand-surface text-brand-maroon hover:bg-brand-gold-soft disabled:opacity-35"><GuideIcon name="arrow" className="h-[18px] w-[18px] rotate-180" /></button>
      <p role="status" aria-live="polite" aria-atomic="true" className="text-center text-sm tabular-nums text-brand-muted">{cardLabel} {active + 1} {countLabel} {cards.length}</p>
      <button type="button" aria-label={next} disabled={active === cards.length - 1} onClick={() => goTo(active + 1)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-brand-surface text-brand-maroon hover:bg-brand-gold-soft disabled:opacity-35"><GuideIcon name="arrow" /></button>
    </div>
  </div>
}

export function MeditationBeginnerGuide() {
  const { i18n } = useTranslation()
  const language = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en') ? 'en' : 'th'
  const copy = meditationJourneyCopy[language]
  const [phase, setPhase] = useState(0)
  const [basesOpen, setBasesOpen] = useState(false)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const makeCards = (cards: MeditationPictureCard[]) => cards.map(card => ({ ...card, visual: <MeditationGuideVisual scene={card.scene} label={card.title} /> }))

  return <section id="meditation-guide" aria-labelledby="meditation-guide-heading" className="meditation-guide scroll-mt-24">
    <h2 id="meditation-guide-heading" className="font-serif text-xl font-semibold leading-snug text-brand-maroon sm:text-2xl">{copy.title}</h2>
    <p className="mt-1 text-sm leading-5 text-brand-muted">{copy.intro}</p>
    <div role="tablist" aria-label={copy.phaseLabel} className="my-4 grid grid-cols-3 gap-2 sm:max-w-lg">
      {copy.phases.map((label, index) => <button key={index} ref={el => { tabs.current[index] = el }} id={`meditation-stage-${index}`} role="tab" type="button" aria-selected={phase === index} aria-controls={`meditation-stage-panel-${index}`} tabIndex={phase === index ? 0 : -1}
        onClick={() => { setPhase(index); setBasesOpen(false) }}
        onKeyDown={event => {
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault()
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3
            setPhase(next); setBasesOpen(false); tabs.current[next]?.focus()
          }
        }}
        className={`min-h-12 rounded-lg border px-2 py-2 break-normal text-sm font-medium leading-5 ${phase === index ? 'border-brand-terracotta bg-brand-terracotta text-white' : 'border-brand-border bg-brand-surface text-brand-maroon hover:bg-brand-gold-soft'}`}>{label}</button>)}
    </div>
    <div id={`meditation-stage-panel-${phase}`} role="tabpanel" aria-labelledby={`meditation-stage-${phase}`} tabIndex={0}>
      <h3 className="text-lg font-medium text-brand-maroon">{[copy.beforeTitle, copy.duringTitle, copy.afterTitle][phase]}</h3>
      {phase !== 1 && <p className="mb-3 mt-1 text-sm leading-5 text-brand-muted">{phase === 0 ? copy.beforeIntro : copy.afterIntro}</p>}
      {phase === 0 && <>
        <PictureCarousel key="before" cards={makeCards(preparationCards[language])} previous={copy.previous} next={copy.next} swipe={copy.swipe} cardLabel={copy.card} countLabel={copy.count} />
        <button type="button" aria-expanded={basesOpen} aria-controls="meditation-base-details" onClick={() => setBasesOpen(!basesOpen)} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-maroon underline underline-offset-4">{basesOpen ? copy.basesHide : copy.basesToggle}<span aria-hidden="true">{basesOpen ? '−' : '+'}</span></button>
        {basesOpen && <section id="meditation-base-details" aria-labelledby="meditation-bases-heading" className="mt-3 rounded-xl border border-brand-border p-3 sm:p-5">
          <h4 id="meditation-bases-heading" className="mb-2 text-lg font-medium text-brand-maroon">{copy.basesTitle}</h4>
          <PictureCarousel cards={meditationBases.map(base => ({ ...base[language], visual: <MeditationGuideVisual base={base.id} label={`${copy.diagram}: ${copy.base} ${base.id}`} /> }))} previous={copy.basePrevious} next={copy.baseNext} swipe={copy.baseSwipe} cardLabel={copy.base} countLabel={copy.count} baseShortcut={copy.base7} />
          <p className="mt-3 text-xs leading-5 text-brand-muted">{copy.source} · <a href={meditationGuideSources[language]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{copy.readSource}</a></p>
        </section>}
      </>}
      {phase === 1 && <div className="meditation-time-card mt-3 overflow-hidden rounded-2xl border border-brand-border bg-brand-surface">
        <div className="meditation-time-art"><MeditationGuideVisual meditationTime label={copy.duringImage} /></div>
        <div className="p-4 sm:p-6"><p className="text-base leading-6 text-brand-text">{copy.duringBody}</p><p className="mt-2 text-sm leading-5 text-brand-muted">{copy.duringNote}</p>
          <a href="#meditation-audio" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-terracotta px-4 text-sm font-medium text-white"><GuideIcon name="play" />{copy.listen}</a>
        </div>
      </div>}
      {phase === 2 && <>
        <PictureCarousel key="after" cards={makeCards(reflectionCards[language])} previous={copy.previous} next={copy.next} swipe={copy.swipe} cardLabel={copy.card} countLabel={copy.count} />
        <p className="mt-3 rounded-lg border border-brand-border bg-brand-gold-soft px-3 py-2 text-sm leading-5 text-brand-text">{copy.afterNote}</p>
      </>}
    </div>
  </section>
}
