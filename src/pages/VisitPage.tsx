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
import { MeditationMark } from '../components/MeditationMark'

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
    <main className="relative isolate min-h-screen overflow-hidden bg-[#d8ccb8] px-4 py-5 text-[#30342d] sm:px-8 sm:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_13%_10%,rgba(255,249,235,.9),transparent_34%),linear-gradient(150deg,#e2d7c4_0%,#cbbca4_100%)]" />
      <MeditationMark className="pointer-events-none absolute -right-28 top-10 -z-10 w-[34rem] text-white/35 sm:w-[46rem]" />

      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="group flex items-center gap-3" aria-label="MonkChat Guide">
          <img src="/monkchat-placeholder.svg" alt="" className="h-10 w-10 rounded-xl bg-[#354033] ring-1 ring-white/30 transition-transform group-hover:-rotate-3" />
          <span className="leading-tight"><span className="block text-sm font-extrabold">MonkChat Guide</span><span className="mt-1 block text-[.55rem] font-bold uppercase tracking-[.2em] text-[#a34e39]">Inner Peace Companion</span></span>
        </Link>
        <Link to="/" className="inline-flex min-h-10 items-center rounded-full border border-[#4b4337]/15 bg-white/24 px-4 text-xs font-bold text-[#595248] backdrop-blur-sm transition-colors hover:bg-white/40">โครงการ / About</Link>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh_-_4.75rem)] max-w-6xl items-center gap-10 py-10 lg:grid-cols-[1fr_.78fr] lg:gap-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#a94732]/18 bg-[#a94732]/8 px-3 py-1.5 text-[.65rem] font-bold uppercase tracking-[.18em] text-[#8e3d2d]"><span className="h-1.5 w-1.5 rounded-full bg-[#a94732]" />Welcome to MonkChat</span>
          <h1 className="mt-6 font-serif text-4xl font-bold leading-[1.08] tracking-[-.04em] text-balance sm:text-6xl">ฟัง เรียนรู้ และเดินทางต่ออย่างสงบ</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#625b50] sm:text-base">Meditation audio, trusted answers, and DCI centers—all in one calm space for your visit.</p>
        </div>

        <section aria-labelledby="language-gate-title" className="rounded-[1.75rem] border border-white/55 bg-[#eadbc1]/86 p-6 shadow-[0_28px_70px_rgba(73,61,45,.16)] backdrop-blur-xl sm:p-8">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a94732] text-white"><svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.2-2.3 3.3-5.3 3.3-9S14.2 5.3 12 3m0 18c-2.2-2.3-3.3-5.3-3.3-9S9.8 5.3 12 3M3.5 9h17m-17 6h17" /></svg></span>
          <p className="mt-6 text-[.65rem] font-bold uppercase tracking-[.2em] text-[#a34e39]">Your language</p>
          <h2 id="language-gate-title" className="mt-2 font-serif text-2xl font-bold tracking-tight sm:text-3xl">เลือกภาษา / Choose language</h2>
          <p className="mt-3 text-sm leading-6 text-[#625b50]">ระบบจะจดจำภาษาสำหรับการเข้าชมครั้งนี้<br />Choose the language for this visit.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onSelect('th')}
            aria-label="ภาษาไทย"
            className="group flex min-h-20 items-center gap-4 rounded-2xl bg-[#a94732] px-5 py-4 text-left text-white shadow-[0_12px_28px_rgba(142,61,45,.2)] transition-all hover:-translate-y-0.5 hover:bg-[#8e3d2d]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-extrabold">TH</span>
            <span><span className="block font-bold">ภาษาไทย</span><span className="mt-0.5 block text-xs text-white/65">ดำเนินการต่อ</span></span>
          </button>
          <button
            type="button"
            onClick={() => onSelect('en')}
            aria-label="English"
            className="group flex min-h-20 items-center gap-4 rounded-2xl border border-[#4b4337]/14 bg-white/55 px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#a94732]/35 hover:bg-white/70"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#354033]/8 text-xs font-extrabold">EN</span>
            <span><span className="block font-bold">English</span><span className="mt-0.5 block text-xs text-[#625b50]">Continue</span></span>
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
    <div className="space-y-5 pb-3">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[.68rem] font-bold uppercase tracking-[.18em] text-[#a34e39]">{t('visitor.heroTag')}</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold leading-[1.08] tracking-[-.035em] text-[#30342d] sm:text-5xl">
            {t('visitor.title')}
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-[#6b6255] sm:text-right">{t('visitor.subtitle')}</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.34fr_.8fr]">
        <section aria-labelledby="recommended-heading" className="relative isolate min-h-[31rem] overflow-hidden rounded-[1.75rem] bg-[#303a2f] text-[#fff4df] shadow-[0_22px_60px_rgba(49,55,43,.18)]">
          <div className="absolute inset-y-0 right-0 hidden w-[42%] overflow-hidden md:block">
            <img src="/images/home/monkchat-slide-2.webp" alt="" className="h-full w-full object-cover opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#303a2f] via-[#303a2f]/25 to-transparent" />
          </div>
          <div className="relative z-10 flex h-full max-w-[64%] flex-col p-6 sm:p-8 max-md:max-w-none">
            <p className="text-[.66rem] font-bold uppercase tracking-[.15em] text-[#efd070]">{t('visitor.recommendedTag')}</p>
            <h2 id="recommended-heading" className="mt-4 max-w-lg font-serif text-3xl font-bold leading-[1.12] tracking-[-.025em] sm:text-4xl">
              {t('visitor.recommendedTitle')}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#fff4df]/68">{t('visitor.recommendedSubtitle')}</p>

            <div className="mt-auto pt-8">
              {isTrackLoading ? (
                <LoadingState label={t('visitor.loadingRecommended')} inverse />
              ) : trackError ? (
                <ErrorState message={trackError} onRetry={fetchRecommendedTracks} retryLabel={t('home.retry')} />
              ) : !selectedTrack || !selectedTranslation ? (
                <EmptyState message={t('visitor.noRecommended')} inverse />
              ) : (
                <div className="rounded-[1.25rem] border border-white/15 bg-black/14 p-5 backdrop-blur-md">
                  {recommendedTracks.length > 1 && (
                    <div className="mb-4 flex flex-wrap gap-2" aria-label={t('visitor.selectRecommended')}>
                      {recommendedTracks.map((track) => {
                        const translation = track.meditation_track_translations.find((item) => item.language_code === currentLang)
                        return (
                          <button key={track.id} type="button" onClick={() => setSelectedTrackId(track.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${track.id === selectedTrack.id ? 'bg-[#efd070] text-[#393427]' : 'bg-white/10 text-white/70 hover:bg-white/15'}`}>
                            {translation?.title}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  <h3 className="text-base font-bold">{selectedTranslation.title}</h3>
                  {selectedTranslation.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#fff4df]/68">{selectedTranslation.description}</p>}
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="text-xs text-[#fff4df]/62">{Math.max(1, Math.round(selectedTrack.duration_seconds / 60))} {t('meditation.minutes')} · {selectedTrack.source_language_code?.toUpperCase()}</span>
                    <Link to={`/meditation?trackId=${selectedTrack.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#bd4e33] px-5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
                      <PlayIcon />{t('visitor.playNow')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-5">
          <section className="rounded-[1.5rem] border border-white/35 bg-[#eadbc1]/82 p-5 shadow-[0_14px_40px_rgba(73,61,45,.09)] backdrop-blur-md sm:p-6">
            <p className="text-[.65rem] font-bold uppercase tracking-[.13em] text-[#a34e39]">Q&amp;A · {t('qa.verificationNotice')}</p>
            <h2 className="mt-3 font-serif text-2xl font-bold text-[#30342d]">{t('visitor.qaTitle')}</h2>
            <Link to="/qa" className="mt-5 flex min-h-12 items-center justify-between rounded-xl border border-[#6b5c48]/20 bg-white/38 px-4 text-sm font-semibold text-[#625b50] transition-colors hover:bg-white/60">
              <span>{t('qa.searchPlaceholder')}</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#a94732] text-white"><QuestionIcon /></span>
            </Link>
          </section>

          <section aria-labelledby="bio-links-heading" className="rounded-[1.5rem] bg-[#354033] p-5 text-[#fff4df] shadow-[0_16px_42px_rgba(49,55,43,.14)] sm:p-6">
            <h2 id="bio-links-heading" className="text-sm font-bold">{t('visitor.chooseTitle')}</h2>
            <div className="mt-3 divide-y divide-white/15">
              <GuideLinkRow to="/qa" title={t('visitor.qaTitle')} description={t('visitor.qaDesc')} icon={<QuestionIcon />} />
              <GuideLinkRow to="/centers" title={t('visitor.centersTitle')} description={t('visitor.centersDesc')} icon={<LocationIcon />} />
              <GuideLinkRow to="/meditation" title={t('visitor.meditationTitle')} description={t('visitor.meditationDesc')} icon={<PlayIcon />} />
            </div>

            {areLinksLoading ? (
              <LoadingState label={t('home.loadingLinks')} inverse />
            ) : linksError ? (
              <ErrorState message={linksError} onRetry={fetchBioLinks} retryLabel={t('home.retry')} />
            ) : bioLinks.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {bioLinks.slice(0, 3).map((link) => {
                  const title = link.bio_link_translations.find((translation) => translation.language_code === currentLang)?.title
                  const imageUrl = getBioLinkImageUrl(link.image_storage_path)
                  return (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={title} onClick={() => { void trackUsageEvent({ eventType: 'bio_link_click', resourceType: 'bio_link', resourceId: link.id }) }} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-3 text-xs font-semibold text-white/78 hover:bg-white/16">
                      {imageUrl ? <img src={imageUrl} alt="" className="h-6 w-6 rounded-full object-cover" /> : <LinkIcon />}{title}<ExternalLinkIcon />
                    </a>
                  )
                })}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <section className="grid gap-4 rounded-[1.35rem] bg-[#8e3d2d] px-5 py-4 text-[#fff1d7] shadow-[0_15px_36px_rgba(113,49,37,.15)] sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:px-7">
        <div><strong className="block text-sm">กิจกรรมจริง · จันทร์และศุกร์</strong><span className="mt-1 block text-xs text-white/70">13.15 น. เป็นต้นไป</span></div>
        <div className="border-white/20 sm:border-l sm:pl-6"><strong className="block text-sm">วัดมหาธาตุ · อยุธยา</strong><span className="mt-1 block text-xs text-white/70">ตรวจสอบจุดนัดหมายก่อนมา</span></div>
        <Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f3d992] px-5 text-sm font-bold text-[#633121] transition-transform hover:-translate-y-0.5">Ayutthaya Monk Chat ↗</Link>
      </section>
    </div>
  )
}

function GuideLinkRow({ to, title, description, icon }: { to: string; title: string; description: string; icon: ReactNode }) {
  return (
    <Link to={to} className="group flex items-center gap-3 py-4">
      <span className="text-[#e9c66b]">{icon}</span>
      <span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><small className="mt-1 block truncate text-[.68rem] text-white/55">{description}</small></span>
      <span className="text-white/60 transition-transform group-hover:translate-x-1">↗</span>
    </Link>
  )
}

function LoadingState({ label, inverse = false }: { label: string; inverse?: boolean }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-8 text-sm ${inverse ? 'text-white/65' : 'text-slate-500'}`} role="status">
      <span className={`h-5 w-5 animate-spin rounded-full border-2 ${inverse ? 'border-white/20 border-t-[#efd070]' : 'border-slate-200 border-t-[#A86100]'}`} />
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

function EmptyState({ message, inverse = false }: { message: string; inverse?: boolean }) {
  return (
    <div className={`mt-4 rounded-xl border border-dashed px-5 py-7 text-center text-sm ${inverse ? 'border-white/20 bg-white/5 text-white/65' : 'border-slate-300 bg-white text-slate-500'}`}>
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
