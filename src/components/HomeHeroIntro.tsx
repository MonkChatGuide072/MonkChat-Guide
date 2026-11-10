import { Link } from 'react-router'
import type { AppLanguage } from '../lib/language'
import { GuideIcon, type GuideIconName } from './GuideIcon'

const shortcuts = [
  { to: '/', th: 'หน้าแรก', en: 'Home', icon: 'home' },
  { to: '/activities', th: 'กิจกรรม', en: 'Activities', icon: 'calendar' },
  { to: '/meditation', th: 'สมาธิ', en: 'Meditate', icon: 'lotus' },
  { to: '/qa', th: 'ถาม–ตอบ', en: 'Q&A', icon: 'chat' },
  { to: '/centers', th: 'ศูนย์', en: 'Centers', icon: 'pin' },
]

/** Preserve the approved full-width scene, title below it and five shortcuts. */
export function HomeHeroIntro({ language }: { language: AppLanguage }) {
  const isEnglish = language === 'en'

  return (
    <section aria-labelledby="home-intro-title" className="bg-[#FFF8EE]">
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
        <p className="mt-2 text-sm text-brand-muted">{isEnglish ? 'Your guide to Ayutthaya Monk Chat' : 'คู่มือสำหรับร่วมกิจกรรม Ayutthaya Monk Chat'}</p>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-brand-muted sm:text-base">
          {isEnglish ? 'Join Monk Chat and guided meditation at Wat Mahathat, Ayutthaya.' : 'ร่วมสนทนาธรรมและฝึกสมาธิ ณ วัดมหาธาตุ พระนครศรีอยุธยา'}
        </p>

        <nav aria-label={isEnglish ? 'Home shortcuts' : 'ทางลัดหน้าแรก'} className="mx-auto mt-6 grid max-w-2xl grid-cols-5 gap-1 min-[390px]:gap-2 sm:gap-3">
          {shortcuts.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={item.to === '/' ? 'page' : undefined}
              className={`flex min-h-[76px] min-w-0 flex-col items-center justify-center gap-2 rounded-xl border px-0 py-3 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-maroon sm:min-h-[88px] sm:px-2 sm:text-sm ${item.to === '/' ? 'border-brand-terracotta bg-brand-terracotta text-white hover:bg-brand-terracotta-dark' : 'border-brand-border bg-brand-surface text-brand-maroon hover:border-brand-terracotta hover:bg-brand-gold-soft'}`}
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
