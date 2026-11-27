import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation } from 'react-router'
import { MeditationBeginnerGuide } from '../components/MeditationBeginnerGuide'
import { MeditationPostureTips } from '../components/MeditationPostureTips'
import { BreathingPacer } from '../components/BreathingPacer'
import { MeditationNavigation } from '../components/MeditationNavigation'

export function MeditationGuidePage() {
  const { i18n } = useTranslation()
  const english = (i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')
  const location = useLocation()
  // Preserve existing links from student audio/resources and shared track URLs.
  if (new URLSearchParams(location.search).has('trackId') || location.hash === '#meditation-audio') {
    return <Navigate replace to={`/meditation/now${location.search}#meditation-audio`} />
  }
  return <div className="mx-auto max-w-5xl space-y-7 pb-12">
    <MeditationNavigation english={english} />
    <header><p className="text-xs font-semibold tracking-widest text-brand-gold">BEGINNER’S GUIDE</p><h1 className="mt-3 font-serif text-3xl font-semibold leading-snug text-brand-maroon">{english ? 'Begin gently, at your own pace' : 'เริ่มต้นอย่างเรียบง่าย ในจังหวะของคุณ'}</h1><p className="mt-3 max-w-2xl text-brand-muted">{english ? 'Explore the familiar preparation, meditation and reflection cards before you practise.' : 'ทำความคุ้นเคยกับการเตรียมตัว การวางใจ และการทบทวนหลังฝึก ก่อนเริ่มนั่งในจังหวะของคุณ'}</p></header>
    <details className="rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-5"><summary className="min-h-11 cursor-pointer py-2 font-medium text-brand-maroon">{english ? 'Optional calming breath preparation' : 'ตัวช่วยปรับลมหายใจ (เลือกใช้)'}</summary><div className="mt-3"><BreathingPacer language={english ? 'en' : 'th'} /></div></details>
    <MeditationBeginnerGuide audioHref="/meditation/now" />
    <MeditationPostureTips language={english ? 'en' : 'th'} />
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-border bg-brand-gold-soft p-5"><div><h2 className="font-serif text-xl font-semibold text-brand-maroon">{english ? 'Ready to try?' : 'พร้อมลองฝึกแล้วหรือยัง?'}</h2><p className="mt-1 text-sm text-brand-muted">{english ? 'Start without signing in.' : 'เริ่มได้เลย โดยไม่ต้องเข้าสู่ระบบ'}</p></div><Link to="/meditation/now" className="inline-flex min-h-11 items-center rounded-xl bg-brand-terracotta px-5 text-sm font-medium text-white">{english ? 'Meditate now' : 'เริ่มนั่งสมาธิ'} →</Link></section>
  </div>
}
