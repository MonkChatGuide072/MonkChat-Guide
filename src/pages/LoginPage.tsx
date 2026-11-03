import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useAuth } from '../lib/auth'
import { supabaseClient } from '../lib/supabase'

import { isAuthApiError } from '@supabase/supabase-js'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { session, profile, isLoading: isAuthLoading, signOut } = useAuth()

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
      <div className="flex min-h-[55vh] items-center justify-center" role="status">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-border border-t-brand-terracotta"></div>
      </div>
    )
  }

  // If the user is logged in but the profile is missing (null) or inactive, show an error state
  if (session && (!profile || !profile.is_active)) {
    const isInactive = profile && !profile.is_active
    const errorKey = isInactive ? 'inactiveAccount' : 'accessDenied'

    return (
      <div className="mx-auto max-w-md space-y-6 py-6 sm:py-12">
        <div className="rounded-2xl border border-red-200 bg-brand-surface p-6 sm:p-8">
          <h2 className="mb-4 text-xl font-medium text-red-800">
            {t(isInactive ? 'management.inactiveTitle' : 'management.deniedTitle')}
          </h2>
          <p className="mb-6 leading-7 text-brand-muted">{t(`pages.login.errors.${errorKey}`)}</p>
          <button
            onClick={async () => {
              try { await signOut(); setErrorMsg('') }
              catch { setErrorMsg(t('management.signOutError')) }
            }}
            className="min-h-12 w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-800 transition-colors hover:bg-red-50"
          >
            {t('admin.nav.signOut')}
          </button>
          {errorMsg && <p role="alert" className="mt-3 text-sm text-red-700">{errorMsg}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-brand-border bg-brand-surface lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden flex-col justify-center gap-8 border-r border-brand-border bg-[#F5F1E9] p-8 lg:flex">
        <img src="/images/logo/ayutthaya-monk-chat-logo.png" alt="Ayutthaya Monk Chat" className="h-20 w-20 object-contain" />
        <div>
          <h2 className="font-serif text-2xl font-medium leading-snug text-brand-maroon">{t('management.loginPanelTitle')}</h2>
          <p className="mt-4 text-sm leading-7 text-brand-muted">{t('management.loginPanelDescription')}</p>
        </div>
      </section>

      <section className="p-6 sm:p-10 lg:p-12">
        <div className="mx-auto max-w-md space-y-5">
        <div className="space-y-2">
          <p className="text-sm text-brand-muted">Ayutthaya Monk Chat</p>
          <h1 className="font-serif text-2xl font-medium text-brand-maroon sm:text-3xl">
            {t('pages.login.title')}
          </h1>
          <p className="text-sm leading-6 text-brand-muted">
            {t('pages.login.subtitle')}
          </p>
        </div>

        {errorMsg && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-text" htmlFor="email">
              {t('pages.login.emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || !supabaseClient}
              placeholder="team@example.com"
              className="min-h-12 w-full rounded-lg border border-brand-border-dark bg-white px-4 text-base text-brand-text transition-colors placeholder:text-brand-muted focus:border-brand-terracotta focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 disabled:bg-neutral-100 disabled:text-neutral-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-text" htmlFor="password">
              {t('pages.login.passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting || !supabaseClient}
              placeholder="••••••••"
              className="min-h-12 w-full rounded-lg border border-brand-border-dark bg-white px-4 text-base text-brand-text transition-colors placeholder:text-brand-muted focus:border-brand-terracotta focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 disabled:bg-neutral-100 disabled:text-neutral-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !supabaseClient || !email || !password}
            className="min-h-12 w-full rounded-lg bg-brand-terracotta px-4 text-sm font-medium text-white transition-colors hover:bg-brand-terracotta-dark disabled:bg-neutral-200 disabled:text-neutral-600"
          >
            {isSubmitting ? t('pages.login.loadingButton') : t('pages.login.submitButton')}
          </button>
        </form>

        <p className="border-t border-brand-border pt-4 text-sm leading-6 text-brand-muted">
          {t('management.loginNote')}
        </p>
        </div>
      </section>
      </div>
  )
}
