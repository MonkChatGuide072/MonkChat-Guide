import type { StoryText } from './monkChatInvitation'
export type Concern='pressure'|'seating'|'instructions'|'privacy'|'clarity'|'consent'|'comfort'|'pace'|'expectation'|'photo-consent'|'space'|'tone'|'time'
export interface RouteEffect { id:string; after:StoryText; raises?:Concern; resolves:Concern[] }
type Input=[string,string,Concern?,Concern[]?]
export const routeEffects:Record<string,RouteEffect>={}
function register(chapter:string,scene:string,...rows:Input[]){rows.forEach(([th,en,raises,resolves=[]],index)=>{const id=`${chapter}/${scene}/${index}`;routeEffects[id]={id,after:{th,en},raises,resolves}})}

// Each row is an authored event consequence, not a generated grade or a copy of the teaching tip.
register('invitation','arrival',
 ['คำชวนสั้นทำให้เขาหยุดฟัง โดยยังไม่ถูกผูกมัดว่าต้องเข้าร่วม','The short invitation gives him room to stop without committing to join.'],
 ['การกล่าวถึงห้านาทีทำให้เขาอยากรู้เวลารวมก่อนตัดสินใจ','Mentioning five minutes makes the total duration important to his decision.'],
 ['คุณได้เริ่มคุยหลังจากเขาคุยกับเพื่อนจบ โดยไม่ขัดจังหวะกัน','You begin after his conversation with friends, without interrupting it.'])
register('invitation','opening',
 ['เขาชวนเพื่อนมาฟังด้วย เพราะเริ่มเห็นภาพว่าที่นี่ทำอะไร','He brings his friends into the conversation because the activity is clearer.'],
 ['คำเร่งให้เข้ามาทำให้เขาหยุดพิจารณาและถามว่าต้องร่วมทันทีหรือไม่','The urgent instruction makes him question whether joining is compulsory.','pressure'])
register('invitation','explain',
 ['เพื่อนที่อยากคุยอย่างเดียวกล้าบอกความต้องการของตน','The friend who only wants to chat feels able to say so.'],
 ['เขาเปรียบเทียบทางเลือกกับเวลาที่มี ก่อนรับปากว่าจะอยู่ต่อ','He weighs the options against his schedule before agreeing to stay.'])
register('invitation','time',
 ['คุณทราบเวลาที่เขาต้องไป จึงตกลงขอบเขตการคุยได้จริง','You learn when he needs to leave and can agree on a realistic conversation.'],
 ['ทั้งกลุ่มเดินต่อโดยไม่ต้องปฏิเสธซ้ำ และยังจากกันอย่างเป็นมิตร','The group continues its visit without refusing again, leaving on friendly terms.'])
register('invitation','friend',
 ['ทั้งกลุ่มเริ่มจากสิ่งที่ทำร่วมกันได้ คือการพูดคุย','The group begins with a shared preference: conversation.'],
 ['แต่ละคนยังมีสิทธิ์ตัดสินใจเรื่องสมาธิภายหลัง โดยไม่ต้องตอบเหมือนกัน','Each person retains an individual choice about meditation later.'])
register('invitation','brief_chat',['เขากล้าบอกเมื่อหมดเวลา เพราะคุณเปิดทางไว้ตั้งแต่แรก','He can say when his time is up because you made that possible from the start.'])
register('invitation','repair',
 ['เขากลับมาฟังเมื่อคุณขอโทษและคืนสิทธิ์ให้เลือก คำเร่งช่วงแรกจึงได้รับการแก้ไข','He listens again after your apology restores a choice, repairing the earlier pressure.',undefined,['pressure']],
 ['เขาไม่ร่วมกิจกรรม แต่การจากลาครั้งนี้ไม่ค้างความกดดันไว้','He does not join, but the farewell no longer carries the earlier pressure.',undefined,['pressure']],
 ['การเร่งอีกครั้งทำให้เขาพาเพื่อนเดินออกไป แทนที่จะฟังรายละเอียด','Further pressure leads him to leave with his friends instead of listening.','pressure'])
