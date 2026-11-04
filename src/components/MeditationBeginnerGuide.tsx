import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { meditationBases, meditationGuideCopy, meditationGuideSources } from '../content/meditationGuide'
import { GuideIcon } from './GuideIcon'
import { MeditationGuideVisual } from './MeditationGuideVisual'
import './MeditationGuide.css'

export function MeditationBeginnerGuide() {
  const { i18n } = useTranslation()
  const language = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en') ? 'en' : 'th'
  const copy = meditationGuideCopy[language]
  const viewport = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const cards = [
    { title: copy.firstTitle, body: copy.firstBody, note: copy.firstNote, base: undefined },
    ...meditationBases.map(base => ({ ...base[language], base: base.id })),
    { title: copy.lastTitle, body: copy.lastBody, note: copy.lastNote, base: undefined },
  ]

  function goTo(index: number) {
    const next = Math.max(0, Math.min(cards.length - 1, index))
    setActive(next)
    const el = viewport.current
    const item = el?.children[next] as HTMLElement | undefined
    const first = el?.children[0] as HTMLElement | undefined
    if (el && item && first) el.scrollTo?.({ left: item.offsetLeft - first.offsetLeft, behavior: 'instant' })
  }

  return (
    <section id="meditation-guide" aria-labelledby="meditation-guide-heading" aria-roledescription="carousel" className="meditation-guide scroll-mt-24">
      <div className="mb-3">
        <h2 id="meditation-guide-heading" className="font-serif text-xl font-semibold leading-snug text-brand-maroon sm:text-2xl">{copy.title}</h2>
        <p className="mt-1 text-sm leading-5 text-brand-muted">{copy.intro}</p>
      </div>
      <div role="group" aria-label={copy.sectionLabel} className="mb-3 grid grid-cols-3 gap-2 sm:max-w-md">
        {[[0, copy.prepare], [1, copy.bases], [7, copy.settle]].map(([index, label]) => {
          const target = Number(index)
          const selected = target === 1 ? active >= 1 && active <= 6 : target === 7 ? active >= 7 : active === target
          return <button key={target} type="button" aria-pressed={selected} onClick={() => goTo(target)} className={`min-h-11 rounded-lg border px-2 text-sm font-medium transition-colors ${selected ? 'border-brand-terracotta bg-brand-terracotta text-white' : 'border-brand-border bg-brand-surface text-brand-maroon hover:bg-brand-gold-soft'}`}>{label}</button>
        })}
      </div>
      <div ref={viewport} className="meditation-card-viewport" role="group" aria-label={copy.keyboardHint} tabIndex={0}
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
        {cards.map((card, index) => <article key={index} className="meditation-picture-card" role="group" aria-roledescription="slide" aria-label={`${copy.card} ${index + 1} ${copy.count} ${cards.length}`} aria-hidden={index !== active} inert={index !== active}>
          <div className="meditation-picture-art">
            <MeditationGuideVisual base={card.base} still={index === 8} label={card.base ? `${copy.diagram}: ${copy.base} ${card.base}` : copy.posture} />
          </div>
          <div className="meditation-picture-copy">
            <p className="text-xs font-medium text-brand-terracotta">{card.base ? `${copy.base} ${card.base} / 7` : copy.lesson}</p>
            <h3 className="mt-1 text-xl font-medium leading-7 text-brand-maroon sm:text-2xl">{card.title}</h3>
            <p className="mt-2 text-base leading-6 text-brand-text">{card.body}</p>
            {card.note && <p className="mt-2 text-sm leading-5 text-brand-muted">{card.note}</p>}
          </div>
        </article>)}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <button type="button" aria-label={copy.previous} disabled={active === 0} onClick={() => goTo(active - 1)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-brand-surface text-brand-maroon transition-colors hover:bg-brand-gold-soft disabled:opacity-35"><GuideIcon name="arrow" className="h-[18px] w-[18px] rotate-180" /></button>
        <p role="status" aria-live="polite" aria-atomic="true" className="text-center text-sm tabular-nums text-brand-muted">{copy.card} {active + 1} {copy.count} {cards.length}</p>
        <button type="button" aria-label={copy.next} disabled={active === cards.length - 1} onClick={() => goTo(active + 1)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-brand-surface text-brand-maroon transition-colors hover:bg-brand-gold-soft disabled:opacity-35"><GuideIcon name="arrow" /></button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs leading-5 text-brand-muted">
        <p>{copy.source} · <a href={meditationGuideSources[language]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-brand-maroon">{copy.readSource}</a></p>
        <a href="#meditation-audio" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-maroon"><GuideIcon name="play" />{copy.listen}</a>
      </div>
    </section>
  )
}
