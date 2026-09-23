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
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#11223C]/12 border-t-[#A86100]"></div>
      </div>
    )
  }

  // If the user is logged in but the profile is missing (null) or inactive, show an error state
  if (session && (!profile || !profile.is_active)) {
    const isInactive = profile && !profile.is_active
    const errorKey = isInactive ? 'inactiveAccount' : 'accessDenied'

    return (
      <div className="mx-auto max-w-md space-y-6 py-6 sm:py-12">
        <div className="rounded-[1.75rem] border border-red-200 bg-white p-6 text-center shadow-[0_18px_55px_rgba(17,34,60,0.08)] sm:p-8">
          <h2 className="text-xl font-bold text-red-700 mb-4">
            {t(isInactive ? 'management.inactiveTitle' : 'management.deniedTitle')}
          </h2>
          <p className="text-slate-600 mb-6">{t(`pages.login.errors.${errorKey}`)}</p>
          <button
            onClick={async () => {
              try { await signOut(); setErrorMsg('') }
              catch { setErrorMsg(t('management.signOutError')) }
            }}
            className="w-full rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
          >
            {t('admin.nav.signOut')}
          </button>
          {errorMsg && <p role="alert" className="mt-3 text-sm text-red-700">{errorMsg}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-[#11223C]/8 bg-white shadow-[0_28px_80px_rgba(17,34,60,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-[#11223C] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/8" />
        <div aria-hidden="true" className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full border border-[#DDA756]/15" />
        <div className="relative flex items-center gap-3">
          <img src="/monkchat-placeholder.svg" alt="" className="h-11 w-11 rounded-xl ring-1 ring-white/15" />
          <div className="leading-tight">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-[#DDA756]">MonkChat</p>
            <p className="font-extrabold">Guide CMS</p>
          </div>
        </div>
        <div className="relative mt-24">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDA756]/12 text-[#DDA756]">
            <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 11V8a4 4 0 118 0v3m-9 0h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2z" />
            </svg>
          </span>
          <h2 className="mt-6 text-3xl font-bold leading-tight tracking-[-0.03em]">{t('management.loginPanelTitle')}</h2>
          <p className="mt-4 text-sm leading-7 text-white/55">{t('management.loginPanelDescription')}</p>
        </div>
      </section>

      <section className="p-6 sm:p-10 lg:p-12">
        <div className="mx-auto max-w-md space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#A86100]">Owner access</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#11223C] sm:text-3xl">
            {t('pages.login.title')}
          </h1>
          <p className="text-sm leading-6 text-[#11223C]/55">
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
            <label className="mb-2 block text-xs font-bold text-[#11223C]/75" htmlFor="email">
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
              className="min-h-12 w-full rounded-xl border border-[#11223C]/15 bg-[#FFFEF9] px-4 text-sm text-[#11223C] transition-colors placeholder:text-slate-400 focus:border-[#A86100]/50 focus:outline-none focus:ring-2 focus:ring-[#A86100]/15 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-[#11223C]/75" htmlFor="password">
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
              className="min-h-12 w-full rounded-xl border border-[#11223C]/15 bg-[#FFFEF9] px-4 text-sm text-[#11223C] transition-colors placeholder:text-slate-400 focus:border-[#A86100]/50 focus:outline-none focus:ring-2 focus:ring-[#A86100]/15 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !supabaseClient || !email || !password}
            className="min-h-12 w-full rounded-xl bg-[#11223C] px-4 text-sm font-bold text-white shadow-[0_10px_25px_rgba(17,34,60,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#1A3256] disabled:translate-y-0 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
          >
            {isSubmitting ? t('pages.login.loadingButton') : t('pages.login.submitButton')}
          </button>
        </form>

        <p className="rounded-xl border border-[#A86100]/15 bg-[#A86100]/6 p-3 text-center text-xs font-semibold leading-5 text-[#8D5200]">
          {t('management.loginNote')}
        </p>
        </div>
      </section>
      </div>
  )
}
