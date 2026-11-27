// Monk Chat Story Simulation Graph
// Based on owner-described activity context and docs/handoffs/monk-chat-story-sample-2026-11-26.json

export interface StoryChoice {
  label: {
    en: string
    th: string
  }
  next: string
  feedbackTh: string
}

export interface StoryNode {
  id: string
  chapter: number
  sceneTh: string
  sceneEn?: string
  speaker?: 'narrator' | 'visitor' | 'monk'
  characterState?: {
    icon: string
    th: string
    en: string
  }
  visitor: {
    en: string
    th: string
  }
  imageSrc: string
  imageBriefTh?: string
  ending: boolean
  endingType?: 'success_join' | 'success_short' | 'polite_decline' | 'completed'
  nextChapterStartId?: string
  choices: StoryChoice[]
}

export interface StoryChapterMeta {
  chapter: number
  titleTh: string
  titleEn: string
  goalTh: string
  goalEn: string
}

export interface MonkChatStory {
  id: string
  titleTh: string
  titleEn: string
  descriptionTh: string
  descriptionEn: string
  startNodeId: string
  chapters: StoryChapterMeta[]
  nodes: Record<string, StoryNode>
}

export const MONK_CHAT_CHAPTERS: StoryChapterMeta[] = [
  {
    "chapter": 1,
    "titleTh": "พบและเชิญชวน",
    "titleEn": "Arrival & Invitation",
    "goalTh": "พบผู้มาเยือนที่สนใจพื้นที่กิจกรรม เริ่มทักทายและชวนโดยไม่กดดัน",
    "goalEn": "Welcome visitors showing interest without being intrusive."
  },
  {
    "chapter": 2,
    "titleTh": "ต้อนรับและทำความรู้จัก",
    "titleEn": "Welcome & Getting Acquainted",
    "goalTh": "เขานั่งลงแล้ว เริ่มคุยโดยไม่กลายเป็นการสอบสวน",
    "goalEn": "Create a comfortable, welcoming dialogue."
  },
  {
    "chapter": 3,
    "titleTh": "สนทนาเรื่องชีวิตพระ",
    "titleEn": "Monastic Life Dialogue",
    "goalTh": "ถามเรื่องจีวร โกนผม หรือบทบาทพระนิสิต อธิบายเรียบง่ายตามความเป็นจริง",
    "goalEn": "Explain monastic robes and daily life with clarity and respect."
  },
  {
    "chapter": 4,
    "titleTh": "ชวนฝึกสมาธิ",
    "titleEn": "Meditation Invitation",
    "goalTh": "ชวนและอธิบายว่าจะทำอะไร ให้เขาเลือกเข้าร่วมหรือไม่",
    "goalEn": "Invite visitor to experience introductory meditation respecting their choice."
  },
  {
    "chapter": 5,
    "titleTh": "เตรียมและนำนั่ง",
    "titleEn": "Preparation & Guiding",
    "goalTh": "เตรียมตัวและสื่อสารขั้นตอนตามบทนำนั่งที่ตรวจแล้ว",
    "goalEn": "Guide posture and steps using approved, gentle instructions."
  },
  {
    "chapter": 6,
    "titleTh": "สนทนาหลังฝึก",
    "titleEn": "Post-Meditation Reflection",
    "goalTh": "ถามความรู้สึกและรับฟังโดยไม่ชี้นำคำตอบ",
    "goalEn": "Listen attentively to their genuine experience without pre-judging."
  },
  {
    "chapter": 7,
    "titleTh": "ถ่ายภาพร่วมกัน",
    "titleEn": "Group Photo & Spacing",
    "goalTh": "ขอความยินยอมถ่ายภาพและจัดระยะที่เหมาะสมตามสมณสารูป",
    "goalEn": "Politely seek consent and ensure mindful, respectful physical spacing."
  },
  {
    "chapter": 8,
    "titleTh": "กล่าวลาและเดินทางต่อ",
    "titleEn": "Farewell & Next Steps",
    "goalTh": "ปิดบทสนทนา ขอบคุณ และให้ข้อมูลฝึกต่อเมื่อเขาสนใจ",
    "goalEn": "Conclude warmly with gratitude and verified continuing resources."
  }
];

