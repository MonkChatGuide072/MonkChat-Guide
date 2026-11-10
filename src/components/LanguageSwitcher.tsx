import { useTranslation } from 'react-i18next'
import { normalizeLanguage, type AppLanguage } from '../lib/language'

export function LanguageSwitcher({ tone = 'terracotta' }: { tone?: 'navy' | 'clay' | 'overlay' | 'terracotta' }) {
  const { i18n, t } = useTranslation()
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language)

  const setLanguage = (lang: AppLanguage) => {
    i18n.changeLanguage(lang)
  }

  const isOverlay = tone === 'overlay'

  return (
    <div
      className={`inline-flex items-center rounded-full border p-0.5 transition-colors ${
        isOverlay
          ? 'border-white/30 bg-white/90 backdrop-blur-md'
          : 'border-brand-border bg-brand-surface'
      }`}
      role="group"
      aria-label={t('language.label')}
    >
      <button
        type="button"
        onClick={() => setLanguage('th')}
        className={`min-h-11 min-w-11 rounded-full px-2.5 py-1 text-sm font-medium transition-colors duration-150 cursor-pointer ${
          currentLang === 'th'
            ? 'bg-brand-terracotta text-white'
            : 'text-brand-maroon hover:bg-brand-gold-soft hover:text-brand-terracotta'
        }`}
        aria-pressed={currentLang === 'th'}
        aria-label={t('language.switchToTh')}
      >
        TH
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`min-h-11 min-w-11 rounded-full px-2.5 py-1 text-sm font-medium transition-colors duration-150 cursor-pointer ${
          currentLang === 'en'
            ? 'bg-brand-terracotta text-white'
            : 'text-brand-maroon hover:bg-brand-gold-soft hover:text-brand-terracotta'
        }`}
        aria-pressed={currentLang === 'en'}
        aria-label={t('language.switchToEn')}
      >
        EN
      </button>
    </div>
  )
}
