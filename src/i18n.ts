import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import thCommon from './locales/th/common.json'
import enCommon from './locales/en/common.json'

export const STORAGE_KEY = 'monkchat_language'

const getSavedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'th' || saved === 'en') {
      return saved
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
      th: { common: thCommon },
      en: { common: enCommon },
    },
    lng: initialLanguage,
    fallbackLng: 'th',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })

// Listen to language change to update localStorage and HTML lang attribute
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lng)
    document.documentElement.lang = lng
  }
})

export default i18n
