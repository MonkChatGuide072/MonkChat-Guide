import type { Language } from '../../types/content'

/**
 * Mock Languages
 * Thai is primary and default; English is secondary.
 */
export const mockLanguages: Language[] = [
  {
    code: 'th',
    native_name: 'ไทย',
    is_active: true,
    is_default: true,
  },
  {
    code: 'en',
    native_name: 'English',
    is_active: true,
    is_default: false,
  },
]
