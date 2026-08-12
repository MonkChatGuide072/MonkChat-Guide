import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const activeLang = i18n.resolvedLanguage || i18n.language || 'th'
  const currentLang = activeLang.startsWith('en') ? 'en' : 'th'

  const setLanguage = (lang: 'th' | 'en') => {
    i18n.changeLanguage(lang)
  }

  return (
    <div
      className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-xs"
      role="group"
      aria-label={t('language.label')}
    >
      <button
        type="button"
        onClick={() => setLanguage('th')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
          currentLang === 'th'
            ? 'bg-amber-600 text-white'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
        aria-pressed={currentLang === 'th'}
        aria-label={t('language.switchToTh')}
      >
        ไทย
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
          currentLang === 'en'
            ? 'bg-amber-600 text-white'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
        aria-pressed={currentLang === 'en'}
        aria-label={t('language.switchToEn')}
      >
        English
      </button>
    </div>
  )
}
