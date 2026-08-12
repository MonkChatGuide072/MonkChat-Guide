import { useTranslation } from 'react-i18next'

export function LoginPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-md mx-auto space-y-6 pt-4 sm:pt-8">
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t('pages.login.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('pages.login.subtitle')}
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="email">
              {t('pages.login.emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              disabled
              placeholder="team@example.com"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="password">
              {t('pages.login.passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              disabled
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled
            className="w-full rounded-lg bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 cursor-not-allowed"
          >
            {t('pages.login.submitButton')}
          </button>
        </form>

        <p className="text-center text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5 border border-amber-200/60 font-medium">
          {t('pages.login.note')}
        </p>
      </div>
    </div>
  )
}
