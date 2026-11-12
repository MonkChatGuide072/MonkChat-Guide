import { useNavigate } from 'react-router'
import { getOfficialContactContent } from '../content/officialContactContent'
import type { AppLanguage } from '../lib/language'
import { GuideIcon } from './GuideIcon'

/**
 * Highlighted Terracotta contact and official social banner placed at the bottom of the home page.
 */
export function OfficialContactBanner({ language }: { language: AppLanguage }) {
  const navigate = useNavigate()
  const contact = getOfficialContactContent(language)

  function handleOpenChatbot() {
    const event = new CustomEvent('monkchat:open-chatbot', { cancelable: true })
    window.dispatchEvent(event)
    if (!event.defaultPrevented) {
      navigate('/qa')
    }
  }

  return (
    <section
      aria-labelledby="home-official-contact-title"
      className="rounded-2xl bg-[#A33D19] p-6 text-white shadow-sm sm:p-8 lg:p-10"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-start gap-2 text-xs font-semibold uppercase tracking-wider text-[#FFF5F0]">
            <GuideIcon name="question" className="mt-0.5 h-4 w-4 shrink-0 text-[#FFF5F0]" />
            <span>{contact.eyebrow}</span>
          </span>

          <h2
            id="home-official-contact-title"
            className="font-serif text-2xl font-semibold leading-snug text-white sm:text-3xl"
          >
            {contact.title}
          </h2>

          <p className="text-sm leading-relaxed text-[#FFF5F0] sm:text-base">
            {contact.description}
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {contact.infoPills.map((pill) => (
              <span
                key={pill.label}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#7F2D12] px-3.5 py-1.5 text-xs font-medium text-white sm:text-sm"
              >
                <GuideIcon name={pill.icon} className="h-3.5 w-3.5 shrink-0 text-[#FFF5F0]" />
                <span>{pill.label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
          <a
            href={contact.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#8C3213] shadow-xs transition-colors duration-150 hover:bg-[#FDF6F2]"
          >
            <GuideIcon name="thumbsUp" className="h-4 w-4 shrink-0" />
            <span>{contact.facebookLabel}</span>
            <GuideIcon name="external" className="h-3.5 w-3.5 shrink-0 opacity-80" />
          </a>

          <button
            type="button"
            onClick={handleOpenChatbot}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/30 bg-[#7F2D12]/85 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#6A240E]"
          >
            <GuideIcon name="chat" className="h-4 w-4 shrink-0" />
            <span>{contact.chatbotLabel}</span>
          </button>
        </div>
      </div>
    </section>
  )
}

