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
      <img
        src="/images/home/monkchat-meditation-ruins.webp"
        alt={isEnglish ? 'A monk and visitors meditating among trees and Ayutthaya brick ruins' : 'พระสงฆ์และผู้มาเยือนนั่งสมาธิท่ามกลางต้นไม้และโบราณสถานอิฐอยุธยา'}
        width={1672}
        height={941}
        fetchPriority="high"
        className="block h-[240px] w-full object-cover object-[center_35%] sm:h-[360px] sm:object-[center_30%] lg:h-[460px] lg:object-[center_28%] xl:h-[500px] xl:object-[center_26%]"
      />

      <div className="mx-auto max-w-[76rem] px-4 pb-2 pt-6 text-center sm:px-6 lg:px-8">
        <h1 id="home-intro-title" className="font-serif text-[2rem] font-semibold leading-snug text-brand-maroon sm:text-4xl lg:text-[2.75rem]">
          {isEnglish ? 'Ayutthaya Monk Chat' : 'อยุธยา มังค์แชท'}
        </h1>
        {!isEnglish && <p lang="en" className="mt-2 text-sm text-brand-muted">Ayutthaya Monk Chat</p>}
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
