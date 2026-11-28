import { invitationArt, invitationChapters, invitationScenes, type InvitationChoice, type InvitationScene, type StoryText } from './monkChatInvitation'

export type StoryScene = Omit<InvitationScene, 'visual' | 'ending'> & {
  visual: string
  ending?: string
  nextChapterId?: string | null
}
export interface StoryChapter {
  id: string
  title: StoryText
  intro: StoryText
  completion: StoryText
  start: string
  cover: string
  next: string | null
  scenes: Record<string, StoryScene>
}
const t = (th: string, en: string): StoryText => ({ th, en })
const c = (lineTh: string, lineEn: string, reactionTh: string, reactionEn: string, tipTh: string, tipEn: string, next: string, action = false): InvitationChoice => ({ line: t(lineTh,lineEn), reaction: t(reactionTh,reactionEn), takeaway: t(tipTh,tipEn), next, action })
const s = (visual: string, th: string, en: string, settingTh: string, settingEn: string, choices: InvitationChoice[]): StoryScene => ({ visual, title:t(th,en), setting:t(settingTh,settingEn), choices })
const end = (visual: string, titleTh: string, titleEn: string, th: string, en: string, ending = 'complete', nextChapterId?: string | null): StoryScene => ({visual,title:t(titleTh,titleEn),setting:t(th,en),choices:[],ending,nextChapterId})

/** Owner-described Monk Chat activity, written as bilingual practice scenarios, not transcripts.
 * No fluency scores or claims of a visitor's internal attainment are inferred from choices.
 */
