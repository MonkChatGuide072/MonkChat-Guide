import { GuideIcon } from './GuideIcon'

export function LanguageGate({ onSelect }: { onSelect: (lang: 'th' | 'en') => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 px-4">
      <div className="h-16 w-16 rounded-full bg-brand-gold-soft border border-brand-gold/40 flex items-center justify-center text-brand-maroon">
        <GuideIcon name="lotus" className="h-8 w-8 text-brand-gold" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-maroon">
          เลือกภาษา / Choose language
        </h1>
        <p className="text-sm text-brand-muted leading-relaxed">
          Please select your preferred language to begin your Monk Chat experience.<br />
          กรุณาเลือกภาษาที่คุณต้องการใช้งานเพื่อเริ่มต้น
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm">
        <button
          type="button"
          aria-label="ภาษาไทย"
          onClick={() => onSelect('th')}
          className="flex flex-col items-center justify-center p-5 rounded-2xl border border-brand-border bg-white hover:border-brand-gold hover:shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <span className="text-2xl mb-1">🇹🇭</span>
          <span className="font-serif font-bold text-brand-maroon text-lg">ภาษาไทย</span>
          <span className="text-xs text-brand-muted mt-0.5">สนทนาธรรม & นำสมาธิ</span>
        </button>

        <button
          type="button"
          aria-label="English"
          onClick={() => onSelect('en')}
          className="flex flex-col items-center justify-center p-5 rounded-2xl border border-brand-border bg-white hover:border-brand-gold hover:shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <span className="text-2xl mb-1">🌏</span>
          <span className="font-serif font-bold text-brand-maroon text-lg">English</span>
          <span className="text-xs text-brand-muted mt-0.5">Monk Chat & Meditation</span>
        </button>
      </div>
    </div>
  )
}