register('invitation','where',['เขาเดินไปถูกจุด และรู้ว่าจะเริ่มจากการคุย ไม่ใช่ถูกพาไปนั่งสมาธิทันที','He finds the correct seats knowing the next step is a conversation, not immediate meditation.'])
register('invitation','brief_where',['คุณเริ่มบทสนทนาโดยมีข้อตกลงเรื่องเวลาที่ทั้งสองฝ่ายรับรู้','The conversation starts with a time limit understood by both sides.'])

register('welcome','seats',
 ['เขาเลือกเก้าอี้ที่สบายและเริ่มปรับตัวกับวงสนทนาได้เอง','He chooses a comfortable chair and begins settling into the circle.'],
 ['คำสั่งให้นั่งชิดทำให้เขาต้องขอพื้นที่เพิ่ม ก่อนจะรู้สึกพร้อมพูดคุย','The close-seating instruction makes him request more space before he can settle.','seating'])
register('welcome','space',
 ['เขาขยับขาและวางกระเป๋าได้ โดยทางเดินยังเปิดอยู่','He has legroom and space for his bag while the path remains clear.',undefined,['seating']],
 ['เขาเป็นคนเลือกย้ายไปมุมที่สะดวก ไม่ได้ถูกย้ายโดยไม่ถาม','He chooses the roomier spot rather than being moved without consultation.',undefined,['seating']])
register('welcome','shoes',
 ['เขานั่งต่อได้โดยไม่ต้องจัดการรองเท้าบนพื้นกลางแจ้ง','He can remain seated without handling his shoes on the outdoor ground.'],
 ['เขาสับสนว่าทำไมกฎเข้าอาคารจึงถูกใช้กับบริเวณเก้าอี้กลางแจ้ง','He is confused by an indoor instruction being applied to the outdoor chairs.','instructions'])
register('welcome','clarify',
 ['เขาเห็นว่าคุณแก้ข้อมูลได้ และกลับมาวางใจคำแนะนำอีกครั้ง','Seeing you correct the information helps restore his confidence in the guidance.',undefined,['instructions']],
 ['เขาทำตามอย่างเกรงใจ แต่เลือกพักจากวงเพราะยังไม่มั่นใจคำแนะนำ','He complies out of politeness but pauses the visit because the guidance still feels uncertain.','instructions'])
register('welcome','agenda',
 ['เขาแนะนำตัวโดยไม่ต้องกังวลว่าการนั่งลงคือการตกลงฝึกสมาธิ','He introduces himself without treating a seat as a commitment to meditate.'],
 ['คำถามที่เขาสนใจเป็นตัวเปิดบทสนทนา จึงไม่ต้องรอคุณบรรยายฝ่ายเดียว','His own question opens the conversation instead of a one-sided introduction.'])

register('acquaint','names',
 ['เขาเริ่มจากชื่อที่สะดวกให้เรียก โดยยังไม่ต้องเปิดเผยข้อมูลอื่น','He begins with his preferred name without having to disclose other details.'],
 ['คำถามหลายเรื่องพร้อมกันทำให้เขาระวังตัวและขอให้ช้าลง','Several personal questions at once make him cautious and prompt a request to slow down.','privacy'])
register('acquaint','repair',
 ['เขากลับมาเล่าเรื่องหลังคุณลดเหลือคำถามเดียวที่เขาเลือกตอบได้','He resumes sharing after you reduce the exchange to one optional question.',undefined,['privacy']],
 ['เขาตอบสั้นลงและเก็บเรื่องส่วนตัวไว้ เพราะคำขอให้ช้าลงไม่ได้รับฟัง','He gives shorter answers and keeps details private because his request was not heard.','privacy'])
register('acquaint','background',
 ['เรื่องการมาอยุธยาครั้งแรกกลายเป็นประสบการณ์ร่วมที่คุยต่อได้','His first visit to Ayutthaya becomes a shared starting point.'],
 ['เขาเลือกเล่าเรื่องวัฒนธรรมที่สนใจ แทนการตอบประวัติตามชุดคำถาม','He chooses a cultural interest rather than answering a fixed personal questionnaire.'])
