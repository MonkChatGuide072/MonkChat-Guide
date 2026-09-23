import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import thCommon from './locales/th/common.json'
import enCommon from './locales/en/common.json'
import { projectLandingTranslations } from './locales/projectLanding'
import { managementTranslations } from './locales/management'
import { LANGUAGE_STORAGE_KEY, normalizeLanguage, type AppLanguage } from './lib/language'

export const STORAGE_KEY = LANGUAGE_STORAGE_KEY

const getSavedLanguage = (): AppLanguage => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'th' || saved === 'en') {
        return saved
      }
    } catch {
      // Keep the Thai default when browser storage is unavailable.
    }
  }
  return 'th'
}

const initialLanguage = getSavedLanguage()

// Ensure document HTML lang matches initial language
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      th: { common: { ...thCommon, projectLanding: projectLandingTranslations.th, management: managementTranslations.th } },
      en: { common: { ...enCommon, projectLanding: projectLandingTranslations.en, management: managementTranslations.en } },
    },
    lng: initialLanguage,
    fallbackLng: 'th',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })

// Keep every public language control in sync through i18next.
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    const normalizedLanguage = normalizeLanguage(lng)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage)
    } catch {
      // Language switching must still work when browser storage is unavailable.
    }
    document.documentElement.lang = normalizedLanguage
  }
})

export default i18n
