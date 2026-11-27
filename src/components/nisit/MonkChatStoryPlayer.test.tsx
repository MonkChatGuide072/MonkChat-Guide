import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MonkChatStoryPlayer } from './MonkChatStoryPlayer'
import { invitationScenes, invitationArt, validateInvitationGraph } from '../../content/monkChatInvitation'

function start() { fireEvent.click(screen.getByRole('button', { name: /เริ่มเรื่องราว|Begin the story/ })) }
function choose(index: number) {
  fireEvent.click(within(screen.getByRole('group', { name: /คำตอบของคุณ|Your response/ })).getAllByRole('button')[index])
  act(() => { vi.advanceTimersByTime(500) })
}
function currentScene() { return document.querySelector('[data-scene]')?.getAttribute('data-scene') }

describe('Illustrated invitation chapter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true } })
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false } })
  })
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks() })

  it('has reachable scenes, valid links, a route to an ending from every scene and bilingual assets', () => {
    expect(validateInvitationGraph()).toEqual([])
    expect(new Set(Object.values(invitationScenes).filter(scene => scene.ending).map(scene => scene.ending))).toEqual(new Set(['joined','brief','declined']))
    for (const scene of Object.values(invitationScenes)) {
      expect(invitationArt[scene.visual].src).toMatch(/invitation\/.*\.png$/)
      expect(scene.setting.th).not.toBe(''); expect(scene.setting.en).not.toBe('')
      for (const choice of scene.choices) { expect(choice.reaction.th).not.toBe(''); expect(choice.reaction.en).not.toBe(''); expect(choice.takeaway.en).not.toBe('') }
    }
  })

  it('begins with the monk observing passers-by and changes picture and event immediately on choice', () => {
    render(<MonkChatStoryPlayer />)
    expect(screen.getByRole('img')).toHaveAttribute('src', invitationArt.arrival.src)
    start(); expect(currentScene()).toBe('arrival')
    expect(screen.getByRole('dialog')).toHaveAttribute('open')
    expect(document.body.style.overflow).toBe('hidden')
    choose(0)
    expect(currentScene()).toBe('explain')
    expect(screen.getByRole('img')).toHaveAttribute('src', invitationArt.listening.src)
    expect(screen.getByText(invitationScenes.arrival.choices[0].reaction.th)).toBeInTheDocument()
    expect(screen.queryByText(invitationScenes.arrival.choices[0].takeaway.th)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Next scene|ฉากถัดไป|คุยต่อ/ })).not.toBeInTheDocument()
  })

  it('handles different preferences in the group before guiding them to seats', () => {
    render(<MonkChatStoryPlayer />); start(); choose(0); choose(0)
    expect(currentScene()).toBe('friend')
    expect(screen.getByRole('img')).toHaveAttribute('src', invitationArt.hesitant.src)
    choose(0); choose(0)
    expect(currentScene()).toBe('joined')
    expect(screen.getByTestId('story-ending-view')).toHaveTextContent('จบบทที่ 1')
    expect(screen.getByRole('img')).toHaveAttribute('src', invitationArt.joined.src)
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.queryByRole('button', { name: /ไปต่อบทที่ 2/ })).not.toBeInTheDocument()
  })

  it('answers the five-minute question, agrees on a short chat and never silently adds meditation', () => {
    render(<MonkChatStoryPlayer />); start(); choose(1)
    expect(currentScene()).toBe('time')
    expect(screen.getByRole('img')).toHaveAttribute('src', invitationArt.time.src)
    choose(0); choose(0); choose(0)
    expect(currentScene()).toBe('brief')
    expect(screen.getByText(invitationScenes.brief.setting.th)).toBeInTheDocument()
    expect(screen.queryByText(/นำนั่งสำเร็จ|ฝึกครบทุกบท/)).not.toBeInTheDocument()
  })

  it('ends a declined invitation respectfully and shows the departure image', () => {
    render(<MonkChatStoryPlayer />); start(); choose(1); choose(1)
    expect(currentScene()).toBe('declined')
    expect(screen.getByRole('img')).toHaveAttribute('src', invitationArt.farewell.src)
    expect(screen.getByText(invitationScenes.declined.setting.th)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('allows repairing a rushed invitation without forcing acceptance', () => {
    render(<MonkChatStoryPlayer />); start(); choose(2); choose(1)
    expect(currentScene()).toBe('repair')
    choose(0); expect(currentScene()).toBe('explain')
    choose(1); choose(1)
    expect(currentScene()).toBe('declined')
    fireEvent.click(screen.getAllByRole('button', { name: 'ลองจุดนี้อีกครั้ง' })[2])
    expect(currentScene()).toBe('repair')
  })

  it('rewinds with history truncated and restart can be cancelled', () => {
    render(<MonkChatStoryPlayer />); start(); choose(0); choose(0)
    fireEvent.click(screen.getByRole('button', { name: 'ย้อนคำตอบล่าสุด' }))
    expect(currentScene()).toBe('explain')
    const confirm = vi.spyOn(window,'confirm').mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มใหม่' }))
    expect(confirm).toHaveBeenCalledOnce(); expect(currentScene()).toBe('explain')
  })

  it('keeps shortcuts within the game and prevents repeat/double-choice during transition', () => {
    render(<MonkChatStoryPlayer />); start()
    fireEvent.keyDown(window,{key:'2'}); expect(currentScene()).toBe('arrival')
    const root=screen.getByTestId('monk-chat-story-player')
    fireEvent.keyDown(root,{key:'2',ctrlKey:true}); expect(currentScene()).toBe('arrival')
    fireEvent.keyDown(root,{key:'2'}); expect(currentScene()).toBe('time')
    fireEvent.keyDown(root,{key:'2'}); expect(currentScene()).toBe('time')
    act(()=>{vi.advanceTimersByTime(500)})
    fireEvent.keyDown(root,{key:'2',repeat:true}); expect(currentScene()).toBe('time')
    fireEvent.keyDown(root,{key:'2'}); expect(currentScene()).toBe('declined')
  })

  it('supports English events and optional Thai translations while preserving the path on language change', () => {
    const {rerender}=render(<MonkChatStoryPlayer isEnglish />); start(); choose(0)
    expect(screen.getByText(invitationScenes.arrival.choices[0].reaction.en)).toBeInTheDocument()
    expect(screen.queryByText(invitationScenes.explain.choices[0].line.th)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Thai translation: off'}))
    expect(screen.getByText(invitationScenes.explain.choices[0].line.th)).toBeInTheDocument()
    rerender(<MonkChatStoryPlayer isEnglish={false} />)
    expect(currentScene()).toBe('explain')
    expect(screen.getByText(invitationScenes.explain.title.th)).toBeInTheDocument()
  })

  it('does not carry another student’s round into a changed identity', () => {
    const {rerender}=render(<MonkChatStoryPlayer studentCode="student-a" />); start(); choose(0)
    rerender(<MonkChatStoryPlayer studentCode="student-b" />)
    expect(screen.getByRole('button',{name:/เริ่มเรื่องราว/})).toBeInTheDocument()
    start(); expect(currentScene()).toBe('arrival')
  })

  it('warns before navigation leaves an active unsaved round', () => {
    render(<><a href="/activities">Leave page</a><MonkChatStoryPlayer /></>); start()
    const confirm=vi.spyOn(window,'confirm').mockReturnValue(false)
    const event=new MouseEvent('click',{bubbles:true,cancelable:true})
    screen.getByRole('link',{name:'Leave page'}).dispatchEvent(event)
    expect(confirm).toHaveBeenCalledOnce(); expect(event.defaultPrevented).toBe(true)
  })
})
