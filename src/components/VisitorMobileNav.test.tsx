import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { VisitorMobileNav } from './VisitorMobileNav'

describe('Visitor phone navigation',()=>{
  it('keeps only home as the central crystal button and links directly to the visitor homepage',()=>{
    render(<MemoryRouter initialEntries={['/visit']}><VisitorMobileNav isEnglish={false} /></MemoryRouter>)
    const links=within(screen.getByRole('navigation')).getAllByRole('link')
    expect(links.map(link=>link.getAttribute('href'))).toEqual(['/activities','/meditation','/visit','/qa','/centers'])
    expect(links[2]).toHaveAttribute('aria-current','page')
    expect(links[2].querySelector('.visitor-home-orb')).not.toBeNull()
    expect(document.querySelectorAll('.visitor-home-orb')).toHaveLength(1)
  })
  it('highlights meditation subpages and changes route when another destination is selected',()=>{
    render(<MemoryRouter initialEntries={['/meditation/now']}><VisitorMobileNav isEnglish /><Routes><Route path="/activities" element={<p>Activity destination</p>}/><Route path="*" element={<p>Meditation destination</p>}/></Routes></MemoryRouter>)
    expect(screen.getByRole('link',{name:'Meditate'})).toHaveAttribute('aria-current','page')
    fireEvent.click(screen.getByRole('link',{name:'Activities'}))
    expect(screen.getByText('Activity destination')).toBeInTheDocument()
    expect(screen.getByRole('link',{name:'Activities'})).toHaveAttribute('aria-current','page')
    expect(screen.getByRole('link',{name:'Meditate'})).not.toHaveAttribute('aria-current')
  })
})