export const storyChapters: StoryChapter[] = [
  {id:'invitation',title:invitationChapters[0],intro:t('บ่ายวันหนึ่ง ณ วัดมหาธาตุ นักท่องเที่ยวสามคนเดินผ่านจุด Monk Chat คำแรกของคุณจะพาเรื่องราวไปทางไหน?','One afternoon at Wat Mahathat, three visitors pass the Monk Chat area. Where will your first words lead?'),completion:t('ทุกคำชวน เปิดพื้นที่ให้เลือก','An invitation leaves room to choose'),start:'arrival',cover:'arrival',next:'welcome',scenes:{...invitationScenes,brief:{...invitationScenes.brief,nextChapterId:'farewell'},declined:{...invitationScenes.declined,nextChapterId:'farewell'}}},
  {id:'welcome',title:invitationChapters[1],intro:t('ผู้มาเยือนเดินมาถึงเก้าอี้ใต้ร่มไม้แล้ว เขายังไม่รู้ว่าจะนั่งตรงไหนหรือกิจกรรมจะเริ่มอย่างไร ลองต้อนรับให้รู้สึกสบายใจ','The visitors reach the chairs under the trees. They are unsure where to sit or what comes next. Help them feel at ease.'),completion:t('การต้อนรับเริ่มจากความสบายใจ','A welcome begins with feeling at ease'),start:'seats',cover:'welcome',next:'acquaint',scenes:{
    seats:s('welcome','เขาหยุดอยู่ข้างเก้าอี้','Beside the chairs','ทั้งกลุ่มมาถึงแล้ว คนหนึ่งมองเก้าอี้ว่างแล้วถามว่า “นั่งตรงไหนได้บ้างครับ?”','The group arrives. One visitor looks at the empty chairs: “Where should we sit?”',[
      c('เชิญเลือกที่นั่งที่สบายได้เลยครับ เรานั่งคุยกันตรงนี้','Please choose a seat where you feel comfortable. We can talk here.','ทั้งกลุ่มเริ่มนั่ง แต่คนหนึ่งชี้รองเท้าตัวเอง: “ต้องถอดไหมครับ?”','They begin to sit. One points at his shoes: “Should I take these off?”','บอกตำแหน่งให้ชัดและให้เขาเลือกที่นั่ง','Make the seating clear and leave room for comfort.','shoes'),
      c('นั่งชิดกันตรงนี้เลยครับ จะได้เริ่มเร็ว ๆ','Sit close together here so we can start quickly.','คนหนึ่งลังเล: “ขอขยับเก้าอี้ออกหน่อยได้ไหมครับ?”','One hesitates: “May I move my chair a little?”','ความสะดวกของผู้ร่วมสำคัญกว่าการเริ่มให้เร็ว','Comfort matters more than rushing the start.','space'),
    ]),
    space:s('welcome-ready','เผื่อพื้นที่ให้สบาย','Room to feel comfortable','เขาต้องการพื้นที่ขยับขาและวางกระเป๋า โดยไม่กีดขวางทางเดิน','A visitor needs legroom and somewhere for a bag, without blocking the path.',[
      c('ได้เลยครับ ขยับให้สบายและเว้นทางเดินตรงนี้ไว้นะครับ','Of course. Adjust it for comfort, and let us keep this walkway clear.','เขาขยับเก้าอี้แล้วนั่งลง ก่อนถามเรื่องรองเท้า','He adjusts the chair and sits, then asks about his shoes.','รับฟังคำขอและดูแลทางเดินร่วมกัน','Acknowledge the request while keeping the shared path clear.','shoes'),
      c('ถ้านั่งตรงมุมนี้จะมีที่วางขามากขึ้นครับ สะดวกไหมครับ','This spot has more legroom. Would it suit you?','เขาเลือกเก้าอี้มุมที่สะดวก แล้วถามว่าต้องถอดรองเท้าไหม','He chooses the roomier seat and asks whether shoes should come off.','เสนอทางเลือกแทนการตัดสินใจให้เขา','Offer an option rather than deciding for the visitor.','shoes'),
    ]),
    shoes:s('welcome','กลางแจ้ง สวมรองเท้าได้','An outdoor gathering','ผู้มาเยือนถามว่า “ต้องถอดรองเท้าหรือถอดหมวกไหมครับ?” ทุกคนกำลังนั่งเก้าอี้กลางแจ้ง','A visitor asks: “Should we take off our shoes or hats?” Everyone is sitting on chairs outdoors.',[
      c('สวมรองเท้าได้ครับ เรานั่งเก้าอี้กลางแจ้ง ปรับตัวให้สบายได้เลย','You can keep your shoes on. We are outdoors on chairs, so please make yourself comfortable.','เขายิ้มแล้วถามว่า “ตอนนี้เราจะทำอะไรก่อนครับ?”','He smiles: “What are we doing first?”','ใช้ข้อแนะนำที่ตรงกับสถานที่จริง ไม่ยกกฎเข้าอาคารมาใช้กับทุกพื้นที่','Match the guidance to this outdoor activity.','agenda'),
      c('ถอดรองเท้าก่อนทุกคนครับ ที่นี่เป็นวัด','Everyone must remove their shoes first because this is a temple.','เขามองพื้นทางเดิน: “แต่เรานั่งข้างนอกใช่ไหมครับ?”','He looks at the path: “But we are sitting outside, right?”','คำสั่งเหมารวมอาจทำให้สับสน ควรแก้ให้ตรงบริบท','An overgeneralized instruction can cause confusion. Clarify the actual setting.','clarify'),
    ]),
    clarify:s('welcome-ready','แก้คำอธิบายอย่างเป็นธรรมชาติ','Clarify the instruction','คุณสังเกตว่าคำแนะนำเมื่อกี้ไม่ตรงกับบริเวณนั่งกลางแจ้ง','You notice that your instruction did not fit this outdoor seating area.',[
      c('ขอแก้ให้ชัดนะครับ บริเวณกิจกรรมกลางแจ้งนี้สวมรองเท้าได้ครับ','Let me clarify: you can keep your shoes on in this outdoor activity area.','เขาพยักหน้าและถามว่ากิจกรรมเริ่มอย่างไร','He nods and asks how the activity will begin.','ยอมรับและแก้ข้อมูลอย่างสุภาพได้ ไม่ต้องยืนยันสิ่งที่คลาดเคลื่อน','It is fine to correct yourself politely.','agenda'),
    ]),
    agenda:s('welcome-ready','บอกสิ่งที่จะเกิดขึ้น','Explain what happens next','ผู้มาเยือนรอคำแนะนำ ทุกคนยังไม่ได้ตกลงว่าจะร่วมสมาธิ','The visitors wait for guidance. They have not yet agreed to meditate.',[
      c('เราทำความรู้จักและคุยกันก่อนครับ ส่วนสมาธิค่อยเลือกได้ตามสะดวก','We can get acquainted and chat first. Meditation is something you can choose later.','เขาวางกระเป๋าลงและเริ่มแนะนำตัว','They settle their bags and begin introducing themselves.','ต้อนรับโดยไม่ผูกการเข้าร่วมกับกิจกรรมที่ยังไม่ยินยอม','A welcome does not commit someone to an optional activity.','ready'),
      c('มีคำถามที่อยากคุยเป็นพิเศษไหมครับ เราเริ่มจากตรงนั้นได้','Is there anything you would especially like to ask? We can start there.','เขายิ้ม: “อยากรู้จักคุณกับชีวิตพระครับ”','They smile: “We would like to learn about you and monastic life.”','ให้ความสนใจของผู้มาเยือนช่วยกำหนดบทสนทนา','Let the visitors help shape the conversation.','ready'),
    ]),
    ready:end('welcome-ready','พร้อมเริ่มพูดคุย','Ready to talk','ทุกคนนั่งสบายและรู้ว่าตนเลือกเข้าร่วมอะไรได้ ต่อไปคือการทำความรู้จัก','Everyone is comfortable and understands their choices. You are ready to get acquainted.'),
  }},
  {id:'acquaint',title:invitationChapters[2],intro:t('เมื่อทุกคนนั่งแล้ว ลองเริ่มทำความรู้จัก รับฟังคำถามเรื่องชีวิตพระ และอธิบายด้วยภาษาอังกฤษที่เข้าใจง่าย','Once everyone is seated, get acquainted, listen to questions about monastic life, and explain in accessible English.'),completion:t('ความเข้าใจเกิดจากการฟังและอธิบายให้พอดี','Understanding grows through listening and clarity'),start:'names',cover:'acquaint',next:'invite',scenes:{
    names:s('acquaint','เริ่มรู้จักกัน','Getting acquainted','หญิงคนหนึ่งยิ้มให้ ทุกคนนั่งรอให้คุณเปิดบทสนทนา','One woman smiles. Everyone waits for you to open the conversation.',[
      c('ยินดีที่ได้รู้จักครับ ผมเป็นพระนิสิตที่นี่ แล้วผมควรเรียกคุณว่าอะไรครับ','It is good to meet you. I am one of the student monks here. What would you like me to call you?','เธอแนะนำตัวว่าแอนนา และแนะนำเพื่อนทั้งสองคน','She introduces herself as Anna and introduces her two friends.','ถามชื่อที่เขาสะดวกให้เรียกก่อนถามข้อมูลส่วนตัวเพิ่มเติม','Ask how someone wishes to be addressed before requesting personal details.','background'),
      c('คุณชื่ออะไร อายุเท่าไร ทำงานอะไร และมาจากประเทศไหนครับ','What is your name, age, job, and country?','เธอหัวเราะเบา ๆ: “หลายคำถามเลย ขอเริ่มทีละอย่างได้ไหม?”','She laughs softly: “That is a lot of questions. Could we start with one?”','การถามรวดเดียวอาจรู้สึกเหมือนสอบสวน ลดจังหวะและให้เขาเลือกเล่า','Too many questions can feel like an interview. Slow down and invite a choice.','repair'),
    ]),
    repair:s('acquaint-question','ลดจังหวะการถาม','Slow the conversation down','ผู้มาเยือนอยากเริ่มจากบทสนทนาง่าย ๆ','The visitor would prefer a simpler start.',[
      c('ได้เลยครับ ยินดีที่ได้รู้จัก คุณอยากให้ผมเรียกว่าอะไรครับ','Of course. It is good to meet you. What would you like me to call you?','เธอแนะนำชื่อและเริ่มเล่าเรื่องการเดินทาง','She shares her name and begins talking about the trip.','ให้เวลาและถามทีละคำถาม','Allow time and ask one question at a time.','background'),
    ]),
    background:s('acquaint','ชวนเล่าโดยไม่กดดัน','Invite a story','แอนนาแนะนำเพื่อนเสร็จแล้ว คุณอยากรู้ว่าเขาเคยมาอยุธยาหรือไม่','Anna finishes introducing her friends. You wonder whether this is their first visit to Ayutthaya.',[
      c('นี่เป็นครั้งแรกที่มาอยุธยาหรือเปล่าครับ','Is this your first visit to Ayutthaya?','เขาเล่าว่าเพิ่งมาไทยครั้งแรก แล้วถามว่า “คุณเป็นนักเรียนที่นี่หรือครับ?”','They say this is their first trip to Thailand, then ask: “Are you a student here?”','เริ่มจากบริบทการเดินทางที่มีร่วมกัน','Begin with the shared context of their visit.','monk'),
      c('มีอะไรในอยุธยาที่คุณสนใจเป็นพิเศษไหมครับ','Is there something in Ayutthaya that you are especially interested in?','เขาบอกว่าสนใจวัฒนธรรมและถามว่าคุณเป็นพระนิสิตใช่ไหม','They mention culture and ask whether you are a student monk.','คำถามปลายเปิดให้ผู้มาเยือนเลือกเรื่องที่อยากเล่า','An open question gives visitors room to choose what to share.','monk'),
    ]),
    monk:s('acquaint-question','เล่าชีวิตพระด้วยคำง่าย ๆ','Explain monastic life simply','ผู้มาเยือนถามว่า “คุณเป็นใคร แล้วทำไมถึงครองจีวรแบบนี้?”','A visitor asks: “Who are you, and why do you wear these robes?”',[
      c('ผมเป็นพระนิสิตครับ เรียนและฝึกตามวิถีพระ จีวรเป็นส่วนหนึ่งของชีวิตที่เรียบง่ายนี้','I am a student monk. I study and practise monastic life. These robes are part of that simple way of living.','เขาพยักหน้าแล้วถามเรื่องการโกนผม','They nod and ask about the shaved head.','อธิบายจากชีวิตที่จับต้องได้ก่อนใช้ศัพท์เฉพาะ','Start with everyday meaning before technical terms.','hair'),
      c('เป็นเรื่องของพระวินัย สมณสารูป และการบรรพชาครับ','It concerns Vinaya, monastic propriety, and ordination.','เขาขมวดคิ้วเล็กน้อย: “ขอโทษครับ คำเหล่านั้นหมายถึงอะไร?”','They look puzzled: “Sorry, what do those words mean?”','ศัพท์ที่ถูกต้องก็อาจไม่ช่วยหากผู้ฟังยังไม่คุ้น','Accurate terms still need an accessible explanation.','simplify'),
    ]),
    simplify:s('acquaint','พูดใหม่ให้เข้าใจง่าย','Put it another way','ผู้มาเยือนไม่คุ้นคำเฉพาะ แต่ยังสนใจฟัง','The visitors are unfamiliar with the terms but remain interested.',[
      c('พูดง่าย ๆ คือเราใช้ชีวิตเรียบง่ายและฝึกตนครับ จีวรช่วยเตือนใจถึงวิถีนี้','Simply put, we live simply and train ourselves. The robes remind us of that way of life.','เขาเข้าใจมากขึ้นและถามเรื่องการโกนผม','They understand better and ask about shaving the head.','พูดใหม่โดยไม่ทำให้ผู้ฟังรู้สึกผิดที่ไม่เข้าใจ','Rephrase without making the listener feel at fault.','hair'),
    ]),
    hair:s('acquaint-question','คำถามต่อยอด','A follow-up question','เขาถามว่า “แล้วทำไมพระจึงโกนผมครับ?” ก่อนถามต่อเรื่องประเพณีที่คุณยังไม่แน่ใจ','They ask: “Why do monks shave their heads?” Then they ask about a custom you are unsure of.',[
      c('การโกนผมเป็นส่วนหนึ่งของวิถีพระที่เรียบง่ายครับ ส่วนคำถามถัดไป ขอผมตรวจสอบกับพระอาจารย์ก่อนนะครับ','Shaving the head is part of our simple monastic life. For your next question, let me check with a teacher first.','เขาขอบคุณที่อธิบายและไม่เดาคำตอบ','They appreciate the explanation and your honesty about checking.','ตอบเท่าที่มั่นใจและบอกตรง ๆ เมื่อควรตรวจสอบ','Explain what you know and be honest when you need to check.','understood'),
      c('ผมอธิบายเรื่องการโกนผมได้ครับ ส่วนประเพณีนั้นแต่ละที่อาจต่างกัน ขอเช็กข้อมูลให้ชัดก่อน','I can explain the shaved head. That other custom may differ between communities, so I would like to check the details.','เขาบอกว่ายินดีรอข้อมูลที่ชัดเจน','They are happy for you to verify the details.','แยกสิ่งที่ทราบกับสิ่งที่ยังไม่แน่ใจ','Distinguish what you know from what still needs verification.','understood'),
    ]),
    understood:end('acquaint','รู้จักกันมากขึ้น','A shared understanding','คุณเริ่มรู้จักผู้มาเยือนและอธิบายชีวิตพระด้วยภาษาง่าย ๆ โดยไม่เดาเรื่องที่ไม่มั่นใจ','You got acquainted and explained monastic life simply, without guessing at an uncertain answer.'),
  }},
  {id:'invite',title:invitationChapters[3],intro:t('บทสนทนาเป็นกันเองแล้ว ลองชวนฝึกสมาธิระยะสั้น พร้อมรับฟังข้อจำกัดและความสมัครใจของแต่ละคน','The conversation feels friendly. Invite a short meditation while respecting each person’s preferences and practical needs.'),completion:t('คำชวนที่ดี มีพื้นที่ให้ปฏิเสธ','A good invitation leaves room for no'),start:'offer',cover:'invite-meditation',next:'guidance',scenes:{
    offer:s('invite-meditation','ชวนอย่างมีทางเลือก','Offer a choice','แอนนาบอกว่าอยากพักจากการเดินชม แต่เพื่อนสองคนยังไม่เคยลองสมาธิ','Anna would like a break from sightseeing. Her friends have never tried meditation.',[
      c('สนใจลองพักใจด้วยสมาธิสั้น ๆ ประมาณห้านาทีไหมครับ หรือคุยกันต่อก็ได้','Would you like to try a short meditation, about five minutes? We can also keep chatting.','เธอสนใจ แต่เพื่อนถามว่า “ต้องนั่งพื้นไหม? เข่าผมไม่ค่อยสบาย”','She is interested, but a friend asks: “Must we sit on the ground? My knees are uncomfortable.”','ชวนให้เลือกได้จริงทั้งตอบรับและไม่ร่วม','Offer a real choice, including continuing the conversation.','chair'),
      c('ตอนนี้ทุกคนหลับตาได้เลยครับ เราจะเริ่มสมาธิ','Everyone, close your eyes now. We are starting meditation.','คนหนึ่งขัดเบา ๆ: “ผมยังไม่ได้ตกลงว่าจะนั่งครับ”','One gently interrupts: “I have not decided to join yet.”','การเข้ามานั่งพูดคุยไม่ได้แปลว่ายินยอมฝึกสมาธิ','Sitting down for a chat is not consent to meditate.','consent'),
    ]),
    consent:s('invite-choice','คืนสิทธิ์ให้เลือก','Restore the choice','คุณต้องแก้คำชวนให้ผู้มาเยือนตัดสินใจได้โดยไม่รู้สึกกดดัน','You need to restore a pressure-free choice.',[
      c('ขอโทษครับ เลือกได้ตามสะดวกเลย จะลอง สังเกตเงียบ ๆ หรือคุยต่อก็ได้','Sorry, it is entirely your choice. You can try, quietly observe, or keep chatting.','เขาผ่อนคลาย: “ถ้านั่งเก้าอี้ได้ ผมอยากฟังวิธีก่อนครับ”','He relaxes: “If I can use a chair, I would like to hear how it works.”','ยืนยันความสมัครใจให้ชัดก่อนอธิบายต่อ','Make the voluntary nature clear before continuing.','chair'),
      c('ได้เลยครับ เราคุยกันต่อได้ ไม่จำเป็นต้องฝึกสมาธิ','Of course. We can keep talking. There is no need to meditate.','เขายิ้มและเลือกสนทนาต่อแทน','He smiles and chooses to continue the conversation.','รับการปฏิเสธโดยไม่ชวนซ้ำให้ลำบากใจ','Accept a refusal without repeated pressure.','chat-only'),
    ]),
    chair:s('invite-choice','นั่งแบบที่สบาย','A comfortable seat','ผู้มาเยือนกังวลเรื่องนั่งพื้น และถามว่าจำเป็นต้องเปลี่ยนท่าหรือถอดรองเท้าไหม','A visitor worries about sitting on the ground and asks whether changing posture or removing shoes is necessary.',[
      c('นั่งเก้าอี้ได้ครับ วางเท้าสบาย ๆ บนพื้น และสวมรองเท้าไว้ได้ เราอยู่กลางแจ้ง','A chair is fine. Rest your feet comfortably on the ground, and keep your shoes on. We are outdoors.','เขาพร้อมลอง แต่เพื่อนถามว่า “ผมไม่ใช่ชาวพุทธ ยังร่วมได้ไหม?”','He is willing to try. A friend asks: “I am not Buddhist. Can I take part?”','ให้ทางเลือกที่ทำได้จริงโดยไม่ฝืนร่างกาย','Offer a practical posture without forcing the body.','belief'),
      c('ถ้านั่งไม่สบาย สังเกตเงียบ ๆ ก่อนก็ได้ครับ อยากเลือกแบบไหน','If sitting feels uncomfortable, you can quietly observe instead. What would you prefer?','เขาเลือกสังเกต ส่วนเพื่อนอยากลองแต่สงสัยเรื่องศาสนา','He chooses to observe. His friends wish to try but ask about religion.','ให้แต่ละคนมีส่วนร่วมในระดับที่สะดวก','Let each person participate at a comfortable level.','belief'),
    ]),
    belief:s('invite-meditation','ต้อนรับโดยไม่ตัดสินความเชื่อ','Welcome different beliefs','เพื่อนคนหนึ่งถามว่า “ผมไม่นับถือพุทธ ต้องเปลี่ยนความเชื่อไหม?”','A friend asks: “I am not Buddhist. Do I need to change my beliefs?”',[
      c('ไม่ต้องเปลี่ยนความเชื่อครับ คุณเลือกลองพักกายใจอย่างสบาย ๆ ได้ หรือสังเกตก่อนก็ได้','You do not need to change your beliefs. You can choose to try a gentle period of rest and attention, or observe first.','เขาตอบว่าอยากลอง แล้วถามว่าเริ่มและจบอย่างไร','He decides to try and asks how the session begins and ends.','อธิบายสิ่งที่จะทำโดยไม่รับรองผลหรือกดดันเรื่องความเชื่อ','Explain the activity without promising results or pressuring belief.','duration'),
      c('ถ้ายังไม่สะดวก เราคุยกันต่อก่อนได้ครับ ไม่มีข้อบังคับ','If you are not comfortable, we can keep talking. There is no obligation.','เขาขอบคุณและเลือกคุยต่อแทนสมาธิ','He thanks you and chooses conversation instead.','ไม่ต้องเปลี่ยนคำปฏิเสธให้กลายเป็นคำตอบรับ','A refusal does not need to be converted into acceptance.','chat-only'),
    ]),
    duration:s('invite-choice','ตกลงสิ่งที่จะทำ','Agree on the plan','ผู้มาเยือนอยากทราบเวลารวมและจะพักได้ไหม','The visitors ask about the total time and whether they may stop.',[
      c('ช่วงนั่งประมาณห้านาทีครับ มีเตรียมตัวกับคุยหลังนั่งอีกเล็กน้อย ถ้าไม่สบายให้ลืมตาหรือพักได้','The sitting is about five minutes, with a little preparation and conversation afterwards. You may open your eyes or pause if uncomfortable.','ทุกคนเลือกว่าจะลองหรือสังเกต และพร้อมฟังการเตรียมตัว','Everyone chooses whether to try or observe and is ready for preparation.','แยกเวลานั่งออกจากเวลาทั้งกิจกรรม และให้สิทธิ์พัก','Distinguish sitting time from the whole activity and allow a pause.','agreed'),
      c('ถ้ามีเวลาน้อย เราคุยต่อสั้น ๆ แล้วค่อยฝึกครั้งหน้าก็ได้ครับ','If time is short, we can have a brief chat and leave meditation for another visit.','เขาเลือกคุยสั้น ๆ และไม่เริ่มนั่งในรอบนี้','They choose a short conversation and do not begin meditation this time.','อย่ารับปากเวลาที่ไม่ตรงกับกิจกรรมจริง','Avoid promising a total duration you cannot deliver.','chat-only'),
    ]),
    agreed:end('invite-meditation','พร้อมฝึกตามความสมัครใจ','Ready by choice','ผู้มาเยือนเข้าใจเวลา ท่านั่ง และสิทธิ์พัก พร้อมเข้าสู่การเตรียมตัว','The visitors understand the timing, posture options, and permission to pause. Preparation can begin.'),
    'chat-only':end('invite-choice','เลือกคุยต่อก็มีคุณค่า','Conversation is a valid choice','รอบนี้ยังไม่ได้นั่งสมาธิ คุณรับฟังและเคารพทางเลือกของผู้มาเยือน จะข้ามบทนำนั่งและหลังฝึกไปสู่การขอถ่ายภาพตามสมัครใจ','No meditation took place in this round. You respected the visitors’ choice. Skip guidance and reflection and move to the optional photo invitation.','alternative','photo'),
  }},
  {id:'guidance',title:invitationChapters[4],intro:t('กลุ่มนี้เลือกลองสมาธิแล้ว คุณจะฝึกเลือกคำพูดนำทีละช่วง จังหวะเงียบในเกมเป็นการจำลอง ไม่ใช่การจับเวลานั่งจริง','This group has chosen to try meditation. Rehearse the guiding language step by step. Quiet intervals in the story are simulated, not a real meditation timer.'),completion:t('นำอย่างนุ่มนวล ให้เวลาผู้ฝึก','Guide gently and leave time to practise'),start:'posture',cover:'guide-adjust',next:'reflection',scenes:{
    posture:s('guide-adjust','เริ่มจากท่าที่สบาย','Begin with comfort','ทุกคนนั่งเก้าอี้พร้อมแล้ว คนหนึ่งยังเกร็งไหล่และขยับขา','Everyone is on a chair. One visitor is holding his shoulders stiffly and shifting his legs.',[
      c('นั่งให้สบาย ตั้งหลังตรงพอดี วางเท้าราบกับพื้น และวางมืออย่างนุ่มนวลบนหน้าตักนะครับ','Sit comfortably with your back gently upright. Rest your feet on the ground and your hands softly on your lap.','เขาคลายไหล่ แต่ขอให้คุณพูดช้าลงอีกนิด','He relaxes his shoulders but asks you to speak a little more slowly.','ท่าที่สบายมาก่อนการพยายามนั่งให้เหมือนภาพ','Comfort matters more than copying a rigid pose.','slower'),
      c('หลังต้องตรงมาก ๆ และห้ามขยับจนจบนะครับ','Keep your back very straight and do not move until we finish.','เขาเกร็งมากขึ้น: “ถ้าปวดต้องทนหรือครับ?”','He becomes more tense: “Do I have to endure it if it hurts?”','คำสั่งแข็งอาจเพิ่มความเกร็ง ต้องให้สิทธิ์ปรับท่า','Rigid instructions can increase tension. Allow adjustment.','adjust'),
    ]),
    adjust:s('guide-adjust','ปรับได้เมื่อไม่สบาย','Permission to adjust','ผู้มาเยือนไม่แน่ใจว่าพักหรือปรับท่าได้ไหม','A visitor is unsure whether pausing or changing posture is allowed.',[
      c('ไม่ต้องฝืนครับ ขยับให้สบายได้ ถ้าต้องการพัก ลืมตาและบอกผมได้เลย','Please do not force it. You may adjust for comfort. If you need a pause, open your eyes and let me know.','เขาปรับท่าและขอให้คุณพูดทีละช่วง','He adjusts his position and asks for one instruction at a time.','ความสบายและสิทธิ์พักช่วยให้ฟังต่อได้','Comfort and permission to pause make it easier to follow.','slower'),
      c('พักก่อนก็ได้ครับ เราค่อยกลับมาคุยกัน ไม่ต้องฝึกต่อถ้าไม่สบาย','You can pause now. We can talk instead; there is no need to continue if you are uncomfortable.','เขาเลือกหยุดและกลับมานั่งพักตามปกติ','He chooses to stop and rest normally.','เคารพการหยุด ไม่ตีความว่าเขาฝึกไม่สำเร็จ','Respect stopping without treating it as failure.','paused'),
    ]),
    slower:s('guide-adjust','หนึ่งคำแนะนำ หนึ่งจังหวะ','One instruction at a time','เขาพูดว่า “ช่วยพูดช้าลงได้ไหมครับ?”','He asks: “Could you speak more slowly?”',[
      c('ได้ครับ ค่อย ๆ หลับตาเบา ๆ เหมือนกำลังจะพักผ่อน แล้วคลายใบหน้าและไหล่นะครับ','Of course. Gently close your eyes, as if resting. Soften your face and relax your shoulders.','ทุกคนค่อย ๆ หลับตาและผ่อนคลาย','They gently close their eyes and relax.','รับคำขอแล้วลดความเร็วจริง เว้นช่องให้ทำตาม','Acknowledge the request and actually slow down, leaving time to respond.','breath'),
      c('ได้ครับ จะเปิดตาไว้เบา ๆ ก่อนก็ได้ ค่อย ๆ ผ่อนคลายใบหน้าและไหล่','Of course. You may keep your eyes softly open for now. Gently relax your face and shoulders.','คนที่ยังไม่สะดวกหลับตาผ่อนคลายมากขึ้น','The visitor who preferred open eyes feels more at ease.','ไม่ต้องบังคับให้ทุกคนทำเหมือนกันทันที','Do not force everyone into the same response immediately.','breath'),
    ]),
    breath:s('guide','ให้ลมหายใจกลับเป็นธรรมชาติ','Let breathing be natural','ผู้มาเยือนพร้อมฟังคำแนะนำเรื่องลมหายใจ','The visitors are ready for a breathing instruction.',[
      c('หายใจเข้าลึก ๆ อย่างสบาย แล้วค่อย ๆ ผ่อนออกสองสามครั้ง จากนั้นปล่อยให้เป็นธรรมชาตินะครับ','Take a few comfortable deep breaths, slowly breathing out. Then let your breathing return to its natural rhythm.','ลมหายใจของแต่ละคนค่อย ๆ เป็นธรรมชาติ','Each person settles into a natural breathing rhythm.','ไม่บังคับจังหวะหรือให้กลั้นลมหายใจ','Avoid forcing a rhythm or asking for breath-holding.','center'),
      c('รับรู้ลมหายใจตามธรรมชาติอย่างเบา ๆ ไม่ต้องทำให้เหมือนกันนะครับ','Gently notice your natural breathing. It does not need to be the same for everyone.','ทั้งกลุ่มนั่งต่ออย่างผ่อนคลาย','The group continues with less effort.','คำแนะนำสั้นและผ่อนคลายช่วยลดการพยายามเกินไป','A brief, relaxed instruction can reduce unnecessary effort.','center'),
    ]),
    center:s('guide','ให้ใจมีที่พัก','A gentle resting place','คุณจะชวนวางใจที่กลางท้อง โดยไม่ให้ผู้เริ่มต้นต้องเพ่งหาจุด','You invite attention to the middle of the abdomen without making beginners search or strain.',[
      c('ค่อย ๆ น้อมใจมาพักภายในกลางท้องอย่างสบาย ไม่ต้องเพ่งหาจุดที่แม่นยำนะครับ','Gently rest your attention in the middle of your abdomen. There is no need to search for an exact point.','คนหนึ่งเปิดตาเบา ๆ: “ผมนึกเป็นภาพไม่ออก ต้องทำอย่างไร?”','One softly opens his eyes: “I cannot picture anything. What should I do?”','เน้นความสบายมากกว่าการค้นหาตำแหน่งอย่างเคร่งเครียด','Emphasize ease rather than a tense search for a location.','image'),
      c('นึกถึงพื้นที่สงบภายในกลางท้องเบา ๆ ถ้าใจลอย ค่อยกลับมาอย่างนุ่มนวล','Softly think of a calm space in the middle of your abdomen. If your mind wanders, return gently.','เขาถามว่า “จำเป็นต้องเห็นดวงแก้วชัดไหม?”','He asks: “Do I need to see a clear crystal ball?”','ให้สิ่งที่กลับมาพักใจได้ โดยไม่รับรองภาพที่ต้องเกิด','Offer a resting place without prescribing an experience.','image'),
    ]),
    image:s('guide-adjust','ชัดเท่าที่สบาย','No need to force an image','ผู้เริ่มต้นกังวลว่าตนไม่เห็นภาพชัด','A beginner worries about not seeing a clear image.',[
      c('ไม่เป็นไรครับ จะนึกดวงแก้วใสเบา ๆ ก็ได้ ชัดแค่ไหนก็พอ หรือพักอยู่กับความสบายก่อน','That is fine. You may gently imagine a clear crystal ball. Any clarity is enough, or simply rest with a comfortable feeling.','เขาปิดตาเบา ๆ อีกครั้ง โดยไม่พยายามบังคับภาพ','He softly closes his eyes again without trying to force the image.','ไม่ทำให้การเห็นภาพเป็นเงื่อนไขว่าฝึกได้หรือไม่ได้','Do not make a visible image a condition for practising.','hold'),
      c('ตอนนี้พักใจอย่างสบายก่อนก็ได้ครับ ไม่ต้องเร่งให้เห็นอะไร','For now, you can simply rest comfortably. There is no need to make anything appear.','เขาผ่อนคลายและกลับมานั่งต่อ','He relaxes and continues sitting.','ลดความคาดหวังและให้เวลาผู้ฝึก','Reduce performance pressure and allow time.','hold'),
    ]),
    hold:s('guide','ประคองอารมณ์สบาย','Stay with gentle ease','ทั้งกลุ่มเริ่มนั่งเงียบแล้ว คุณยังมีคำพูดเตรียมไว้อีกหลายประโยค','The group is becoming quiet. You still have several prepared sentences in mind.',[
      c('ประคองใจและอารมณ์สบายอย่างนี้ต่อไปสักครู่นะครับ แล้วเว้นช่วงเงียบ','Rest with this comfortable, relaxed feeling for a little while. Then leave a quiet pause.','เวลาผ่านไปในฉากจำลอง ทุกคนได้มีช่วงเงียบโดยไม่มีคำสั่งแทรก','A quiet interval passes in the simulation, without more instructions.','การเว้นจังหวะเป็นส่วนหนึ่งของการนำ ไม่จำเป็นต้องพูดตลอด','Silence is part of guiding; you do not need to speak continuously.','return'),
      c('พูดคำแนะนำชุดใหม่ต่อทันที เพื่อไม่ให้มีช่วงเงียบ','Continue with another set of instructions immediately, to avoid silence.','คนหนึ่งเปิดตา: “ช่วยเว้นให้ผมลองทำตามสักครู่ได้ไหม?”','A visitor opens his eyes: “Could you give me a moment to try?”','คำพูดมากเกินไปอาจขัดจังหวะ ให้กลับมาเว้นช่วง','Too much speech can interrupt practice. Leave some space.','quiet-repair',true),
    ]),
    'quiet-repair':s('guide-adjust','ให้เวลาลองจริง','Make room to practise','ผู้มาเยือนขอช่วงเงียบหลังฟังคำแนะนำ','The visitor asks for a quiet interval after the guidance.',[
      c('ได้เลยครับ พักอยู่กับความสบายนี้นะครับ แล้วหยุดพูดให้เขาได้ฝึก','Of course. Rest with this gentle ease. Then stop speaking and leave time to practise.','ช่วงเงียบผ่านไป ก่อนถึงเวลาค่อย ๆ กลับมา','A quiet interval passes before it is time to return gently.','ตอบรับคำขอแล้วเปลี่ยนจังหวะการนำ','Respond to the request by changing your pace.','return'),
    ]),
    return:s('guide','ค่อย ๆ กลับมา','Return gently','ช่วงนั่งในฉากจำลองสิ้นสุดแล้ว คุณจะชวนกลับมารับรู้รอบตัวอย่างไร','The simulated sitting period has ended. How will you invite awareness of the surroundings?',[
      c('ค่อย ๆ รับรู้บรรยากาศรอบตัว ผ่อนลมหายใจ แล้วลืมตาช้า ๆ เมื่อพร้อมนะครับ','Gradually notice your surroundings, breathe comfortably, and slowly open your eyes when you are ready.','ทุกคนค่อย ๆ ลืมตาและนั่งพักต่ออีกครู่','Everyone slowly opens their eyes and rests for a moment.','จบอย่างไม่เร่งและไม่เรียกร้องผลที่ต้องเกิด','Close gently without demanding a particular result.','guided'),
      c('เมื่อพร้อม ค่อย ๆ ลืมตาและขยับกายเบา ๆ ได้ครับ ไม่ต้องรีบนะครับ','When you are ready, gently open your eyes and move a little. There is no hurry.','ทั้งกลุ่มกลับมารับรู้รอบตัวในจังหวะของตนเอง','The group returns to the surroundings at their own pace.','ให้ผู้ฝึกกลับมาในจังหวะที่สบาย','Allow a comfortable pace of return.','guided'),
    ]),
    guided:end('guide-adjust','นำครบทั้งเริ่ม พักใจ และกลับมา','A gentle beginning and return','คุณฝึกเลือกภาษานำและจังหวะเงียบครบแล้ว เวลานี้เป็นเหตุการณ์จำลอง ไม่ใช่เวลานั่งจริงของผู้เรียน','You rehearsed guiding language and quiet intervals. This was a simulated event, not the learner’s actual meditation time.'),
    paused:end('guide-adjust','การพักเป็นทางเลือกที่รับฟังได้','A pause deserves respect','ผู้มาเยือนหยุดฝึกตามความสะดวก คุณเปิดพื้นที่ให้กลับมาพูดคุยโดยไม่ตัดสิน','The visitor paused by choice. You made room for conversation without judgment.','paused'),
  }},
  {id:'reflection',title:invitationChapters[5],intro:t('หลังนั่ง ผู้มาเยือนอาจสงบ คิดหลายเรื่อง หรือไม่รู้สึกต่าง ลองถามและตอบโดยไม่ชี้นำว่าต้องเห็นหรือรู้สึกอะไร','After sitting, visitors may feel calm, distracted, or no different. Practise listening without telling them what they should have experienced.'),completion:t('รับฟังประสบการณ์ โดยไม่จัดอันดับ','Listen without ranking experiences'),start:'ask',cover:'reflect',next:'photo',scenes:{
    ask:s('reflect','ชวนเล่าอย่างเปิดกว้าง','Invite an open account','ทุกคนลืมตาแล้ว คุณอยากชวนพูดถึงช่วงที่เพิ่งฝึก','Everyone has opened their eyes. You want to invite a reflection.',[
      c('ช่วงเมื่อกี้เป็นอย่างไรบ้างครับ มีอะไรที่อยากเล่าหรือถามไหม','How was that for you? Is there anything you would like to share or ask?','แอนนาเล่าว่าสบายขึ้น แต่เพื่อนบอกว่า “ผมคิดเรื่องอื่นตลอดเลย”','Anna feels more at ease, but her friend says: “I kept thinking about other things.”','ถามปลายเปิดก่อน ไม่สมมติว่าทุกคนสงบเหมือนกัน','Ask openly rather than assuming everyone felt calm.','wandering'),
      c('เห็นดวงแก้วใสแล้วใช่ไหมครับ','You saw a clear crystal ball, did you not?','คนหนึ่งลังเล: “ผมไม่เห็นอะไร แบบนี้ผิดไหมครับ?”','One hesitates: “I did not see anything. Did I do it wrong?”','คำถามชี้นำอาจทำให้ผู้ฝึกกังวลว่าต้องมีประสบการณ์เฉพาะ','A leading question can create pressure for a particular experience.','no-image'),
    ]),
    wandering:s('reflect-question','คิดหลายเรื่อง','A wandering mind','เพื่อนคนหนึ่งรู้สึกว่าตนล้มเหลวเพราะมีความคิดระหว่างนั่ง','A visitor feels he failed because thoughts arose while sitting.',[
      c('มีความคิดได้ครับ เมื่อรู้ตัว ค่อย ๆ กลับมาพักใจอย่างนุ่มนวล ไม่ต้องตำหนิตัวเอง','Thoughts can arise. When you notice them, gently return to your resting point. There is no need to criticize yourself.','เขาผ่อนคลาย แล้วเพื่อนอีกคนบอกว่า “ฉันไม่รู้สึกเปลี่ยนแปลงเลย”','He feels reassured. Another visitor says: “I did not notice any change.”','ให้สิ่งที่ทำต่อได้จริงโดยไม่รับรองว่าความคิดจะหายทั้งหมด','Offer a practical response without promising the disappearance of thoughts.','no-change'),
      c('ครั้งหน้าลองฝึกช่วงสั้น ๆ สบาย ๆ และกลับมาอย่างอ่อนโยนเมื่อรู้ตัวก็ได้ครับ','Next time, you can try a short, comfortable session and return gently whenever you notice your mind wandering.','เขาอยากลองใหม่โดยไม่กดดัน ส่วนอีกคนบอกว่ายังไม่รู้สึกต่าง','He is willing to try without pressure. Another visitor says nothing felt different.','ใช้คำแนะนำที่ลดความพยายามเกินไป','Reduce performance pressure with manageable practice.','no-change'),
    ]),
    'no-image':s('reflect-question','ไม่เห็นภาพก็เล่าได้','No image is required','ผู้มาเยือนกังวลว่าการไม่เห็นอะไรแปลว่าฝึกผิด','The visitor worries that seeing nothing means failure.',[
      c('ไม่จำเป็นต้องเห็นอะไรครับ ผมถามนำไปหน่อย ช่วงที่นั่งจริง ๆ คุณรู้สึกอย่างไรบ้าง','You do not need to see anything. My question was too leading. How did the sitting actually feel for you?','เขาเล่าว่ามีความคิดหลายเรื่องระหว่างนั่ง','He describes having many thoughts while sitting.','แก้คำถามแล้วกลับมารับฟังสิ่งที่เกิดจริง','Correct the question and listen to the actual experience.','wandering'),
    ]),
    'no-change':s('reflect','ยังไม่รู้สึกต่าง','No noticeable change','อีกคนบอกว่า “ฉันไม่รู้สึกเปลี่ยนแปลงเลย ต้องนั่งนานกว่านี้ไหม?”','Another says: “I did not feel different. Must I sit longer?”',[
      c('ไม่ต้องเร่งให้เกิดอะไรครับ เริ่มจากช่วงสั้นที่สบาย และสังเกตอย่างเป็นธรรมชาติก็พอ','There is no need to make something happen. Start with a comfortable short period and notice naturally.','เขาพยักหน้า ก่อนถามเรื่องภาพใส ๆ ที่อีกคนสังเกตได้','They nod, then ask about a clear image another person noticed.','ไม่ใช้เวลานานเป็นคำตอบอัตโนมัติหรือรับรองผล','Do not prescribe longer sitting automatically or guarantee an outcome.','experience'),
      c('วันนี้เพียงได้ลองก็พอครับ ถ้าไม่อยากฝึกต่อ เราคุยหรือจบกิจกรรมได้ตามสะดวก','Trying it today is enough. If you do not wish to continue, we can chat or finish whenever you prefer.','เขารู้สึกว่าตนเลือกได้ และถามต่อเรื่องความรู้สึกระหว่างฝึก','They appreciate the choice and ask about an experience during practice.','ให้ผู้มาเยือนกำหนดว่าจะฝึกต่อหรือไม่','Let visitors decide whether to continue.','experience'),
    ]),
    experience:s('reflect-question','ฟังโดยไม่ด่วนตีความ','Listen without assigning attainment','คนหนึ่งบอกว่าเห็นภาพใส ๆ อีกคนรู้สึกตัวเบาหรือเล็กลง แล้วถามว่าหมายความว่าอย่างไร','One person noticed a clear image; another felt light or smaller. They ask what it means.',[
      c('ขอบคุณที่เล่าครับ สังเกตอย่างสบาย ไม่ต้องไล่ตามหรือเพ่งให้เกิดซ้ำ ถ้าอยากคุยรายละเอียด เราถามพระอาจารย์ด้วยกันได้','Thank you for sharing. Notice gently without chasing or forcing it to happen again. If you want to explore it further, we can ask a teacher together.','ผู้มาเยือนรู้สึกว่ารับฟังได้ โดยไม่ถูกจัดอันดับว่าใครฝึกดีกว่า','They feel heard without anyone’s experience being ranked.','รับฟังและแนะนำความผ่อนคลาย ไม่สรุปขั้นความสำเร็จจากคำบอกเล่า','Listen and encourage ease without assigning a level of attainment.','heard'),
      c('ตอนนี้คุณรู้สึกสบายไหมครับ ถ้าต้องการพักก็กลับมารับรู้รอบตัวและคุยกันก่อนได้','Do you feel comfortable now? If you would like a pause, you can notice the surroundings and talk with us first.','เขาบอกว่าตอนนี้สบายและพร้อมกลับมาคุยตามปกติ','They say they feel comfortable and are ready to resume conversation.','ถามความสบายปัจจุบันก่อนด่วนอธิบายประสบการณ์','Check present comfort before interpreting an experience.','heard'),
    ]),
    heard:end('reflect','เล่าได้โดยไม่ต้องเหมือนกัน','Different experiences can be shared','คุณรับฟังทั้งความสงบ ความคิด และความรู้สึกที่ไม่เปลี่ยนแปลง พร้อมให้คำแนะนำอย่างไม่ชี้นำ','You listened to calm, distraction, and no noticeable change, and offered non-leading guidance.'),
  }},
  {id:'photo',title:invitationChapters[6],intro:t('เมื่อบทสนทนาหรือกิจกรรมสิ้นสุดลง ลองขอถ่ายภาพร่วมกัน จัดระยะอย่างสุภาพ และเคารพคนที่ไม่ต้องการอยู่ในภาพ','As the conversation or activity ends, invite a group photo, arrange comfortable spacing, and respect anyone who prefers not to be pictured.'),completion:t('ภาพที่ดี เริ่มจากความยินยอม','A good photo begins with consent'),start:'permission',cover:'photo',next:'farewell',scenes:{
    permission:s('photo','ชวนก่อนยกกล้อง','Ask before the camera','เพื่อนคนหนึ่งหยิบโทรศัพท์ขึ้นมา คุณอยากชวนถ่ายภาพหมู่','A visitor takes out a phone. You would like to invite a group photo.',[
      c('ก่อนกลับ อยากถ่ายภาพร่วมกันไหมครับ ใครไม่สะดวกไม่ต้องร่วมภาพก็ได้นะครับ','Before you go, would you like a photo together? Anyone who prefers not to be in it is welcome to sit this one out.','สองคนตอบรับ แต่แอนนาบอกว่าไม่อยากอยู่ในภาพ','Two agree, but Anna says she would rather not be in the picture.','ขอความยินยอมแต่ละคน ไม่ถือว่าทั้งกลุ่มตอบเหมือนกัน','Ask each person rather than assuming the group shares one preference.','opt-out'),
      c('ทุกคนมารวมกันครับ เดี๋ยวถ่ายรูปเลย','Everyone, gather here. We are taking a picture now.','แอนนาถอยนิดหนึ่ง: “ฉันไม่อยากถูกถ่ายค่ะ”','Anna steps back: “I do not want to be photographed.”','คำชวนที่เป็นคำสั่งอาจทำให้ปฏิเสธยาก ต้องรับฟังทันที','An instruction can make refusal difficult. Respond immediately.','opt-out'),
    ]),
    'opt-out':s('photo-choice','ไม่อยู่ในภาพก็ร่วมช่วงนี้ได้','Respect opting out','แอนนาไม่อยากปรากฏในภาพ แต่เพื่อนสองคนอยากถ่าย','Anna prefers not to appear, while her two friends would like a photo.',[
      c('ได้เลยครับ คุณรอตรงนี้ได้ หรือถ้าอยากช่วยถือกล้องก็ได้ตามสะดวก','Of course. You can wait here, or hold the camera if you would like. It is entirely up to you.','เธอเลือกช่วยถ่ายให้เพื่อน ส่วนเพื่อนคนหนึ่งเดินเข้ามายืนใกล้คุณ','She chooses to take the photo. A friend then stands very close to you.','อย่าผูกการไม่อยู่ในภาพกับหน้าที่ต้องเป็นคนถ่าย','Do not make holding the camera an obligation for opting out.','space'),
      c('ไม่มีปัญหาครับ เราจะจัดมุมให้เฉพาะคนที่อยากอยู่ในภาพ','No problem. We will frame the photo to include only those who want to be in it.','เธอไปยืนพักข้าง ๆ ขณะเพื่อนเดินมายืนใกล้คุณ','She waits to one side as a friend moves close to you.','ปรับภาพให้ตรงกับความยินยอมจริง','Adjust the framing to match actual consent.','space'),
      c('ถ้าอย่างนั้นเราไม่ต้องถ่ายก็ได้ครับ ขอบคุณที่บอกนะครับ','Then we can skip the photo. Thank you for letting us know.','ทั้งกลุ่มยอมรับและพร้อมกล่าวลา','The group agrees and is ready to say goodbye.','ไม่จำเป็นต้องมีภาพถ่ายจึงจะจบกิจกรรมได้ดี','A successful activity does not require a photo.','no-photo'),
    ]),
    space:s('photo-choice','บอกระยะอย่างสุภาพ','Explain spacing kindly','ผู้มาเยือนคนหนึ่งเดินมายืนชิดและกำลังยื่นแขนมาจะคล้องแขนคุณ คุณต้องจัดระยะตามวิถีพระโดยไม่ทำให้ใครเสียหน้า','A visitor moves close and starts to link arms. You need to arrange appropriate monastic spacing without embarrassing anyone.',[
      c('ขอเว้นระยะเล็กน้อยนะครับ ตามวิถีพระ เรามายืนข้างกันตรงนี้ได้ครับ','As a monk, I keep a little space. We can stand side by side here.','เขาหยุดและขยับตามด้วยความเข้าใจ','They stop and move over with understanding.','บอกขอบเขตอย่างสงบ พร้อมชี้ทางเลือกที่ทำได้','State the boundary calmly and offer a workable position.','sharing'),
      c('ชี้ตำแหน่งว่างด้านข้าง แล้วบอกว่า “ตรงนี้พอดีครับ จะได้อยู่ในภาพครบ”','Gesture to the open spot beside you and say, “This spot works well so everyone fits in the frame.”','เขาขยับตาม แต่ถามว่า “ต้องเว้นระยะไว้หรือครับ?”','They move, then ask: “Should we leave some space?”','การชี้ตำแหน่งช่วยได้ แต่คำอธิบายสั้น ๆ อาจยังจำเป็น','A gesture can help, but a brief explanation may still be needed.','explain-space',true),
    ]),
    'explain-space':s('photo-choice','อธิบายโดยไม่ตำหนิ','Explain without blame','เขาถามด้วยความสงสัยเรื่องระยะห่าง','The visitor is simply curious about the spacing.',[
      c('ครับ ผมรักษาระยะตามวิถีพระ เราถ่ายร่วมกันอย่างเป็นมิตรตรงนี้ได้เลยครับ','Yes. I keep some space as part of monastic life. We can still have a friendly photo together here.','เขาพยักหน้าและยืนในตำแหน่งที่จัดไว้','They nod and take the suggested position.','ไม่ผูกขอบเขตกับการตำหนิผู้มาเยือน','Explain the boundary without criticizing the visitor.','sharing'),
    ]),
    sharing:s('photo-choice','ถ่ายภาพกับเผยแพร่เป็นคนละคำขอ','A photo and a post are different choices','คนถือกล้องถามว่า “ถ่ายได้แล้วใช่ไหม แล้วจะลงเพจกิจกรรมด้วยไหม?”','The person holding the phone asks: “Are we ready? Will this go on the activity page too?”',[
      c('ถ่ายภาพส่วนตัวตามที่ตกลงได้ครับ ถ้าจะเผยแพร่ต้องถามคนในภาพแยกอีกครั้งก่อน','We can take the personal photo we agreed on. Posting it publicly needs a separate agreement from the people pictured.','ทุกคนยืนยันเรื่องภาพส่วนตัว โดยยังไม่ตกลงให้เผยแพร่','They confirm the personal photo, without agreeing to public posting.','ความยินยอมให้ถ่ายไม่ใช่ความยินยอมให้เผยแพร่ทุกช่องทาง','Consent to a photo is not blanket consent to publish it.','taken'),
      c('รบกวนยืนยันอีกครั้งนะครับ ใครอยากอยู่ในภาพบ้าง ส่วนเรื่องเผยแพร่เรายังไม่ทำตอนนี้','Let us check once more who wants to be pictured. We are not posting it publicly now.','คนที่ไม่ร่วมภาพอยู่นอกกรอบ และคนที่ยินยอมพร้อมถ่าย','The person opting out remains outside the frame; the others are ready.','ทวนขอบเขตที่ตกลงโดยไม่ขยายสิทธิ์เอง','Confirm the agreed scope without expanding it.','taken'),
    ]),
    taken:end('photo-choice','ถ่ายตามที่ทุกคนยินยอม','A photo by agreement','ในฉากจำลอง คุณจัดตำแหน่งและขอบเขตภาพตามความยินยอม ไม่มีการเปิดกล้องหรืออัปโหลดภาพจริง','In the simulation, you arranged spacing and consent. No real camera was opened and no photograph was uploaded.'),
    'no-photo':end('photo-choice','ไม่ถ่ายก็จบอย่างอบอุ่นได้','A warm close without a photo','รอบนี้ไม่มีการถ่ายภาพ คุณเคารพความสะดวกของผู้มาเยือนและพร้อมกล่าวลา','No photo was taken. You respected the visitors’ preference and are ready to say goodbye.','alternative'),
  }},
  {id:'farewell',title:invitationChapters[7],intro:t('การสนทนากำลังสิ้นสุดลง บางคนอยากได้ข้อมูลต่อ บางคนต้องรีบไป ลองกล่าวลาให้เหมาะโดยไม่ยืดเยื้อหรือส่งข้อมูลเกินที่เขาต้องการ','The conversation is ending. Some visitors want more information; others need to leave. Close warmly without prolonging the visit or sending unwanted information.'),completion:t('จบอย่างอบอุ่น และเคารพเวลาของกัน','Close warmly and respect their time'),start:'closing',cover:'goodbye',next:null,scenes:{
    closing:s('goodbye','ถึงเวลากล่าวลา','Time to say goodbye','กลุ่มผู้มาเยือนเตรียมเดินต่อ คนหนึ่งบอกว่า “ขอบคุณครับ แต่เราต้องไปต่อแล้ว”','The visitors are ready to leave. One says: “Thank you, but we need to continue our visit now.”',[
      c('ขอบคุณที่แวะมาพูดคุยครับ ขอให้เที่ยวอยุธยาอย่างมีความสุข','Thank you for spending time with us. Enjoy the rest of your visit to Ayutthaya.','เขายิ้ม ก่อนคนหนึ่งถามว่าหาข้อมูลกิจกรรมครั้งหน้าได้ที่ไหน','They smile. One asks where to find information about a future visit.','ตอบรับการจากลาโดยไม่รั้งเวลา','Acknowledge their departure rather than holding them back.','information'),
      c('รออีกหน่อยครับ ผมมีอีกหลายเรื่องอยากเล่า','Please stay a little longer. I have several more things to explain.','เขามองนาฬิกา: “ขอโทษครับ เรานัดเพื่อนไว้แล้ว”','He checks his watch: “Sorry, we are meeting friends.”','ความตั้งใจให้ข้อมูลมากอาจกลายเป็นการรั้งเวลา','Good intentions can still make it harder to leave.','time'),
      c('ขอบคุณครับ เดินทางต่อโดยสวัสดิภาพนะครับ','Thank you. Have a pleasant onward journey.','ทั้งกลุ่มโบกมือลาโดยไม่ขอข้อมูลเพิ่มเติม','The group waves goodbye without requesting more information.','การกล่าวลาสั้น ๆ ก็เพียงพอเมื่อผู้มาเยือนพร้อมไป','A brief goodbye is enough when visitors are ready to go.','departed'),
    ]),
    time:s('goodbye','เคารพเวลาที่บอกไว้','Respect the stated time','ผู้มาเยือนมีนัดต่อและไม่สะดวกฟังเพิ่ม','The visitors have another appointment and cannot stay.',[
      c('เข้าใจครับ ขอบคุณที่มา ขอให้เดินทางต่ออย่างมีความสุขนะครับ','I understand. Thank you for coming, and enjoy the rest of your day.','เขาผ่อนคลายและกล่าวลา','They relax and say goodbye.','จบโดยไม่ทำให้ผู้มาเยือนต้องปฏิเสธซ้ำ','Close without making the visitor refuse repeatedly.','departed'),
      c('ได้ครับ ถ้าอยากดูข้อมูลทีหลัง คุณเปิดเว็บจากป้ายได้ ไม่ต้องทำตอนนี้นะครับ','Of course. If you want information later, the website is on the sign. There is no need to do anything now.','เขาขอบคุณแล้วเดินต่อ โดยไม่ได้หยุดรับข้อมูล','They thank you and continue walking without stopping for information.','เสนอทางเลือกสั้น ๆ โดยไม่เพิ่มภาระตอนจากลา','Offer a light option without adding a task at departure.','departed'),
    ]),
    information:s('goodbye-links','ให้ข้อมูลตามที่ขอ','Offer the requested information','คนหนึ่งอยากดูกิจกรรมหรือบทฝึกต่อ แต่อีกคนเก็บโทรศัพท์แล้ว','One visitor would like activity information or practice material, while another has put their phone away.',[
      c('ดูเว็บ MonkChat Guide หรือเพจ MonkChat Ayutthaya ได้ครับ คุณอยากดูข้อมูลกิจกรรมหรือคู่มือสมาธิก่อน','You can visit MonkChat Guide or the MonkChat Ayutthaya page. Would you prefer activity information or the meditation guide?','คนที่สนใจเลือกคู่มือสมาธิ ส่วนอีกคนยืนรออย่างสบาย','The interested visitor chooses the meditation guide while their friend waits comfortably.','ถามสิ่งที่ต้องการก่อนให้ข้อมูล ไม่บังคับทั้งกลุ่ม','Ask what is wanted rather than requiring the whole group to participate.','resource'),
      c('ถ้าไม่สะดวกเปิดตอนนี้ จดชื่อเว็บไว้ดูทีหลังก็ได้ครับ','If now is not convenient, you can note the website name and look later.','เขาจดชื่อไว้แล้วพร้อมกล่าวลา','They note the name and are ready to leave.','ให้ข้อมูลในรูปแบบที่เขาสะดวก','Offer information in a convenient form.','departed'),
    ]),
    resource:s('goodbye-links','ส่งต่อโดยไม่รับปากเกินจริง','Guide without overpromising','ผู้มาเยือนถามว่า “ถ้ากลับมาครั้งหน้า ต้องจองไหม แล้วเวลาเดิมเสมอหรือเปล่า?”','A visitor asks: “Do we need a booking next time? Is the schedule always the same?”',[
      c('กิจกรรมรับผู้มาเยือนแบบไม่ต้องจองครับ แต่รอบอาจปรับได้ ควรดูประกาศล่าสุดจากเพจทางการก่อนมา','The activity welcomes walk-in visitors, but sessions can change. Please check the latest official page announcement before returning.','เขาเข้าใจว่าจะตรวจประกาศอีกครั้ง แล้วขอบคุณ','They understand that they should check again and thank you.','แยกข้อมูลทั่วไปกับตารางที่อาจเปลี่ยน ไม่รับรองอนาคต','Distinguish general information from a schedule that may change.','departed'),
      c('ข้อมูลล่าสุดอยู่ในช่องทางทางการครับ ถ้าคุณอยาก ผมชี้ให้ดูตรงป้ายนี้ได้','The latest information is on the official channel. If you would like, I can show you the sign here.','เขาเลือกดูชื่อช่องทางก่อนกล่าวลา','They choose to note the official channel before leaving.','ชี้แหล่งตรวจสอบแทนการเดารอบในอนาคต','Point to a verifiable source rather than guessing future sessions.','departed'),
    ]),
    departed:end('goodbye','จากกันด้วยมิตรภาพ','A friendly goodbye','คุณขอบคุณ เคารพเวลาของผู้มาเยือน และให้ข้อมูลเท่าที่เขาต้องการ บทกล่าวลาจบแล้ว โดยไม่อ้างว่าผู้เรียนเล่นครบทุกบทหากเพิ่งเลือกบทนี้','You thanked the visitors, respected their time, and offered only the information they wanted. This chapter is complete; it does not imply that every other chapter has been played.'),
  }},
]

