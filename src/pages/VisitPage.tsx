import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import {
  normalizeLanguage,
  VISITOR_LANGUAGE_SELECTED_EVENT,
  VISITOR_LANGUAGE_SESSION_KEY,
  type AppLanguage,
} from '../lib/language'
import { trackUsageEvent } from '../lib/analytics'
import { getBioLinkImageUrl } from '../lib/bioLinkImages'
import { supabaseClient } from '../lib/supabase'

interface TrackTranslationRow {
  language_code: string
  title: string
  description: string
}

interface MedTrackRow {
  id: string
  source_language_code: string
  duration_seconds: number
  meditation_track_translations: TrackTranslationRow[]
}

interface BioLinkTranslationRow {
  language_code: string
  title: string
}

interface BioLinkRow {
  id: string
  url: string
  display_order: number
  image_storage_path: string | null
  bio_link_translations: BioLinkTranslationRow[]
}

function hasSafeExternalUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

export function VisitPage() {
  const { i18n } = useTranslation()
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(
    () => sessionStorage.getItem(VISITOR_LANGUAGE_SESSION_KEY) != null,
  )
  const [currentLang, setCurrentLang] = useState<AppLanguage>(() =>
    normalizeLanguage(i18n.resolvedLanguage || i18n.language),
  )

  useEffect(() => {
    const handleLanguageChanged = (language: string) => {
      setCurrentLang(normalizeLanguage(language))
    }

    i18n.on('languageChanged', handleLanguageChanged)
    return () => i18n.off('languageChanged', handleLanguageChanged)
  }, [i18n])

  const handleLanguageChange = (language: AppLanguage) => {
    sessionStorage.setItem(VISITOR_LANGUAGE_SESSION_KEY, language)
    setHasSelectedLanguage(true)
    setCurrentLang(language)
    void i18n.changeLanguage(language)
    window.dispatchEvent(new Event(VISITOR_LANGUAGE_SELECTED_EVENT))
  }

  if (!hasSelectedLanguage) {
    return <LanguageGate onSelect={handleLanguageChange} />
  }

  return <VisitorHome currentLang={currentLang} />
}

function LanguageGate({ onSelect }: { onSelect: (language: AppLanguage) => void }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#0C1B31] px-4 py-6 text-white sm:px-8 sm:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_10%,rgba(221,167,86,0.22),transparent_30%),radial-gradient(circle_at_12%_88%,rgba(168,97,0,0.18),transparent_32%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-16 -z-10 h-80 w-80 rounded-full border border-white/6" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-30 -z-10 h-52 w-52 rounded-full border border-[#DDA756]/15" />

      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="group flex items-center gap-3" aria-label="MonkChat Guide">
          <img src="/monkchat-placeholder.svg" alt="" className="h-10 w-10 rounded-xl ring-1 ring-white/15 transition-transform group-hover:-rotate-3" />
          <span className="leading-tight">
            <span className="block text-[0.62rem] font-extrabold uppercase tracking-[0.22em] text-[#DDA756]">MonkChat</span>
            <span className="block text-sm font-extrabold">Guide</span>
          </span>
        </Link>
        <Link to="/" className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-xs font-bold text-white/70 transition-colors hover:border-[#DDA756]/45 hover:text-[#DDA756]">
          โครงการ / About
        </Link>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 py-12 lg:grid-cols-[1fr_0.82fr] lg:gap-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DDA756]/25 bg-[#DDA756]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#F2C887]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#DDA756]" />
            Welcome to MonkChat
          </span>
          <h1 className="mt-7 text-4xl font-bold leading-tight tracking-[-0.04em] text-balance sm:text-6xl">
            ฟัง เรียนรู้ และเดินทางต่ออย่างสงบ
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/62 sm:text-base">
            Meditation audio, trusted answers, and DCI centers—all in one calm space for your visit.
          </p>
        </div>

        <section aria-labelledby="language-gate-title" className="rounded-[2rem] border border-white/10 bg-[#FFFEF9] p-6 text-[#11223C] shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-8">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A86100]/10 text-[#A86100]">
            <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.2-2.3 3.3-5.3 3.3-9S14.2 5.3 12 3m0 18c-2.2-2.3-3.3-5.3-3.3-9S9.8 5.3 12 3M3.5 9h17m-17 6h17" />
            </svg>
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#A86100]">Your language</p>
          <h2 id="language-gate-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            เลือกภาษา / Choose language
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#11223C]/60">
            ระบบจะจดจำภาษาสำหรับการเข้าชมครั้งนี้<br />Choose the language for this visit.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onSelect('th')}
            aria-label="ภาษาไทย"
            className="group flex min-h-20 items-center gap-4 rounded-2xl bg-[#A86100] px-5 py-4 text-left text-white shadow-[0_12px_30px_rgba(168,97,0,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#8D5200]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-extrabold">TH</span>
            <span><span className="block font-bold">ภาษาไทย</span><span className="mt-0.5 block text-xs text-white/65">ดำเนินการต่อ</span></span>
          </button>
          <button
            type="button"
            onClick={() => onSelect('en')}
            aria-label="English"
            className="group flex min-h-20 items-center gap-4 rounded-2xl border border-[#11223C]/12 bg-white px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#A86100]/35 hover:shadow-md"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#11223C]/6 text-xs font-extrabold">EN</span>
            <span><span className="block font-bold">English</span><span className="mt-0.5 block text-xs text-[#11223C]/50">Continue</span></span>
          </button>
          </div>
        </section>
        </div>
    </main>
  )
}