register('acquaint','monk',
 ['เขาเชื่อมจีวรกับชีวิตเรียบง่ายได้ จึงกล้าถามเรื่องโกนผมต่อ','He connects the robes with simple living and asks about the shaved head.'],
 ['ศัพท์เฉพาะหยุดความเข้าใจของเขา แม้คุณตั้งใจตอบอย่างถูกต้อง','Technical terms interrupt his understanding despite your intention to answer accurately.','clarity'])
register('acquaint','simplify',
 ['คำอธิบายใหม่ทำให้เขากล้าถามต่อ โดยไม่รู้สึกผิดที่ไม่รู้ศัพท์','The simpler explanation lets him ask more without embarrassment.',undefined,['clarity']],
 ['เขาพยักหน้าเพื่อรักษามารยาท แต่เดินออกไปโดยยังไม่เข้าใจเรื่องที่ถาม','He nods politely but leaves without understanding the explanation.','clarity'])
register('acquaint','hair',
 ['เขาได้คำตอบเรื่องโกนผม และรู้ว่าคำถามถัดไปจะถูกตรวจสอบก่อนตอบ','He receives an explanation about shaving and knows the next answer will be checked.'],
 ['เขาเข้าใจว่าประเพณีอาจต่างกัน จึงไม่เอาคำตอบเดียวไปเหมารวมทุกชุมชน','He understands that customs can vary rather than applying one answer everywhere.'])

register('invite','offer',
 ['เขาเลือกพิจารณาสมาธิโดยยังคุยต่อได้ ถ้าไม่สะดวก','He can consider meditation while retaining the option to keep chatting.'],
 ['คำสั่งหลับตาทำให้เขาต้องทักท้วงว่ายังไม่ได้ยินยอม','The instruction to close his eyes makes him point out that he has not agreed.','consent'])
register('invite','consent',
 ['เขากลับมาฟังวิธีฝึกเมื่อเห็นว่าตนเลือกสังเกตหรือไม่ร่วมได้','He listens again when observing or declining becomes a real option.',undefined,['consent']],
 ['บทสนทนาดำเนินต่อโดยไม่มีสมาธิ และไม่มีใครถูกนับว่าได้ฝึกแล้ว','Conversation continues without meditation, and no one is treated as having practised.',undefined,['consent']],
 ['เขาออกจากวงหลังคำปฏิเสธถูกเปลี่ยนเป็นคำชวนซ้ำอีกครั้ง','He leaves after his refusal is met with another attempt to persuade him.','consent'])
register('invite','chair',
 ['ข้อกังวลเรื่องเข่าลดลงเพราะมีทางเลือกนั่งเก้าอี้จริง','A practical chair option addresses his concern about his knees.'],
 ['คนที่ไม่สะดวกนั่งเลือกสังเกต ส่วนเพื่อนยังเลือกลองได้','The visitor who prefers not to sit can observe while his friends choose to try.'])
register('invite','belief',
 ['เขาเลือกลองโดยไม่ต้องรู้สึกว่าถูกขอให้เปลี่ยนความเชื่อ','He chooses to try without feeling asked to change his beliefs.'],
 ['เขาเลือกสนทนาแทน และคุณไม่พาเรื่องไปสู่ประสบการณ์สมาธิที่ยังไม่เกิด','He chooses conversation, so the story does not invent a meditation experience.'])
register('invite','duration',
 ['ทั้งกลุ่มรู้ว่าเวลารวมมีช่วงเตรียมและคุย และรู้วิธีพักหากไม่สบาย','The group understands the preparation and discussion time as well as how to pause.'],
 ['เวลาที่มีถูกใช้กับบทสนทนาสั้น แทนการเร่งให้นั่งทั้งที่ใกล้ต้องไป','The available time becomes a brief conversation instead of a rushed sitting.'])

