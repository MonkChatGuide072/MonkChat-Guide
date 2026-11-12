import { Link } from 'react-router'
import { GuideIcon } from './GuideIcon'
import type { AppLanguage } from '../lib/language'

interface Props {
  onSelect: (language: AppLanguage) => void
  subtitleTh?: string
  subtitleEn?: string
}

/** Shared language gate shown at the QR landing routes before a session language is picked. */
export function LanguageGate({
  onSelect,
  subtitleTh = 'ร่วมสนทนาธรรมและฝึกสมาธิ ณ วัดมหาธาตุ พระนครศรีอยุธยา',
  subtitleEn = 'Monk Chat and guided meditation at Wat Mahathat, Ayutthaya',
}: Props) {
  return (
    <main className="min-h-screen bg-brand-cream px-4 py-8 text-brand-text sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-3" aria-label="MonkChat Guide">
          <img
            src="/images/logo/ayutthaya-monk-chat-logo.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
          />
          <span className="text-sm font-medium leading-6 text-brand-maroon">
            MonkChat Guide
            <br />
            <span lang="en" className="text-brand-muted">
              Ayutthaya Monk Chat
            </span>
          </span>
        </Link>

        <div className="mt-8 overflow-hidden rounded-2xl border border-brand-border bg-brand-surface sm:mt-12 lg:grid lg:grid-cols-2">
          <div>
            <img
              src="/images/home/monkchat-language-gate-real.jpg"
              alt="พระสงฆ์และผู้มาเยือนนั่งสนทนาธรรมและฝึกสมาธิ ณ วัดมหาธาตุ พระนครศรีอยุธยา / Monks and visitors engaging in Monk Chat and meditation at Wat Mahathat, Ayutthaya"
              width={1024}
              height={707}
              className="h-48 w-full object-cover sm:h-64 lg:h-full"
            />
          </div>

          <section aria-labelledby="language-gate-title" className="p-6 sm:p-8">
            <GuideIcon name="globe" className="h-6 w-6 text-brand-muted" />
            <h1 id="language-gate-title" className="mt-4 text-2xl font-semibold leading-snug text-brand-maroon">
              เลือกภาษา / Choose language
            </h1>
            <p className="mt-3 text-sm leading-6 text-brand-muted">
              เลือกภาษาสำหรับการเข้าชมครั้งนี้
              <br />
              <span lang="en">Choose the language for this visit</span>
            </p>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => onSelect('th')}
                aria-label="ภาษาไทย"
                className="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-lg bg-brand-terracotta px-4 py-3 text-left text-white transition-colors duration-150 hover:bg-brand-terracotta-dark"
              >
                <span className="font-medium">ภาษาไทย</span>
                <span lang="en" className="text-sm">
                  Thai
                </span>
                <GuideIcon name="arrow" />
              </button>
              <button
                type="button"
                onClick={() => onSelect('en')}
                aria-label="English"
                className="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-lg border border-brand-border bg-brand-surface px-4 py-3 text-left text-brand-maroon transition-colors duration-150 hover:bg-brand-gold-soft"
              >
                <span lang="en" className="font-medium">
                  English
                </span>
                <span className="text-sm">ภาษาอังกฤษ</span>
                <GuideIcon name="arrow" />
              </button>
            </div>
            <p className="mt-6 border-t border-brand-border pt-4 text-sm leading-6 text-brand-muted">
              {subtitleTh}
              <br />
              <span lang="en">{subtitleEn}</span>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

