import { useState } from 'react'
import { GuideIcon } from './GuideIcon'

interface MeditationPostureTipsProps {
  language: 'en' | 'th'
}

export function MeditationPostureTips({ language }: MeditationPostureTipsProps) {
  const isEn = language === 'en'
  const [activeTab, setActiveTab] = useState<'posture' | 'video' | 'tips'>('posture')

  const postures = [
    {
      title: isEn ? '1. Chair Sitting (Recommended for Visitors)' : '1. นั่งเก้าอี้ (แนะนำสำหรับผู้มีปัญหาข้อเข่าหรือชาวต่างชาติ)',
      desc: isEn
        ? 'Sit upright on a stable chair with your back comfortably supported. Keep both feet resting flat on the floor, about shoulder-width apart. Rest your hands gently on your lap.'
        : 'นั่งหลังตรงสบาย ๆ บนเก้าอี้ที่มั่นคง เท้าทั้งสองข้างวางราบกับพื้นพอดี ไม่เกร็งกล้ามเนื้อ วางมือทั้งสองบนหน้าตักเบา ๆ',
      tip: isEn ? 'Ideal for foreign guests with knee or back stiffness' : 'เหมาะสำหรับผู้ที่ไม่ถนัดนั่งขัดสมาธิบนพื้น',
      icon: 'check',
    },
    {
      title: isEn ? '2. Floor / Mat Half-Lotus Sitting' : '2. นั่งขัดสมาธิบนพื้นหรือเบาะรอง',
      desc: isEn
        ? 'Sit on a meditation cushion or mat. Place your right leg over your left leg. Keep your spine naturally upright without stiffening your neck or shoulders.'
        : 'นั่งบนเบาะหรือผ้ารองนั่ง ขาขวาทับขาซ้าย ลำตัวตั้งตรงพอดี ๆ ไม่แอ่นหรือเกร็งคอ ปล่อยไหล่ให้ผ่อนคลาย',
      tip: isEn ? 'Traditional monastic posture' : 'ท่านั่งมาตรฐานแบบดั้งเดิม',
      icon: 'lotus',
    },
    {
      title: isEn ? '3. Hand Placement & Eye Relaxation' : '3. การวางมือและการหลับตาเบา ๆ',
      desc: isEn
        ? 'Place your right hand on top of your left hand, with the tip of your right index finger gently touching your left thumb. Close your eyelids softly (around 90%), as if gently drifting to sleep.'
        : 'มือขวาวางทับมือซ้าย นิ้วชี้ขวาจรดหัวแม่มือซ้าย วางไว้บนหน้าตักเบา ๆ หลับตาเบา ๆ คล้ายกำลังจะเคลิ้มหลับ ปิดเปลือกตาเพียง 90% พอสบาย ไม่บีบตา',
      tip: isEn ? 'No tension in forehead, eyebrows, or eyes' : 'ไม่เพ่ง ไม่เค้นกล้ามเนื้อใบหน้า',
      icon: 'check',
    },
  ]

  const troubles = [
    {
      title: isEn ? 'Wandering Thoughts (ฟุ้งซ่าน)' : 'ใจคิดเรื่องอื่น (ฟุ้งซ่าน)',
      solution: isEn
        ? 'Do not battle your thoughts. Smile gently at the wandering thought, let it drift away like a cloud, and softly bring your attention back to the center of your body.'
        : 'อย่าไปต่อสู้กับความคิด เมื่อรู้ตัวว่าใจลอย ให้ยิ้มรับเบา ๆ แล้วค่อย ๆ น้อมใจกลับมาพักที่ศูนย์กลางกายฐานที่ 7 อย่างผ่อนคลาย',
    },
    {
      title: isEn ? 'Feeling Sleepy (ง่วงนอน)' : 'รู้สึกง่วงนอน',
      solution: isEn
        ? 'Take 2-3 deep, refreshing breaths. Gently straighten your back and slightly open your eyelids to allow soft ambient light in before re-closing them softly.'
        : 'สูดลมหายใจเข้าลึก ๆ 2-3 ครั้ง ยืดลำตัวให้ตรงขึ้น หรือลืมตาขึ้นมารับแสงสักครู่ เมื่อสดชื่นแล้วจึงค่อย ๆ หลับตาเบา ๆ ใหม่อีกครั้ง',
    },
    {
      title: isEn ? 'Physical Tension or Aches (ปวดเมื่อย/ตึง)' : 'ร่างกายตึงหรือปวดเมื่อย',
      solution: isEn
        ? 'Consciously scan from head to toe, relaxing facial muscles, shoulders, and abdomen. You may shift your posture gently without disturbing your inner calm.'
        : 'สำรวจร่างกายตั้งแต่ศีรษะจรดปลายเท้า คลายกล้ามเนื้อหัวไหล่และคอ หากเมื่อยสามารถขยับปรับเปลี่ยนท่านั่งได้อย่างนุ่มนวล',
    },
    {
      title: isEn ? 'Noticing Inner Light (เห็นแสงสว่าง)' : 'เห็นแสงสว่างหรือภาพภายใน',
      solution: isEn
        ? 'Remain completely still and neutral. Do not get excited or try to grasp it. Simply observe it with contentment, like enjoying a peaceful sunrise.'
        : 'รักษาใจให้นิ่งเฉย ไม่ตื่นเต้นและไม่ต้องพยายามเค้นให้ชัดขึ้น ดูไปอย่างสบาย ๆ เหมือนมองดูทิวทัศน์ธรรมชาติอันสงบ',
    },
  ]

  return (
    <section className="space-y-6 rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(43,24,16,0.03)]">
      {/* Header and navigation tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-800/15 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 shadow-2xs">
            <GuideIcon name="book" className="h-3.5 w-3.5 text-amber-700" />
            <span>{isEn ? 'Practical Field Guidance' : 'คำแนะนำและคู่มือภาคปฏิบัติ'}</span>
          </div>
          <h2 className="mt-2 font-serif text-xl sm:text-2xl font-semibold text-brand-maroon">
            {isEn ? 'Essential Meditation Preparation & Tips' : 'ข้อแนะนำการเตรียมตัวและแก้ปัญหาขณะฝึก'}
          </h2>
        </div>

        {/* Segmented Tab Buttons */}
        <div className="flex rounded-xl bg-stone-100 p-1" role="tablist" aria-label="Meditation tips categories">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'posture'}
            onClick={() => setActiveTab('posture')}
            className={`min-h-10 rounded-lg px-3.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'posture' ? 'bg-white text-brand-maroon shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isEn ? 'Seating & Posture' : 'ท่านั่งและการวางมือ'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'tips'}
            onClick={() => setActiveTab('tips')}
            className={`min-h-10 rounded-lg px-3.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'tips' ? 'bg-white text-brand-maroon shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isEn ? 'Troubleshooting' : 'วิธีแก้ฟุ้งซ่าน/ง่วง'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'video'}
            onClick={() => setActiveTab('video')}
            className={`min-h-10 rounded-lg px-3.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'video' ? 'bg-white text-brand-maroon shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isEn ? 'Video Guide' : 'วิดีโอสาธิต'}
          </button>
        </div>
      </div>

      {/* Tab 1: Seating Postures */}
      {activeTab === 'posture' && (
        <div className="grid gap-4 sm:grid-cols-3">
          {postures.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-[#FDFCFB] p-5 shadow-2xs hover:border-amber-300 transition-colors"
            >
              <div>
                <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 border border-amber-200/50 mb-3">
                  {item.tip}
                </span>
                <h3 className="font-sans text-base font-bold text-stone-900 leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Troubleshooting */}
      {activeTab === 'tips' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {troubles.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-stone-200/90 bg-[#FDFCFB] p-5 shadow-2xs"
            >
              <div className="flex items-center gap-2 text-brand-terracotta">
                <GuideIcon name="info" className="h-4 w-4" />
                <h3 className="font-sans text-base font-bold text-stone-900">
                  {item.title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 pl-6 border-l-2 border-amber-500/40">
                {item.solution}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Video Demonstration Guide */}
      {activeTab === 'video' && (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-[#FAF7F2] p-6 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900 mb-2">
              <GuideIcon name="play" className="h-4 w-4 text-amber-700" />
              <span>{isEn ? 'Guided Meditation Video Demonstration' : 'วิดีโอสาธิตการปฏิบัติสมาธิเบื้องต้น'}</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-semibold text-brand-maroon">
              {isEn ? 'Watch How Buddhist Monks Prepare for Stillness' : 'ชมคลิปสาธิตท่านั่งและการปรับใจให้สงบ'}
            </h3>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              {isEn
                ? 'Follow along with the teaching monks as they guide you through relaxed posture, breathing awareness, and resting at the 7th base of mind.'
                : 'รับชมการสาธิตท่านั่ง การวางมือ และการน้อมใจไปสู่ศูนย์กลางกายฐานที่ 7 อย่างถูกต้องและเป็นธรรมชาติ'}
            </p>

            {/* Video Frame */}
            <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl border border-stone-300 shadow-md bg-stone-900 flex items-center justify-center relative group">
              <iframe
                title={isEn ? 'Meditation Guide Demonstration Video' : 'วิดีโอแนะนำการนั่งสมาธิ'}
                src="https://www.youtube-nocookie.com/embed/1vWqQZ3qQJ8?rel=0"
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
