import { useEffect, useRef, useState, type FormEvent } from 'react'
import { thankYouMessages } from '../../content/nisitPractice'
import { GuideIcon } from '../GuideIcon'
import { ThankYouPostcard } from './ThankYouPostcard'
import { postcardPalettes, type PostcardPaletteId } from '../../content/thankYouPostcard'
import './ThankYouPostcard.css'

interface LocalVisitorNote {
  id: string
  name: string
  countryOrNote: string
  createdAt: string
}

const VISITORS_STORAGE_KEY = 'monkchat_nisit_visitors_v1'

/** Local-only visitor quick-note log & Thank-You Card PNG generator (never uploads personal data). */
export function NisitThankYouCard({
  isEnglish,
  defaultMonkLabel,
}: {
  isEnglish: boolean
  defaultMonkLabel?: string
}) {
  const [visitors, setVisitors] = useState<LocalVisitorNote[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(VISITORS_STORAGE_KEY) || '[]') as LocalVisitorNote[]
    } catch {
      return []
    }
  })
  const [guestNameInput, setGuestNameInput] = useState('')
  const [guestNoteInput, setGuestNoteInput] = useState('')

  const [cardVisitorName, setCardVisitorName] = useState('')
  const [cardMonkName, setCardMonkName] = useState(defaultMonkLabel ?? '')
  const [cardDate, setCardDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [messageId, setMessageId] = useState<string>(thankYouMessages[0].id)
  const [cardFeedback, setCardFeedback] = useState<string | null>(null)
  const [palette, setPalette] = useState<PostcardPaletteId>('garden')
  const [isDownloading, setIsDownloading] = useState(false)
  const postcardRef = useRef<SVGSVGElement>(null)
  const [generatedPng, setGeneratedPng] = useState<{ url: string; signature: string } | null>(null)
  const cardSignature = JSON.stringify([cardVisitorName, cardMonkName, cardDate, messageId, palette, isEnglish])
  useEffect(() => () => { if (generatedPng) URL.revokeObjectURL(generatedPng.url) }, [generatedPng])

  const selectedTemplate = thankYouMessages.find((m) => m.id === messageId) ?? thankYouMessages[0]
  const effectiveVisitor = cardVisitorName.trim() || (isEnglish ? 'Dear Guest' : 'Dear Guest')

  const persistVisitors = (next: LocalVisitorNote[]) => {
    setVisitors(next)
    try {
      localStorage.setItem(VISITORS_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage quota errors.
    }
  }

  const handleAddVisitor = (e: FormEvent) => {
    e.preventDefault()
    const cleanName = guestNameInput.trim()
    if (!cleanName) return
    const entry: LocalVisitorNote = {
      id: `${Date.now()}`,
      name: cleanName.slice(0, 80),
      countryOrNote: guestNoteInput.trim().slice(0, 120),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    persistVisitors([entry, ...visitors])
    setCardVisitorName(entry.name)
    setGuestNameInput('')
    setGuestNoteInput('')
  }

  const handleClearAll = () => {
    persistVisitors([])
    setCardFeedback(
      isEnglish
        ? 'Cleared all local visitor notes from this device.'
        : 'ล้างบันทึกชื่อผู้มาเยือนออกจากเครื่องนี้ทั้งหมดแล้ว',
    )
  }

  const handleDownloadPng = async () => {
    if (!postcardRef.current || isDownloading) return
    setIsDownloading(true)
    setCardFeedback(null)
    let sourceUrl: string | undefined
    let downloadUrl: string | undefined
    try {
      await document.fonts?.ready
      const svg = new XMLSerializer().serializeToString(postcardRef.current)
      sourceUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
      const image = new Image()
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error('Postcard image unavailable'))
        image.src = sourceUrl!
      })
      const canvas = document.createElement('canvas')
      canvas.width = 1200
      canvas.height = 1500
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas unavailable')
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error('PNG unavailable')), 'image/png')
      })
      downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `monkchat-thank-you-${effectiveVisitor.toLowerCase().replace(/[^a-z0-9]+/gi, '-') || 'guest'}.png`
      link.href = downloadUrl
      document.body.append(link)
      link.click()
      link.remove()
      setGeneratedPng({ url: downloadUrl, signature: cardSignature })
      setCardFeedback(isEnglish ? 'Your postcard PNG is ready to save.' : 'สร้างโปสการ์ดพร้อมบันทึกแล้ว')
    } catch {
      setCardFeedback(isEnglish ? 'Could not create the postcard. Please try again.' : 'ยังสร้างไฟล์การ์ดไม่สำเร็จ กรุณาลองอีกครั้ง')
    } finally {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl)

      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Privacy Reminder Banner */}
      <div className="training-notes-privacy rounded-xl border border-brand-border bg-brand-gold-soft/70 p-4 text-sm leading-6 text-brand-muted">
        <strong className="font-medium text-brand-maroon">
          {isEnglish ? 'Device-only storage (Zero DB): ' : 'เก็บเฉพาะในเครื่องนี้เท่านั้น (ไม่ส่งชื่อขึ้นฐานข้อมูล): '}
        </strong>
        {isEnglish
          ? 'Visitor names and thank-you cards stay strictly inside your browser so you can safely prepare cards on-site without privacy overhead.'
          : 'รายชื่อผู้มาเยือนที่จดไว้และการ์ดขอบคุณทำงานบนเครื่องของคุณ 100% เพื่อรักษาความเป็นส่วนตัวของนักท่องเที่ยว และกดล้างข้อมูลท้ายวันได้ทันที'}
      </div>

      <div className="training-card-columns grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* Left Column: Quick Visitor Notes */}
        <section className="space-y-4 rounded-2xl border border-brand-border bg-brand-surface p-5">
          <div>
            <h2 className="font-serif text-lg font-semibold text-brand-maroon">
              {isEnglish ? '1. On-site visitor quick notes' : '1. จดชื่อผู้มาเยือนระหว่างสนทนา'}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              {isEnglish
                ? 'Tap a name after saving to fill the Thank-You Card automatically.'
                : 'จดชื่อเล่น/ชื่อจริงหรือประเทศไว้ แล้วคลิกชื่อนั้นเพื่อส่งไปทำการ์ดขอบคุณด้านขวาได้ทันที'}
            </p>
          </div>

          <form onSubmit={handleAddVisitor} className="space-y-3">
            <label className="block text-sm font-medium text-brand-maroon">
              <span>{isEnglish ? 'Visitor name' : 'ชื่อนักท่องเที่ยว / ผู้มาเยือน'}</span>
              <input
                type="text"
                required
                maxLength={80}
                value={guestNameInput}
                onChange={(e) => setGuestNameInput(e.target.value)}
                placeholder={isEnglish ? 'e.g. Sarah, Kenji' : 'เช่น Sarah, Kenji'}
                className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
              />
            </label>
            <label className="block text-sm font-medium text-brand-maroon">
              <span>{isEnglish ? 'Country or conversation note (optional)' : 'ประเทศ หรือบันทึกสั้น ๆ (ไม่บังคับ)'}</span>
              <input
                type="text"
                maxLength={120}
                value={guestNoteInput}
                onChange={(e) => setGuestNoteInput(e.target.value)}
                placeholder={isEnglish ? 'e.g. Germany · asked about mindfulness' : 'เช่น เยอรมนี · สนใจถามเรื่องสติ'}
                className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-terracotta px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
            >
              <GuideIcon name="clipboard" />
              <span>{isEnglish ? 'Add to local list' : 'บันทึกชื่อลงรายการหน้างาน'}</span>
            </button>
          </form>

          <div className="border-t border-brand-border pt-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-brand-maroon tabular-nums">
                {isEnglish ? `Today’s notes (${visitors.length})` : `รายชื่อที่จดไว้ (${visitors.length})`}
              </p>
              {visitors.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="min-h-11 cursor-pointer rounded-lg px-2 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  {isEnglish ? 'Clear device notes' : 'ล้างข้อมูลท้ายวัน'}
                </button>
              )}
            </div>

            {visitors.length === 0 ? (
              <p className="mt-3 text-sm text-brand-muted">
                {isEnglish ? 'No visitor notes saved on this device yet.' : 'ยังไม่มีรายชื่อที่จดไว้บนเครื่องนี้'}
              </p>
            ) : (
              <ul className="mt-3 max-h-60 space-y-2 overflow-y-auto pr-1">
                {visitors.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => setCardVisitorName(v.name)}
                      className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-brand-border bg-brand-cream/50 px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-brand-gold-soft"
                    >
                      <span className="min-w-0">
                        <strong className="block font-medium text-brand-maroon">{v.name}</strong>
                        {v.countryOrNote && (
                          <span className="block text-xs text-brand-muted">{v.countryOrNote}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-brand-terracotta tabular-nums">{v.createdAt}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Right Column: Thank-You Card Editor + Visual Preview + Download */}
        <section className="space-y-4 rounded-2xl border border-brand-border bg-brand-surface p-5">
          <div>
            <h2 className="font-serif text-lg font-semibold text-brand-maroon">
              {isEnglish ? '2. On-site Thank-You Card' : '2. สร้างการ์ดขอบคุณที่เข้าร่วมโครงการ'}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              {isEnglish
                ? 'Customize and save a remembrance PNG card for your visitor to keep or photograph.'
                : 'ปรับข้อความแล้วบันทึกเป็นภาพ PNG ให้ผู้มาเยือนเก็บไว้เป็นที่ระลึกหน้างาน'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-brand-maroon">
              <span>{isEnglish ? 'Name on card' : 'ชื่อบนการ์ด'}</span>
              <input
                type="text"
                maxLength={60}
                value={cardVisitorName}
                onChange={(e) => setCardVisitorName(e.target.value)}
                placeholder={isEnglish ? 'Dear Guest' : 'ใส่ชื่อนักท่องเที่ยว'}
                className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
              />
            </label>
            <label className="block text-sm font-medium text-brand-maroon">
              <span>{isEnglish ? 'Date' : 'วันที่'}</span>
              <input
                type="date"
                value={cardDate}
                onChange={(e) => setCardDate(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text tabular-nums"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-brand-maroon">
              <span>{isEnglish ? 'Guided by (optional)' : 'ชื่อพระนิสิตผู้สนทนา (ไม่บังคับ)'}</span>
              <input
                type="text"
                maxLength={60}
                value={cardMonkName}
                onChange={(e) => setCardMonkName(e.target.value)}
                placeholder={isEnglish ? 'e.g. Phra ...' : 'เช่น พระ... / รหัส 6611018'}
                className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
              />
            </label>
            <label className="block text-sm font-medium text-brand-maroon">
              <span>{isEnglish ? 'Card message theme' : 'รูปแบบข้อความขอบคุณ'}</span>
              <select
                value={messageId}
                onChange={(e) => setMessageId(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-base text-brand-text"
              >
                {thankYouMessages.map((msg) => (
                  <option key={msg.id} value={msg.id}>
                    {isEnglish ? msg.labelEn : msg.labelTh}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="postcard-palette-picker">
            <legend>{isEnglish ? 'Choose a postcard mood' : 'เลือกบรรยากาศของโปสการ์ด'}</legend>
            <div className="postcard-palettes">
              {postcardPalettes.map((item) => (
                <label key={item.id}>
                  <input type="radio" name="postcard-palette" value={item.id} checked={palette === item.id}
                    onChange={() => setPalette(item.id)} />
                  <span className="postcard-palette-dot" style={{ background: item.paper }} aria-hidden="true" />
                  <span>{isEnglish ? item.en : item.th}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div aria-label={isEnglish ? 'Thank-You Card preview' : 'ตัวอย่างการ์ดขอบคุณ'} className="postcard-preview-frame">
            <ThankYouPostcard ref={postcardRef} visitor={effectiveVisitor} monk={cardMonkName} date={cardDate}
              message={selectedTemplate.en} translation={isEnglish ? undefined : selectedTemplate.th} palette={palette} />
          </div>
          <p className="postcard-download-note">{isEnglish ? 'A little memory from Ayutthaya · PNG 1200 × 1500' : 'ความทรงจำเล็ก ๆ จากอยุธยา · PNG 1200 × 1500'}</p>

          <button
            type="button"
            onClick={() => void handleDownloadPng()}
            disabled={isDownloading}
            className="postcard-download-button inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
          >
            <GuideIcon name="share" />
            <span>{isDownloading ? (isEnglish ? 'Creating postcard…' : 'กำลังสร้างโปสการ์ด…') : (isEnglish ? 'Download Thank-You Card PNG' : 'ดาวน์โหลดการ์ดขอบคุณ (PNG)')}</span>
          </button>

          {generatedPng?.signature === cardSignature && (
            <a href={generatedPng.url} target="_blank" rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-brand-maroon underline underline-offset-4">
              {isEnglish ? 'Open postcard image' : 'เปิดภาพการ์ดเพื่อดูหรือบันทึก'}
              <GuideIcon name="external" className="h-4 w-4" />
            </a>
          )}

          {cardFeedback && (
            <p role="status" className="text-center text-sm font-medium text-brand-terracotta">
              {cardFeedback}
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