register('guidance','posture',
 ['เขาคลายไหล่และขอจังหวะช้าลง แทนการทนเกร็งเงียบ ๆ','He relaxes his shoulders and asks for a slower pace instead of silently enduring tension.'],
 ['ข้อห้ามขยับทำให้เขาเกร็งเพิ่มและไม่แน่ใจว่าบอกความไม่สบายได้ไหม','The no-movement instruction increases tension and makes him unsure whether he may speak up.','comfort'])
register('guidance','adjust',
 ['เขาปรับท่าแล้วกล้าฝึกต่อ เพราะรู้ว่าพักได้เมื่อจำเป็น','He adjusts and feels able to continue because pausing is allowed.',undefined,['comfort']],
 ['เขาหยุดรอบนี้ตามที่ตนเลือก โดยไม่ถูกทำให้รู้สึกว่าล้มเหลว','He stops this round by choice without being treated as a failure.',undefined,['comfort']],
 ['เขาต้องลืมตาและหยุดเอง เพราะคำขอเรื่องความสบายยังไม่ได้รับฟัง','He opens his eyes and stops on his own because his discomfort has not been acknowledged.','comfort'])
register('guidance','slower',
 ['เขามีเวลาทำตามการหลับตาและคลายใบหน้า โดยไม่ต้องตามคำพูดให้ทัน','He has time to soften his eyes and face without racing the instructions.'],
 ['ผู้ที่ไม่สะดวกหลับตายังมีส่วนร่วมได้ด้วยตาที่เปิดอย่างผ่อนคลาย','The person uncomfortable closing his eyes can still participate gently.'])
register('guidance','breath',
 ['หลังลมหายใจสบายสองสามครั้ง เขาไม่ต้องรักษาจังหวะที่ถูกบังคับต่อ','After a few comfortable breaths, he need not maintain a forced rhythm.'],
 ['แต่ละคนอยู่กับลมหายใจของตน โดยไม่พยายามทำให้เหมือนเพื่อน','Each person follows their own breathing without trying to match the others.'])
register('guidance','center',
 ['เขามีจุดพักใจโดยไม่ต้องแข่งขันหาตำแหน่งให้แม่นยำ','He has a resting place without competing to find an exact point.'],
 ['เมื่อคิดเรื่องอื่น เขามีวิธีกลับมาอย่างเบา ๆ แทนการตำหนิตนเอง','When thoughts arise, he has a gentle way back instead of self-criticism.'])
register('guidance','image',
 ['เขาลองนึกภาพอย่างไม่เพ่ง และยอมรับความชัดที่มีในขณะนั้น','He tries imagining without strain and accepts the clarity available.'],
 ['เขาวางความคาดหวังเรื่องภาพไว้ก่อน และฝึกต่อด้วยความสบาย','He sets the image expectation aside and continues with ease.'])
register('guidance','hold',
 ['ความเงียบเปิดให้เขาได้ลองอยู่กับความสบายจริง ๆ','The quiet interval gives him room to practise resting with ease.'],
 ['คำแนะนำใหม่แทรกช่วงที่เขากำลังลองทำ จนต้องขอเวลาเงียบ','New instructions interrupt his attempt, so he asks for quiet.','pace'])
register('guidance','quiet-repair',
 ['เขาได้ช่วงเงียบตามที่ขอ หลังคุณหยุดเพิ่มคำสั่ง','He receives the quiet interval he requested after you stop adding instructions.',undefined,['pace']],
 ['เขายุติรอบนี้เพราะต้องฟังต่อ แต่ยังไม่มีจังหวะลองฝึก','He ends the round after more listening leaves no chance to practise.','pace'])
register('guidance','return',
 ['เขาค่อย ๆ รับรู้รอบตัวก่อนลืมตา จึงไม่ถูกเร่งให้จบทันที','He notices the surroundings before opening his eyes, without being rushed.'],
 ['เขาเลือกเวลาลืมตาและขยับตัวเอง โดยไม่ต้องทำพร้อมเพื่อน','He chooses when to open his eyes and move, rather than matching the group.'])