export const MONK_CHAT_STORY_1: MonkChatStory = {
  id: 'a-visit-to-monk-chat',
  titleTh: 'หนึ่งครั้งใน Monk Chat',
  titleEn: 'A Visit to Monk Chat',
  descriptionTh: 'ฝึกดำเนินบทสนทนาตั้งแต่พบผู้มาเยือน ต้อนรับ ชวนสมาธิ ตอบคำถามธรรมะ จนถึงกล่าวลาตามสถานการณ์จริง',
  descriptionEn: 'Practice real-life Monk Chat dialogue: welcoming visitors, meditation invite, Dhamma Q&A, and mindful farewell.',
  startNodeId: 'arrival',
  chapters: MONK_CHAT_CHAPTERS,
  nodes: {
  "arrival": {
    "id": "arrival",
    "chapter": 1,
    "sceneTh": "บ่ายวันหนึ่ง ณ บริเวณวัดมหาธาตุ คุณยืนประจำจุดกิจกรรม Monk Chat มีนักท่องเที่ยว 3 คนเดินผ่านหน้าโต๊ะ คนหนึ่งชะลอเดินมองป้ายกิจกรรม อีกสองคนกำลังสนทนากัน คุณจะเริ่มต้นอย่างไร?",
    "sceneEn": "One afternoon at Wat Mahathat, you stand by the Monk Chat table. Three visitors walk past: one glances at the banner while two are talking. How will you begin?",
    "speaker": "narrator",
    "characterState": {
      "icon": "🚶‍♂️",
      "th": "กำลังเดินผ่าน / มองป้ายกิจกรรม",
      "en": "Walking past / Looking at banner"
    },
    "visitor": {
      "en": "(Three visitors are walking past your table. One glances at the Monk Chat sign while two are chatting.)",
      "th": "(นักท่องเที่ยวสามคนกำลังเดินผ่านหน้าโต๊ะ คนหนึ่งหันมองป้ายกิจกรรม อีกสองคนกำลังคุยกัน)"
    },
    "imageSrc": "/images/home/monkchat-spot-wat-mahathat.jpg",
    "imageBriefTh": "จุดกิจกรรม Monk Chat วัดมหาธาตุ พร้อมนักท่องเที่ยวเดินผ่าน",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Hello! Would you like to hear a little about Monk Chat?",
          "th": "Hello! Would you like to hear a little about Monk Chat? (สวัสดีครับ สนใจฟังข้อมูลสั้นๆ เกี่ยวกับ Monk Chat ไหมครับ)"
        },
        "next": "ch1_ask_info",
        "feedbackTh": "ทักทายอย่างเป็นมิตร เปิดโอกาสให้อีกฝ่ายสอบถามข้อมูลเพิ่มเติมโดยไม่กดดัน"
      },
      {
        "label": {
          "en": "Hello! Would you like to try about five minutes of meditation?",
          "th": "Hello! Would you like to try about five minutes of meditation? (สวัสดีครับ สนใจลองฝึกสมาธิสั้นๆ ประมาณ 5 นาทีไหมครับ)"
        },
        "next": "ch1_check_time",
        "feedbackTh": "ชวนด้วยกิจกรรมสมาธิสั้นที่ระบุเวลาชัดเจน เหมาะกับผู้ที่สนใจการปฏิบัติ"
      },
      {
        "label": {
          "en": "(Wait for them to finish talking, make eye contact, and smile mindfully)",
          "th": "(รอให้คุยจบ สบตาและส่งรอยยิ้มอย่างสำรวมโดยไม่ขวางทาง)"
        },
        "next": "ch1_gentle_eye_contact",
        "feedbackTh": "รอจังหวะที่เหมาะสมโดยไม่ตัดบทสนทนาของผู้มาเยือน แสดงความสำรวมตามสมณสารูป"
      }
    ]
  },
  "ch1_ask_info": {
    "id": "ch1_ask_info",
    "chapter": 1,
    "sceneTh": "นักท่องเที่ยวคนหนึ่งหยุดเดิน หันมาสบตาและเอ่ยถามด้วยความอยากรู้",
    "sceneEn": "One visitor stops, turns to you with curiosity, and asks about the activity.",
    "speaker": "visitor",
    "characterState": {
      "icon": "💬",
      "th": "หยุดฟัง / สอบถามด้วยความสนใจ",
      "en": "Stopping to listen / Curious"
    },
    "visitor": {
      "en": "Hello! What is Monk Chat about?",
      "th": "สวัสดีครับ! กิจกรรม Monk Chat เกี่ยวกับอะไรหรือครับ?"
    },
    "imageSrc": "/images/home/monkchat-meet-monks.jpg",
    "imageBriefTh": "นักท่องเที่ยวหยุดคุยสอบถามข้อมูลกับพระนิสิต",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "You can talk with monks and try a short meditation if you like.",
          "th": "You can talk with monks and try a short meditation if you like. (พูดคุยกับพระได้ครับ และมีสมาธิสั้นๆ ประมาณ 5 นาทีหากสนใจ)"
        },
        "next": "ch1_accept_join",
        "feedbackTh": "อธิบายกิจกรรมทั้งสองส่วนอย่างกระชับและให้ทางเลือกตามความพร้อม"
      },
      {
        "label": {
          "en": "We offer friendly conversation about Buddhism, temple life, or Thai culture.",
          "th": "We offer friendly conversation about Buddhism, temple life, or Thai culture. (พูดคุยแลกเปลี่ยนเรื่องพระพุทธศาสนา วิถีชีวิตพระ หรือวัฒนธรรมไทยได้อย่างเป็นกันเองครับ)"
        },
        "next": "ch1_conversation_interest",
        "feedbackTh": "เน้นการสนทนาอย่างอบอุ่น เหมาะสำหรับผู้ที่อยากแลกเปลี่ยนความรู้"
      },
      {
        "label": {
          "en": "Please come sit right now! You need to join us today.",
          "th": "Please come sit right now! You need to join us today. (มานั่งตรงนี้เดี๋ยวนี้เลยครับ คุณต้องเข้าร่วมกับเราวันนี้นะ)"
        },
        "next": "ch1_awkward_pressure",
        "feedbackTh": "คำสั่งหรือการเร่งรัดทำให้อีกฝ่ายอึดอัด ควรใช้คำเชิญชวนที่นุ่มนวล"
      }
    ]
  },
  "ch1_check_time": {
    "id": "ch1_check_time",
    "chapter": 1,
    "sceneTh": "นักท่องเที่ยวก้มดูนาฬิกาข้อมือ เพื่อนอีกสองคนหยุดยืนรอฟัง",
    "sceneEn": "The visitor glances down at their watch while their friends wait.",
    "speaker": "visitor",
    "characterState": {
      "icon": "⌚",
      "th": "กังวลเรื่องเวลา / ตรวจสอบกำหนดการ",
      "en": "Checking watch / Time-conscious"
    },
    "visitor": {
      "en": "Five minutes? Does that include talking, or just meditation? We have a tour bus soon.",
      "th": "ห้านาทีหรือครับ? รวมพูดคุยด้วยไหม หรือเฉพาะสมาธิ? พวกเรามีรถทัวร์รออยู่ครับ"
    },
    "imageSrc": "/images/home/monkchat-qa-dialogue.jpg",
    "imageBriefTh": "นักท่องเที่ยวยืนชั่งใจเรื่องเวลา",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Five minutes is the meditation itself. When do you need to leave?",
          "th": "Five minutes is the meditation itself. When do you need to leave? (ห้านาทีคือช่วงสมาธิครับ คุณต้องออกเดินทางต่อกี่โมงหรือครับ?)"
        },
        "next": "ch1_time_clarified",
        "feedbackTh": "ตอบคำถามเรื่องเวลาตรงไปตรงมา และรับฟังกำหนดการของอีกฝ่ายเพื่อช่วยจัดสรรเวลา"
      },
      {
        "label": {
          "en": "Don't worry about the time, just sit down and we'll see.",
          "th": "Don't worry about the time, just sit down and we'll see. (ไม่ต้องห่วงเรื่องเวลาหรอกครับ มานั่งก่อนเลย เดี๋ยวค่อยว่ากัน)"
        },
        "next": "ch1_awkward_pressure",
        "feedbackTh": "การปัดความกังวลเรื่องเวลาทำให้อีกฝ่ายไม่มั่นใจในการเข้าร่วม"
      },
      {
        "label": {
          "en": "If your bus is coming very soon, you are welcome to pick up our guide sheet and enjoy your walk.",
          "th": "If your bus is coming very soon, you are welcome to pick up our guide sheet and enjoy your walk. (ถ้ารถทัวร์จะมารับแล้ว หยิบแผ่นพับและเดินชมต่อได้เลยครับ)"
        },
        "next": "ch1_polite_farewell",
        "feedbackTh": "เข้าใจและเคารพข้อจำกัดเรื่องเวลาของผู้มาเยือนอย่างยิ่ง"
      }
    ]
  },
  "ch1_gentle_eye_contact": {
    "id": "ch1_gentle_eye_contact",
    "chapter": 1,
    "sceneTh": "เมื่อเพื่อนในกลุ่มพูดจบ นักท่องเที่ยวหันมาสบตา พระนิสิตส่งยิ้มสำรวม อีกฝ่ายยิ้มตอบและชะลอฝีเท้าลง",
    "sceneEn": "As their conversation pauses, the visitor makes eye contact. You smile mindfully; they smile back and slow down.",
    "speaker": "visitor",
    "characterState": {
      "icon": "🌿",
      "th": "ยิ้มตอบรับอย่างเป็นมิตร / ชะลอฝีเท้า",
      "en": "Smiling friendly / Slowing down"
    },
    "visitor": {
      "en": "Good afternoon! Are monks available to speak with visitors?",
      "th": "สวัสดีตอนบ่ายครับ! พระสามารถสนทนากับนักท่องเที่ยวได้ใช่ไหมครับ?"
    },
    "imageSrc": "/images/home/monkchat-meet-monks.jpg",
    "imageBriefTh": "นักท่องเที่ยวชะลอฝีเท้าและยิ้มทักทาย",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Yes, welcome! This is Monk Chat. Would you like to sit in the shade and chat?",
          "th": "Yes, welcome! This is Monk Chat. Would you like to sit in the shade and chat? (ใช่ครับ ยินดีต้อนรับครับ นี่คือกิจกรรม Monk Chat เชิญนั่งพักในร่มและคุยกันได้ครับ)"
        },
        "next": "ch1_accept_join",
        "feedbackTh": "ต้อนรับอย่างอบอุ่นและชวนเข้ามาพักผ่อนในร่ม"
      },
      {
        "label": {
          "en": "Yes, we are here for friendly conversation. You can also rest here if you need shade.",
          "th": "Yes, we are here for friendly conversation. You can also rest here if you need shade. (ใช่ครับ พวกเราพร้อมสนทนา และมีที่นั่งในร่มให้พักผ่อนด้วยครับ)"
        },
        "next": "ch1_conversation_interest",
        "feedbackTh": "แสดงการต้อนรับด้วยน้ำใจและสร้างความสบายใจแก่ผู้มาเยือน"
      }
    ]
  },
  "ch1_time_clarified": {
    "id": "ch1_time_clarified",
    "chapter": 1,
    "sceneTh": "นักท่องเที่ยวปรึกษากับเพื่อนร่วมทางและเสนอเวลาที่สะดวก",
    "sceneEn": "The visitor checks with their companions and proposes the time they have available.",
    "speaker": "visitor",
    "characterState": {
      "icon": "🤝",
      "th": "ขอคุยช่วงสั้น 10 นาที",
      "en": "Proposing brief 10-minute chat"
    },
    "visitor": {
      "en": "We have about 10 minutes before the tour group meets. Could we just have a brief chat?",
      "th": "พวกเรามีเวลาประมาณ 10 นาทีก่อนเรียกรวม จะขอคุยสั้นๆ สักหน่อยได้ไหมครับ?"
    },
    "imageSrc": "/images/home/monkchat-qa-dialogue.jpg",
    "imageBriefTh": "นักท่องเที่ยวปรึกษาเวลาอย่างสบายใจ",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Ten minutes is wonderful. We can sit down for a short chat.",
          "th": "Ten minutes is wonderful. We can sit down for a short chat. (10 นาทีก็ดีมากเลยครับ เชิญนั่งคุยกันสั้นๆ ได้เลยครับ)"
        },
        "next": "ch1_short_chat_agreed",
        "feedbackTh": "ปรับกิจกรรมให้เข้ากับเวลาของผู้มาเยือนอย่างยืดหยุ่น"
      },
      {
        "label": {
          "en": "Ten minutes is too short. You need at least 30 minutes.",
          "th": "Ten minutes is too short. You need at least 30 minutes. (10 นาทีน้อยเกินไปครับ ต้องมีเวลาอย่างน้อย 30 นาทีถึงจะร่วมได้)"
        },
        "next": "ch1_polite_farewell",
        "feedbackTh": "การกำหนดเวลาขั้นต่ำที่ตึงเกินไปอาจทำให้พลาดโอกาสสร้างมิตรภาพแรกเริ่ม"
      }
    ]
  },
  "ch1_conversation_interest": {
    "id": "ch1_conversation_interest",
    "chapter": 1,
    "sceneTh": "ผู้มาเยือนสนใจพูดคุย แต่ต้องการความชัดเจนเรื่องการนั่งสมาธิ",
    "sceneEn": "The visitor is interested in speaking, but wants to clarify the meditation part.",
    "speaker": "visitor",
    "characterState": {
      "icon": "💡",
      "th": "สนใจคุย / สอบถามความพร้อม",
      "en": "Interested in talk / Asking options"
    },
    "visitor": {
      "en": "That sounds very interesting! Do we need to do meditation, or can we just talk?",
      "th": "ฟังดูน่าสนใจมากครับ! จำเป็นต้องนั่งสมาธิไหมครับ หรือแค่นั่งคุยเฉยๆ ก็ได้?"
    },
    "imageSrc": "/images/home/monkchat-meet-monks.jpg",
    "imageBriefTh": "ผู้มาเยือนสอบถามทางเลือกกิจกรรม",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Meditation is completely optional. You are welcome to just have a conversation.",
          "th": "Meditation is completely optional. You are welcome to just have a conversation. (สมาธิเป็นทางเลือกตามความสะดวกครับ แค่นั่งคุยอย่างเดียวได้เลยครับ)"
        },
        "next": "ch1_accept_join",
        "feedbackTh": "คลายความกังวล ชี้แจงว่ากิจกรรมสมาธิขึ้นอยู่กับความสมัครใจ"
      },
      {
        "label": {
          "en": "You have to do meditation too, otherwise the session is incomplete.",
          "th": "You have to do meditation too, otherwise the session is incomplete. (ต้องนั่งสมาธิด้วยครับ ไม่อย่างนั้นจะไม่ครบหลักสูตร)"
        },
        "next": "ch1_awkward_pressure",
        "feedbackTh": "การบังคับกิจกรรมอาจสร้างความอึดอัดแก่ผู้มาเยือนที่มีความพร้อมต่างกัน"
      }
    ]
  },
  "ch1_awkward_pressure": {
    "id": "ch1_awkward_pressure",
    "chapter": 1,
    "sceneTh": "นักท่องเที่ยวชะงักและถอยหลังก้าวหนึ่ง แสดงท่าทีอึดอัดที่ถูกเร่งรัด",
    "sceneEn": "The visitor pauses and takes a step back, feeling slightly pressured.",
    "speaker": "visitor",
    "characterState": {
      "icon": "✋",
      "th": "ชะงัก / ถอยหลัง / รู้สึกถูกกดดัน",
      "en": "Hesitant / Stepping back / Pressured"
    },
    "visitor": {
      "en": "Uh, do we have to join right now? We were really just looking around...",
      "th": "เอ่อ... พวกเราจำเป็นต้องร่วมตอนนี้เลยไหมครับ? พอดีแค่เดินดูเฉยๆ..."
    },
    "imageSrc": "/images/home/monkchat-real-atmosphere.jpg",
    "imageBriefTh": "ผู้มาเยือนชะงักถอยหลังอย่างลังเล",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "I'm so sorry, please don't feel pressured! You are very welcome to just look around and take photos.",
          "th": "I'm so sorry, please don't feel pressured! You are very welcome to just look around and take photos. (ขออภัยด้วยครับ ไม่ต้องกังวลหรือรู้สึกถูกกดดันนะครับ เดินชมวัดและถ่ายภาพได้ตามสบายเลยครับ)"
        },
        "next": "ch1_relieved",
        "feedbackTh": "ขอโทษอย่างจริงใจและลดความกดดันทันที ช่วยฟื้นฟูความสัมพันธ์ได้อย่างยอดเยี่ยม"
      },
      {
        "label": {
          "en": "No problem at all. Please take your time and enjoy your visit in Ayutthaya.",
          "th": "No problem at all. Please take your time and enjoy your visit in Ayutthaya. (ไม่เป็นไรเลยครับ ขอให้เพลิดเพลินกับการท่องเที่ยวอยุธยานะครับ)"
        },
        "next": "ch1_polite_farewell",
        "feedbackTh": "ปล่อยให้อีกฝ่ายเดินชมต่อด้วยความสุภาพ ไม่ตื๊อหรือแสดงความไม่พอใจ"
      }
    ]
  },
  "ch1_relieved": {
    "id": "ch1_relieved",
    "chapter": 1,
    "sceneTh": "นักท่องเที่ยวมีท่าทีผ่อนคลายลง ยิ้มใหม่อีกครั้ง และกลับมาสนใจพูดคุย",
    "sceneEn": "The visitor relaxes, smiles warmly again, and shows renewed interest.",
    "speaker": "visitor",
    "characterState": {
      "icon": "😊",
      "th": "ผ่อนคลาย / กลับมาสนใจพูดคุย",
      "en": "Relieved / Reconnecting friendly"
    },
    "visitor": {
      "en": "Thank you for understanding, venerable! Actually, could we just ask one quick question about the temple?",
      "th": "ขอบคุณที่เข้าใจครับท่าน! จริงๆ แล้วพวกเราขอถามคำถามสั้นๆ สักข้อได้ไหมครับ?"
    },
    "imageSrc": "/images/home/monkchat-meet-monks.jpg",
    "imageBriefTh": "บรรยากาศกลับมาผ่อนคลายและเป็นมิตร",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Of course! Please take a seat in the shade. We are very happy to chat.",
          "th": "Of course! Please take a seat in the shade. We are very happy to chat. (ได้แน่นอนครับ! เชิญนั่งพักในร่มได้เลยครับ พวกเรายินดีพูดคุยด้วยครับ)"
        },
        "next": "ch1_accept_join",
        "feedbackTh": "ต้อนรับการกลับมาของบทสนทนาด้วยรอยยิ้มและความเมตตา"
      }
    ]
  },
  "ch1_accept_join": {
    "id": "ch1_accept_join",
    "chapter": 1,
    "sceneTh": "การเชิญชวนสำเร็จ: นักท่องเที่ยวยิ้มตอบรับและก้าวเดินมานั่งที่โต๊ะกิจกรรม Monk Chat",
    "sceneEn": "Invitation successful: The visitors smile warmly and step towards the Monk Chat table.",
    "speaker": "visitor",
    "characterState": {
      "icon": "🪷",
      "th": "ตอบรับเข้าร่วม / เดินมานั่งที่โต๊ะ",
      "en": "Accepted / Walking to table"
    },
    "visitor": {
      "en": "That sounds wonderful. Thank you, we'd love to sit down with you.",
      "th": "ฟังดูยอดเยี่ยมมาก ขอบคุณครับ พวกเรายินดีนั่งคุยด้วยครับ"
    },
    "imageSrc": "/images/home/monkchat-slide-1.webp",
    "imageBriefTh": "นักท่องเที่ยวตอบรับร่วมกิจกรรมและเดินมายังที่นั่ง",
    "ending": true,
    "endingType": "success_join",
    "nextChapterStartId": "welcome",
    "choices": []
  },
  "ch1_short_chat_agreed": {
    "id": "ch1_short_chat_agreed",
    "chapter": 1,
    "sceneTh": "การเชิญชวนสำเร็จ: ตกลงสนทนาช่วงสั้น 10 นาทีตามความสะดวกของนักท่องเที่ยว",
    "sceneEn": "Invitation successful: Agreed on a brief 10-minute session that fits the visitor's schedule.",
    "speaker": "visitor",
    "characterState": {
      "icon": "⏱️",
      "th": "ตกลงร่วมสนทนาแบบกระชับ",
      "en": "Agreed for brief session"
    },
    "visitor": {
      "en": "Great! Ten minutes is perfect. Thank you for accommodating our schedule.",
      "th": "ยอดเยี่ยมเลยครับ 10 นาทีกำลังดี ขอบคุณที่เข้าใจเรื่องเวลาของพวกเราครับ"
    },
    "imageSrc": "/images/home/monkchat-qa-dialogue.jpg",
    "imageBriefTh": "นักท่องเที่ยวตกลงร่วมคุยสั้นๆ 10 นาที",
    "ending": true,
    "endingType": "success_short",
    "nextChapterStartId": "welcome",
    "choices": []
  },
  "ch1_polite_farewell": {
    "id": "ch1_polite_farewell",
    "chapter": 1,
    "sceneTh": "การกล่าวลาอย่างสุภาพ: นักท่องเที่ยวโบกมือลาและเดินชมวัดต่อด้วยความสบายใจ",
    "sceneEn": "Mindful farewell: The visitors wave goodbye and continue their peaceful walk through the temple.",
    "speaker": "visitor",
    "characterState": {
      "icon": "🍃",
      "th": "กล่าวลาอย่างสุภาพ / เดินชมต่อ",
      "en": "Mindful farewell / Continuing walk"
    },
    "visitor": {
      "en": "Thank you so much, venerable! Enjoy your afternoon.",
      "th": "ขอบคุณมากครับท่าน ขอให้มีช่วงบ่ายที่งดงามนะครับ"
    },
    "imageSrc": "/images/home/monkchat-slide-2.webp",
    "imageBriefTh": "นักท่องเที่ยวเดินชมโบราณสถานต่อหลังได้รับคำอวยพร",
    "ending": true,
    "endingType": "polite_decline",
    "choices": []
  },
  "welcome": {
    "id": "welcome",
    "chapter": 2,
    "sceneTh": "ผู้มาเยือนนั่งลงในพื้นที่สนทนา",
    "visitor": {
      "en": "Thank you. This is my first Monk Chat.",
      "th": "ขอบคุณครับ นี่เป็นครั้งแรกที่ร่วม Monk Chat"
    },
    "imageSrc": "/images/home/monkchat-slide-2.webp",
    "imageBriefTh": "ผู้มาเยือนนั่งลงในพื้นที่สนทนา",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Welcome! What would you like to know about today?",
          "th": "ยินดีต้อนรับครับ วันนี้สนใจอยากทราบเรื่องอะไรครับ"
        },
        "next": "intro",
        "feedbackTh": "ให้ผู้มาเยือนเริ่มจากสิ่งที่สนใจ"
      },
      {
        "label": {
          "en": "Welcome! Where are you visiting from?",
          "th": "ยินดีต้อนรับครับ คุณเดินทางมาจากที่ไหนครับ"
        },
        "next": "intro",
        "feedbackTh": "เริ่มทำความรู้จักด้วยคำถามที่เข้ากับบริบทการเดินทาง"
      }
    ]
  },
  "intro": {
    "id": "intro",
    "chapter": 3,
    "sceneTh": "บทสนทนาเริ่มเป็นกันเอง ผู้มาเยือนมองจีวรด้วยความสงสัย",
    "visitor": {
      "en": "I am visiting from overseas. May I ask about your robes?",
      "th": "ผมเดินทางมาจากต่างประเทศ ขอถามเรื่องจีวรได้ไหมครับ"
    },
    "imageSrc": "/images/home/monkchat-slide-3.webp",
    "imageBriefTh": "บทสนทนาเริ่มเป็นกันเอง ผู้มาเยือนมองจีวรด้วยความสงสัย",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Of course. What would you like to know?",
          "th": "ได้เลยครับ อยากทราบเรื่องไหนครับ"
        },
        "next": "robes",
        "feedbackTh": "รับฟังคำถามให้ชัดก่อนอธิบาย"
      },
      {
        "label": {
          "en": "Please speak a little more slowly so I can understand you clearly.",
          "th": "รบกวนพูดช้าลงสักนิดนะครับ จะได้เข้าใจคุณชัดเจน"
        },
        "next": "robes",
        "feedbackTh": "การขอให้พูดช้าลงเป็นทักษะสื่อสาร ไม่ใช่ความผิด"
      }
    ]
  },
  "robes": {
    "id": "robes",
    "chapter": 3,
    "sceneTh": "ผู้มาเยือนถามเรื่องชีวิตพระ",
    "visitor": {
      "en": "Why do monks wear these robes and shave their heads?",
      "th": "ทำไมพระจึงห่มจีวรแบบนี้และโกนผมหรือครับ"
    },
    "imageSrc": "/images/home/monkchat-slide-3.webp",
    "imageBriefTh": "ผู้มาเยือนถามเรื่องชีวิตพระ",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "These are part of our monastic way of life. May I explain one part at a time?",
          "th": "สิ่งเหล่านี้เป็นส่วนหนึ่งของวิถีชีวิตพระ ขออธิบายทีละประเด็นนะครับ"
        },
        "next": "meditation_invite",
        "feedbackTh": "เป็นประโยคเปิดคำอธิบายเท่านั้น คำอธิบายเนื้อหาจริงต้องใช้ข้อความที่พระผู้รับผิดชอบตรวจ ไม่ถือว่าต้นแบบนี้อธิบายครบแล้ว"
      },
      {
        "label": {
          "en": "I would like to check the details with a teaching monk so I can answer accurately.",
          "th": "ขอสอบถามพระอาจารย์เรื่องรายละเอียดก่อนนะครับ จะได้ตอบได้ถูกต้อง"
        },
        "next": "refer",
        "feedbackTh": "ไม่เดาคำตอบเมื่อไม่แน่ใจ และบอกขั้นตอนช่วยหาคำตอบ"
      }
    ]
  },
  "refer": {
    "id": "refer",
    "chapter": 3,
    "sceneTh": "พระนิสิตรับเรื่องไว้เพื่อสอบถามผู้รับผิดชอบ ไม่แสดงคำตอบที่แต่งขึ้น",
    "visitor": {
      "en": "Thank you for checking.",
      "th": "ขอบคุณที่ช่วยตรวจสอบครับ"
    },
    "imageSrc": "/images/home/monkchat-slide-3.webp",
    "imageBriefTh": "พระนิสิตรับเรื่องไว้เพื่อสอบถามผู้รับผิดชอบ ไม่แสดงคำตอบที่แต่งขึ้น",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "You are welcome. Would you like to hear about our meditation activity?",
          "th": "ยินดีครับ สนใจฟังเรื่องกิจกรรมสมาธิของเราไหมครับ"
        },
        "next": "meditation_invite",
        "feedbackTh": "เชื่อมกิจกรรมใหม่ด้วยการขอความสนใจ ไม่อ้างว่าหาคำตอบเดิมแล้ว"
      }
    ]
  },
  "meditation_invite": {
    "id": "meditation_invite",
    "chapter": 4,
    "sceneTh": "หลังพูดคุย พระนิสิตชวนผู้มาเยือนลองฝึก",
    "visitor": {
      "en": "What else can I try here?",
      "th": "ที่นี่มีอะไรให้ลองอีกบ้างครับ"
    },
    "imageSrc": "/images/home/monkchat-slide-4.webp",
    "imageBriefTh": "หลังพูดคุย พระนิสิตชวนผู้มาเยือนลองฝึก",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Would you like to try a short meditation together? You can choose whether to join.",
          "th": "สนใจลองนั่งสมาธิสั้น ๆ ด้วยกันไหมครับ คุณเลือกได้ว่าจะร่วมไหม"
        },
        "next": "preparation",
        "feedbackTh": "ชวนอย่างชัดเจนและให้สิทธิ์เลือก"
      },
      {
        "label": {
          "en": "Would you prefer to keep chatting, or try meditation?",
          "th": "อยากพูดคุยต่อ หรือลองนั่งสมาธิดีครับ"
        },
        "next": "chat_only",
        "feedbackTh": "เปิดทางเลือก ในเส้นทางตัวอย่างนี้ผู้มาเยือนขอสนทนาต่อ"
      }
    ]
  },
  "chat_only": {
    "id": "chat_only",
    "chapter": 4,
    "sceneTh": "ผู้มาเยือนสนใจสนทนาแต่ยังไม่พร้อมฝึกสมาธิ",
    "visitor": {
      "en": "I would rather just talk today.",
      "th": "วันนี้ผมขอพูดคุยอย่างเดียวก่อนครับ"
    },
    "imageSrc": "/images/home/monkchat-slide-4.webp",
    "imageBriefTh": "ผู้มาเยือนสนใจสนทนาแต่ยังไม่พร้อมฝึกสมาธิ",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Of course. What would you like to ask?",
          "th": "ได้เลยครับ อยากถามเรื่องอะไรครับ"
        },
        "next": "photo",
        "feedbackTh": "เคารพความต้องการ ตัวอย่างตัดเวลาการสนทนาไปยังช่วงปิดกิจกรรม ไม่บังคับให้กลับมานั่ง"
      }
    ]
  },
  "preparation": {
    "id": "preparation",
    "chapter": 5,
    "sceneTh": "ผู้มาเยือนอยากลองแต่ไม่ถนัดนั่งพื้น",
    "visitor": {
      "en": "I would like to try, but sitting on the floor is difficult for me.",
      "th": "อยากลองครับ แต่ผมนั่งพื้นไม่ค่อยสะดวก"
    },
    "imageSrc": "/images/home/monkchat-meditation-hero.webp",
    "imageBriefTh": "ผู้มาเยือนอยากลองแต่ไม่ถนัดนั่งพื้น",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Let us find a comfortable seat before we begin.",
          "th": "เราหาที่นั่งที่สบายก่อนเริ่มกันนะครับ"
        },
        "next": "sitting",
        "feedbackTh": "ปรับการเตรียมตัวตามความสะดวก ไม่บังคับท่า"
      },
      {
        "label": {
          "en": "You must sit on the floor.",
          "th": "คุณต้องนั่งพื้นเท่านั้นครับ"
        },
        "next": "repair_posture",
        "feedbackTh": "เป็นคำตอบกดดัน ให้มีทางแก้และทบทวนคำแนะนำที่ตรวจแล้ว"
      }
    ]
  },
  "repair_posture": {
    "id": "repair_posture",
    "chapter": 5,
    "sceneTh": "ผู้มาเยือนกังวลว่าจะเข้าร่วมไม่ได้",
    "visitor": {
      "en": "Then perhaps I cannot join.",
      "th": "ถ้าอย่างนั้นผมคงร่วมไม่ได้ครับ"
    },
    "imageSrc": "/images/home/monkchat-meditation-hero.webp",
    "imageBriefTh": "ผู้มาเยือนกังวลว่าจะเข้าร่วมไม่ได้",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "I am sorry. We can adjust the seating so you feel comfortable.",
          "th": "ขอโทษครับ เราปรับที่นั่งให้คุณรู้สึกสบายได้"
        },
        "next": "sitting",
        "feedbackTh": "รับรู้ปัญหาและเสนอทางเลือก โดยรายละเอียดท่านั่งใช้คู่มือที่ตรวจแล้ว"
      }
    ]
  },
  "sitting": {
    "id": "sitting",
    "chapter": 5,
    "sceneTh": "จัดที่นั่งแล้ว เตรียมใช้บทนำนั่งที่โครงการตรวจแล้ว ภาพนิ่งแทนช่วงฝึกจริง",
    "visitor": {
      "en": "I am ready.",
      "th": "พร้อมแล้วครับ"
    },
    "imageSrc": "/images/home/monkchat-meditation-hero.webp",
    "imageBriefTh": "จัดที่นั่งแล้ว เตรียมใช้บทนำนั่งที่โครงการตรวจแล้ว ภาพนิ่งแทนช่วงฝึกจริง",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "We will begin gently. I will guide you step by step.",
          "th": "เราจะค่อย ๆ เริ่มนะครับ ผมจะนำทีละขั้น"
        },
        "next": "after",
        "feedbackTh": "รุ่นแรกเปลี่ยนฉากไปหลังฝึก บทนำนั่งฉบับจริงใช้สื่อเดิมที่ตรวจแล้ว ไม่แต่งคำสอนเพิ่มจากต้นแบบ"
      }
    ]
  },
  "after": {
    "id": "after",
    "chapter": 6,
    "sceneTh": "หลังสมาธิ ผู้มาเยือนค่อย ๆ ลืมตา พระนิสิตเปิดบทสนทนา",
    "visitor": {
      "en": "We have finished the meditation.",
      "th": "จบช่วงฝึกสมาธิแล้ว"
    },
    "imageSrc": "/images/home/monkchat-meditation-field.webp",
    "imageBriefTh": "หลังสมาธิ ผู้มาเยือนค่อย ๆ ลืมตา พระนิสิตเปิดบทสนทนา",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "How was that for you? Would you like to share anything?",
          "th": "เมื่อกี้เป็นอย่างไรบ้างครับ มีอะไรอยากเล่าไหม"
        },
        "next": "after_wandering",
        "feedbackTh": "ถามเปิดกว้าง ในเส้นทางนี้ผู้มาเยือนเล่าว่ามีความคิดแทรก"
      },
      {
        "label": {
          "en": "How do you feel now?",
          "th": "ตอนนี้รู้สึกอย่างไรบ้างครับ"
        },
        "next": "after_calm",
        "feedbackTh": "ถามความรู้สึกโดยไม่กำหนดว่าต้องเห็นหรือรู้สึกแบบใด"
      },
      {
        "label": {
          "en": "You saw a crystal ball, right?",
          "th": "คุณเห็นดวงแก้วแล้วใช่ไหมครับ"
        },
        "next": "after_neutral",
        "feedbackTh": "คำถามชี้นำประสบการณ์ ควรเปิดโอกาสให้เขาเล่าด้วยคำของตัวเอง"
      }
    ]
  },
  "after_wandering": {
    "id": "after_wandering",
    "chapter": 6,
    "sceneTh": "ผู้มาเยือนเล่าประสบการณ์ตรงโดยยังไม่แน่ใจ",
    "visitor": {
      "en": "My mind kept wandering. Did I do it wrong?",
      "th": "ใจผมคิดไปเรื่อย ๆ ผมทำผิดหรือเปล่าครับ"
    },
    "imageSrc": "/images/home/monkchat-meditation-field.webp",
    "imageBriefTh": "ผู้มาเยือนเล่าประสบการณ์ตรงโดยยังไม่แน่ใจ",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Thank you for sharing. Which part would you like to ask about?",
          "th": "ขอบคุณที่เล่านะครับ มีช่วงไหนที่อยากถามเพิ่มเติมไหม"
        },
        "next": "photo",
        "feedbackTh": "รับฟังก่อนตัดสิน คำแนะนำสมาธิต่อไปต้องอ้างคู่มือที่ตรวจแล้ว"
      }
    ]
  },
  "after_calm": {
    "id": "after_calm",
    "chapter": 6,
    "sceneTh": "ผู้มาเยือนรู้สึกผ่อนคลาย",
    "visitor": {
      "en": "I feel a little more relaxed.",
      "th": "ผมรู้สึกผ่อนคลายขึ้นเล็กน้อยครับ"
    },
    "imageSrc": "/images/home/monkchat-meditation-field.webp",
    "imageBriefTh": "ผู้มาเยือนรู้สึกผ่อนคลาย",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Thank you for sharing. Is there anything you would like to ask?",
          "th": "ขอบคุณที่เล่าครับ มีอะไรอยากถามเพิ่มเติมไหม"
        },
        "next": "photo",
        "feedbackTh": "รับฟังโดยไม่แปลประสบการณ์เป็นระดับความสำเร็จทางธรรม"
      }
    ]
  },
  "after_neutral": {
    "id": "after_neutral",
    "chapter": 6,
    "sceneTh": "ผู้มาเยือนไม่มีประสบการณ์ตามที่ถูกถาม",
    "visitor": {
      "en": "No. I did not see anything like that.",
      "th": "ไม่ครับ ผมไม่ได้เห็นอะไรแบบนั้น"
    },
    "imageSrc": "/images/home/monkchat-meditation-field.webp",
    "imageBriefTh": "ผู้มาเยือนไม่มีประสบการณ์ตามที่ถูกถาม",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Thank you for telling me. Please describe it in your own words, if you would like.",
          "th": "ขอบคุณที่บอกนะครับ ถ้าสะดวก ลองเล่าด้วยคำของคุณเองได้เลย"
        },
        "next": "photo",
        "feedbackTh": "แก้คำถามชี้นำด้วยการเปิดพื้นที่ให้เล่าตามจริง ไม่ตัดสินว่าฝึกไม่สำเร็จ"
      }
    ]
  },
  "photo": {
    "id": "photo",
    "chapter": 7,
    "sceneTh": "การสนทนาจบลง กลุ่มกำลังจะถ่ายภาพร่วมกัน",
    "visitor": {
      "en": "Thank you for the conversation.",
      "th": "ขอบคุณสำหรับการพูดคุยครับ"
    },
    "imageSrc": "/images/home/monkchat-slide-3.webp",
    "imageBriefTh": "การสนทนาจบลง กลุ่มกำลังจะถ่ายภาพร่วมกัน",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Would you like to join our group photo? It is completely optional.",
          "th": "สนใจร่วมถ่ายภาพหมู่ไหมครับ ถ้าไม่สะดวกก็ไม่เป็นไร"
        },
        "next": "lineup",
        "feedbackTh": "ขอความยินยอมก่อนถ่ายและเปิดทางปฏิเสธ"
      },
      {
        "label": {
          "en": "Would you prefer to skip the photo?",
          "th": "อยากข้ามการถ่ายภาพไหมครับ"
        },
        "next": "no_photo",
        "feedbackTh": "ในเส้นทางนี้ผู้มาเยือนเลือกไม่ถ่ายภาพ ให้เคารพความต้องการ"
      }
    ]
  },
  "lineup": {
    "id": "lineup",
    "chapter": 7,
    "sceneTh": "ขณะจัดภาพหมู่ ผู้ร่วมกิจกรรมอีกคนเดินเข้ามาใกล้และกำลังจะจับแขนพระนิสิต",
    "visitor": {
      "en": "Can I stand right beside you?",
      "th": "ขอยืนข้าง ๆ ตรงนี้ได้ไหมคะ"
    },
    "imageSrc": "/images/home/monkchat-slide-3.webp",
    "imageBriefTh": "ขณะจัดภาพหมู่ ผู้ร่วมกิจกรรมอีกคนเดินเข้ามาใกล้และกำลังจะจับแขนพระนิสิต",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Please stand here and leave a little space between us. Thank you.",
          "th": "ยืนตรงนี้ได้ครับ ขอเว้นระยะระหว่างเราสักนิด ขอบคุณครับ"
        },
        "next": "goodbye",
        "feedbackTh": "บอกตำแหน่งและขอเว้นระยะอย่างสุภาพ ข้อปฏิบัติเฉพาะให้พระผู้รับผิดชอบตรวจ"
      },
      {
        "label": {
          "en": "Stand somewhere else!",
          "th": "ไปยืนที่อื่นเลย"
        },
        "next": "repair_space",
        "feedbackTh": "คำสั่งแข็งอาจทำให้อีกฝ่ายเสียหน้า ให้ฝึกปรับเป็นคำขอสุภาพ"
      }
    ]
  },
  "repair_space": {
    "id": "repair_space",
    "chapter": 7,
    "sceneTh": "ผู้มาเยือนชะงักและไม่แน่ใจว่าทำอะไรผิด",
    "visitor": {
      "en": "Oh, I am sorry. Where should I stand?",
      "th": "ขอโทษค่ะ ควรยืนตรงไหนคะ"
    },
    "imageSrc": "/images/home/monkchat-slide-3.webp",
    "imageBriefTh": "ผู้มาเยือนชะงักและไม่แน่ใจว่าทำอะไรผิด",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Thank you. This spot is fine; just leave a little space, please.",
          "th": "ขอบคุณครับ ตรงนี้ได้เลย ขอเว้นระยะสักนิดนะครับ"
        },
        "next": "goodbye",
        "feedbackTh": "ช่วยให้เขารู้ว่าต้องทำอย่างไรโดยไม่ตำหนิ"
      }
    ]
  },
  "no_photo": {
    "id": "no_photo",
    "chapter": 7,
    "sceneTh": "ผู้มาเยือนเลือกไม่อยู่ในภาพ",
    "visitor": {
      "en": "I would prefer not to be in the photo.",
      "th": "ขอไม่อยู่ในภาพนะครับ"
    },
    "imageSrc": "/images/home/monkchat-slide-3.webp",
    "imageBriefTh": "ผู้มาเยือนเลือกไม่อยู่ในภาพ",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Of course. Thank you for letting us know.",
          "th": "ได้เลยครับ ขอบคุณที่บอกนะครับ"
        },
        "next": "goodbye",
        "feedbackTh": "เคารพการไม่ยินยอม ไม่ถ่ายหรือเผยแพร่ภาพเขาโดยข้ามความต้องการ"
      }
    ]
  },
  "goodbye": {
    "id": "goodbye",
    "chapter": 8,
    "sceneTh": "จบกิจกรรม ผู้มาเยือนเตรียมเดินทางต่อ",
    "visitor": {
      "en": "Thank you. I enjoyed meeting you.",
      "th": "ขอบคุณครับ ยินดีที่ได้รู้จัก"
    },
    "imageSrc": "/images/home/monkchat-slide-2.webp",
    "imageBriefTh": "จบกิจกรรม ผู้มาเยือนเตรียมเดินทางต่อ",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "Thank you for joining us. Enjoy the rest of your visit.",
          "th": "ขอบคุณที่มาร่วมกิจกรรมครับ ขอให้เที่ยวอย่างมีความสุข"
        },
        "next": "completed",
        "feedbackTh": "กล่าวลาสุภาพโดยไม่ยืดบทสนทนาหรือบังคับรับข้อมูลเพิ่ม"
      },
      {
        "label": {
          "en": "You are welcome. Would you like information about continuing your practice?",
          "th": "ยินดีครับ สนใจข้อมูลสำหรับฝึกต่อไหมครับ"
        },
        "next": "continue_info",
        "feedbackTh": "เสนอข้อมูลต่อเมื่อเขาสนใจ ใช้ช่องทางที่โครงการตรวจแล้ว"
      }
    ]
  },
  "continue_info": {
    "id": "continue_info",
    "chapter": 8,
    "sceneTh": "ผู้มาเยือนสนใจฝึกต่อ",
    "visitor": {
      "en": "Yes, where can I learn more?",
      "th": "สนใจครับ หาข้อมูลเพิ่มเติมได้ที่ไหน"
    },
    "imageSrc": "/images/home/monkchat-slide-2.webp",
    "imageBriefTh": "ผู้มาเยือนสนใจฝึกต่อ",
    "ending": false,
    "choices": [
      {
        "label": {
          "en": "You can explore the verified practice information on our website.",
          "th": "ดูข้อมูลแหล่งฝึกต่อที่โครงการตรวจไว้บนเว็บไซต์ได้ครับ"
        },
        "next": "completed",
        "feedbackTh": "ใช้ข้อมูลจริงในหน้าศูนย์ฝึกต่อ ไม่แต่งที่อยู่หรือกำหนดการใหม่"
      }
    ]
  },
  "completed": {
    "id": "completed",
    "chapter": 8,
    "sceneTh": "จบเรื่อง: แสดงประโยคที่เลือก feedback และทางกลับไปลองฉากอื่น",
    "visitor": {
      "en": "Thank you. Goodbye!",
      "th": "ขอบคุณครับ สวัสดีครับ"
    },
    "imageSrc": "/images/home/monkchat-slide-2.webp",
    "imageBriefTh": "จบเรื่อง: แสดงประโยคที่เลือก feedback และทางกลับไปลองฉากอื่น",
    "ending": true,
    "choices": []
  },
  "declined": {
    "id": "declined",
    "chapter": 1,
    "sceneTh": "จบเส้นทาง: ผู้มาเยือนเดินชมต่อหลังได้รับคำเชิญอย่างสุภาพ",
    "visitor": {
      "en": "Thank you. Maybe another time.",
      "th": "ขอบคุณครับ ไว้โอกาสหน้านะครับ"
    },
    "imageSrc": "/images/home/monkchat-slide-1.webp",
    "imageBriefTh": "จบเส้นทาง: ผู้มาเยือนเดินชมต่อหลังได้รับคำเชิญอย่างสุภาพ",
    "ending": true,
    "choices": []
  }
},
}

/** Validation helper ensuring graph integrity (no broken links, all targets exist) */
export function validateStoryGraph(story: MonkChatStory): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const nodeIds = new Set(Object.keys(story.nodes))

  if (!nodeIds.has(story.startNodeId)) {
    errors.push(`Start node "${story.startNodeId}" does not exist in story nodes.`)
  }

  let hasEnding = false
  for (const [nodeId, node] of Object.entries(story.nodes)) {
    if (node.ending) {
      hasEnding = true
    }
    for (const choice of node.choices) {
      if (!nodeIds.has(choice.next)) {
        errors.push(`Node "${nodeId}" references non-existent target node "${choice.next}".`)
      }
    }
  }

  if (!hasEnding) {
    errors.push('Story graph contains no ending nodes.')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
