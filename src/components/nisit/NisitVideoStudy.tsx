import { useState, type FormEvent } from 'react'
import { nisitStudyResources, parseSafeYouTubeEmbedUrl } from '../../content/nisitPractice'
import { GuideIcon } from '../GuideIcon'

/** External listening/pronunciation resources + safe class YouTube embed tool (zero storage cost). */
export function NisitVideoStudy({ isEnglish }: { isEnglish: boolean }) {
  const [urlInput, setUrlInput] = useState('')
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const [urlError, setUrlError] = useState('')

  const handleLoadVideo = (e: FormEvent) => {
    e.preventDefault()
    const safe = parseSafeYouTubeEmbedUrl(urlInput)
    if (!safe) {
      setUrlError(
        isEnglish
          ? 'Please enter a valid https://youtube.com or https://youtu.be video link.'
          : 'กรุณากรอกลิงก์วิดีโอ YouTube แบบ https://youtube.com หรือ https://youtu.be ที่ถูกต้องเท่านั้น',
      )
      return
    }
    setUrlError('')
    setEmbedUrl(safe)
  }

  return (
    <div className="space-y-6">
      {/* Safe YouTube Study Launcher */}
      <section className="rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
        <div className="flex items-start gap-2 text-xs font-medium text-brand-terracotta">
          <GuideIcon name="play" />
          <span>{isEnglish ? 'External video practice (0 THB bandwidth)' : 'ฝึกฟังและออกเสียงผ่านวิดีโอภายนอก (ไม่เปลืองพื้นที่ระบบ)'}</span>
        </div>
        <h2 className="mt-2 font-serif text-lg font-semibold text-brand-maroon">
          {isEnglish ? 'Open a class listening or pronunciation video' : 'เปิดคลิปวิดีโอฝึกฟังและพูดตามสำหรับห้องเรียน'}
        </h2>
        <p className="mt-1 text-sm leading-6 text-brand-muted">
          {isEnglish
            ? 'Paste a YouTube link provided by your instructor to listen and shadow-speak alongside the vocabulary.'
            : 'วางลิงก์ YouTube ที่พระอาจารย์หรือทีมงานแนะนำในชั้นเรียนเพื่อเปิดฟังซ้ำและฝึกออกเสียงตาม (รองรับเฉพาะลิงก์ YouTube ที่ปลอดภัย)'}
        </p>

        <form onSubmit={handleLoadVideo} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="nisit-youtube-url">
            {isEnglish ? 'YouTube video URL' : 'ลิงก์วิดีโอ YouTube'}
          </label>
          <input
            id="nisit-youtube-url"
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="min-h-11 flex-1 rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
          />
          <button
            type="submit"
            className="min-h-11 shrink-0 cursor-pointer rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
          >
            {isEnglish ? 'Load video' : 'เปิดวิดีโอฝึกฟัง'}
          </button>
        </form>

        {urlError && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {urlError}
          </p>
        )}

        {embedUrl && (
          <div className="mt-5 overflow-hidden rounded-xl border border-brand-border bg-black">
            <div className="aspect-video w-full">
              <iframe
                src={embedUrl}
                title={isEnglish ? 'Student meditation listening practice video' : 'วิดีโอฝึกฟังและออกเสียงสำหรับพระนิสิต'}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          </div>
        )}
      </section>

      {/* Curated Official Sources */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-lg font-semibold text-brand-maroon">
            {isEnglish ? 'Recommended listening & reference links' : 'คลังแหล่งเรียนรู้และฝึกการสื่อสารที่แนะนำ'}
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            {isEnglish
              ? 'Official Dhammakaya English/Thai references already reviewed in the project.'
              : 'แหล่งอ้างอิงภาษาอังกฤษและไทยทางการสำหรับเตรียมความพร้อมก่อนสนทนากับผู้มาเยือน'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {nisitStudyResources.map((res) => (
            <article key={res.id} className="flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-surface p-5">
              <div>
                <p className="text-xs font-medium text-brand-terracotta">
                  {isEnglish ? res.categoryEn : res.categoryTh}
                </p>
                <h3 className="mt-1 font-sans text-base font-medium text-brand-maroon">
                  {isEnglish ? res.titleEn : res.titleTh}
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  {isEnglish ? res.descriptionEn : res.descriptionTh}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {res.focusTerms.map((term) => (
                    <span
                      key={term}
                      className="rounded-lg border border-brand-border bg-brand-cream px-2 py-0.5 text-xs text-brand-maroon"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-2">
                {res.url ? (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand-border-dark bg-brand-cream px-4 text-sm font-medium text-brand-maroon transition-colors duration-150 hover:bg-brand-gold-soft"
                  >
                    <span>{isEnglish ? 'Open reference' : 'เปิดดูสื่อต้นฉบับ'}</span>
                    <GuideIcon name="external" />
                  </a>
                ) : (
                  <p className="inline-flex min-h-11 items-center rounded-xl border border-dashed border-brand-border px-3 text-xs text-brand-muted">
                    {isEnglish ? 'Pending approved class video link' : 'รอลิงก์วิดีโอที่ทีมงาน/อาจารย์อนุมัติเพิ่ม'}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

