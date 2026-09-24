import { useTranslation } from 'react-i18next'
import { normalizeLanguage, type AppLanguage } from '../lib/language'

export function LanguageSwitcher({ tone = 'navy' }: { tone?: 'navy' | 'clay' | 'overlay' }) {
  const { i18n, t } = useTranslation()
  const currentLang = normalizeLanguage(i18n.resolvedLanguage || i18n.language)
  const isClay = tone === 'clay'
  const isOverlay = tone === 'overlay'

  const setLanguage = (lang: AppLanguage) => {
    i18n.changeLanguage(lang)
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border p-1 shadow-inner ${
        isOverlay
          ? 'border-white/25 bg-white/90 shadow-black/10 backdrop-blur-md'
          : isClay
          ? 'border-[#7A3E2E]/12 bg-[#F7EAE2]/90'
          : 'border-[#11223C]/10 bg-[#F4EFE5]/90'
      }`}
      role="group"
      aria-label={t('language.label')}
    >
      <button
        type="button"
        onClick={() => setLanguage('th')}
        className={`min-h-9 rounded-full px-3 text-xs font-bold transition-all cursor-pointer ${
          currentLang === 'th'
            ? `${isClay || isOverlay ? 'bg-[#7A3E2E]' : 'bg-[#11223C]'} text-white shadow-sm`
            : `${isClay || isOverlay ? 'text-[#5B3A31]/65 hover:text-[#5B3A31]' : 'text-[#11223C]/60 hover:text-[#11223C]'} hover:bg-white`
        }`}
        aria-pressed={currentLang === 'th'}
        aria-label={t('language.switchToTh')}
      >
        ไทย
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`min-h-9 rounded-full px-3 text-xs font-bold transition-all cursor-pointer ${
          currentLang === 'en'
            ? `${isClay || isOverlay ? 'bg-[#7A3E2E]' : 'bg-[#11223C]'} text-white shadow-sm`
            : `${isClay || isOverlay ? 'text-[#5B3A31]/65 hover:text-[#5B3A31]' : 'text-[#11223C]/60 hover:text-[#11223C]'} hover:bg-white`
        }`}
        aria-pressed={currentLang === 'en'}
        aria-label={t('language.switchToEn')}
      >
        English
      </button>
    </div>
  )
}
