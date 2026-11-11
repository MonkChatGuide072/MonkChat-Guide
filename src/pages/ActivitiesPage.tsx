import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { GuideIcon } from '../components/GuideIcon'
import { getActivitiesPageContent } from '../content/activitiesContent'
import { normalizeLanguage } from '../lib/language'

export function ActivitiesPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const language = normalizeLanguage(i18n.resolvedLanguage || i18n.language)
  const content = getActivitiesPageContent(language)

  function handleOpenChatbot() {
    const event = new CustomEvent('monkchat:open-chatbot', { cancelable: true })
    window.dispatchEvent(event)
    if (!event.defaultPrevented) {
      navigate('/qa')
    }
  }

  return (
    <div className="space-y-10 bg-brand-cream pb-8 text-brand-text sm:space-y-12">
      {/* Hero Section */}
      <section className="rounded-2xl border border-brand-border bg-brand-surface p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#A33D19]/25 bg-[#FDF4EE] px-3 py-1 text-xs font-medium text-[#8C3213]">
            <GuideIcon name="lotus" className="h-3.5 w-3.5 shrink-0 text-[#A33D19]" />
            <span>{content.hero.badge}</span>
          </span>

          <p className="mt-4 font-serif text-sm font-semibold tracking-wide text-[#8C3213] sm:text-base">
            {content.hero.eyebrow}
          </p>

          <h1 className="mt-1 font-serif text-2xl font-semibold leading-snug text-brand-maroon sm:text-4xl">
            {content.hero.title}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
            {content.hero.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {content.hero.chips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-brand-border bg-[#F8F8F6] px-3.5 py-1.5 text-xs font-medium text-brand-maroon sm:text-sm"
              >
                <GuideIcon name={chip.icon} className="h-4 w-4 shrink-0 text-[#A33D19]" />
                <span>{chip.label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Authentic Activity Atmosphere Cards */}
      <section aria-labelledby="activities-atmosphere-title" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A33D19] sm:text-sm">
              <GuideIcon name="camera" className="h-4 w-4 shrink-0" />
              <span>{content.gallery.eyebrow}</span>
            </span>
            <h2
              id="activities-atmosphere-title"
              className="mt-1 font-serif text-2xl font-semibold text-brand-maroon sm:text-3xl"
            >
              {content.gallery.title}
            </h2>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-3.5 py-1.5 text-xs font-medium text-brand-maroon">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#A33D19]" />
            <span>{content.gallery.pillLabel}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.gallery.cards.map((card) => (
            <article
              key={card.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-brand-surface transition-colors duration-150 hover:border-brand-border-dark"
            >
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-[#EFEFE9]">
                  <img
                    src={card.image}
                    alt={card.title}
                    width={card.imageWidth}
                    height={card.imageHeight}
                    loading="lazy"
                    className={`h-full w-full object-cover ${card.imageClassName ?? 'object-center'}`}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-brand-maroon shadow-xs">
                    {card.badge}
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="font-sans text-lg font-semibold text-brand-maroon sm:text-xl">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-t border-brand-border/70 px-5 py-2 text-xs sm:px-6 sm:text-sm">
                <span className="inline-flex items-center gap-1.5 text-brand-muted">
                  <GuideIcon name={card.metaIcon} className="h-4 w-4 shrink-0 text-[#A33D19]" />
                  <span>{card.metaLeft}</span>
                </span>
                {card.linkTo ? (
                  <Link
                    to={card.linkTo}
                    className="inline-flex min-h-11 items-center font-semibold text-[#8C3213] hover:underline"
                  >
                    {card.metaRight}
                  </Link>
                ) : (
                  <span className="font-medium text-brand-maroon tabular-nums">{card.metaRight}</span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="rounded-xl border border-brand-border bg-brand-gold-soft/60 px-4 py-3 text-xs leading-6 text-brand-muted sm:px-5 sm:text-sm">
          <strong className="font-medium text-brand-maroon">{content.gallery.scheduleNoteTitle} </strong>
          <span>{content.gallery.scheduleNoteBody}</span>
        </div>
      </section>

      {/* Highlighted Contact & Official Social Banner (Accent Terracotta Palette) */}
      <section
        aria-labelledby="activities-contact-title"
        className="rounded-2xl bg-[#A33D19] p-6 text-white shadow-sm sm:p-8 lg:p-10"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-start gap-2 text-xs font-semibold uppercase tracking-wider text-[#FFF5F0]">
              <GuideIcon name="question" className="mt-0.5 h-4 w-4 shrink-0 text-[#FFF5F0]" />
              <span>{content.contact.eyebrow}</span>
            </span>

            <h2
              id="activities-contact-title"
              className="font-serif text-2xl font-semibold leading-snug text-white sm:text-3xl"
            >
              {content.contact.title}
            </h2>

            <p className="text-sm leading-relaxed text-[#FFF5F0] sm:text-base">
              {content.contact.description}
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {content.contact.infoPills.map((pill) => (
                <span
                  key={pill.label}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#7F2D12] px-3.5 py-1.5 text-xs font-medium text-white sm:text-sm"
                >
                  <GuideIcon name={pill.icon} className="h-3.5 w-3.5 shrink-0 text-[#FFF5F0]" />
                  <span>{pill.label}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
            <a
              href={content.contact.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#8C3213] shadow-xs transition-colors duration-150 hover:bg-[#FDF6F2]"
            >
              <GuideIcon name="thumbsUp" className="h-4 w-4 shrink-0" />
              <span>{content.contact.facebookLabel}</span>
              <GuideIcon name="external" className="h-3.5 w-3.5 shrink-0 opacity-80" />
            </a>

            <button
              type="button"
              onClick={handleOpenChatbot}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/30 bg-[#7F2D12]/85 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#6A240E]"
            >
              <GuideIcon name="chat" className="h-4 w-4 shrink-0" />
              <span>{content.contact.chatbotLabel}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Visitor Etiquette Section */}
      <section
        aria-labelledby="activities-etiquette-title"
        className="rounded-2xl border border-brand-border bg-brand-surface p-6 sm:p-8"
      >
        <div className="max-w-2xl">
          <span className="text-xs font-medium text-[#A33D19] sm:text-sm">
            {content.etiquette.eyebrow}
          </span>
          <h2
            id="activities-etiquette-title"
            className="mt-1 font-serif text-xl font-semibold text-brand-maroon sm:text-2xl"
          >
            {content.etiquette.title}
          </h2>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {content.etiquette.items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-brand-border bg-[#F8F8F6] p-5"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border bg-white text-[#A33D19]">
                <GuideIcon name={item.icon} className="h-5 w-5" />
              </span>
              <h3 className="text-base font-medium text-brand-maroon">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
