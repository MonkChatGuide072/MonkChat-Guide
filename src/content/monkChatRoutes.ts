import { storyArt, type StoryChapter } from './monkChatChapters'
import type { StoryText } from './monkChatInvitation'
import { createRouteChapters } from './monkChatRouteBranches'
import { routeEffects, type Concern, type RouteEffect } from './monkChatRouteEffects'
export const routedChapters=createRouteChapters()
export interface RouteStep {sceneId:string;choiceIndex:number}
const t=(th:string,en:string):StoryText=>({th,en})
export const concernFeedback:Record<Concern,StoryText>={
  pressure:t('รับคำลังเลหรือคำปฏิเสธก่อน อย่าชวนซ้ำจนผู้มาเยือนต้องเดินหนี','Acknowledge hesitation or refusal instead of repeating pressure until the visitor leaves.'),
  seating:t('ถามความสะดวกและเว้นพื้นที่ให้นั่ง ก่อนเร่งเริ่มกิจกรรม','Check comfort and seating space before rushing the activity.'),
  instructions:t('บอกข้อปฏิบัติให้ตรงกับพื้นที่กลางแจ้ง และแก้ข้อมูลเมื่อไม่ตรงบริบท','Match instructions to the outdoor setting and correct mismatched information.'),
  privacy:t('ถามทีละเรื่อง ให้เขาเลือกเล่า และเคารพเรื่องที่ไม่อยากเปิดเผย','Ask one thing at a time and respect what the visitor prefers not to disclose.'),
  clarity:t('ใช้คำง่ายและเช็กความเข้าใจ อย่าตีความการพยักหน้าว่าเข้าใจแล้ว','Use accessible words and check understanding rather than relying on a polite nod.'),
  consent:t('การมานั่งคุยไม่ได้แปลว่ายินยอมฝึกสมาธิ ต้องให้สิทธิ์เลือกจริง','Joining a conversation is not consent to meditate; preserve a real choice.'),
  comfort:t('เมื่อผู้ฝึกไม่สบาย ให้ปรับท่าหรือพัก ไม่สั่งให้ทนต่อ','When someone is uncomfortable, allow adjustment or a pause rather than insisting they endure it.'),
  pace:t('เว้นจังหวะให้ผู้ฝึกทำตาม อย่าพูดต่อเพียงเพื่อให้ครบคำที่เตรียมมา','Leave time to practise instead of speaking just to complete the prepared script.'),
  expectation:t('ฟังประสบการณ์จริง ไม่กำหนดว่าทุกคนต้องเห็นภาพหรือรู้สึกเหมือนกัน','Listen to the actual experience without requiring a particular image or feeling.'),
  'photo-consent':t('ถามก่อนถ่าย และให้แต่ละคนปฏิเสธได้โดยไม่ต้องรับหน้าที่อื่นแทน','Ask before a photo and allow opting out without assigning another task.'),
  space:t('อธิบายระยะอย่างสุภาพตั้งแต่แรก ผู้มาเยือนไม่ทราบธรรมเนียม จึงเป็นหน้าที่เราที่ต้องบอกให้ชัด','Explain spacing courteously from the start. A visitor may not know the custom; it is our responsibility to communicate it.'),
  tone:t('รักษาขอบเขตได้โดยไม่ทำให้ผู้มาเยือนเสียหน้า และขอโทษน้ำเสียงได้เมื่อพูดห้วน','Maintain the boundary without embarrassing the visitor, and apologize for a harsh tone when needed.'),
  time:t('เมื่อผู้มาเยือนบอกว่าต้องไป ให้จบตามเวลานั้น ไม่เพิ่มข้อมูลที่เขาไม่ได้ขอ','When visitors need to leave, respect the time and avoid adding unwanted information.'),
}
export const routeArt:Record<string,{src:string;alt:StoryText}>={...storyArt}
for(const ch of routedChapters){
  routeArt[`${ch.id}-good`]={src:`/images/nisit-stories/outcomes/${ch.id}-good.png`,alt:t(`ฉากผลลัพธ์ที่เป็นมิตร: ${ch.title.th}`,`A friendly outcome: ${ch.title.en}`)}
  routeArt[`${ch.id}-coach`]={src:`/images/nisit-stories/outcomes/${ch.id}-coach.png`,alt:t(`พระอาจารย์พูดคุยกับพระนิสิตเป็นการส่วนตัว: ${ch.title.th}`,`A private discussion with the supervising monk: ${ch.title.en}`)}
}
routeArt['photo-close']={src:'/images/nisit-stories/outcomes/photo-close.png',alt:t('ผู้มาเยือนหญิงอีกคนยืนใกล้และจับแขนเพราะยังไม่ทราบธรรมเนียม แอนนายังอยู่นอกภาพ','Another woman stands close and holds an arm, unaware of the custom; Anna remains outside the photo')}
routeArt['photo-hurt']={src:'/images/nisit-stories/outcomes/photo-hurt.png',alt:t('ผู้มาเยือนถอยออกอย่างอึดอัดหลังได้ยินคำพูดห้วน','The visitor steps back uncomfortably after a harsh response')}

