import { Link } from 'react-router'
import { PUBLIC_SHORTCUTS } from '../content/publicShortcuts'
import type { AppLanguage } from '../lib/language'
import { GuideIcon, type GuideIconName } from './GuideIcon'

/** Preserve the approved full-width scene, title below it and five shortcuts. */
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
    <section aria-labelledby="home-intro-title" className="bg-brand-cream">
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
          className="block h-[190px] w-full object-cover object-[center_35%] sm:h-[280px] sm:object-[center_30%] lg:h-[320px] lg:object-[center_28%] xl:h-[max(400px,19.53vw)] xl:object-[center_26%]"
        />
      </picture>
      <p id="home-banner-quote" lang="en" className="sr-only">
        In the calm of the temple, I heard the loudest truth.
      </p>

      <div className="mx-auto max-w-[76rem] px-4 pb-2 pt-6 text-center sm:px-6 lg:px-8">
        <h1 id="home-intro-title" className="font-serif text-[2rem] font-semibold leading-snug text-brand-maroon sm:text-4xl lg:text-[2.75rem]">
          MonkChat Guide
        </h1>
        <p className="mt-2 text-sm font-medium text-brand-terracotta sm:text-base [text-wrap:balance]">
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

        <nav aria-label={isEnglish ? 'Home shortcuts' : 'ทางลัดหน้าแรก'} className="mx-auto mt-6 grid max-w-2xl grid-cols-5 gap-1 min-[390px]:gap-2 sm:gap-3">
          {PUBLIC_SHORTCUTS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={item.to === normalizedActive ? 'page' : undefined}
              className={`flex min-h-[76px] min-w-0 flex-col items-center justify-center gap-2 rounded-xl border px-0 py-3 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-maroon sm:min-h-[88px] sm:px-2 sm:text-sm ${item.to === normalizedActive ? 'border-brand-terracotta bg-brand-terracotta text-white hover:bg-brand-terracotta-dark' : 'border-brand-border bg-brand-surface text-brand-maroon hover:border-brand-terracotta hover:bg-brand-gold-soft'}`}
            >
              <GuideIcon name={item.icon as GuideIconName} className="h-6 w-6" />
              <span className="text-center text-xs leading-4 tracking-normal sm:text-sm sm:leading-5">{isEnglish ? item.en : item.th}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