register('reflection','ask',
 ['เขาเล่าทั้งความสบายและความคิดได้ เพราะคำถามไม่ได้กำหนดคำตอบ','He can share ease and distraction because the question prescribes neither.'],
 ['คำถามเรื่องดวงแก้วทำให้คนที่ไม่เห็นภาพกังวลว่าตนทำผิด','The crystal-image question worries the person who saw nothing.','expectation'])
register('reflection','wandering',
 ['เขาเลิกมองความคิดเป็นความผิด และรู้ว่าจะกลับมาอย่างไรเมื่อรู้ตัว','He stops treating thoughts as a mistake and knows how to return when he notices.'],
 ['เขาเห็นทางลองฝึกครั้งถัดไปที่สั้นและไม่กดดันตนเอง','He sees a manageable, less pressured way to try another session.'])
register('reflection','no-image',
 ['เขากล้าเล่าสิ่งที่เกิดจริงหลังคุณยอมรับว่าถามนำไป','He shares honestly after you acknowledge the leading question.',undefined,['expectation']],
 ['เขาหยุดเล่าประสบการณ์ เพราะคิดว่าต้องเห็นภาพก่อนจึงจะได้รับฟัง','He stops sharing, believing he must first see an image to be heard.','expectation'])
register('reflection','no-change',
 ['เขาไม่ต้องเพิ่มเวลานั่งเพื่อพิสูจน์ว่าตนควรรู้สึกเปลี่ยนแปลง','He need not sit longer to prove that he should feel a change.'],
 ['เขารู้ว่าจบหรือคุยต่อได้ โดยไม่ต้องตอบว่าการฝึกให้ผลแบบใด','He knows he may finish or talk without reporting a prescribed result.'])
register('reflection','experience',
 ['เขาเล่าภาพและความรู้สึกได้โดยไม่ถูกจัดระดับ และมีทางถามครูเพิ่มเติม','He can describe images or sensations without ranking, with a teacher available for further questions.'],
 ['บทสนทนากลับมาที่ความสบายปัจจุบันของเขา แทนการด่วนสรุปความหมาย','The discussion returns to his present comfort instead of rushing to interpret meaning.'])

register('photo','permission',
 ['แต่ละคนกล้าบอกความสะดวกก่อนกล้องเริ่มทำงาน','Each person can state a preference before the camera is used.'],
 ['คำสั่งรวมกลุ่มทำให้คนที่ไม่ต้องการภาพต้องถอยและปฏิเสธเอง','The instruction to gather makes the person opting out step back and refuse.','photo-consent'])
register('photo','opt-out',
 ['แอนนาเลือกช่วยถือกล้องเอง โดยไม่ถูกมอบหน้าที่เพราะไม่อยู่ในภาพ','Anna volunteers to hold the camera rather than being assigned the task for opting out.',undefined,['photo-consent']],
 ['ขอบเขตของภาพปรับตามคนที่ยินยอมจริง แอนนายังอยู่นอกภาพ','The framing follows actual consent, with Anna remaining outside the photo.',undefined,['photo-consent']],
 ['รอบนี้ไม่มีภาพถ่าย และไม่มีใครต้องเปลี่ยนใจเพื่อให้กิจกรรมจบลงได้','This round ends without a photo, and nobody has to change their mind.',undefined,['photo-consent']])
register('photo','space',
 ['ผู้มาเยือนหญิงที่เพิ่งเข้ามาร่วมเข้าใจระยะก่อนจะจัดท่าภาพ','The woman who has just joined understands the spacing before posing.',undefined,['space']],
 ['การชี้จุดช่วยจัดกรอบได้ แต่เธอยังต้องถามว่าควรเว้นระยะอย่างไร','The suggested position helps the frame, but she still needs an explanation.','space'],
 ['เมื่อไม่มีคำอธิบาย เธอเข้าใจว่ายืนแนบและจับแขนเพื่อถ่ายภาพได้','Without an explanation, she assumes standing close and holding an arm is acceptable.','space'])
register('photo','explain-space',
 ['คำอธิบายสั้นทำให้เธอเลือกขยับโดยไม่รู้สึกว่าถูกตำหนิ','The brief explanation lets her move without feeling blamed.',undefined,['space']],
 ['คำถามที่ไม่ได้รับคำตอบทำให้เธอขยับกลับมาใกล้อีกครั้ง','The unanswered question leads her to move close again.','space'])
