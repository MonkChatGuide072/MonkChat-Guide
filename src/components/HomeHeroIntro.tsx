import { Link } from 'react-router'
import { PUBLIC_SHORTCUTS } from '../content/publicShortcuts'
import type { AppLanguage } from '../lib/language'
import { GuideIcon, type GuideIconName } from './GuideIcon'

/** Preserve the approved full-width scene, title below it and five shortcuts with tactile polish. */
export function HomeHeroIntro({
  language,
  activePath = '/',
}: {
  language: AppLanguage
  activePath?: '/' | '/home' | '/visit'
}) {
  const isEnglish = language === 'en'
  const normalizedActive = activePath === '/home' || activePath === '/visit' ? '/' : activePath

  return (
    <section aria-labelledby="home-intro-title" className="bg-[#FAF7F2] border-b border-[#EADCC6]/60">
      <div className="relative overflow-hidden group">
        <picture className="block">
          <source media="(min-width: 80rem)" srcSet="/images/home/monkchat-banner-desktop.webp" />
          <source media="(min-width: 40rem)" srcSet="/images/home/monkchat-banner-tablet.webp" />
          <img
            src="/images/home/monkchat-banner-mobile.webp"
            alt={isEnglish ? 'Ayutthaya Monk Chat, a monk and visitors sit together among the Ayutthaya ruins' : 'Ayutthaya Monk Chat พระสงฆ์และผู้มาเยือนนั่งด้วยกันท่ามกลางโบราณสถานอยุธยา'}
            aria-describedby="home-banner-quote"
            width={1170}
            height={570}
            fetchPriority="high"
            className="block h-[220px] w-full object-cover object-[center_35%] sm:h-[320px] sm:object-[center_30%] lg:h-[380px] lg:object-[center_28%] xl:h-[max(440px,22vw)] xl:object-[center_26%] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E1803]/80 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-4 right-4 sm:left-8 sm:bottom-5 flex items-center justify-between text-white text-xs pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#FEF3C7] text-[11px] font-medium">
            <span>☸️</span>
            <span>Wat Mahathat, Historic Ayutthaya</span>
          </span>
          <span className="hidden sm:inline-block text-white/80 italic text-xs font-serif drop-shadow-sm">
            "In the calm of the temple, I heard the loudest truth."
          </span>
        </div>
      </div>
      <p id="home-banner-quote" lang="en" className="sr-only">
        In the calm of the temple, I heard the loudest truth.
      </p>

      <div className="mx-auto max-w-[76rem] px-4 pb-4 pt-6 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#EBD8B0]/60 border border-[#D5B77E]/80 text-[#78350F] text-xs font-semibold mb-2">
          <span>🌿</span>
          <span>{isEnglish ? 'Buddhist Dissemination Technology · DCI' : 'เทคโนโลยีการเผยแผ่พุทธธรรม · ศูนย์พุทธศาสตร์ศึกษา DCI'}</span>
        </div>

        <h1 id="home-intro-title" className="font-serif text-[2.1rem] font-bold leading-tight text-brand-maroon sm:text-4xl lg:text-[2.85rem] tracking-tight">
          MonkChat Guide
        </h1>
        <p className="mt-2 text-sm font-semibold text-brand-terracotta sm:text-base [text-wrap:balance]">
          {isEnglish
            ? 'Take a seat in the shade · Open conversation with monks'
            : 'พักกายใต้ร่มไม้ใหญ่ · เปิดใจคุยกับพระสงฆ์'}
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-brand-muted sm:text-base [text-wrap:pretty]">
          {isEnglish ? (
            <>
              Sit comfortably under the shade trees at Wat Mahathat. Ask anything you wonder about monk life,
              and enjoy 5 minutes of quiet meditation.<br className="hidden sm:inline" /> Friendly, welcoming, no formalities, and 100% free walk-in.
            </>
          ) : (
            <>
              นั่งเก้าอี้สบายๆ ใต้ร่มไม้วัดมหาธาตุ อยุธยา พูดคุยอย่างเป็นกันเอง ถามได้ทุกเรื่องที่สงสัย
              และพักใจให้สงบ 5&nbsp;นาที<br className="hidden sm:inline" /> เปิดกว้างทุกศาสนา ร่วมได้ทันทีโดยไม่มีค่าใช้จ่าย
            </>
          )}
        </p>

        {/* 5 Tactile Handcrafted Shortcuts with scale-on-press */}
        <nav aria-label={isEnglish ? 'Home shortcuts' : 'ทางลัดหน้าแรก'} className="mx-auto mt-6 grid max-w-2xl grid-cols-5 gap-1.5 min-[390px]:gap-2 sm:gap-3">
          {PUBLIC_SHORTCUTS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={item.to === normalizedActive ? 'page' : undefined}
              className={`flex min-h-[78px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 py-3 text-xs font-semibold transition-all duration-150 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-maroon sm:min-h-[92px] sm:px-2 sm:text-sm ${
                item.to === normalizedActive
                  ? 'border-brand-terracotta bg-gradient-to-b from-brand-terracotta to-brand-terracotta-dark text-white shadow-sm'
                  : 'border-[#E2D5C3] bg-[#FFFDF9] text-brand-maroon shadow-2xs hover:border-brand-terracotta hover:bg-[#FDF6ED]'
              }`}
            >
              <GuideIcon name={item.icon as GuideIconName} className="h-6 w-6 shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-center text-xs leading-4 tracking-normal sm:text-sm sm:leading-5">{isEnglish ? item.en : item.th}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
