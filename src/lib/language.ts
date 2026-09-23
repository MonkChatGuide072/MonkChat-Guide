export const LANGUAGE_STORAGE_KEY = 'monkchat_language'
export const VISITOR_LANGUAGE_SESSION_KEY = 'ui_language_code'
export const VISITOR_LANGUAGE_SELECTED_EVENT = 'languageSelected'

export type AppLanguage = 'th' | 'en'

export function normalizeLanguage(language: string | null | undefined): AppLanguage {
  return language?.toLowerCase().startsWith('en') ? 'en' : 'th'
}