const newArtDescriptions: Record<string, StoryText> = {
  welcome:t('ผู้มาเยือนเดินมาถึงกลุ่มเก้าอี้ใต้ร่มไม้','Visitors arrive at the shaded chairs'),
  'welcome-ready':t('ผู้มาเยือนนั่งเก้าอี้และจัดพื้นที่อย่างสบาย','Visitors settle comfortably with space for their belongings'),
  acquaint:t('ผู้มาเยือนแนะนำตัวในวงสนทนา','Visitors introduce themselves in the conversation circle'),
  'acquaint-question':t('ผู้มาเยือนถามเกี่ยวกับชีวิตพระด้วยความสนใจ','A visitor asks about monastic life'),
  'invite-meditation':t('กลุ่มผู้มาเยือนรับฟังคำชวนฝึกสมาธิ','The visitors listen to an invitation to meditate'),
  'invite-choice':t('แต่ละคนในกลุ่มแสดงความสะดวกที่แตกต่างกัน','The visitors express different participation preferences'),
  guide:t('ผู้มาเยือนฝึกสมาธิอย่างสบายบนเก้าอี้กลางแจ้ง','Visitors practise gently on outdoor chairs'),
  'guide-adjust':t('ผู้มาเยือนปรับท่านั่งและขอคำแนะนำทีละช่วง','Visitors adjust their posture and ask for slower guidance'),
  reflect:t('ผู้มาเยือนเล่าความรู้สึกหลังฝึก','Visitors share how the practice felt'),
  'reflect-question':t('ผู้มาเยือนถามเรื่องความคิดและความรู้สึกขณะฝึก','A visitor asks about thoughts and feelings during practice'),
  photo:t('พระและผู้มาเยือนเตรียมถ่ายภาพร่วมกันโดยเว้นระยะ','A monk and visitors prepare for a photo with comfortable space'),
  'photo-choice':t('ผู้มาเยือนเลือกช่วยถือกล้องแทนการอยู่ในภาพ','A visitor chooses to hold the camera rather than appear in the photo'),
  goodbye:t('ผู้มาเยือนโบกมือลาก่อนเดินทางต่อ','The visitors wave goodbye before continuing their visit'),
  'goodbye-links':t('ผู้มาเยือนดูข้อมูลกิจกรรมก่อนกล่าวลา','Visitors look at activity information before leaving'),
}
export const storyArt: Record<string, {src:string;alt:StoryText}> = {
  ...invitationArt,
  ...Object.fromEntries(Object.entries(newArtDescriptions).map(([id,alt])=>[id,{src:`/images/nisit-stories/chapters/${id}.png`,alt}])),
}

