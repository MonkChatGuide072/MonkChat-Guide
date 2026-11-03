import type { SVGProps } from 'react'

const paths = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v10h5v-6h3v6h5V10',
  calendar: 'M8 3v4m8-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 9h2m4 0h2m-8 3h2',
  lotus: 'M12 20c-4-3-6-7 0-15 6 8 4 12 0 15Zm0 0C6 20 3 16 3 10c5 1 8 4 9 10Zm0 0c6 0 9-4 9-10-5 1-8 4-9 10Z',
  chat: 'M5 18 3 21v-6a8 8 0 1 1 4 4l-2-1Zm3-7h.01M12 11h.01M16 11h.01',
  pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
  hourglass: 'M7 3h10M7 21h10M8 3v4l8 10v4M16 3v4L8 17v4',
  directions: 'm21 3-6 18-4-8-8-4 18-6ZM11 13 21 3',
  info: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6m0-10h.01',
  check: 'm5 12 4 4L19 6',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  down: 'm6 9 6 6 6-6',
  external: 'M14 4h6v6m0-6L10 14m-2-9H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-3',
  link: 'm10 13 4-4m-6 7-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 1 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0',
  play: 'm8 5 11 7-11 7V5Z',
  question: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-2.5 2-2.5 4M12 17h.01',
  clipboard: 'M9 4H6a1 1 0 0 0-1 1v15h14V5a1 1 0 0 0-1-1h-3M9 3h6v4H9V3Zm0 9h6m-6 4h6',
  close: 'm6 6 12 12M6 18 18 6',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z',
  bookmark: 'M6 3h12v18l-6-4-6 4V3Z',
  share: 'M15 8 9 11m6 5-6-3M21 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM21 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21a7 7 0 0 1 14 0',
} as const

export type GuideIconName = keyof typeof paths

/** Uses the project's existing outline vocabulary without adding a dependency. */
export function GuideIcon({ name, className = 'h-[18px] w-[18px]', ...props }: SVGProps<SVGSVGElement> & { name: GuideIconName }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} {...props}>
    <path d={paths[name]} />
  </svg>
}
