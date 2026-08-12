/**
 * Helper utility for resolving language-scalable translations with Thai fallback.
 * 
 * Rules:
 * - Does not rely on fixed columns like title_th or title_en.
 * - Resolves current language first, then falls back to defaultLanguage ('th'), then first available.
 */
export function getTranslation<T extends { language_code: string }>(
  translations: T[],
  currentLanguage: string,
  defaultLanguage: string = 'th'
): T | undefined {
  if (!translations || translations.length === 0) return undefined

  return (
    translations.find((t) => t.language_code === currentLanguage) ||
    translations.find((t) => t.language_code === defaultLanguage) ||
    translations[0]
  )
}
