import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
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

export function VisitPage() {
  const { i18n } = useTranslation()
  const [sessionLang, setSessionLang] = useState<string | null>(sessionStorage.getItem('ui_language_code'))

  const handleLanguageChange = (lang: string) => {
    sessionStorage.setItem('ui_language_code', lang)
    i18n.changeLanguage(lang)
    window.dispatchEvent(new Event('languageSelected'))
    setSessionLang(lang)
  }

  if (!sessionLang) {
    return <LanguageGate onSelect={handleLanguageChange} />
  }

  return <VisitorHome currentLang={sessionLang} onLanguageChange={handleLanguageChange} />
}

function LanguageGate({ onSelect }: { onSelect: (lang: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 px-4 font-['Noto_Sans_Thai']">
      <h1 className="text-3xl sm:text-4xl font-bold text-[#11223C] text-center">
        Welcome / ยินดีต้อนรับ
      </h1>
      <p className="text-slate-600 text-center max-w-md text-sm sm:text-base">
        Please select your preferred language.<br/>
        กรุณาเลือกภาษาที่คุณต้องการใช้งาน
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mt-8">
        <button 
          onClick={() => onSelect('en')} 
          className="p-6 rounded-2xl bg-[#11223C] text-[#FFFEF9] font-bold text-xl hover:bg-slate-800 transition-colors shadow-md border border-[#11223C]/20 cursor-pointer"
        >
          English
        </button>
        <button 
          onClick={() => onSelect('th')} 
          className="p-6 rounded-2xl bg-[#A86100] text-[#FFFEF9] font-bold text-xl hover:bg-amber-800 transition-colors shadow-md border border-[#A86100]/20 cursor-pointer"
        >
          ภาษาไทย
        </button>
      </div>
    </div>
  )
}

function VisitorHome({ currentLang, onLanguageChange }: { currentLang: string, onLanguageChange: (lang: string) => void }) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recTracks, setRecTracks] = useState<MedTrackRow[]>([])
  const [selectedAudioLang, setSelectedAudioLang] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!supabaseClient) return
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: tracksError } = await supabaseClient
        .from('meditation_tracks')
        .select(`id, source_language_code, duration_seconds, meditation_track_translations(language_code, title, description)`)
        .eq('content_status', 'published')
        .eq('is_published', true)
        .eq('is_recommended', true)

      if (tracksError) throw tracksError

      const tracksData = (data || []) as MedTrackRow[]

      // Strict translation filtering for Recommended Tracks UI
      const validTracks = tracksData.filter(track => 
        track.meditation_track_translations.some(t => t.language_code === currentLang)
      )

      setRecTracks(validTracks)
      
      if (validTracks.length === 1) {
        setSelectedAudioLang(validTracks[0].source_language_code)
      } else {
        setSelectedAudioLang(null) // Prompt user to select
      }
    } catch (err) {
      console.error(err)
      setError(t('qa.errorLoad', 'Failed to load content. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }, [currentLang, t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const currentRecTrack = selectedAudioLang 
    ? recTracks.find(t => t.source_language_code === selectedAudioLang)
    : null

  return (
    <div className="space-y-8 sm:space-y-12 pb-8 pt-2 sm:pt-6 font-['Noto_Sans_Thai']">
      
      {/* Header component for VisitorHome since it's used inside a clean layout */}
      <header className="flex items-center justify-between pb-4 border-b border-slate-200">
        <Link to="/visit" className="flex items-center gap-2 font-bold text-slate-900 tracking-tight hover:text-[#A86100] transition-colors">
          <span className="inline-block w-3 h-3 rounded-full bg-[#A86100]"></span>
          <span className="text-base sm:text-lg">MonkChat Guide</span>
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const newLang = currentLang === 'th' ? 'en' : 'th';
              onLanguageChange(newLang);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {currentLang === 'th' ? 'EN' : 'TH'}
          </button>
        </div>
      </header>

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3 max-w-4xl mx-auto">
          <p className="text-red-800 font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchData}
            className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#A86100] hover:bg-amber-800 text-white transition-colors cursor-pointer"
          >
            {t('qa.retry', 'Retry')}
          </button>
        </div>
      )}

      {/* Recommended Track Hero */}
      {!error && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#11223C]">
              {t('app.heading', 'Meditation Guide')}
            </h1>
            <p className="text-[#A86100] text-sm font-semibold uppercase tracking-widest">
              {t('home.recommended', 'Recommended')}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin h-6 w-6 border-b-2 border-[#A86100] rounded-full"></div>
            </div>
          ) : recTracks.length === 0 ? (
            <div className="text-center p-6 text-slate-500 italic text-sm bg-slate-50 rounded-xl border border-slate-100">
              {t('home.noRecommendedTrack', 'No recommended track available at this time.')}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 space-y-4 max-w-xl mx-auto">
              {recTracks.length > 1 && (
                <div className="flex flex-col space-y-3 border-b border-slate-200 pb-4">
                  <label className="text-sm text-slate-600 font-semibold">{t('home.selectAudioLanguage', 'Select Audio Language:')}</label>
                  <div className="flex gap-2 justify-center">
                    {recTracks.map(track => (
                      <button
                        key={track.source_language_code}
                        onClick={() => setSelectedAudioLang(track.source_language_code)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${selectedAudioLang === track.source_language_code ? 'bg-[#11223C] text-[#FFFEF9]' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                      >
                        {track.source_language_code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {currentRecTrack ? (
                <div className="text-center space-y-4 pt-2">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[#11223C]">
                      {currentRecTrack.meditation_track_translations.find(t => t.language_code === currentLang)?.title || 'Meditation Track'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {currentRecTrack.meditation_track_translations.find(t => t.language_code === currentLang)?.description}
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 font-mono font-semibold">
                        {Math.round(currentRecTrack.duration_seconds / 60)} {t('meditation.minutes', 'min')}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-[#A86100]/10 text-[#A86100] font-semibold uppercase">
                        AUDIO: {currentRecTrack.source_language_code}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/meditation?trackId=${currentRecTrack.id}`}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-[#A86100] text-[#FFFEF9] font-bold rounded-xl shadow-sm hover:bg-amber-800 transition-colors mt-2"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    {t('home.playNow', 'Play Now')}
                  </Link>
                </div>
              ) : recTracks.length > 1 ? (
                <div className="text-center p-4 text-slate-500 italic text-sm">
                  Please select an audio language to continue.
                </div>
              ) : null}
            </div>
          )}
        </section>
      )}

      {/* Primary Navigation Cards (Only Q&A and Centers) */}
      {!error && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
          <Link to="/qa" className="group bg-white rounded-xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-[#A86100] flex flex-col items-center text-center justify-center transition-all">
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-[#A86100] flex items-center justify-center group-hover:bg-[#A86100] group-hover:text-white transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[#11223C]">{t('home.qaCardTitle', 'Q&A')}</h3>
            </div>
          </Link>
          <Link to="/centers" className="group bg-white rounded-xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-[#A86100] flex flex-col items-center text-center justify-center transition-all">
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-[#A86100] flex items-center justify-center group-hover:bg-[#A86100] group-hover:text-white transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[#11223C]">{t('home.centersCardTitle', 'Centers')}</h3>
            </div>
          </Link>
        </section>
      )}
    </div>
  )
}
