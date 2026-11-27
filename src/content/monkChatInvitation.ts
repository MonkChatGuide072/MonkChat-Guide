export type StoryText = { th: string; en: string }
export type InvitationChoice = {
  line: StoryText
  reaction: StoryText
  takeaway: StoryText
  next: string
  action?: boolean
}
export type InvitationVisual = 'arrival' | 'listening' | 'time' | 'hesitant' | 'joined' | 'farewell'
export type InvitationScene = {
  visual: InvitationVisual
  title: StoryText
  setting: StoryText
  visitor?: StoryText
  choices: InvitationChoice[]
  ending?: 'joined' | 'brief' | 'declined'
}
const text = (th: string, en: string): StoryText => ({ th, en })
const choice = (th: string, en: string, responseTh: string, responseEn: string, tipTh: string, tipEn: string, next: string, action = false): InvitationChoice => ({
  line: text(th, en), reaction: text(responseTh, responseEn), takeaway: text(tipTh, tipEn), next, action,
})

// Owner-described activity context; dialogue is a reviewable training draft, not an event transcript.
export const invitationScenes: Record<string, InvitationScene> = {
  arrival: { visual: 'arrival',
    title: text('คนกลุ่มหนึ่งกำลังเดินผ่าน', 'A group is walking past'),
    setting: text('บ่ายวันหนึ่ง คุณยืนอยู่ข้างจุดกิจกรรม Monk Chat ที่วัดมหาธาตุ นักท่องเที่ยวสามคนเดินมาช้า ๆ คนหนึ่งมองป้าย อีกสองคนยังคุยกัน คุณเว้นทางเดินไว้ แล้วจะเริ่มอย่างไร?', 'One afternoon, you are beside the Monk Chat activity area at Wat Mahathat. Three visitors approach slowly. One looks at the sign while the others talk. You leave the path clear. How will you begin?'),
    choices: [
      choice('สวัสดีครับ สนใจฟังเรื่องกิจกรรม Monk Chat สักครู่ไหมครับ', 'Hello! Would you like to hear a little about Monk Chat?', 'คนที่มองป้ายหยุดฟัง: “Monk Chat คืออะไรหรือครับ?”', 'The visitor looking at the sign stops: “What is Monk Chat?”', 'เริ่มด้วยคำชวนสั้น ๆ ให้เขาตัดสินใจว่าจะหยุดฟังหรือไม่', 'A short invitation lets the visitor decide whether to stop.', 'explain'),
      choice('สวัสดีครับ อยากลองนั่งสมาธิสั้น ๆ ประมาณห้านาทีไหมครับ', 'Hello! Would you like to try a short meditation, about five minutes?', 'คนหนึ่งหันมา: “ห้านาทีหรือครับ? เรามีเวลาไม่มาก รวมทั้งหมดนานแค่ไหน?”', 'One visitor turns: “Five minutes? We do not have much time. How long would the whole visit take?”', 'บอกกิจกรรมและระยะเวลาคร่าว ๆ ได้ แต่ต้องแยกเวลานั่งออกจากเวลาร่วมกิจกรรมทั้งหมด', 'A brief description helps, but distinguish meditation time from the whole visit.', 'time'),
      choice('รอให้เขาคุยจบ แล้วสบตาและยิ้มโดยไม่ขวางทาง', 'Wait for a pause, then make eye contact and smile without blocking the path.', 'เมื่อคุยจบ คนหนึ่งยิ้มตอบและชะลอเดิน: “สวัสดีครับ”', 'After a pause, one visitor smiles and slows down: “Hello.”', 'การเว้นจังหวะช่วยไม่ขัดบทสนทนา เมื่อเขาตอบรับจึงค่อยแนะนำกิจกรรม', 'Waiting avoids interrupting. A response gives you an opening to introduce the activity.', 'opening', true),
    ],
  },
  opening: { visual: 'listening',
    title: text('มีจังหวะให้เริ่มคุย', 'An opening to speak'),
    setting: text('เขาหยุดทักคุณแล้ว แต่เพื่อนยังยืนรออยู่ ควรแนะนำกิจกรรมให้เข้าใจได้ในประโยคเดียว', 'One visitor has greeted you, while their friends wait nearby. Introduce the activity in one clear sentence.'),
    visitor: text('สวัสดีครับ ที่ป้ายนั้นเป็นกิจกรรมอะไรครับ', 'Hello. What is the activity on that sign?'),
    choices: [
      choice('ที่นี่คือ Monk Chat ครับ มาพูดคุยกับพระและลองสมาธิสั้น ๆ ได้ สนใจฟังเพิ่มเติมไหมครับ', 'This is Monk Chat. You can talk with monks and try a short meditation. Would you like to hear more?', 'เขาหันไปชวนเพื่อนหยุดด้วย: “ฟังดูน่าสนใจ แล้วต้องทำอะไรบ้างครับ?”', 'The visitor gestures to their friends to stop: “That sounds interesting. What would we do?”', 'อธิบายกิจกรรมก่อนชวน ไม่สมมติว่าผู้มาเยือนรู้จัก Monk Chat อยู่แล้ว', 'Explain what Monk Chat involves instead of assuming it is familiar.', 'explain'),
      choice('เข้ามาตรงนี้ก่อนเลยครับ เดี๋ยวเราจะเริ่มแล้ว', 'Come over here now; we are about to start.', 'เขาชะงัก: “ต้องเข้าร่วมเลยหรือครับ? เรายังไม่ได้ตัดสินใจ”', 'The visitor hesitates: “Do we have to join now? We have not decided yet.”', 'ประโยคที่เร่งให้เข้ามาอาจฟังเหมือนคำสั่ง ยังแก้ด้วยการให้ทางเลือกได้', 'An urgent invitation can sound like an instruction. You can repair it by restoring a choice.', 'repair'),
    ],
  },
  explain: { visual: 'listening',
    title: text('อธิบายให้เห็นภาพ', 'Make the invitation clear'),
    setting: text('ตอนนี้ทั้งกลุ่มหันมาฟัง คุณมีโอกาสอธิบายสั้น ๆ ว่าเขาจะได้ทำอะไร โดยไม่เริ่มบรรยายยาว', 'The group is listening now. Explain what they can do, without turning the invitation into a long talk.'),
    visitor: text('Monk Chat คืออะไร แล้วถ้าเข้าร่วมเราต้องทำอะไรบ้างครับ', 'What is Monk Chat, and what would we do if we joined?'),
    choices: [
      choice('เราพูดคุยกันเรื่องชีวิตพระหรือคำถามที่คุณสนใจครับ ถ้าอยากลอง ก็นั่งสมาธิสั้น ๆ ร่วมกันได้', 'We can talk about monastic life or questions you are interested in. You can also try a short meditation if you like.', 'คนหนึ่งพยักหน้า แต่เพื่อนถาม: “ถ้าฉันอยากคุยอย่างเดียว ไม่ได้นั่งสมาธิ ได้ไหม?”', 'One visitor nods, but a friend asks: “Can I just talk without meditating?”', 'บอกสิ่งที่จะเกิดขึ้นให้ชัด แล้วเปิดพื้นที่ให้แต่ละคนเลือกกิจกรรม', 'Describe the activities clearly and leave room for individual preferences.', 'friend'),
      choice('คุณอยากพูดคุยก่อน หรือลองนั่งสมาธิประมาณห้านาทีครับ เลือกได้ตามสะดวก', 'Would you prefer to chat first, or try about five minutes of meditation? You can choose.', 'เขามองนาฬิกา: “เราอาจมีเวลาแค่ไม่กี่นาที แล้วกิจกรรมทั้งหมดใช้เท่าไรครับ?”', 'The visitor checks the time: “We may only have a few minutes. How long does the whole activity take?”', 'การเสนอทางเลือกช่วย แต่ควรตอบเรื่องเวลาตามจริงก่อนให้เขาตกลง', 'Options help, but clarify timing before asking for a commitment.', 'time'),
    ],
  },
  time: { visual: 'time',
    title: text('เขามีเวลาไม่มาก', 'They have limited time'),
    setting: text('คุณยังไม่ทราบเวลาที่กลุ่มต้องออกจากวัด อย่ารับปากว่าทุกอย่างจะจบภายในห้านาที', 'You do not yet know when the group needs to leave. Avoid promising that the whole visit will fit into five minutes.'),
    visitor: text('เรามีเวลาไม่มากครับ ห้านาทีนั้นรวมพูดคุยด้วยหรือเปล่า', 'We do not have much time. Does five minutes include the conversation?'),
    choices: [
      choice('ห้านาทีคือช่วงนั่งสมาธิครับ ถ้ารวมพูดคุยจะนานกว่านั้น คุณต้องออกจากที่นี่เมื่อไรครับ', 'Five minutes is the meditation itself. The conversation would take longer. When do you need to leave?', 'เขาตอบ: “เรานัดเพื่อนอีกสิบนาที คงแวะคุยสั้น ๆ ได้ แต่ยังไม่นั่งสมาธิ”', 'The visitor replies: “We meet a friend in ten minutes. We could have a brief chat, but not meditate now.”', 'แยกเวลาของแต่ละกิจกรรม และถามข้อจำกัดก่อนเสนอสิ่งที่เหมาะ', 'Separate the activity times and ask about their schedule before suggesting a plan.', 'brief_chat'),
      choice('ถ้ากำลังรีบ ไม่เป็นไรเลยครับ เดินชมต่อได้ แล้วค่อยกลับมาเมื่อสะดวก', 'If you are in a hurry, that is quite all right. Enjoy your visit, and come back if you have time.', 'เขายิ้ม: “ขอบคุณที่เข้าใจครับ วันนี้เราคงต้องไปก่อน”', 'The visitor smiles: “Thank you for understanding. We need to go for now.”', 'จบการชวนอย่างสุภาพได้โดยไม่ต้องพยายามให้เขาเข้าร่วมทุกครั้ง', 'A respectful invitation can end without participation.', 'declined'),
    ],
  },
  friend: { visual: 'hesitant',
    title: text('คนในกลุ่มอยากทำต่างกัน', 'Different preferences in one group'),
    setting: text('คนหนึ่งสนใจสมาธิ แต่อีกคนอยากพูดคุยเท่านั้น คำตอบของคุณควรทำให้ทั้งสองคนรู้ว่าตนเองมีทางเลือก', 'One visitor is interested in meditation; another only wants to talk. Help both understand their options.'),
    visitor: text('ฉันคุยอย่างเดียวได้ไหมคะ ยังไม่แน่ใจว่าอยากนั่งสมาธิ', 'Could I just talk? I am not sure I want to meditate.'),
    choices: [
      choice('ได้ครับ ไม่จำเป็นต้องนั่งสมาธิ คุณอยากเริ่มด้วยการพูดคุยกันทั้งกลุ่มไหมครับ', 'Of course. Meditation is optional. Would your group like to start with a conversation?', 'ทั้งกลุ่มปรึกษากัน แล้วคนหนึ่งตอบ: “ได้ครับ เรามาคุยกันก่อน แล้วค่อยตัดสินใจ”', 'They briefly confer, then one visitor says: “Yes, let us talk first and decide about meditation later.”', 'ยืนยันทางเลือกของแต่ละคน แล้วชวนเริ่มจากสิ่งที่ทั้งกลุ่มสะดวก', 'Respect individual choices and suggest a starting point the group is comfortable with.', 'where'),
      choice('ได้ครับ คุณคุยอย่างเดียวได้ ส่วนเพื่อนค่อยตัดสินใจเรื่องสมาธิเมื่อพร้อม', 'Certainly. You can just chat, and your friends can decide about meditation when they are ready.', 'เพื่อนในกลุ่มดูผ่อนคลาย: “ดีเลยครับ งั้นเราขอแวะเข้าไปคุยก่อน”', 'The group seems more at ease: “That works for us. We would like to come over and chat.”', 'ไม่ต้องตัดสินใจแทนทั้งกลุ่ม และไม่ต้องให้ทุกคนทำเหมือนกัน', 'Avoid deciding for the whole group or requiring identical participation.', 'where'),
    ],
  },
  brief_chat: { visual: 'time',
    title: text('ตกลงขอบเขตให้ตรงกัน', 'Agree on a brief visit'),
    setting: text('เขาบอกว่ามีนัดในสิบนาที ตอนนี้จุดสำคัญคือชวนต่อให้ตรงกับสิ่งที่ตกลง ไม่เปลี่ยนไปพานั่งสมาธิ', 'They have an appointment in ten minutes. Keep the invitation consistent with their wish for a short conversation.'),
    visitor: text('ถ้าอย่างนั้น ขอคุยสั้น ๆ ก่อนได้ไหมครับ', 'In that case, could we just have a brief chat?'),
    choices: [
      choice('ได้เลยครับ คุยสั้น ๆ ได้ และถ้าต้องไปเมื่อไรก็บอกผมได้ครับ', 'Of course. We can keep it brief, and please let me know when you need to leave.', 'เขาพยักหน้า: “ขอบคุณครับ แล้วเราควรไปตรงไหน?”', 'The visitor nods: “Thank you. Where should we go?”', 'ย้ำข้อตกลงเรื่องเวลาและให้เขาบอกได้เมื่อต้องไป', 'Confirm the time limit and make it easy for them to leave.', 'brief_where'),
    ],
  },
  repair: { visual: 'hesitant',
    title: text('ลดความกดดันแล้วชวนใหม่', 'Repair an invitation that felt rushed'),
    setting: text('เขายังไม่ได้ปฏิเสธ แต่คำชวนก่อนหน้าทำให้รู้สึกว่าต้องรีบตัดสินใจ คุณยังแก้จังหวะนี้ได้', 'They have not declined, but the earlier invitation felt rushed. You can still repair the interaction.'),
    visitor: text('ต้องเข้าร่วมเลยหรือครับ เรายังไม่ได้ตัดสินใจ', 'Do we have to join now? We have not decided yet.'),
    choices: [
      choice('ขอโทษครับ ไม่ต้องรีบตัดสินใจ สนใจฟังว่ากิจกรรมเป็นอย่างไรก่อนไหมครับ', 'I am sorry. There is no need to decide now. Would you like to hear what the activity involves first?', 'เขาผ่อนท่าที: “ได้ครับ ช่วยเล่าสั้น ๆ ให้ฟังหน่อย”', 'The visitor relaxes: “All right. Could you explain it briefly?”', 'ยอมรับว่าชวนเร็วไป และคืนสิทธิ์การตัดสินใจให้ผู้มาเยือน', 'Acknowledge the rush and restore the visitor’s choice.', 'explain'),
      choice('ไม่จำเป็นต้องร่วมครับ ขอบคุณที่แวะฟัง ขอให้เที่ยวอย่างมีความสุขนะครับ', 'You do not have to join. Thank you for stopping, and enjoy your visit.', 'เขายิ้มตอบ: “ขอบคุณครับ ไว้โอกาสหน้า”', 'The visitor smiles: “Thank you. Maybe another time.”', 'การคลี่คลายแล้วกล่าวลาอย่างสุภาพก็เป็นผลลัพธ์ที่เหมาะสม', 'Repairing the tone and ending politely is also an appropriate outcome.', 'declined'),
    ],
  },
  where: { visual: 'listening',
    title: text('ชวนไปยังจุดกิจกรรม', 'Guide them to the activity area'),
    setting: text('กลุ่มตกลงจะพูดคุยก่อน คุณชี้ไปยังที่นั่งข้างป้าย Monk Chat โดยยังเว้นทางเดินให้คนอื่น', 'The group has agreed to chat first. You indicate the seats beside the Monk Chat sign, keeping the walkway clear.'),
    visitor: text('เราจะนั่งตรงไหนครับ', 'Where should we sit?'),
    choices: [
      choice('เชิญตรงที่นั่งข้างป้าย Monk Chat ครับ เราเริ่มจากพูดคุยกันก่อน', 'Please come to the seats beside the Monk Chat sign. We can start with a conversation.', 'ทั้งกลุ่มเดินตามไปยังที่นั่ง: “ขอบคุณครับ”', 'The group moves towards the seats: “Thank you.”', 'บอกตำแหน่งที่ชัดและทวนสิ่งที่ตกลงไว้ การต้อนรับที่นั่งเป็นบทฝึกถัดไป', 'Give a clear location and confirm the plan. Welcoming them at the seats belongs to the next chapter.', 'joined'),
    ],
  },
  brief_where: { visual: 'listening',
    title: text('พาไปคุยตามเวลาที่มี', 'Keep the visit brief'),
    setting: text('กลุ่มพร้อมแวะคุยสั้น ๆ เท่านั้น คุณยังไม่เริ่มขั้นตอนสมาธิ', 'The group is ready for a brief chat only. Do not begin meditation instructions.'),
    visitor: text('เราควรไปตรงไหนครับ', 'Where should we go?'),
    choices: [
      choice('เชิญที่นั่งข้างป้ายนี้ครับ เราคุยสั้น ๆ ตามเวลาที่คุณสะดวกได้', 'Please come to the seats beside this sign. We can keep the conversation within the time you have.', 'เขาเดินไปยังที่นั่งกับเพื่อน: “ดีเลยครับ ขอบคุณ”', 'The visitor walks towards the seats with the group: “That is great. Thank you.”', 'รักษาข้อตกลงว่าเป็นการคุยสั้น ๆ ไม่ขยายเป็นกิจกรรมที่เขายังไม่ตอบรับ', 'Keep the agreed brief conversation rather than expanding it into an activity they have not accepted.', 'brief'),
    ],
  },
  joined: { visual: 'joined', title: text('กลุ่มตอบรับคำชวน', 'The group accepted the invitation'), setting: text('คุณชวนกลุ่มไปพูดคุยที่จุดกิจกรรมได้ โดยยังเปิดให้แต่ละคนตัดสินใจเรื่องสมาธิภายหลัง', 'You invited the group to the conversation area, leaving meditation as an individual choice for later.'), ending: 'joined', choices: [] },
  brief: { visual: 'joined', title: text('ตกลงแวะคุยสั้น ๆ', 'A brief conversation was agreed'), setting: text('คุณตอบเรื่องเวลาและชวนเข้าร่วมตามขอบเขตที่เขาสะดวก บทนี้ยังไม่ได้ฝึกนำนั่งสมาธิ', 'You clarified timing and agreed on a visit that fits their schedule. This chapter did not practise meditation guidance.'), ending: 'brief', choices: [] },
  declined: { visual: 'farewell', title: text('กล่าวลาโดยเคารพการตัดสินใจ', 'A respectful farewell'), setting: text('กลุ่มเลือกเดินชมต่อ คุณจบคำชวนอย่างสุภาพ การไม่เข้าร่วมไม่ใช่ความล้มเหลวของผู้ฝึก', 'The group chose to continue their visit. You ended the invitation politely. Their declining is not a failure.'), ending: 'declined', choices: [] },
}

