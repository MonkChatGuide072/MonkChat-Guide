import { describe, expect, it } from 'vitest'
import { routedChapters, routeArt, getRouteConclusion, getRouteEffect, validateRouteConsequences, type RouteStep } from './monkChatRoutes'

function paths(chapter:typeof routedChapters[number],id=chapter.start,history:RouteStep[]=[],seen:string[]=[]):RouteStep[][] {
  if(seen.includes(id))throw new Error(`Cycle: ${chapter.id}/${id}`)
  const scene=chapter.scenes[id]
  if(scene.ending)return [history]
  if(!scene.choices.length)throw new Error(`Dead end: ${chapter.id}/${id}`)
  return scene.choices.flatMap((choice,choiceIndex)=>paths(chapter,choice.next,[...history,{sceneId:id,choiceIndex}],[...seen,id]))
}
const photo=routedChapters.find(ch=>ch.id==='photo')!
const prefix:RouteStep[]=[{sceneId:'permission',choiceIndex:0},{sceneId:'opt-out',choiceIndex:0},{sceneId:'space',choiceIndex:2}]
describe('Consequences persist across all eight story chapters',()=>{
  it('audits every complete route rather than sampling only the first choices',()=>{
    const chapters=routedChapters.map(ch=>({id:ch.id,scenes:Object.keys(ch.scenes).length,choices:Object.values(ch.scenes).reduce((n,s)=>n+s.choices.length,0),routes:paths(ch).length}))
    console.info('ROUTE_AUDIT',JSON.stringify(chapters))
    expect(chapters).toHaveLength(8)
    expect(chapters.every(ch=>ch.routes>1)).toBe(true)
  })
  it('authors a bilingual consequence for every offered choice and ships every illustration',()=>{
    expect(validateRouteConsequences()).toEqual([])
    for(const art of Object.values(routeArt))expect(art.src).toMatch(/^\/images\/nisit-stories\/.*\.png$/)
  })
  it.each(routedChapters.map(ch=>[ch.id,ch] as const))('%s: every route terminates and has a distinct bilingual decision trail',(_id,ch)=>{
    const routes=paths(ch),ids=new Set<string>(),th=new Set<string>(),en=new Set<string>()
    for(const history of routes){
      const result=getRouteConclusion(ch,history)
      ids.add(result.id)
      th.add(result.effects.map(e=>e.after.th).join('\n')+'\n'+result.epilogue.th)
      en.add(result.effects.map(e=>e.after.en).join('\n')+'\n'+result.epilogue.en)
      expect(result.effects).toHaveLength(history.length)
      expect(routeArt[result.visual]).toBeDefined()
      expect(result.pending.length>0).toBe(result.kind==='unresolved')
    }
    expect(ids.size).toBe(routes.length);expect(th.size).toBe(routes.length);expect(en.size).toBe(routes.length)
  })
  it('keeps the photo boundary unresolved when ignored and debriefs privately',()=>{
    const result=getRouteConclusion(photo,[...prefix,{sceneId:'contact',choiceIndex:0}])
    expect(result.kind).toBe('unresolved');expect(result.pending).toContain('space')
    expect(result.epilogue.th).toContain('เป็นการส่วนตัว');expect(result.visual).toBe('photo-coach')
  })
  it('distinguishes a courteous repair, a harsh response, and an apology after it',()=>{
    const repaired=getRouteConclusion(photo,[...prefix,{sceneId:'contact',choiceIndex:1},{sceneId:'sharing',choiceIndex:0}])
    const harsh=getRouteConclusion(photo,[...prefix,{sceneId:'contact',choiceIndex:2},{sceneId:'hurt',choiceIndex:1}])
    const apology=getRouteConclusion(photo,[...prefix,{sceneId:'contact',choiceIndex:2},{sceneId:'hurt',choiceIndex:0},{sceneId:'sharing',choiceIndex:0}])
    expect(repaired.kind).toBe('repaired');expect(harsh.kind).toBe('unresolved');expect(harsh.pending).toContain('tone');expect(apology.kind).toBe('repaired')
    expect(new Set([repaired.id,harsh.id,apology.id]).size).toBe(3)
  })
  it('rewinding discards concerns from the abandoned branch and does not leak into another chapter',()=>{
    expect(getRouteConclusion(photo,[...prefix,{sceneId:'contact',choiceIndex:0}]).pending).toContain('space')
    const rewind=[...prefix.slice(0,-1),{sceneId:'space',choiceIndex:0},{sceneId:'sharing',choiceIndex:0}]
    expect(getRouteConclusion(photo,rewind).kind).toBe('clear')
    expect(getRouteConclusion(routedChapters[0],[]).pending).toEqual([])
  })
  it('never shows a completed group photo when the learner respects an opt-out',()=>{
    const result=getRouteConclusion(photo,[{sceneId:'permission',choiceIndex:0},{sceneId:'opt-out',choiceIndex:2}])
    expect(result.visual).toBe('farewell-good')
  })
  it('keeps distinct consequences when choices reconverge on a shared next scene',()=>{
    const ch=routedChapters[0]
    expect(getRouteEffect(ch.id,{sceneId:'friend',choiceIndex:0}).after).not.toEqual(getRouteEffect(ch.id,{sceneId:'friend',choiceIndex:1}).after)
  })
})