register('photo','contact',
 ['ภาพถูกถ่ายโดยขอบเขตยังไม่ชัด และพระอาจารย์นำเรื่องนี้มาคุยกับคุณก่อนกลับ','The photo is taken with the boundary still unclear; the supervisor raises it privately before you leave.','space'],
 ['เธอปล่อยแขนและขยับตามเมื่อได้รับคำอธิบาย จึงถ่ายต่อได้โดยไม่ค้างความเข้าใจผิด','She releases your arm and moves after the explanation, allowing the photo without the misunderstanding.',undefined,['space']],
 ['น้ำเสียงทำให้เธอเสียหน้า แม้คุณต้องการรักษาระยะก็ตาม','The tone embarrasses her even though you need to maintain space.','tone',['space']])
register('photo','hurt',
 ['การขอโทษน้ำเสียงช่วยให้เธอเข้าใจขอบเขตและค่อย ๆ กลับมาร่วมภาพ','The apology for your tone helps her understand the boundary and rejoin at ease.',undefined,['tone','space']],
 ['เธอเลือกออกไปและทั้งกลุ่มเก็บกล้อง ความไม่สบายใจยังไม่ได้รับการแก้','She leaves and the group puts away the camera, with the discomfort unresolved.','tone'])
register('photo','sharing',
 ['ภาพส่วนตัวไม่ถูกขยายความยินยอมให้เป็นการเผยแพร่สาธารณะ','Agreement to a personal photo is not expanded into permission for public posting.'],
 ['ก่อนกดถ่าย ทุกคนได้รับการทวนว่าใครอยู่ในภาพ และยังไม่มีการเผยแพร่','Before the shutter, participation is checked again and no public posting is assumed.'])

register('farewell','closing',
 ['เขาพร้อมจากลาอย่างเป็นมิตร และคนที่สนใจจึงถามข้อมูลต่อเอง','He is free to leave warmly, and the interested visitor requests information voluntarily.'],
 ['คำขอให้อยู่เพิ่มทำให้เขาต้องย้ำเรื่องนัดหมายอีกครั้ง','The request to stay makes him repeat that he has another appointment.','time'],
 ['เขาจากลาได้ทันที โดยไม่ถูกเพิ่มขั้นตอนก่อนเดินทางต่อ','He can leave immediately without another task being added.'])
register('farewell','time',
 ['เขาเดินต่อได้ตรงตามเวลาที่บอก และคำรั้งช่วงแรกได้รับการแก้ไข','He can leave at the stated time, repairing the earlier attempt to hold him back.',undefined,['time']],
 ['เขาได้ทางเลือกดูข้อมูลภายหลัง โดยไม่ถูกขอให้หยุดเปิดโทรศัพท์ตอนนี้','He has an option for later information without being stopped to use his phone now.',undefined,['time']],
 ['เขาจบการคุยอย่างเร่งรีบเพราะต้องรักษานัด แม้คุณยังอยากให้ข้อมูล','He ends the exchange hurriedly to keep his appointment despite your wish to continue.','time'])
register('farewell','information',
 ['คนที่สนใจได้รับข้อมูลที่เลือก ส่วนเพื่อนไม่ต้องทำตามไปด้วย','The interested person receives chosen information without obliging the friend.'],
 ['เขาจดชื่อไว้ดูเองในภายหลัง จึงเดินทางต่อได้ทันที','He notes the name for later and can continue his visit immediately.'])
register('farewell','resource',
 ['เขาวางแผนกลับมาโดยรู้ว่าต้องตรวจประกาศล่าสุดอีกครั้ง','He can plan another visit knowing that the latest announcement needs checking.'],
 ['เขารู้ว่าข้อมูลทางการอยู่ตรงไหน แทนการพึ่งคำรับปากเรื่องรอบในอนาคต','He knows where official information is instead of relying on a promise about future sessions.'])
