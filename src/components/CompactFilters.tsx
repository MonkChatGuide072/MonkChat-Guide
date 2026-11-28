import { useId, useRef, useState, type ReactNode } from 'react'
import './CompactFilters.css'

/** Mobile filters stay out of the reading area until requested. */
export function CompactFilters({ label, selected, children }: { label: string; selected: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  return <div className="compact-filters" data-open={open}>
    <button ref={trigger} type="button" className="compact-filter-toggle" aria-expanded={open} aria-controls={id}
      onClick={() => setOpen(value => !value)}>
      <span>{label}: <strong>{selected}</strong></span><span aria-hidden="true">{open ? '⌃' : '⌄'}</span>
    </button>
    <div id={id} className="compact-filter-options" onKeyDown={event => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() }
    }} onClick={event => {
      if ((event.target as HTMLElement).closest('button') && window.matchMedia?.('(max-width: 767px)').matches) {
        setOpen(false)
        trigger.current?.focus()
      }
    }}>{children}</div>
  </div>
}