export function getRouteEffect(chapterId:string,step:RouteStep):RouteEffect {
  const id=`${chapterId}/${step.sceneId}/${step.choiceIndex}`
  const effect=routeEffects[id]
  if(!effect)throw new Error(`Missing authored consequence: ${id}`)
  return effect
}
/** A route is its entire ordered decision history, not just the final shared scene ID.
 * Rewinding recomputes the concern ledger, so a discarded decision leaves no hidden penalty.
 */
export function getRouteConclusion(chapter:StoryChapter,history:RouteStep[]){
  const effects=history.map(step=>getRouteEffect(chapter.id,step))
  const pending=new Set<Concern>(),encountered=new Set<Concern>(),repaired=new Set<Concern>()
  for(const effect of effects){
    for(const issue of effect.resolves){if(pending.has(issue))repaired.add(issue);pending.delete(issue)}
    if(effect.raises){pending.add(effect.raises);encountered.add(effect.raises);repaired.delete(effect.raises)}
  }
  const id=[chapter.id,...effects.map(e=>e.id.split('/').slice(1).join(':'))].join('|')
  const kind=pending.size?'unresolved':encountered.size?'repaired':'clear'
  const title=kind==='unresolved'?t('ปลายทางที่ยังมีเรื่องค้างให้แก้','An outcome with an unresolved issue'):kind==='repaired'?t('พลาดระหว่างทาง แต่คุณกลับมาแก้ได้','A difficult turn, followed by a repair'):chapter.completion
  const feedback=Array.from(kind==='unresolved'?pending:encountered).map(issue=>concernFeedback[issue])
  let epilogue:StoryText
  if(kind==='unresolved')epilogue=t(`ก่อนกลับจากกิจกรรม พระอาจารย์เรียกคุณมาคุยเป็นการส่วนตัวว่า “${feedback.map(f=>f.th).join(' ')}”`,`Before leaving the activity, the supervising monk privately reminds you: “${feedback.map(f=>f.en).join(' ')}”`)
  else if(kind==='repaired')epilogue=t(`พระอาจารย์คุยกับคุณเป็นการส่วนตัวว่า คุณสังเกตปัญหาและแก้สถานการณ์ได้แล้ว ครั้งหน้าควรเริ่มให้ชัดตั้งแต่แรก: ${feedback.map(f=>f.th).join(' ')}`,`In a private debrief, the supervising monk notes that you noticed and repaired the problem. Next time, make the opening clear: ${feedback.map(f=>f.en).join(' ')}`)
  else epilogue=effects.at(-1)?.after??chapter.completion
  const last=effects.at(-1)
  const ending=last?chapter.scenes[history.at(-1)!.sceneId].choices[history.at(-1)!.choiceIndex].next:null
  const departure=kind==='clear'&&((chapter.id==='photo'&&ending==='no-photo')||(chapter.id==='invitation'&&ending==='declined'))
  return {id,kind,title,epilogue,effects,pending:Array.from(pending),repaired:Array.from(repaired),visual:departure?'farewell-good':`${chapter.id}-${kind==='clear'?'good':'coach'}`}
}

/** Completeness check: every offered response has a distinct authored consequence. */
export function validateRouteConsequences():string[]{
  const errors:string[]=[],used=new Set<string>()
  for(const ch of routedChapters){
    const reached=new Set<string>(),todo=[ch.start]
    while(todo.length){const id=todo.pop()!;if(reached.has(id))continue;reached.add(id);const scene=ch.scenes[id];if(!scene){errors.push(`Missing scene ${ch.id}/${id}`);continue}todo.push(...scene.choices.map(c=>c.next))}
    for(const [id,scene] of Object.entries(ch.scenes)){
      if(!reached.has(id))errors.push(`Unreachable ${ch.id}/${id}`)
      if(!routeArt[scene.visual])errors.push(`Missing image ${scene.visual}`)
      scene.choices.forEach((choice,index)=>{const key=`${ch.id}/${id}/${index}`;used.add(key);const effect=routeEffects[key];if(!effect||!effect.after.th.trim()||!effect.after.en.trim())errors.push(`Missing consequence ${key}`);if(!ch.scenes[choice.next])errors.push(`Missing target ${key}`)})
    }
  }
  for(const id of Object.keys(routeEffects))if(!used.has(id))errors.push(`Orphan consequence ${id}`)
  return errors
}