/** Validate each chapter independently: no dead links, inaccessible scenes, or trapped branches. */
export function validateStoryChapters(): string[] {
  const errors:string[]=[]
  const chapterIds=new Set(storyChapters.map(chapter=>chapter.id))
  if(chapterIds.size!==storyChapters.length) errors.push('Duplicate chapter ID')
  for(const chapter of storyChapters){
    const reachable=new Set<string>();const queue=[chapter.start]
    while(queue.length){const id=queue.pop()!;if(reachable.has(id))continue;reachable.add(id);const node=chapter.scenes[id];if(!node){errors.push(`${chapter.id}: missing ${id}`);continue}queue.push(...node.choices.map(item=>item.next))}
    if(chapter.next&&!chapterIds.has(chapter.next))errors.push(`${chapter.id}: invalid next chapter`)
    for(const [id,node] of Object.entries(chapter.scenes)){
      if(!reachable.has(id))errors.push(`${chapter.id}: unreachable ${id}`)
      if(!storyArt[node.visual])errors.push(`${chapter.id}/${id}: missing art`)
      if(node.nextChapterId&&!chapterIds.has(node.nextChapterId))errors.push(`${chapter.id}/${id}: invalid continuation`)
      if(node.ending&&node.choices.length)errors.push(`${chapter.id}/${id}: ending has choices`)
      const pending=[id],seen=new Set<string>();let ends=false
      while(pending.length){const target=pending.pop()!;if(seen.has(target))continue;seen.add(target);const n=chapter.scenes[target];if(!n)continue;if(n.ending){ends=true;break}pending.push(...n.choices.map(item=>item.next))}
      if(!ends)errors.push(`${chapter.id}/${id}: cannot finish`)
      if(!node.ending&&!node.choices.length)errors.push(`${chapter.id}/${id}: empty event`)
    }
  }
  return errors
}
