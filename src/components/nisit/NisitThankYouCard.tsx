import { useState, type FormEvent } from 'react'
import { thankYouMessages } from '../../content/nisitPractice'
import { GuideIcon } from '../GuideIcon'

interface LocalVisitorNote {
  id: string
  name: string
  countryOrNote: string
  createdAt: string
}

const VISITORS_STORAGE_KEY = 'monkchat_nisit_visitors_v1'

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/)
  let line = ''
  let currentY = y
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) ctx.fillText(line, x, currentY)
  return currentY
}

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

  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 800
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawCard = (logo?: HTMLImageElement) => {
      // Clean white card with deep navy and soft gold framing
      ctx.fillStyle = '#F7F7F4'
      ctx.fillRect(0, 0, 1200, 800)

      // Inner card surface & hairline borders
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(48, 48, 1104, 704)
      ctx.strokeStyle = '#C8A252'
      ctx.lineWidth = 3
      ctx.strokeRect(48, 48, 1104, 704)
      ctx.strokeStyle = '#E2E6EB'
      ctx.lineWidth = 1.5
      ctx.strokeRect(64, 64, 1072, 672)

      if (logo) {
        ctx.drawImage(logo, 550, 92, 100, 100)
      }

      ctx.textAlign = 'center'
      ctx.fillStyle = '#8F6419'
      ctx.font = '600 22px Georgia, serif'
      ctx.fillText('AYUTTHAYA MONK CHAT · WAT MAHATHAT', 600, 224)

      ctx.fillStyle = '#11223C'
      ctx.font = '600 44px Georgia, serif'
      ctx.fillText('With Gratitude & Inner Peace', 600, 286)

      ctx.fillStyle = '#526071'
      ctx.font = '500 24px sans-serif'
      ctx.fillText('Thank you for joining us today,', 600, 350)

      ctx.fillStyle = '#11223C'
      ctx.font = '600 48px Georgia, serif'
      ctx.fillText(effectiveVisitor.slice(0, 42), 600, 412)

      ctx.strokeStyle = '#C8A252'
      ctx.beginPath()
      ctx.moveTo(360, 434)
      ctx.lineTo(840, 434)
      ctx.stroke()

      ctx.fillStyle = '#1E293B'
      ctx.font = '400 25px sans-serif'
      wrapCanvasText(ctx, selectedTemplate.en, 600, 492, 860, 38)

      ctx.fillStyle = '#526071'
      ctx.font = '500 20px sans-serif'
      const footerParts = [`Wat Mahathat, Phra Nakhon Si Ayutthaya`, cardDate]
      if (cardMonkName.trim()) {
        footerParts.push(`Guided by ${cardMonkName.trim().slice(0, 60)}`)
      }
      ctx.fillText(footerParts.join(' · '), 600, 668)

      const link = document.createElement('a')
      link.download = `monkchat-thank-you-${effectiveVisitor.toLowerCase().replace(/[^a-z0-9]+/gi, '-') || 'guest'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setCardFeedback(
        isEnglish ? 'Saved Thank-You Card PNG on this device.' : 'ดาวน์โหลดไฟล์ภาพการ์ดขอบคุณ PNG ลงเครื่องแล้ว',
      )
    }

    const img = new Image()
    img.onload = () => drawCard(img)
    img.onerror = () => drawCard(undefined)
    img.src = '/images/logo/ayutthaya-monk-chat-logo.png'
  }

  return (
    <div className="space-y-6">
      {/* Privacy Reminder Banner */}
      <div className="rounded-xl border border-brand-border bg-brand-gold-soft/70 p-4 text-sm leading-6 text-brand-muted">
        <strong className="font-medium text-brand-maroon">
          {isEnglish ? 'Device-only storage (Zero DB): ' : 'เก็บเฉพาะในเครื่องนี้เท่านั้น (ไม่ส่งชื่อขึ้นฐานข้อมูล): '}
        </strong>
        {isEnglish
          ? 'Visitor names and thank-you cards stay strictly inside your browser so you can safely prepare cards on-site without privacy overhead.'
          : 'รายชื่อผู้มาเยือนที่จดไว้และการ์ดขอบคุณทำงานบนเครื่องของคุณ 100% เพื่อรักษาความเป็นส่วนตัวของนักท่องเที่ยว และกดล้างข้อมูลท้ายวันได้ทันที'}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
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

          {/* Live Preview Card */}
          <div
            aria-label={isEnglish ? 'Thank-You Card preview' : 'ตัวอย่างการ์ดขอบคุณ'}
            className="rounded-xl border-2 border-brand-border-dark bg-brand-cream p-4"
          >
            <div className="rounded-lg border border-brand-border bg-brand-surface p-5 text-center">
              <img
                src="/images/logo/ayutthaya-monk-chat-logo.png"
                alt="Ayutthaya Monk Chat"
                width={1001}
                height={1024}
                className="mx-auto h-14 w-14 object-contain"
              />
              <p className="mt-2 text-xs font-medium tracking-normal text-brand-terracotta">
                Ayutthaya Monk Chat · Wat Mahathat
              </p>
              <h3 className="mt-1 font-serif text-xl font-semibold text-brand-maroon">
                With Gratitude &amp; Inner Peace
              </h3>
              <p className="mt-3 text-xs text-brand-muted">Thank you for joining us today,</p>
              <p className="mt-1 border-b border-brand-border pb-2 font-serif text-2xl font-semibold text-brand-maroon">
                {effectiveVisitor}
              </p>
              <p className="mt-3 text-sm leading-6 text-brand-text">{selectedTemplate.en}</p>
              {!isEnglish && (
                <p className="mt-1 text-xs leading-5 text-brand-muted">{selectedTemplate.th}</p>
              )}
              <p className="mt-4 text-xs text-brand-muted tabular-nums">
                Wat Mahathat, Ayutthaya · {cardDate}
                {cardMonkName.trim() ? ` · Guided by ${cardMonkName.trim()}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
          >
            <GuideIcon name="share" />
            <span>{isEnglish ? 'Download Thank-You Card PNG' : 'ดาวน์โหลดการ์ดขอบคุณ (PNG)'}</span>
          </button>

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

