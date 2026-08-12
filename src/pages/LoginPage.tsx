import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useAuth } from '../lib/auth'
import { supabaseClient } from '../lib/supabase'

import { isAuthApiError } from '@supabase/supabase-js'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { session, profile, isLoading: isAuthLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Redirect to admin if already authenticated and profile is active
  useEffect(() => {
    if (!isAuthLoading && session && profile && profile.is_active) {
      navigate('/admin', { replace: true })
    }
  }, [session, profile, isAuthLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabaseClient) return

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        if (isAuthApiError(error) && error.status === 400 && error.message.includes('Invalid login credentials')) {
          setErrorMsg(t('pages.login.errors.invalidCredentials'))
        } else if (error.name === 'AuthRetryableFetchError' || error.message.includes('fetch')) {
          setErrorMsg(t('pages.login.errors.configuration'))
        } else {
          setErrorMsg(t('pages.login.errors.generic'))
        }
        return
      }
      // On success, AuthProvider's listener will pick it up,
      // load profile, and the useEffect above will redirect.
    } catch (err: any) {
      console.error('Unhandled login exception:', err.name || 'Error')
      if (err instanceof TypeError || err.message?.includes('fetch') || err.message?.includes('URL')) {
        setErrorMsg(t('pages.login.errors.configuration'))
      } else {
        setErrorMsg(t('pages.login.errors.generic'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show a generic loading state if we are still fetching the initial auth state
  if (isAuthLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  // If the user is logged in but the profile is missing (null) or inactive, show an error state
  if (session && (!profile || !profile.is_active)) {
    const isInactive = profile && !profile.is_active
    const errorKey = isInactive ? 'inactiveAccount' : 'accessDenied'

    return (
      <div className="max-w-md mx-auto space-y-6 pt-4 sm:pt-8">
        <div className="bg-white rounded-xl border border-red-200 p-6 sm:p-8 shadow-xs text-center">
          <h2 className="text-xl font-bold text-red-700 mb-4">
            {isInactive ? 'Account Inactive' : 'Access Denied'}
          </h2>
          <p className="text-slate-600 mb-6">{t(`pages.login.errors.${errorKey}`)}</p>
          <button
            onClick={() => {
              supabaseClient?.auth.signOut()
              setErrorMsg('') // Clear any lingering form errors
            }}
            className="w-full rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

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

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="email">
              {t('pages.login.emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || !supabaseClient}
              placeholder="team@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="password">
              {t('pages.login.passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting || !supabaseClient}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !supabaseClient || !email || !password}
            className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:bg-slate-300 disabled:text-slate-500 transition-colors"
          >
            {isSubmitting ? t('pages.login.loadingButton') : t('pages.login.submitButton')}
          </button>
        </form>

        <p className="text-center text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5 border border-amber-200/60 font-medium">
          {t('pages.login.note')}
        </p>
      </div>
    </div>
  )
}
