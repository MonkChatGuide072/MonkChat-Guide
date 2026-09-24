import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

const variants = [
  { key: 'A', name: 'Documentary opening' },
  { key: 'B', name: 'Conversation journal' },
  { key: 'C', name: 'Visit first' },
] as const

export type HomePrototypeVariant = (typeof variants)[number]['key']

export function PrototypeSwitcher({ current }: { current: HomePrototypeVariant }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const hostname = typeof window === 'undefined' ? '' : window.location.hostname
  const isCloudflarePreview = hostname.endsWith('.monkchat-guide.pages.dev') && hostname !== 'monkchat-guide.pages.dev'
  const canShowSwitcher = import.meta.env.DEV || isCloudflarePreview

  const selectOffset = (offset: number) => {
    const currentIndex = variants.findIndex((variant) => variant.key === current)
    const next = variants[(currentIndex + offset + variants.length) % variants.length]
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('variant', next.key)
    setSearchParams(nextParams, { replace: true })
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, [contenteditable="true"]')) return
      if (event.key === 'ArrowLeft') selectOffset(-1)
      if (event.key === 'ArrowRight') selectOffset(1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  if (!canShowSwitcher) return null

  const active = variants.find((variant) => variant.key === current) ?? variants[0]

  return (
    <aside
      className="fixed inset-x-0 bottom-4 z-[100] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-1 rounded-full bg-[#17211D] p-1.5 text-white shadow-[0_18px_50px_rgba(23,33,29,0.32)] ring-1 ring-white/15"
      aria-label="Home prototype variants"
    >
      <button
        type="button"
        onClick={() => selectOffset(-1)}
        className="grid h-11 w-11 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/12 hover:text-white"
        aria-label="Previous prototype"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="min-w-44 px-3 text-center">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#E7C9B4]">Prototype only</p>
        <p className="mt-0.5 text-sm font-bold">{active.key} · {active.name}</p>
      </div>
      <button
        type="button"
        onClick={() => selectOffset(1)}
        className="grid h-11 w-11 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/12 hover:text-white"
        aria-label="Next prototype"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </aside>
  )
}