function VisitorHome({ currentLang }: { currentLang: AppLanguage }) {
  const { t } = useTranslation()
  const [isTrackLoading, setIsTrackLoading] = useState(true)
  const [trackError, setTrackError] = useState<string | null>(null)
  const [recommendedTracks, setRecommendedTracks] = useState<MedTrackRow[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [areLinksLoading, setAreLinksLoading] = useState(true)
  const [linksError, setLinksError] = useState<string | null>(null)
  const [bioLinks, setBioLinks] = useState<BioLinkRow[]>([])

  const fetchRecommendedTracks = useCallback(async () => {
    if (!supabaseClient) {
      setTrackError(t('meditation.errorNoClient'))
      setIsTrackLoading(false)
      return
    }

    setIsTrackLoading(true)
    setTrackError(null)

    try {
      const { data, error } = await supabaseClient
        .from('meditation_tracks')
        .select('id, source_language_code, duration_seconds, meditation_track_translations(language_code, title, description)')
        .eq('content_status', 'published')
        .eq('is_published', true)
        .eq('is_recommended', true)

      if (error) throw error

      const translatedTracks = ((data ?? []) as MedTrackRow[]).filter((track) =>
        track.meditation_track_translations.some(
          (translation) => translation.language_code === currentLang,
        ),
      )

      setRecommendedTracks(translatedTracks)
      setSelectedTrackId(translatedTracks[0]?.id ?? null)
    } catch {
      setRecommendedTracks([])
      setSelectedTrackId(null)
      setTrackError(t('visitor.errorRecommended'))
    } finally {
      setIsTrackLoading(false)
    }
  }, [currentLang, t])

  const fetchBioLinks = useCallback(async () => {
    if (!supabaseClient) {
      setLinksError(t('home.errorLoadLinks'))
      setAreLinksLoading(false)
      return
    }

    setAreLinksLoading(true)
    setLinksError(null)

    try {
      const { data, error } = await supabaseClient
        .from('bio_links')
        .select('id, url, display_order, image_storage_path, bio_link_translations(language_code, title)')
        .eq('content_status', 'published')
        .eq('is_published', true)
        .order('display_order', { ascending: true })

      if (error) throw error

      const translatedLinks = ((data ?? []) as BioLinkRow[]).filter((link) =>
        hasSafeExternalUrl(link.url)
        && link.bio_link_translations.some(
          (translation) => translation.language_code === currentLang,
        ),
      )

      setBioLinks(translatedLinks)
    } catch {
      setBioLinks([])
      setLinksError(t('home.errorLoadLinks'))
    } finally {
      setAreLinksLoading(false)
    }
  }, [currentLang, t])

  useEffect(() => {
    void fetchRecommendedTracks()
  }, [fetchRecommendedTracks])

  useEffect(() => {
    void fetchBioLinks()
  }, [fetchBioLinks])

  const selectedTrack = recommendedTracks.find((track) => track.id === selectedTrackId)
    ?? recommendedTracks[0]
  const selectedTranslation = selectedTrack?.meditation_track_translations.find(
    (translation) => translation.language_code === currentLang,
  )

  return (
    <div className="space-y-10 pb-5 sm:space-y-14">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#11223C] px-6 py-9 text-white shadow-[0_24px_70px_rgba(17,34,60,0.18)] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_20%,rgba(221,167,86,0.2),transparent_28%)]" />
        <div aria-hidden="true" className="absolute -right-10 -top-24 -z-10 h-80 w-80 rounded-full border border-white/8" />
        <div aria-hidden="true" className="absolute right-8 top-10 -z-10 hidden h-44 w-44 rounded-full border border-[#DDA756]/18 md:block" />
        <div className="max-w-2xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
            {t('visitor.heroTag')}
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-[-0.035em] text-balance sm:text-5xl">
            {t('visitor.title')}
          </h1>
          <p className="max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
            {t('visitor.subtitle')}
          </p>
        </div>
      </section>

      <section aria-labelledby="recommended-heading" className="rounded-[1.75rem] border border-[#11223C]/8 bg-white/85 p-5 shadow-[0_18px_55px_rgba(17,34,60,0.07)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A86100]">
              {t('visitor.recommendedTag')}
            </p>
            <h2 id="recommended-heading" className="mt-2 text-xl font-bold text-[#11223C] sm:text-2xl">
              {t('visitor.recommendedTitle')}
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-500 sm:text-right">
            {t('visitor.recommendedSubtitle')}
          </p>
        </div>

        {isTrackLoading ? (
          <LoadingState label={t('visitor.loadingRecommended')} />
        ) : trackError ? (
          <ErrorState message={trackError} onRetry={fetchRecommendedTracks} retryLabel={t('home.retry')} />
        ) : !selectedTrack || !selectedTranslation ? (
          <EmptyState message={t('visitor.noRecommended')} />
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              {recommendedTracks.length > 1 && (
                <div className="mb-4 flex flex-wrap gap-2" aria-label={t('visitor.selectRecommended')}>
                  {recommendedTracks.map((track) => {
                    const translation = track.meditation_track_translations.find(
                      (item) => item.language_code === currentLang,
                    )
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => setSelectedTrackId(track.id)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                          track.id === selectedTrack.id
                            ? 'bg-[#11223C] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {translation?.title}
                      </button>
                    )
                  })}
                </div>
              )}
              <h3 className="text-xl font-bold text-[#11223C]">{selectedTranslation.title}</h3>
              {selectedTranslation.description && (
                <p className="mt-2 text-sm leading-6 text-slate-600">{selectedTranslation.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-md bg-slate-100 px-2.5 py-1.5 text-slate-700">
                  {Math.max(1, Math.round(selectedTrack.duration_seconds / 60))} {t('meditation.minutes')}
                </span>
                <span className="rounded-md bg-amber-50 px-2.5 py-1.5 text-amber-800">
                  {t('meditation.audioLanguage')}: {selectedTrack.source_language_code?.toUpperCase() || t('meditation.unknownLanguage')}
                </span>
              </div>
            </div>
            <Link
              to={`/meditation?trackId=${selectedTrack.id}`}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#A86100] px-6 py-3 font-bold text-white transition-colors hover:bg-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 lg:w-auto"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.56 7.17A1 1 0 008 8v4a1 1 0 001.56.83l3-2a1 1 0 000-1.66l-3-2z" clipRule="evenodd" />
              </svg>
              {t('visitor.playNow')}
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="visitor-actions-heading">
        <div className="mb-5">
          <h2 id="visitor-actions-heading" className="text-xl font-bold text-[#11223C] sm:text-2xl">
            {t('visitor.chooseTitle')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t('visitor.chooseSubtitle')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <VisitorActionCard
            to="/meditation"
            title={t('visitor.meditationTitle')}
            description={t('visitor.meditationDesc')}
            action={t('visitor.meditationAction')}
            icon={<PlayIcon />}
            tone="gold"
          />
          <VisitorActionCard
            to="/qa"
            title={t('visitor.qaTitle')}
            description={t('visitor.qaDesc')}
            action={t('visitor.qaAction')}
            icon={<QuestionIcon />}
            tone="navy"
          />
          <VisitorActionCard
            to="/centers"
            title={t('visitor.centersTitle')}
            description={t('visitor.centersDesc')}
            action={t('visitor.centersAction')}
            icon={<LocationIcon />}
            tone="sand"
          />
        </div>
      </section>

      <section aria-labelledby="bio-links-heading" className="rounded-[1.75rem] border border-[#11223C]/8 bg-[#F2E9D8]/55 p-5 sm:p-8 lg:p-10">
        <div className="text-center">
          <h2 id="bio-links-heading" className="text-xl font-bold text-[#11223C] sm:text-2xl">
            {t('home.bioLinksTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{t('home.bioLinksSubtitle')}</p>
        </div>

        {areLinksLoading ? (
          <LoadingState label={t('home.loadingLinks')} />
        ) : linksError ? (
          <ErrorState message={linksError} onRetry={fetchBioLinks} retryLabel={t('home.retry')} />
        ) : bioLinks.length === 0 ? (
          <EmptyState message={t('home.emptyLinks')} />
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {bioLinks.map((link) => {
              const title = link.bio_link_translations.find(
                (translation) => translation.language_code === currentLang,
              )?.title
              const imageUrl = getBioLinkImageUrl(link.image_storage_path)

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    void trackUsageEvent({
                      eventType: 'bio_link_click',
                      resourceType: 'bio_link',
                      resourceId: link.id,
                    })
                  }}
                  className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-all hover:border-amber-600 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#A86100]">
                      <LinkIcon />
                    </span>
                  )}
                  <span className="min-w-0 flex-1 break-words font-semibold text-[#11223C]">{title}</span>
                  <ExternalLinkIcon />
                </a>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function VisitorActionCard({ to, title, description, action, icon, tone }: {
  to: string
  title: string
  description: string
  action: string
  icon: ReactNode
  tone: 'gold' | 'navy' | 'sand'
}) {
  const toneClasses = {
    gold: 'bg-[#A86100]/10 text-[#A86100] group-hover:bg-[#A86100] group-hover:text-white',
    navy: 'bg-[#11223C]/8 text-[#11223C] group-hover:bg-[#11223C] group-hover:text-white',
    sand: 'bg-[#DDA756]/20 text-[#8D5200] group-hover:bg-[#DDA756] group-hover:text-[#11223C]',
  }

  return (
    <Link
      to={to}
      className="group flex min-h-64 flex-col rounded-[1.5rem] border border-[#11223C]/8 bg-white/90 p-6 shadow-[0_12px_35px_rgba(17,34,60,0.05)] transition-all hover:-translate-y-1 hover:border-[#A86100]/30 hover:shadow-[0_22px_55px_rgba(17,34,60,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${toneClasses[tone]}`}>
        {icon}
      </span>
      <h3 className="mt-5 text-lg font-bold text-[#11223C]">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#A86100]">
        {action}
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  )
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-sm text-slate-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#A86100]" />
      {label}
    </div>
  )
}

function ErrorState({ message, retryLabel, onRetry }: {
  message: string
  retryLabel: string
  onRetry: () => Promise<void>
}) {
  return (
    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-center">
      <p className="text-sm font-semibold text-red-800">{message}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800"
      >
        {retryLabel}
      </button>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm text-slate-500">
      {message}
    </div>
  )
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.75 9.25L9.5 6.2A1 1 0 008 7.07v9.86a1 1 0 001.5.87l5.25-3.05a3.18 3.18 0 000-5.5z" />
      <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
    </svg>
  )
}

function QuestionIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 9.5a4 4 0 117.2 2.4c-1.2 1.6-3.2 1.7-3.2 3.6m0 3h.01M12 22a10 10 0 100-20 10 10 0 000 20z" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1114 0z" />
      <circle cx="12" cy="10" r="2.5" strokeWidth={1.8} />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 13a5 5 0 007.54.54l2-2a5 5 0 00-7.07-7.07l-1.15 1.14m2.68 5.38a5 5 0 00-7.54-.54l-2 2a5 5 0 007.07 7.07l1.14-1.14" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-hover:text-[#A86100]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 5h5m0 0v5m0-5l-8 8m-2-6H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3" />
    </svg>
  )
}
