import { Link } from 'react-router'
import type { AppLanguage } from '../lib/language'

const shortcuts = [
  { to: '/', th: 'หน้าแรก', en: 'Home', path: 'M3 11.5 12 4l9 7.5M5.5 10v10h5v-6h3v6h5V10' },
  { to: '/activities', th: 'กิจกรรม', en: 'Activities', path: 'M8 3v4m8-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 9h2m4 0h2m-8 3h2' },
  { to: '/meditation', th: 'สมาธิ', en: 'Meditation', path: 'M12 20c-4-3-6-7 0-15 6 8 4 12 0 15Zm0 0C6 20 3 16 3 10c5 1 8 4 9 10Zm0 0c6 0 9-4 9-10-5 1-8 4-9 10Z' },
  { to: '/qa', th: 'ถาม–ตอบ', en: 'Q&A', path: 'M5 18 3 21v-6a8 8 0 1 1 4 4l-2-1Zm3-7h.01M12 11h.01M16 11h.01' },
  { to: '/centers', th: 'ศูนย์', en: 'Centers', path: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
]

/** Home-only introduction; keep the shared header and lower visitor content unchanged. */
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
        className="block h-[240px] w-full object-cover object-[center_62%] sm:h-[340px] lg:h-[440px]"
      />

      <div className="mx-auto max-w-[76rem] px-4 pb-1 pt-5 text-center sm:px-6 sm:pt-6 lg:px-8">
        <h1 id="home-intro-title" className="font-serif text-[1.9rem] font-bold leading-snug text-[#681B16] sm:text-4xl lg:text-[2.75rem]">
          {isEnglish ? 'Ayutthaya Monk Chat' : 'อยุธยา มังค์แชท'}
        </h1>
        {!isEnglish && <p lang="en" className="mt-1 text-xs font-medium tracking-[0.08em] text-[#A43D1D] sm:text-sm">AYUTTHAYA MONK CHAT</p>}
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[#5A4B40] sm:text-base">
          {isEnglish ? 'Join Monk Chat and guided meditation at Wat Mahathat, Ayutthaya.' : 'ร่วมสนทนาธรรมและฝึกสมาธิ ณ วัดมหาธาตุ พระนครศรีอยุธยา'}
        </p>

        <nav aria-label={isEnglish ? 'Home shortcuts' : 'ทางลัดหน้าแรก'} className="mx-auto mt-5 grid max-w-2xl grid-cols-5 gap-1.5 sm:mt-6 sm:gap-3">
          {shortcuts.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={item.to === '/' ? 'page' : undefined}
              className={`flex min-h-[76px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-3 text-[0.7rem] font-semibold leading-tight transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#681B16] sm:min-h-[88px] sm:text-sm ${item.to === '/' ? 'border-[#A43D1D] bg-[#A43D1D] text-white shadow-sm hover:bg-[#8E3317]' : 'border-[#EADCC6] bg-[#FFFDF7] text-[#681B16] hover:border-[#A43D1D] hover:bg-[#FAF0E1]'}`}
            >
              <svg aria-hidden="true" className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.65} strokeLinecap="round" strokeLinejoin="round">
                <path d={item.path} />
              </svg>
              <span className={isEnglish ? 'text-[0.65rem] min-[390px]:text-[0.7rem] sm:text-sm' : undefined}>{isEnglish ? item.en : item.th}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  )
}
