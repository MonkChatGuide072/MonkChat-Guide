import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

const destinationCards = [
  { to: '/meditation', icon: '🧘', titleKey: 'visitor.meditationTitle', descriptionKey: 'visitor.meditationDesc', actionKey: 'visitor.meditationAction' },
  { to: '/qa', icon: '💬', titleKey: 'visitor.qaTitle', descriptionKey: 'visitor.qaDesc', actionKey: 'visitor.qaAction' },
  { to: '/centers', icon: '🏛️', titleKey: 'visitor.centersTitle', descriptionKey: 'visitor.centersDesc', actionKey: 'visitor.centersAction' },
] as const

export function VisitorGuidePage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8 pb-8 pt-2 sm:pt-6">
      <section className="mx-auto max-w-3xl rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50 to-white p-6 text-center shadow-xs sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">{t('visitor.heroTag')}</p>
        <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">{t('visitor.title')}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{t('visitor.subtitle')}</p>
      </section>

      <section className="mx-auto max-w-4xl space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{t('visitor.chooseTitle')}</h2>
          <p className="mt-1 text-sm text-slate-600">{t('visitor.chooseSubtitle')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 sm:gap-6">
          {destinationCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group flex min-h-64 flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-2xs transition-all duration-200 hover:border-amber-400 hover:shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              <div className="space-y-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100/80 text-lg group-hover:bg-amber-600 transition-colors motion-reduce:transition-none" aria-hidden="true">{card.icon}</span>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700">{t(card.titleKey)}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{t(card.descriptionKey)}</p>
              </div>
              <span className="pt-4 text-sm font-semibold text-amber-700">{t(card.actionKey)} →</span>
            </Link>
          ))}
        </div>
      </section>

      <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-slate-500">{t('visitor.notice')}</p>
    </div>
  )
}
