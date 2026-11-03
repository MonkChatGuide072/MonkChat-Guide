import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function MeditationSupplementary() {
  const { t, i18n } = useTranslation()
  const isEnglish = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')

  const tips = [
    {
      title: t('meditation.supplementary.wanderingTitle'),
      desc: t('meditation.supplementary.wanderingDesc'),
      icon: (
        <svg className="h-[18px] w-[18px] text-[#A43D1D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: t('meditation.supplementary.sleepyTitle'),
      desc: t('meditation.supplementary.sleepyDesc'),
      icon: (
        <svg className="h-[18px] w-[18px] text-[#A43D1D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      title: t('meditation.supplementary.dailyTitle'),
      desc: t('meditation.supplementary.dailyDesc'),
      icon: (
        <svg className="h-[18px] w-[18px] text-[#A43D1D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <section
      id="meditation-supplementary"
      aria-labelledby="meditation-supplementary-heading"
      className="scroll-mt-24 space-y-6"
    >
      {/* 1. Simple Meditation with Monks Card */}
      <div className="overflow-hidden rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] sm:grid sm:grid-cols-[1fr_1.4fr]">
        <div className="relative h-48 w-full sm:h-full">
          <img
            src="/images/home/monkchat-slide-3.webp"
            alt="Monks in Ayutthaya"
            loading="lazy" className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-brand-muted">
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>{isEnglish ? 'Ayutthaya' : 'อยุธยา'}</span>
            </div>
            <h3 className="mt-2 font-sans text-xl font-medium text-[#681B16] sm:text-2xl">
              {isEnglish ? 'Simple Meditation with Monks' : 'ฝึกสมาธิอย่างเรียบง่ายกับพระสงฆ์'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-brand-muted sm:text-sm">
              {isEnglish
                ? 'A gentle way to experience Buddhist meditation, inspired by the peaceful practice of monks in Ayutthaya. Suitable for all visitors regardless of background.'
                : 'สัมผัสประสบการณ์การทำสมาธิตามแนวทางพระพุทธศาสนา ที่ได้รับแรงบันดาลใจจากวัตรปฏิบัติอันสงบของพระสงฆ์ในอยุธยา เปิดกว้างสำหรับผู้มาเยือนทุกคน'}
            </p>
          </div>
          <div className="mt-5">
            <Link
              to="/visit"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#A43D1D] bg-[#FFFDF7] px-5 text-sm font-medium text-[#A43D1D] transition-colors duration-150 hover:bg-[#FDF4E3]"
            >
              <span>{isEnglish ? 'Join Session in Ayutthaya' : 'เข้าร่วมกิจกรรม ณ อยุธยา'}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Additional Practice Tips Card */}
      <div className="rounded-2xl border border-[#EADCC6] bg-[#FFFDF7] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="text-xs font-medium text-[#A43D1D]">
              {isEnglish ? 'Practice tips' : 'คำแนะนำเพิ่มเติม'}
            </span>
            <h2 id="meditation-supplementary-heading" className="mt-1 font-serif text-xl font-semibold text-[#681B16] sm:text-2xl">
              {t('meditation.supplementary.title')}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-brand-muted sm:text-sm">
              {t('meditation.supplementary.subtitle')}
            </p>
          </div>
          <span
            role="note"
            className="self-start inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            {t('meditation.supplementary.reviewDraftBadge')}
          </span>
        </div>

        {/* Common Experience Tips */}
        <div className="mt-5">
          <h3 className="font-sans text-sm font-medium text-[#681B16] sm:text-base">
            {t('meditation.supplementary.tipsSectionTitle')}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {tips.map((tip) => (
              <div
                key={tip.title}
                className="flex flex-col justify-between rounded-xl border border-[#EADCC6] bg-[#FFF8EE]/60 p-4"
              >
                <div>
                  <div className="inline-flex rounded-lg bg-[#FDF4E3] p-2 text-[#A43D1D] border border-[#EADCC6]">
                    {tip.icon}
                  </div>
                  <h4 className="mt-3 font-sans text-sm font-medium text-[#681B16]">
                    {tip.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    {tip.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exit to Home */}
        <div className="mt-6 border-t border-[#EADCC6]/80 pt-5">
          <div className="rounded-xl border border-[#EADCC6] bg-[#FAF2E6]/60 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div className="space-y-1">
              <h3 className="font-sans text-sm font-medium text-[#681B16]">
                {t('meditation.supplementary.exitTitle')}
              </h3>
              <p className="max-w-xl text-sm text-brand-muted">
                {t('meditation.supplementary.exitDesc')}
              </p>
            </div>
            <div className="mt-3 shrink-0 sm:mt-0">
              <Link
                to="/visit"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#A43D1D] px-5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#8E3317]"
              >
                <span>{t('meditation.supplementary.exitButton')}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
