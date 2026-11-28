import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storyChapters, storyArt, validateStoryChapters } from '../../content/monkChatChapters'
import { MonkChatStoryPlayer } from './MonkChatStoryPlayer'

function advance(index = 0) {
  fireEvent.click(within(screen.getByRole('group',{name:'Your response'})).getAllByRole('button')[index])
  act(()=>{vi.advanceTimersByTime(500)})
}
function openChapter(index:number) {
  const nav=screen.getByRole('navigation',{name:'Choose a story chapter'})
  fireEvent.click(within(nav).getAllByRole('button')[index])
}

describe('Complete Monk Chat chapter path',()=>{
  beforeEach(()=>{
    vi.useFakeTimers()
    Object.defineProperty(HTMLDialogElement.prototype,'showModal',{configurable:true,value(){this.open=true}})
    Object.defineProperty(HTMLDialogElement.prototype,'close',{configurable:true,value(){this.open=false}})
  })
  afterEach(()=>{vi.clearAllTimers();vi.useRealTimers();vi.restoreAllMocks()})

  it('has eight independently playable bilingual chapters with no dead ends or missing continuation targets',()=>{
    expect(storyChapters).toHaveLength(8)
    expect(validateStoryChapters()).toEqual([])
    for(const chapter of storyChapters){
      const walk=(id:string,path:string[]):number=>{
        expect(path).not.toContain(id)
        const scene=chapter.scenes[id]
        expect(scene).toBeDefined()
        expect(scene.title.th.trim()).not.toBe('');expect(scene.title.en.trim()).not.toBe('')
        expect(scene.setting.th.trim()).not.toBe('');expect(scene.setting.en.trim()).not.toBe('')
        expect(storyArt[scene.visual]).toBeDefined()
        if(scene.ending)return 1
        expect(scene.choices.length).toBeGreaterThan(0)
        return scene.choices.reduce((count,choice)=>{
          for(const field of [choice.line,choice.reaction,choice.takeaway]){expect(field.th.trim()).not.toBe('');expect(field.en.trim()).not.toBe('')}
          return count+walk(choice.next,[...path,id])
        },0)
      }
      expect(walk(chapter.start,[])).toBeGreaterThan(1)
    }
  })

  it('uses newly generated chapter images rather than recycling invitation pictures for chapters 2–8',()=>{
    const covers=new Set<string>()
    for(const chapter of storyChapters.slice(1)){
      covers.add(storyArt[chapter.cover].src)
      const images=new Set(Object.values(chapter.scenes).map(scene=>storyArt[scene.visual].src))
      expect(images.size).toBeGreaterThanOrEqual(2)
      for(const path of images)expect(path).toMatch(/\/chapters\/.+\.png$/)
    }
    expect(covers.size).toBe(7)
  })

  for(const [index,chapter] of storyChapters.entries()){
    it(`plays ${chapter.id} to a chapter-specific ending with only that chapter's decisions`,()=>{
      render(<MonkChatStoryPlayer isEnglish />);openChapter(index)
      expect(screen.getByRole('dialog')).toHaveAccessibleName(`Monk Chat event · Chapter ${index+1}`)
      let id=chapter.start,decisions=0
      while(!chapter.scenes[id].ending){
        expect(document.querySelector('[data-scene]')).toHaveAttribute('data-scene',id)
        id=chapter.scenes[id].choices[0].next;advance();decisions++
        expect(decisions).toBeLessThan(20)
      }
      expect(screen.getByTestId('story-ending-view')).toHaveTextContent(`CHAPTER ${index+1} COMPLETE`)
      expect(screen.getAllByRole('listitem')).toHaveLength(decisions)
      expect(screen.getByTestId('story-ending-view')).not.toHaveTextContent('100%')
      fireEvent.click(screen.getByRole('button',{name:'Choose another chapter'}))
      expect(screen.getByRole('status')).toHaveTextContent('1 / 8')
    })
  }

  it('continues from chapter 1 to chapter 2 with a fresh local history and new picture',()=>{
    render(<MonkChatStoryPlayer isEnglish />);openChapter(0)
    advance();advance();advance();advance()
    fireEvent.click(screen.getByRole('button',{name:/Continue to chapter 2/}))
    expect(screen.getByTestId('monk-chat-story-player')).toHaveAttribute('data-chapter','welcome')
    expect(document.querySelector('[data-scene]')).toHaveAttribute('data-scene','seats')
    expect(screen.getByRole('img')).toHaveAttribute('src',storyArt.welcome.src)
    expect(screen.queryByRole('button',{name:'Reconsider your last choice'})).not.toBeInTheDocument()
  })

  it('skips guidance and post-meditation when visitors choose conversation only',()=>{
    render(<MonkChatStoryPlayer isEnglish />);openChapter(3)
    advance(0);advance(0);advance(1)
    expect(document.querySelector('[data-scene]')).toHaveAttribute('data-scene','chat-only')
    expect(screen.getByRole('button',{name:/Continue to chapter 7/})).toBeInTheDocument()
    expect(screen.queryByRole('button',{name:/Continue to chapter 5|Continue to chapter 6/})).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:/Continue to chapter 7/}))
    expect(screen.getByTestId('monk-chat-story-player')).toHaveAttribute('data-chapter','photo')
  })

  it('accepts declining the group photo and continues to goodbye without inventing a photo',()=>{
    render(<MonkChatStoryPlayer isEnglish />);openChapter(6)
    advance();advance(2)
    expect(document.querySelector('[data-scene]')).toHaveAttribute('data-scene','no-photo')
    expect(screen.getByText(/No photo was taken\./)).toBeInTheDocument()
    expect(screen.getByRole('button',{name:/Continue to chapter 8/})).toBeInTheDocument()
  })

  it('resets chapter progress and cancels pending transitions when the student changes',()=>{
    const {rerender}=render(<MonkChatStoryPlayer isEnglish studentCode="one" />);openChapter(7)
    advance(2);fireEvent.click(screen.getByRole('button',{name:'Choose another chapter'}))
    expect(screen.getByRole('status')).toHaveTextContent('1 / 8')
    openChapter(2)
    fireEvent.click(within(screen.getByRole('group',{name:'Your response'})).getAllByRole('button')[0])
    rerender(<MonkChatStoryPlayer isEnglish studentCode="two" />)
    act(()=>{vi.advanceTimersByTime(500)})
    expect(screen.getByRole('status')).toHaveTextContent('0 / 8')
    expect(screen.getByTestId('monk-chat-story-player')).toHaveAttribute('data-chapter','invitation')
  })
})
