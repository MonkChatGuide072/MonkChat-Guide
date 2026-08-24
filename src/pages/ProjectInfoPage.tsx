import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export function ProjectInfoPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8 sm:space-y-12 pb-8 pt-2 sm:pt-6">
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs text-center space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4">
          <img
            src="/monkchat-placeholder.svg"
            alt="MonkChat Logo"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-xs border border-slate-100 object-cover"
          />
        </div>
        <div className="space-y-3 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-[#11223C] tracking-tight leading-tight font-['Noto_Sans_Thai']">
            MonkChat Guide
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-['Noto_Sans_Thai']">
            {t('home.purposeText')}
          </p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold block text-xs uppercase tracking-wider text-[#A86100]">
              Visitors / นักท่องเที่ยว
            </span>
            <p className="text-slate-600 text-xs sm:text-sm font-['Noto_Sans_Thai']">
              {t('home.purposeVisitors')}
            </p>
            <Link to="/visit" className="inline-block mt-3 px-4 py-2 bg-[#11223C] text-[#FFFEF9] rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors font-['Noto_Sans_Thai']">
              Go to Guide / เข้าสู่แอป
            </Link>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="font-semibold block text-xs uppercase tracking-wider text-[#A86100]">
              Monks & Team / ทีมงาน
            </span>
            <p className="text-slate-600 text-xs sm:text-sm font-['Noto_Sans_Thai']">
              {t('home.purposeMonks')}
            </p>
            <Link to="/admin/login" className="inline-block mt-3 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors font-['Noto_Sans_Thai']">
              Team Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