export function validateInvitationGraph(): string[] {
  const errors: string[] = []
  const reachable = new Set<string>()
  function visit(id: string) {
    if (reachable.has(id)) return
    const scene = invitationScenes[id]
    if (!scene) { errors.push(`Missing scene: ${id}`); return }
    reachable.add(id)
    for (const item of scene.choices) visit(item.next)
  }
  visit('arrival')
  for (const [id, scene] of Object.entries(invitationScenes)) {
    if (!reachable.has(id)) errors.push(`Unreachable scene: ${id}`)
    const pending = [id], seen = new Set<string>()
    let ends = false
    while (pending.length) {
      const current = pending.pop()!
      if (seen.has(current)) continue
      seen.add(current)
      const node = invitationScenes[current]
      if (!node) continue
      if (node.ending) { ends = true; break }
      pending.push(...node.choices.map(item => item.next))
    }
    if (!ends) errors.push(`No ending reachable: ${id}`)
    if (!scene.ending && !scene.choices.length) errors.push(`Empty scene: ${id}`)
  }
  return errors
}

export const invitationChapters: StoryText[] = [
  text('การเชิญชวน','The invitation'),text('ต้อนรับเมื่อมานั่ง','Welcoming visitors'),text('ทำความรู้จักและชีวิตพระ','Getting acquainted and monastic life'),text('ชวนสมาธิ','Inviting someone to meditate'),text('เตรียมและนำนั่ง','Preparation and guidance'),text('สนทนาหลังฝึก','After meditation'),text('ถ่ายภาพหมู่','The group photo'),text('กล่าวลา','Saying goodbye'),
]
export const invitationArt: Record<InvitationVisual, {src:string;alt:StoryText}> = {
  arrival: {src:'/images/nisit-stories/invitation/arrival.png',alt:text('นักท่องเที่ยวสามคนกำลังเดินผ่านจุดกิจกรรม','Three visitors walking past the activity area')},
  listening: {src:'/images/nisit-stories/invitation/listening.png',alt:text('กลุ่มนักท่องเที่ยวหยุดฟังคำชวน','The group stops to listen to the invitation')},
  time: {src:'/images/nisit-stories/invitation/time.png',alt:text('ผู้มาเยือนดูนาฬิกาและบอกข้อจำกัดเรื่องเวลา','A visitor checks his watch and discusses their schedule')},
  hesitant: {src:'/images/nisit-stories/invitation/hesitant.png',alt:text('คนหนึ่งในกลุ่มกำลังถามเพื่อให้แน่ใจก่อนเข้าร่วม','One of the visitors asks for clarification before joining')},
  joined: {src:'/images/nisit-stories/invitation/joined.png',alt:text('กลุ่มนักท่องเที่ยวเดินไปยังที่นั่งหลังตอบรับ','The group moves towards the seats after accepting')},
  farewell: {src:'/images/nisit-stories/invitation/farewell.png',alt:text('นักท่องเที่ยวโบกมือลาและเดินชมต่อ','The visitors wave goodbye and continue their visit')},
}
