import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { mockBioLinks, mockBioLinkTranslations } from '../data/mock'
import { getTranslation } from '../utils/translation'

export function HomePage() {
  const { t, i18n } = useTranslation()

  // Sort BioPage links by display_order
  const sortedBioLinks = [...mockBioLinks].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="space-y-8 sm:space-y-12 pb-8 pt-2 sm:pt-6">
      {/* Hero / Header Section */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs text-center space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative group">
            <img
              src="/monkchat-placeholder.svg"
              alt="MonkChat Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-xs border border-slate-100 object-cover"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none"></span>
            {t('home.demoBadge')}
          </div>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-amber-600">
            {t('home.heroTag')}
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            {t('app.heading')}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t('app.description')}
          </p>
        </div>
      </section>

      {/* Primary Navigation Cards */}
      <section className="space-y-4 max-w-5xl mx-auto">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t('home.navCardsTitle')}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            {t('home.navCardsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {/* Card 1: Meditation */}
          <Link
            to="/meditation"
            className="group bg-white rounded-xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-amber-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-all duration-200 motion-reduce:transition-none flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:bg-amber-600 group-hover:text-white transition-colors motion-reduce:transition-none">
                🧘‍♂️
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                {t('home.meditationCardTitle')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('home.meditationCardDesc')}
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center text-sm font-semibold text-amber-600 group-hover:text-amber-700">
              <span>{t('home.meditationCardAction')}</span>
              <span className="ml-1.5 transform group-hover:translate-x-1 transition-transform motion-reduce:transition-none">
                →
              </span>
            </div>
          </Link>

          {/* Card 2: Q&A */}
          <Link
            to="/qa"
            className="group bg-white rounded-xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-amber-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-all duration-200 motion-reduce:transition-none flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:bg-amber-600 group-hover:text-white transition-colors motion-reduce:transition-none">
                💬
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                {t('home.qaCardTitle')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('home.qaCardDesc')}
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center text-sm font-semibold text-amber-600 group-hover:text-amber-700">
              <span>{t('home.qaCardAction')}</span>
              <span className="ml-1.5 transform group-hover:translate-x-1 transition-transform motion-reduce:transition-none">
                →
              </span>
            </div>
          </Link>

          {/* Card 3: DCI Centers */}
          <Link
            to="/centers"
            className="group bg-white rounded-xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-amber-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-all duration-200 motion-reduce:transition-none flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:bg-amber-600 group-hover:text-white transition-colors motion-reduce:transition-none">
                🏛️
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                {t('home.centersCardTitle')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('home.centersCardDesc')}
              </p>
            </div>
            <div className="pt-4 mt-2 flex items-center text-sm font-semibold text-amber-600 group-hover:text-amber-700">
              <span>{t('home.centersCardAction')}</span>
              <span className="ml-1.5 transform group-hover:translate-x-1 transition-transform motion-reduce:transition-none">
                →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* BioPage Links Section */}
      <section className="bg-gradient-to-b from-amber-50/40 to-slate-50/60 rounded-2xl border border-amber-200/60 p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t('home.bioLinksTitle')}
          </h2>
          <p className="text-sm text-slate-600">
            {t('home.bioLinksSubtitle')}
          </p>
        </div>

        <div className="space-y-3">
          {sortedBioLinks.map((link) => {
            const translation = getTranslation(
              mockBioLinkTranslations.filter((t) => t.bio_link_id === link.id),
              i18n.language,
              'th'
            )

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between min-h-[48px] px-5 py-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-amber-400 hover:bg-amber-50/30 text-slate-800 hover:text-slate-900 font-medium text-sm sm:text-base focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 transition-all duration-200 motion-reduce:transition-none"
              >
                <span>{translation?.title || link.url}</span>
                <span className="text-xs text-amber-600 font-semibold uppercase tracking-wider ml-2 flex-shrink-0">
                  🔗 Demo Link
                </span>
              </a>
            )
          })}
        </div>

        <p className="text-xs text-center text-slate-500 italic">
          * {t('home.bioLinksNotice')}
        </p>
      </section>

      {/* Project Purpose Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
          {t('home.purposeTitle')}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {t('home.purposeText')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wider text-amber-700">
              🌏 Visitors
            </span>
            <p className="text-slate-600 text-xs sm:text-sm">
              {t('home.purposeVisitors')}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wider text-amber-700">
              🧘 Monks & Team
            </span>
            <p className="text-slate-600 text-xs sm:text-sm">
              {t('home.purposeMonks')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
