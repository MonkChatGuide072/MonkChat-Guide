/** Editable copy for the existing Home and Activities layout. No content is seeded or published by this file. */
export interface WebsiteField {key:string;th:string;en:string;group:string;kind:'text'|'number'|'image'|'url'|'route'|'map'|'visible';limit:number;defaults:{th:string;en:string};path?:string[]}
export const websiteFields: WebsiteField[] = [
  {
    "key": "home_hero_001",
    "th": "Ayutthaya Monk Chat พระสงฆ์และผู้มาเยือนนั่งด้วยกันท่ามกลา",
    "en": "Ayutthaya Monk Chat, a monk and visitors sit together amon",
    "group": "ภาพเปิดและข้อความแนะนำ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "Ayutthaya Monk Chat พระสงฆ์และผู้มาเยือนนั่งด้วยกันท่ามกลางโบราณสถานอยุธยา",
      "en": "Ayutthaya Monk Chat, a monk and visitors sit together among the Ayutthaya ruins"
    }
  },
  {
    "key": "home_hero_002",
    "th": "เทคโนโลยีการเผยแผ่พุทธธรรม · ศูนย์พุทธศาสตร์ศึกษา DCI",
    "en": "Buddhist Dissemination Technology · DCI",
    "group": "ภาพเปิดและข้อความแนะนำ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "เทคโนโลยีการเผยแผ่พุทธธรรม · ศูนย์พุทธศาสตร์ศึกษา DCI",
      "en": "Buddhist Dissemination Technology · DCI"
    }
  },
  {
    "key": "home_hero_004",
    "th": "ทางลัดหน้าแรก",
    "en": "Home shortcuts",
    "group": "ภาพเปิดและข้อความแนะนำ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ทางลัดหน้าแรก",
      "en": "Home shortcuts"
    }
  },
  {
    "key": "home_hero_location",
    "th": "ข้อความบนภาพ",
    "en": "ข้อความบนภาพ",
    "group": "ภาพเปิดและข้อความแนะนำ",
    "kind": "text",
    "limit": 500,
    "defaults": {
      "th": "Wat Mahathat, Historic Ayutthaya",
      "en": "Wat Mahathat, Historic Ayutthaya"
    }
  },
  {
    "key": "home_hero_quote",
    "th": "คำโปรยบนภาพ",
    "en": "คำโปรยบนภาพ",
    "group": "ภาพเปิดและข้อความแนะนำ",
    "kind": "text",
    "limit": 500,
    "defaults": {
      "th": "In the calm of the temple, I heard the loudest truth.",
      "en": "In the calm of the temple, I heard the loudest truth."
    }
  },
  {
    "key": "home_text_005",
    "th": "พบและสนทนากับพระสงฆ์",
    "en": "Meet the monks",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "พบและสนทนากับพระสงฆ์",
      "en": "Meet the monks"
    }
  },
  {
    "key": "home_text_006",
    "th": "พูดคุยอย่างเปิดใจ เหมือนมีเพื่อนรับฟัง ถามได้ทุกเรื่องที่ส",
    "en": "Have an open, friendly conversation. Ask anything about mo",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "พูดคุยอย่างเปิดใจ เหมือนมีเพื่อนรับฟัง ถามได้ทุกเรื่องที่สงสัยเกี่ยวกับชีวิตพระ วัฒนธรรม หรือการปล่อยวางความเครียด",
      "en": "Have an open, friendly conversation. Ask anything about monastic life, Thai culture, and finding calm."
    }
  },
  {
    "key": "home_image_007",
    "th": "รูป monkchat-meet-monks.jpg",
    "en": "Image monkchat-meet-monks.jpg",
    "group": "การ์ดและภาพหน้าโฮม",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/home/monkchat-meet-monks.jpg",
      "en": "/images/home/monkchat-meet-monks.jpg"
    }
  },
  {
    "key": "home_text_008",
    "th": "ฝึกสมาธิเบื้องต้น",
    "en": "Short meditation",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ฝึกสมาธิเบื้องต้น",
      "en": "Short meditation"
    }
  },
  {
    "key": "home_text_009",
    "th": "สมาธิสั้น 5–10 นาที นั่งเก้าอี้สบายๆ ใต้ร่มไม้ใหญ่ หลับตาเ",
    "en": "A gentle 5–10 minute breathing pause. Seated comfortably o",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สมาธิสั้น 5–10 นาที นั่งเก้าอี้สบายๆ ใต้ร่มไม้ใหญ่ หลับตาเบาๆ ผ่อนคลายร่างกาย และสร้างสติรู้ตัว",
      "en": "A gentle 5–10 minute breathing pause. Seated comfortably on chairs under shade trees—no experience needed."
    }
  },
  {
    "key": "home_image_010",
    "th": "รูป monkchat-real-meditation.jpg",
    "en": "Image monkchat-real-meditation.jpg",
    "group": "การ์ดและภาพหน้าโฮม",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/home/monkchat-real-meditation.jpg",
      "en": "/images/home/monkchat-real-meditation.jpg"
    }
  },
  {
    "key": "home_text_011",
    "th": "ถาม-ตอบข้อสงสัย",
    "en": "Q&A",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ถาม-ตอบข้อสงสัย",
      "en": "Q&A"
    }
  },
  {
    "key": "home_text_012",
    "th": "ถามได้ทุกข้อสงสัยอย่างสบายใจ ทั้งเรื่องธรรมเนียม ข้อห้ามใน",
    "en": "Every question is welcome. Ask freely about monk rules, te",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ถามได้ทุกข้อสงสัยอย่างสบายใจ ทั้งเรื่องธรรมเนียม ข้อห้ามในวัด หรือหลักคิดในการใช้ชีวิต",
      "en": "Every question is welcome. Ask freely about monk rules, temple etiquette, or everyday peace of mind."
    }
  },
  {
    "key": "home_image_013",
    "th": "รูป monkchat-qa-dialogue.jpg",
    "en": "Image monkchat-qa-dialogue.jpg",
    "group": "การ์ดและภาพหน้าโฮม",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/home/monkchat-qa-dialogue.jpg",
      "en": "/images/home/monkchat-qa-dialogue.jpg"
    }
  },
  {
    "key": "home_text_014",
    "th": "ภาพความทรงจำ",
    "en": "Photo souvenir",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ภาพความทรงจำ",
      "en": "Photo souvenir"
    }
  },
  {
    "key": "home_text_015",
    "th": "เก็บภาพความประทับใจและมิตรภาพอันอบอุ่นร่วมกับพระสงฆ์ ณ เมื",
    "en": "Capture a memorable moment of cross-cultural friendship an",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "เก็บภาพความประทับใจและมิตรภาพอันอบอุ่นร่วมกับพระสงฆ์ ณ เมืองประวัติศาสตร์อยุธยา",
      "en": "Capture a memorable moment of cross-cultural friendship and kindness in ancient Ayutthaya."
    }
  },
  {
    "key": "home_image_016",
    "th": "รูป monkchat-souvenir.jpg",
    "en": "Image monkchat-souvenir.jpg",
    "group": "การ์ดและภาพหน้าโฮม",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/home/monkchat-souvenir.jpg",
      "en": "/images/home/monkchat-souvenir.jpg"
    }
  },
  {
    "key": "home_text_017",
    "th": "ล้อมวงคุยสบายๆ ใต้ร่มไม้ใหญ่ วัดมหาธาตุ",
    "en": "Warm cultural exchange under the trees",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ล้อมวงคุยสบายๆ ใต้ร่มไม้ใหญ่ วัดมหาธาตุ",
      "en": "Warm cultural exchange under the trees"
    }
  },
  {
    "key": "home_text_018",
    "th": "บรรยากาศสนทนาจริงใต้ร่มเงาไม้ร่มรื่น พูดคุยซักถามวิถีชีวิต",
    "en": "Real open-air conversations with MCU student monks where y",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "บรรยากาศสนทนาจริงใต้ร่มเงาไม้ร่มรื่น พูดคุยซักถามวิถีชีวิตพระ วัฒนธรรมไทย และการดูแลใจอย่างเป็นมิตร ไร้พิธีรีตอง",
      "en": "Real open-air conversations with MCU student monks where you can sit comfortably and ask about Thai monastic life, mindfulness, and everyday happiness."
    }
  },
  {
    "key": "home_image_019",
    "th": "รูป monkchat-real-atmosphere.jpg",
    "en": "Image monkchat-real-atmosphere.jpg",
    "group": "การ์ดและภาพหน้าโฮม",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/home/monkchat-real-atmosphere.jpg",
      "en": "/images/home/monkchat-real-atmosphere.jpg"
    }
  },
  {
    "key": "home_text_020",
    "th": "พักกาย พักใจ เริ่มต้นได้ทุกคน",
    "en": "Rest & gentle stillness for everyone",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "พักกาย พักใจ เริ่มต้นได้ทุกคน",
      "en": "Rest & gentle stillness for everyone"
    }
  },
  {
    "key": "home_text_021",
    "th": "หลบไอร้อนมาสัมผัสความสงบเบื้องต้น 5–10 นาที นั่งเก้าอี้สบา",
    "en": "Escape the midday heat and enjoy five to ten minutes of ca",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "หลบไอร้อนมาสัมผัสความสงบเบื้องต้น 5–10 นาที นั่งเก้าอี้สบายๆ ผ่อนคลายทั้งร่างกายและจิตใจ เหมาะสำหรับทุกคน",
      "en": "Escape the midday heat and enjoy five to ten minutes of calm breathing—welcoming all backgrounds, seated comfortably on chairs."
    }
  },
  {
    "key": "home_image_022",
    "th": "รูป monkchat-real-stillness.jpg",
    "en": "Image monkchat-real-stillness.jpg",
    "group": "การ์ดและภาพหน้าโฮม",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/home/monkchat-real-stillness.jpg",
      "en": "/images/home/monkchat-real-stillness.jpg"
    }
  },
  {
    "key": "home_text_023",
    "th": "ทำไมพระสงฆ์จึงครองจีวรสีส้มหรือสีกรัก?",
    "en": "Why do Buddhist monks wear orange or saffron robes?",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ทำไมพระสงฆ์จึงครองจีวรสีส้มหรือสีกรัก?",
      "en": "Why do Buddhist monks wear orange or saffron robes?"
    }
  },
  {
    "key": "home_text_024",
    "th": "ในอดีต จีวรของพระสงฆ์ย้อมด้วยสีธรรมชาติจากเปลือกไม้และขมิ้",
    "en": "Traditionally, robes were dyed using natural forest materi",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ในอดีต จีวรของพระสงฆ์ย้อมด้วยสีธรรมชาติจากเปลือกไม้และขมิ้น สีส้มจึงสะท้อนถึงการสละความฟุ้งเฟ้อทางโลก และมุ่งสู่ชีวิตที่เรียบง่ายบริสุทธิ์",
      "en": "Traditionally, robes were dyed using natural forest materials like roots, tree bark, and turmeric. The earth tone symbolizes simplicity, detachment from luxury, and a life dedicated to inner purification."
    }
  },
  {
    "key": "home_text_025",
    "th": "ทำไมพระสงฆ์จึงต้องรักษาระยะห่างกับสตรี?",
    "en": "Why do monks keep physical distance from women?",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ทำไมพระสงฆ์จึงต้องรักษาระยะห่างกับสตรี?",
      "en": "Why do monks keep physical distance from women?"
    }
  },
  {
    "key": "home_text_026",
    "th": "เป็นข้อปฏิบัติทางพระวินัยเพื่อรักษาความบริสุทธิ์และความเคา",
    "en": "As part of our ancient monastic vows (Vinaya), monks refra",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "เป็นข้อปฏิบัติทางพระวินัยเพื่อรักษาความบริสุทธิ์และความเคารพซึ่งกันและกัน พระสงฆ์ยินดีอย่างยิ่งที่จะสนทนาและตอบคำถามด้วยเมตตาจิตเสมอครับ",
      "en": "As part of our ancient monastic vows (Vinaya), monks refrain from physical contact with women to maintain clear purity and mutual respect. Monks are always delighted to converse and answer questions with kindness!"
    }
  },
  {
    "key": "home_text_027",
    "th": "ถ้าไม่ได้นับถือศาสนาพุทธ สามารถฝึกสมาธิได้ไหม?",
    "en": "Can I practice meditation if I belong to another religion?",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ถ้าไม่ได้นับถือศาสนาพุทธ สามารถฝึกสมาธิได้ไหม?",
      "en": "Can I practice meditation if I belong to another religion?"
    }
  },
  {
    "key": "home_text_028",
    "th": "สามารถฝึกได้แน่นอน 100% ครับ สมาธิคือการพักผ่อนของจิตใจและ",
    "en": "Yes, absolutely! Meditation is universal peace and mindful",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สามารถฝึกได้แน่นอน 100% ครับ สมาธิคือการพักผ่อนของจิตใจและการรู้ลมหายใจ ซึ่งเป็นธรรมชาติสากลของมนุษย์ทุกคนโดยไม่มีการแบ่งแยกความเชื่อ",
      "en": "Yes, absolutely! Meditation is universal peace and mindful observation of breath. It belongs to all human beings regardless of belief, nationality, or cultural background."
    }
  },
  {
    "key": "home_text_029",
    "th": "ต้องการเข้าร่วมกิจกรรมต้องทำอย่างไร?",
    "en": "How do I join Ayutthaya Monk Chat?",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ต้องการเข้าร่วมกิจกรรมต้องทำอย่างไร?",
      "en": "How do I join Ayutthaya Monk Chat?"
    }
  },
  {
    "key": "home_text_030",
    "th": "เดินเข้ามาได้เลยครับ! จัดทุกวันจันทร์และศุกร์ ตั้งแต่เวลา ",
    "en": "Just walk in! Sessions take place every Monday and Friday ",
    "group": "การ์ดและคำถามหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "เดินเข้ามาได้เลยครับ! จัดทุกวันจันทร์และศุกร์ ตั้งแต่เวลา 13:15 น. ใต้ร่มไม้ใหญ่ใกล้พระปรางค์ประธานวัดมหาธาตุ ฟรีโดยไม่ต้องจองล่วงหน้า",
      "en": "Just walk in! Sessions take place every Monday and Friday from 13:15 onwards under the shaded trees near the central prang at Wat Mahathat. 100% free with no booking required."
    }
  },
  {
    "key": "home_text_031",
    "th": "สถิติประวัติศาสตร์ Ayutthaya Monk Chat · ครั้งที่ 122",
    "en": "Ayutthaya Monk Chat Milestone · Session #122",
    "group": "ข้อความหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สถิติประวัติศาสตร์ Ayutthaya Monk Chat · ครั้งที่ ",
      "en": "Ayutthaya Monk Chat Milestone · Session #"
    }
  },
  {
    "key": "home_text_032",
    "th": "สถิติประวัติศาสตร์กิจกรรมจริง ณ วัดมหาธาตุ พระนครศรีอยุธยา",
    "en": "Official Historic Field Record at Wat Mahathat",
    "group": "ข้อความหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สถิติประวัติศาสตร์กิจกรรมจริง ณ วัดมหาธาตุ พระนครศรีอยุธยา",
      "en": "Official Historic Field Record at Wat Mahathat"
    }
  },
  {
    "key": "home_text_033",
    "th": "บันทึกทางการล่าสุด: ครั้งที่ 122 (13 พ.ย. 2569)",
    "en": "Updated: Session #122 (Nov 13, 2026)",
    "group": "ข้อความหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "บันทึกทางการล่าสุด",
      "en": "Last updated"
    }
  },
  {
    "key": "home_stat_date",
    "th": "วันที่อัปเดตสถิติ",
    "en": "Statistics date",
    "group": "สถิติและรอบกิจกรรม",
    "kind": "text",
    "limit": 150,
    "defaults": {
      "th": "13 พ.ย. 2569",
      "en": "Nov 13, 2026"
    }
  },
  {
    "key": "home_text_034",
    "th": "ครั้งจัดกิจกรรม",
    "en": "Historic Sessions",
    "group": "ข้อความหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ครั้งจัดกิจกรรม",
      "en": "Historic Sessions"
    }
  },
  {
    "key": "home_text_035",
    "th": "ประวัติศาสตร์อยุธยา",
    "en": "Ayutthaya heritage",
    "group": "ข้อความหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ประวัติศาสตร์อยุธยา",
      "en": "Ayutthaya heritage"
    }
  },
  {
    "key": "home_text_036",
    "th": "ผู้เข้าร่วมทั้งสิ้น (ท่าน)",
    "en": "Total Participants",
    "group": "ข้อความหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ผู้เข้าร่วมทั้งสิ้น (ท่าน)",
      "en": "Total Participants"
    }
  },
  {
    "key": "home_text_037",
    "th": "สนทนาธรรมและสมาธิ",
    "en": "Welcomed warmly",
    "group": "ข้อความหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สนทนาธรรมและสมาธิ",
      "en": "Welcomed warmly"
    }
  },
  {
    "key": "home_text_038",
    "th": "ชนชาติ / ประเทศ",
    "en": "Nations Reached",
    "group": "ข้อความหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ชนชาติ / ประเทศ",
      "en": "Nations Reached"
    }
  },
  {
    "key": "home_text_039",
    "th": "มิตรภาพไร้พรมแดน",
    "en": "Global friendship",
    "group": "ข้อความหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "มิตรภาพไร้พรมแดน",
      "en": "Global friendship"
    }
  },
  {
    "key": "home_text_040",
    "th": "เวลานั่งสมาธิสะสม (ชม.)",
    "en": "Meditation Hours",
    "group": "ข้อความหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "เวลานั่งสมาธิสะสม (ชม.)",
      "en": "Meditation Hours"
    }
  },
  {
    "key": "home_text_042",
    "th": "ฟรี 100% ทุกกิจกรรม",
    "en": "100% Free",
    "group": "ข้อความหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ฟรี 100% ทุกกิจกรรม",
      "en": "100% Free"
    }
  },
  {
    "key": "home_text_043",
    "th": "บริการด้วยกุศลจิต",
    "en": "Universal gift of calm",
    "group": "ข้อความหน้าโฮม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "บริการด้วยกุศลจิต",
      "en": "Universal gift of calm"
    }
  },
  {
    "key": "home_text_044",
    "th": "จันทร์ และ ศุกร์",
    "en": "Mon & Fri",
    "group": "ตารางและสถานที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "จันทร์ และ ศุกร์",
      "en": "Mon & Fri"
    }
  },
  {
    "key": "home_text_045",
    "th": "กิจกรรมนำสมาธิ",
    "en": "Meditation sessions",
    "group": "ตารางและสถานที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "กิจกรรมนำสมาธิ",
      "en": "Meditation sessions"
    }
  },
  {
    "key": "home_text_046",
    "th": "13:15 น. เป็นต้นไป",
    "en": "13:15 onwards",
    "group": "ตารางและสถานที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "13:15 น. เป็นต้นไป",
      "en": "13:15 onwards"
    }
  },
  {
    "key": "home_text_047",
    "th": "เวลาเริ่มกิจกรรม",
    "en": "Starting time",
    "group": "ตารางและสถานที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "เวลาเริ่มกิจกรรม",
      "en": "Starting time"
    }
  },
  {
    "key": "home_text_048",
    "th": "5–10 นาที",
    "en": "5–10 min",
    "group": "ตารางและสถานที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "5–10 นาที",
      "en": "5–10 min"
    }
  },
  {
    "key": "home_text_049",
    "th": "ระยะเวลานำสมาธิ",
    "en": "Guided session",
    "group": "ตารางและสถานที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ระยะเวลานำสมาธิ",
      "en": "Guided session"
    }
  },
  {
    "key": "home_text_050",
    "th": "พระนครศรีอยุธยา",
    "en": "Ayutthaya",
    "group": "ตารางและสถานที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "พระนครศรีอยุธยา",
      "en": "Ayutthaya"
    }
  },
  {
    "key": "home_text_051",
    "th": "วัดมหาธาตุ",
    "en": "Wat Mahathat",
    "group": "ตารางและสถานที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "วัดมหาธาตุ",
      "en": "Wat Mahathat"
    }
  },
  {
    "key": "home_text_054",
    "th": "สมาธิสั้น 5 นาที: พักใจ พักความคิด",
    "en": "A 5-Minute Mental Coffee Break",
    "group": "คำแนะนำฟังสมาธิ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สมาธิสั้น 5 นาที: พักใจ พักความคิด",
      "en": "A 5-Minute Mental Coffee Break"
    }
  },
  {
    "key": "home_text_055",
    "th": "ร่วมฝึกสมาธิเบื้องต้นผ่านเสียงนำสมาธิสากลของพระอาจารย์พสุธ",
    "en": "Listen to our peaceful guided meditation audio by Lp Pasur",
    "group": "คำแนะนำฟังสมาธิ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ร่วมฝึกสมาธิเบื้องต้นผ่านเสียงนำสมาธิสากลของพระอาจารย์พสุธา (มูลนิธิธรรมกาย) นั่งเก้าอี้สบายๆ ค่อยๆ หลับตาลงเบาๆ และรวมใจหยุดนิ่ง ณ ศูนย์กลางกาย",
      "en": "Listen to our peaceful guided meditation audio by Lp Pasura (Dhammakaya Foundation). Sit back comfortably, close your eyes softly, and let your mind settle into gentle stillness."
    }
  },
  {
    "key": "home_text_056",
    "th": "กำลังเล่นเสียงนำสมาธิ",
    "en": "Playing Guided Audio",
    "group": "คำแนะนำฟังสมาธิ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "กำลังเล่นเสียงนำสมาธิ",
      "en": "Playing Guided Audio"
    }
  },
  {
    "key": "home_text_057",
    "th": "แตะเพื่อเริ่มสมาธิ",
    "en": "Tap to Start Audio",
    "group": "คำแนะนำฟังสมาธิ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "แตะเพื่อเริ่มสมาธิ",
      "en": "Tap to Start Audio"
    }
  },
  {
    "key": "home_text_058",
    "th": "สิ่งที่จะได้สัมผัสในกิจกรรม",
    "en": "What to expect",
    "group": "สิ่งที่จะได้สัมผัส",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สิ่งที่จะได้สัมผัสในกิจกรรม",
      "en": "What to expect"
    }
  },
  {
    "key": "home_text_059",
    "th": "ล้อมวงคุยสบายๆ ใต้ร่มเงาไม้โบราณสถาน กับพระนิสิต มจร อย่าง",
    "en": "Sit under the historic trees with MCU student monks. Frien",
    "group": "สิ่งที่จะได้สัมผัส",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ล้อมวงคุยสบายๆ ใต้ร่มเงาไม้โบราณสถาน กับพระนิสิต มจร อย่างเป็นมิตรและเป็นกันเอง",
      "en": "Sit under the historic trees with MCU student monks. Friendly, open, and peaceful."
    }
  },
  {
    "key": "home_text_060",
    "th": "คำถามยอดนิยม",
    "en": "Top Curiosities",
    "group": "คำถามแนะนำ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "คำถามยอดนิยม",
      "en": "Top Curiosities"
    }
  },
  {
    "key": "home_text_061",
    "th": "ข้อสงสัยที่นักท่องเที่ยวมักถามบ่อย",
    "en": "Questions Visitors Wonder Most",
    "group": "คำถามแนะนำ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ข้อสงสัยที่นักท่องเที่ยวมักถามบ่อย",
      "en": "Questions Visitors Wonder Most"
    }
  },
  {
    "key": "home_text_062",
    "th": "ดูคลังคำถาม 200 ข้อ",
    "en": "View all 200 Q&As",
    "group": "คำถามแนะนำ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ดูคลังคำถาม 200 ข้อ",
      "en": "View all 200 Q&As"
    }
  },
  {
    "key": "home_text_063",
    "th": "สถานที่และแผนที่",
    "en": "Location & map",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สถานที่และแผนที่",
      "en": "Location & map"
    }
  },
  {
    "key": "home_text_064",
    "th": "จุดนัดพบกิจกรรม Monk Chat ใต้ร่มไม้ใหญ่ ณ วัดมหาธาตุ พระนค",
    "en": "How to find our shaded outdoor meeting spot inside Wat Mah",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "จุดนัดพบกิจกรรม Monk Chat ใต้ร่มไม้ใหญ่ ณ วัดมหาธาตุ พระนครศรีอยุธยา",
      "en": "How to find our shaded outdoor meeting spot inside Wat Mahathat, Ayutthaya."
    }
  },
  {
    "key": "home_image_065",
    "th": "รูปสถานที่",
    "en": "Location image",
    "group": "สถานที่และแผนที่",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/home/monkchat-spot-wat-mahathat.jpg",
      "en": "/images/home/monkchat-spot-wat-mahathat.jpg"
    }
  },
  {
    "key": "home_text_066",
    "th": "ภาพจุดจัดกิจกรรม Monk Chat จริงใต้ร่มไม้ใหญ่ วัดมหาธาตุ พร",
    "en": "Real Monk Chat outdoor meeting spot under the shade trees ",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ภาพจุดจัดกิจกรรม Monk Chat จริงใต้ร่มไม้ใหญ่ วัดมหาธาตุ พระนครศรีอยุธยา",
      "en": "Real Monk Chat outdoor meeting spot under the shade trees at Wat Mahathat, Ayutthaya"
    }
  },
  {
    "key": "home_text_067",
    "th": "ภาพจุดกิจกรรมจริง · ใต้ร่มไม้ใหญ่ วัดมหาธาตุ",
    "en": "Real meeting spot · Under shade trees",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ภาพจุดกิจกรรมจริง · ใต้ร่มไม้ใหญ่ วัดมหาธาตุ",
      "en": "Real meeting spot · Under shade trees"
    }
  },
  {
    "key": "home_text_068",
    "th": "จุดนัดพบโบราณสถาน",
    "en": "Historic Site",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "จุดนัดพบโบราณสถาน",
      "en": "Historic Site"
    }
  },
  {
    "key": "home_text_069",
    "th": "วัดมหาธาตุ พระนครศรีอยุธยา",
    "en": "Wat Mahathat, Ayutthaya",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "วัดมหาธาตุ พระนครศรีอยุธยา",
      "en": "Wat Mahathat, Ayutthaya"
    }
  },
  {
    "key": "home_text_070",
    "th": "บริเวณลานร่มไม้ใหญ่ภายในวัดมหาธาตุ ใกล้พระปรางค์ประธาน เดิ",
    "en": "Shaded courtyard inside Wat Mahathat, near the central pra",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "บริเวณลานร่มไม้ใหญ่ภายในวัดมหาธาตุ ใกล้พระปรางค์ประธาน เดินเข้ามานั่งเก้าอี้ใต้ร่มไม้ได้เลย มีพระนิสิตคอยต้อนรับอย่างอบอุ่นและเป็นกันเอง",
      "en": "Shaded courtyard inside Wat Mahathat, near the central prang. Feel free to walk in and take a chair under the trees. Monks are warmly waiting to welcome you."
    }
  },
  {
    "key": "home_text_071",
    "th": "จุดนัดพบ: ลานร่มไม้ภายในวัดมหาธาตุ พระนครศรีอยุธยา",
    "en": "Wat Mahathat (near central prang), Ayutthaya",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "จุดนัดพบ: ลานร่มไม้ภายในวัดมหาธาตุ พระนครศรีอยุธยา",
      "en": "Wat Mahathat (near central prang), Ayutthaya"
    }
  },
  {
    "key": "home_text_072",
    "th": "ทุกวันจันทร์และวันศุกร์ เวลา 13:15 น. เป็นต้นไป",
    "en": "Every Monday & Friday from 13:15 onwards",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ทุกวันจันทร์และวันศุกร์ เวลา 13:15 น. เป็นต้นไป",
      "en": "Every Monday & Friday from 13:15 onwards"
    }
  },
  {
    "key": "home_text_073",
    "th": "เข้าร่วมฟรี ไม่มีค่าใช้จ่าย เดินเข้ามานั่งเก้าอี้พูดคุยได้",
    "en": "Free walk-in, no booking required. Welcoming all cultures ",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "เข้าร่วมฟรี ไม่มีค่าใช้จ่าย เดินเข้ามานั่งเก้าอี้พูดคุยได้ทันที",
      "en": "Free walk-in, no booking required. Welcoming all cultures and backgrounds."
    }
  },
  {
    "key": "home_text_074",
    "th": "ดูแผนที่",
    "en": "View map",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ดูแผนที่",
      "en": "View map"
    }
  },
  {
    "key": "home_text_075",
    "th": "ขอเส้นทาง",
    "en": "Get directions",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ขอเส้นทาง",
      "en": "Get directions"
    }
  },
  {
    "key": "home_text_076",
    "th": "แผนที่จริง · วัดมหาธาตุ พระนครศรีอยุธยา",
    "en": "Real Map · Wat Mahathat, Phra Nakhon Si Ayutthaya",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "แผนที่จริง · วัดมหาธาตุ พระนครศรีอยุธยา",
      "en": "Real Map · Wat Mahathat, Phra Nakhon Si Ayutthaya"
    }
  },
  {
    "key": "home_text_077",
    "th": "เปิดแผนที่เต็มบน Google Maps",
    "en": "Open full Google Maps",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "เปิดแผนที่เต็มบน Google Maps",
      "en": "Open full Google Maps"
    }
  },
  {
    "key": "home_text_078",
    "th": "แผนที่จริง วัดมหาธาตุ พระนครศรีอยุธยา",
    "en": "Google Map of Wat Mahathat, Ayutthaya",
    "group": "สถานที่และแผนที่",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "แผนที่จริง วัดมหาธาตุ พระนครศรีอยุธยา",
      "en": "Google Map of Wat Mahathat, Ayutthaya"
    }
  },
  {
    "key": "home_text_079",
    "th": "บรรยากาศสถานที่จริง",
    "en": "Real Surroundings",
    "group": "ภาพบรรยากาศ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "บรรยากาศสถานที่จริง",
      "en": "Real Surroundings"
    }
  },
  {
    "key": "home_text_080",
    "th": "บรรยากาศกิจกรรมและสถานที่",
    "en": "Atmosphere & surroundings",
    "group": "ภาพบรรยากาศ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "บรรยากาศกิจกรรมและสถานที่",
      "en": "Atmosphere & surroundings"
    }
  },
  {
    "key": "home_text_081",
    "th": "สัมผัสความเรียบง่าย สงบเย็น และเป็นกันเองท่ามกลางเมืองประว",
    "en": "Calm open-air dialogue and beginner meditation surrounded ",
    "group": "ภาพบรรยากาศ",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สัมผัสความเรียบง่าย สงบเย็น และเป็นกันเองท่ามกลางเมืองประวัติศาสตร์พระนครศรีอยุธยา",
      "en": "Calm open-air dialogue and beginner meditation surrounded by Ayutthaya heritage."
    }
  },
  {
    "key": "home_stat_sessions",
    "th": "จำนวนครั้งกิจกรรม",
    "en": "จำนวนครั้งกิจกรรม",
    "group": "สถิติและรอบกิจกรรม",
    "kind": "number",
    "limit": 12,
    "defaults": {
      "th": "122",
      "en": "122"
    }
  },
  {
    "key": "home_stat_participants",
    "th": "จำนวนผู้เข้าร่วม",
    "en": "จำนวนผู้เข้าร่วม",
    "group": "สถิติและรอบกิจกรรม",
    "kind": "number",
    "limit": 12,
    "defaults": {
      "th": "15317",
      "en": "15317"
    }
  },
  {
    "key": "home_stat_nations",
    "th": "จำนวนประเทศ",
    "en": "จำนวนประเทศ",
    "group": "สถิติและรอบกิจกรรม",
    "kind": "number",
    "limit": 12,
    "defaults": {
      "th": "94",
      "en": "94"
    }
  },
  {
    "key": "home_stat_hours",
    "th": "ชั่วโมงสมาธิสะสม",
    "en": "ชั่วโมงสมาธิสะสม",
    "group": "สถิติและรอบกิจกรรม",
    "kind": "number",
    "limit": 12,
    "defaults": {
      "th": "1276",
      "en": "1276"
    }
  },
  {
    "key": "home_stat_minutes",
    "th": "นาทีสมาธิสะสม",
    "en": "Total meditation minutes",
    "group": "สถิติและรอบกิจกรรม",
    "kind": "number",
    "limit": 12,
    "defaults": {
      "th": "76585",
      "en": "76585"
    }
  },
  {
    "key": "home_cost",
    "th": "ข้อความค่าเข้าร่วม",
    "en": "Participation cost",
    "group": "สถิติและรอบกิจกรรม",
    "kind": "text",
    "limit": 100,
    "defaults": {
      "th": "0 ฿",
      "en": "0 ฿"
    }
  },
  {
    "key": "home_station_label",
    "th": "ป้ายส่วนเสียง",
    "en": "ป้ายส่วนเสียง",
    "group": "คำแนะนำฟังสมาธิ",
    "kind": "text",
    "limit": 250,
    "defaults": {
      "th": "🎧 ONE-TAP MEDITATION STATION",
      "en": "🎧 ONE-TAP MEDITATION STATION"
    }
  },
  {
    "key": "home_relax_quote",
    "th": "ข้อความขณะฟังเสียง",
    "en": "ข้อความขณะฟังเสียง",
    "group": "คำแนะนำฟังสมาธิ",
    "kind": "text",
    "limit": 250,
    "defaults": {
      "th": "Relax your body and mind...",
      "en": "Relax your body and mind..."
    }
  },
  {
    "key": "home_map_url",
    "th": "ลิงก์เปิดแผนที่",
    "en": "ลิงก์เปิดแผนที่",
    "group": "สถานที่และแผนที่",
    "kind": "url",
    "limit": 1000,
    "defaults": {
      "th": "https://www.google.com/maps/search/?api=1&query=14.3570,100.5675",
      "en": "https://www.google.com/maps/search/?api=1&query=14.3570,100.5675"
    }
  },
  {
    "key": "home_map_embed",
    "th": "แผนที่ฝัง",
    "en": "แผนที่ฝัง",
    "group": "สถานที่และแผนที่",
    "kind": "map",
    "limit": 1000,
    "defaults": {
      "th": "https://maps.google.com/maps?q=14.3570,100.5675&z=17&output=embed",
      "en": "https://maps.google.com/maps?q=14.3570,100.5675&z=17&output=embed"
    }
  },
  {
    "key": "activity_hero_badge",
    "th": "ป้ายไฮไลต์",
    "en": "ป้ายไฮไลต์",
    "group": "หัวข้อและไฮไลต์กิจกรรม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "วัดมหาธาตุ · มรดกโลกอยุธยา",
      "en": "Wat Mahathat · Ayutthaya Heritage"
    },
    "path": [
      "hero",
      "badge"
    ]
  },
  {
    "key": "activity_hero_eyebrow",
    "th": "คำโปรยส่วน",
    "en": "คำโปรยส่วน",
    "group": "หัวข้อและไฮไลต์กิจกรรม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "MONK CHAT & MEDITATION",
      "en": "MONK CHAT & MEDITATION"
    },
    "path": [
      "hero",
      "eyebrow"
    ]
  },
  {
    "key": "activity_hero_chips_0_label",
    "th": "ข้อความไฮไลต์",
    "en": "ข้อความไฮไลต์",
    "group": "หัวข้อและไฮไลต์กิจกรรม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "Free Walk-in · เข้าร่วมได้ทันที",
      "en": "Free Walk-in · No Booking"
    },
    "path": [
      "hero",
      "chips",
      "0",
      "label"
    ]
  },
  {
    "key": "activity_hero_chips_1_label",
    "th": "ข้อความไฮไลต์",
    "en": "ข้อความไฮไลต์",
    "group": "หัวข้อและไฮไลต์กิจกรรม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ทุกวันจันทร์และวันศุกร์ 13:15 น. เป็นต้นไป",
      "en": "Every Mon & Fri · 13:15 onwards"
    },
    "path": [
      "hero",
      "chips",
      "1",
      "label"
    ]
  },
  {
    "key": "activity_hero_chips_2_label",
    "th": "ข้อความไฮไลต์",
    "en": "ข้อความไฮไลต์",
    "group": "หัวข้อและไฮไลต์กิจกรรม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ลานร่มไม้ใหญ่ วัดมหาธาตุ อยุธยา",
      "en": "Shaded courtyard, Wat Mahathat"
    },
    "path": [
      "hero",
      "chips",
      "2",
      "label"
    ]
  },
  {
    "key": "activity_gallery_eyebrow",
    "th": "คำโปรยส่วน",
    "en": "คำโปรยส่วน",
    "group": "หัวข้อส่วนกิจกรรม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ภาพบรรยากาศและกิจกรรม",
      "en": "Moments & Atmosphere"
    },
    "path": [
      "gallery",
      "eyebrow"
    ]
  },
  {
    "key": "activity_gallery_title",
    "th": "หัวข้อ",
    "en": "หัวข้อ",
    "group": "หัวข้อส่วนกิจกรรม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "บรรยากาศจริงรอบกิจกรรม Monk Chat",
      "en": "Real Atmosphere Around Monk Chat"
    },
    "path": [
      "gallery",
      "title"
    ]
  },
  {
    "key": "activity_gallery_pillLabel",
    "th": "ป้ายข้อความ",
    "en": "ป้ายข้อความ",
    "group": "หัวข้อส่วนกิจกรรม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "บรรยากาศจริง ณ วัดมหาธาตุ อยุธยา",
      "en": "Wat Mahathat, Ayutthaya"
    },
    "path": [
      "gallery",
      "pillLabel"
    ]
  },
  {
    "key": "activity_gallery_scheduleNoteTitle",
    "th": "หัวข้อหมายเหตุ",
    "en": "หัวข้อหมายเหตุ",
    "group": "หัวข้อส่วนกิจกรรม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ข้อแนะนำตารางกิจกรรม:",
      "en": "Schedule note:"
    },
    "path": [
      "gallery",
      "scheduleNoteTitle"
    ]
  },
  {
    "key": "activity_gallery_scheduleNoteBody",
    "th": "หมายเหตุเวลา",
    "en": "หมายเหตุเวลา",
    "group": "หัวข้อส่วนกิจกรรม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "จัดเป็นประจำทุกวันจันทร์และวันศุกร์ ตั้งแต่เวลา 13:15 น. เป็นต้นไป (เข้าร่วมฟรี ไม่ต้องลงทะเบียนล่วงหน้า) รอบกิจกรรมอาจปรับตามตารางการศึกษาหรือศาสนกิจของพระนิสิต",
      "en": "Held every Monday and Friday from 13:15 onwards at Wat Mahathat (free walk-in, no advance registration required). Times may occasionally adjust for academic examinations or monastic duties."
    },
    "path": [
      "gallery",
      "scheduleNoteBody"
    ]
  },
  {
    "key": "activity_gallery_cards_0_image",
    "th": "รูปภาพ",
    "en": "รูปภาพ",
    "group": "การ์ดกิจกรรม 1",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/activities/activity-1.jpg",
      "en": "/images/activities/activity-1.jpg"
    },
    "path": [
      "gallery",
      "cards",
      "0",
      "image"
    ]
  },
  {
    "key": "activity_gallery_cards_0_badge",
    "th": "ป้ายไฮไลต์",
    "en": "ป้ายไฮไลต์",
    "group": "การ์ดกิจกรรม 1",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ลานประวัติศาสตร์",
      "en": "Historic Courtyard"
    },
    "path": [
      "gallery",
      "cards",
      "0",
      "badge"
    ]
  },
  {
    "key": "activity_gallery_cards_0_title",
    "th": "หัวข้อ",
    "en": "หัวข้อ",
    "group": "การ์ดกิจกรรม 1",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สนทนาธรรม Monk Chat ณ วัดมหาธาตุ",
      "en": "Monk Chat at Wat Mahathat"
    },
    "path": [
      "gallery",
      "cards",
      "0",
      "title"
    ]
  },
  {
    "key": "activity_gallery_cards_0_description",
    "th": "รายละเอียด",
    "en": "รายละเอียด",
    "group": "การ์ดกิจกรรม 1",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "บรรยากาศสงบร่มเย็นใต้ร่มไม้ใหญ่เคียงข้างโบราณสถานวัดมหาธาตุ ชาวไทยและนักท่องเที่ยวร่วมสนทนาอย่างอบอุ่นและผ่อนคลาย",
      "en": "Open, welcoming Dhamma conversation under the shade trees beside historic Wat Mahathat with MCU student monks."
    },
    "path": [
      "gallery",
      "cards",
      "0",
      "description"
    ]
  },
  {
    "key": "activity_gallery_cards_0_metaLeft",
    "th": "ข้อความด้านล่างซ้าย",
    "en": "ข้อความด้านล่างซ้าย",
    "group": "การ์ดกิจกรรม 1",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "วงสนทนากลางแจ้ง",
      "en": "Open-air setting"
    },
    "path": [
      "gallery",
      "cards",
      "0",
      "metaLeft"
    ]
  },
  {
    "key": "activity_gallery_cards_0_metaRight",
    "th": "ข้อความด้านล่างขวา",
    "en": "ข้อความด้านล่างขวา",
    "group": "การ์ดกิจกรรม 1",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "Free Walk-in",
      "en": "Free Walk-in"
    },
    "path": [
      "gallery",
      "cards",
      "0",
      "metaRight"
    ]
  },
  {
    "key": "activity_gallery_cards_1_image",
    "th": "รูปภาพ",
    "en": "รูปภาพ",
    "group": "การ์ดกิจกรรม 2",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/activities/activity-2.jpg",
      "en": "/images/activities/activity-2.jpg"
    },
    "path": [
      "gallery",
      "cards",
      "1",
      "image"
    ]
  },
  {
    "key": "activity_gallery_cards_1_badge",
    "th": "ป้ายไฮไลต์",
    "en": "ป้ายไฮไลต์",
    "group": "การ์ดกิจกรรม 2",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "เสวนาเปิดใจ",
      "en": "Open Dialogue"
    },
    "path": [
      "gallery",
      "cards",
      "1",
      "badge"
    ]
  },
  {
    "key": "activity_gallery_cards_1_title",
    "th": "หัวข้อ",
    "en": "หัวข้อ",
    "group": "การ์ดกิจกรรม 2",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "แลกเปลี่ยนภาษาและมุมมองธรรมะ",
      "en": "Language & Dhamma Exchange"
    },
    "path": [
      "gallery",
      "cards",
      "1",
      "title"
    ]
  },
  {
    "key": "activity_gallery_cards_1_description",
    "th": "รายละเอียด",
    "en": "รายละเอียด",
    "group": "การ์ดกิจกรรม 2",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "พระนิสิตพร้อมตอบคำถามเกี่ยวกับวิถีชีวิตพระสงฆ์ ความหมายของการฝึกสติ และหลักคิดดีงามในการดำเนินชีวิตประจำวัน",
      "en": "MCU student monks share perspectives on monastic life, mindfulness, and practical Thai Buddhist wisdom."
    },
    "path": [
      "gallery",
      "cards",
      "1",
      "description"
    ]
  },
  {
    "key": "activity_gallery_cards_1_metaLeft",
    "th": "ข้อความด้านล่างซ้าย",
    "en": "ข้อความด้านล่างซ้าย",
    "group": "การ์ดกิจกรรม 2",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "English & Thai",
      "en": "English & Thai"
    },
    "path": [
      "gallery",
      "cards",
      "1",
      "metaLeft"
    ]
  },
  {
    "key": "activity_gallery_cards_1_metaRight",
    "th": "ข้อความด้านล่างขวา",
    "en": "ข้อความด้านล่างขวา",
    "group": "การ์ดกิจกรรม 2",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "13:15 น. เป็นต้นไป",
      "en": "13:15 onwards"
    },
    "path": [
      "gallery",
      "cards",
      "1",
      "metaRight"
    ]
  },
  {
    "key": "activity_gallery_cards_2_image",
    "th": "รูปภาพ",
    "en": "รูปภาพ",
    "group": "การ์ดกิจกรรม 3",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/activities/activity-3.jpg",
      "en": "/images/activities/activity-3.jpg"
    },
    "path": [
      "gallery",
      "cards",
      "2",
      "image"
    ]
  },
  {
    "key": "activity_gallery_cards_2_badge",
    "th": "ป้ายไฮไลต์",
    "en": "ป้ายไฮไลต์",
    "group": "การ์ดกิจกรรม 3",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "เจริญสติภาวนา",
      "en": "Mindfulness"
    },
    "path": [
      "gallery",
      "cards",
      "2",
      "badge"
    ]
  },
  {
    "key": "activity_gallery_cards_2_title",
    "th": "หัวข้อ",
    "en": "หัวข้อ",
    "group": "การ์ดกิจกรรม 3",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "เจริญสติกำหนดลมหายใจ",
      "en": "Mindful Breath Meditation (5–10 min)"
    },
    "path": [
      "gallery",
      "cards",
      "2",
      "title"
    ]
  },
  {
    "key": "activity_gallery_cards_2_description",
    "th": "รายละเอียด",
    "en": "รายละเอียด",
    "group": "การ์ดกิจกรรม 3",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สัมผัสความสงบภายในใจด้วยการกำหนดสติรับรู้ลมหายใจเข้า-ออก ปฏิบัติได้ง่าย ๆ เหมาะสำหรับผู้เริ่มต้นทุกพื้นฐาน",
      "en": "Gentle 5–10 minute breath awareness practiced on temple grounds or anytime through our guided web audio."
    },
    "path": [
      "gallery",
      "cards",
      "2",
      "description"
    ]
  },
  {
    "key": "activity_gallery_cards_2_metaLeft",
    "th": "ข้อความด้านล่างซ้าย",
    "en": "ข้อความด้านล่างซ้าย",
    "group": "การ์ดกิจกรรม 3",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "Mindfulness",
      "en": "Mindfulness"
    },
    "path": [
      "gallery",
      "cards",
      "2",
      "metaLeft"
    ]
  },
  {
    "key": "activity_gallery_cards_2_metaRight",
    "th": "ข้อความด้านล่างขวา",
    "en": "ข้อความด้านล่างขวา",
    "group": "การ์ดกิจกรรม 3",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ฟังเสียงนำสมาธิ →",
      "en": "Try guided audio →"
    },
    "path": [
      "gallery",
      "cards",
      "2",
      "metaRight"
    ]
  },
  {
    "key": "activity_gallery_cards_2_linkTo",
    "th": "ลิงก์การ์ด",
    "en": "ลิงก์การ์ด",
    "group": "การ์ดกิจกรรม 3",
    "kind": "route",
    "limit": 1000,
    "defaults": {
      "th": "/meditation",
      "en": "/meditation"
    },
    "path": [
      "gallery",
      "cards",
      "2",
      "linkTo"
    ]
  },
  {
    "key": "activity_gallery_cards_3_image",
    "th": "รูปภาพ",
    "en": "รูปภาพ",
    "group": "การ์ดกิจกรรม 4",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/activities/activity-4.jpg",
      "en": "/images/activities/activity-4.jpg"
    },
    "path": [
      "gallery",
      "cards",
      "3",
      "image"
    ]
  },
  {
    "key": "activity_gallery_cards_3_badge",
    "th": "ป้ายไฮไลต์",
    "en": "ป้ายไฮไลต์",
    "group": "การ์ดกิจกรรม 4",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "บรรยากาศธรรมชาติ",
      "en": "Natural Setting"
    },
    "path": [
      "gallery",
      "cards",
      "3",
      "badge"
    ]
  },
  {
    "key": "activity_gallery_cards_3_title",
    "th": "หัวข้อ",
    "en": "หัวข้อ",
    "group": "การ์ดกิจกรรม 4",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สนทนาผ่อนคลายไร้พรมแดน",
      "en": "Welcoming Conversation"
    },
    "path": [
      "gallery",
      "cards",
      "3",
      "title"
    ]
  },
  {
    "key": "activity_gallery_cards_3_description",
    "th": "รายละเอียด",
    "en": "รายละเอียด",
    "group": "การ์ดกิจกรรม 4",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "นั่งเก้าอี้สบายใต้ร่มไม้ใหญ่ พูดคุยเปิดใจแลกเปลี่ยนความเห็นด้านวัฒนธรรมท่ามกลางโบราณสถานอยุธยา",
      "en": "Relaxed open-air dialogue under tree shade, welcoming questions from visitors of every culture and belief."
    },
    "path": [
      "gallery",
      "cards",
      "3",
      "description"
    ]
  },
  {
    "key": "activity_gallery_cards_3_metaLeft",
    "th": "ข้อความด้านล่างซ้าย",
    "en": "ข้อความด้านล่างซ้าย",
    "group": "การ์ดกิจกรรม 4",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "Open Discussion",
      "en": "Open Discussion"
    },
    "path": [
      "gallery",
      "cards",
      "3",
      "metaLeft"
    ]
  },
  {
    "key": "activity_gallery_cards_3_metaRight",
    "th": "ข้อความด้านล่างขวา",
    "en": "ข้อความด้านล่างขวา",
    "group": "การ์ดกิจกรรม 4",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "พระสงฆ์ & ผู้มาเยือน",
      "en": "Monks & Visitors"
    },
    "path": [
      "gallery",
      "cards",
      "3",
      "metaRight"
    ]
  },
  {
    "key": "activity_gallery_cards_4_image",
    "th": "รูปภาพ",
    "en": "รูปภาพ",
    "group": "การ์ดกิจกรรม 5",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/activities/activity-5.jpg",
      "en": "/images/activities/activity-5.jpg"
    },
    "path": [
      "gallery",
      "cards",
      "4",
      "image"
    ]
  },
  {
    "key": "activity_gallery_cards_4_badge",
    "th": "ป้ายไฮไลต์",
    "en": "ป้ายไฮไลต์",
    "group": "การ์ดกิจกรรม 5",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ช่วงเวลาสงบ",
      "en": "Peaceful Moment"
    },
    "path": [
      "gallery",
      "cards",
      "4",
      "badge"
    ]
  },
  {
    "key": "activity_gallery_cards_4_title",
    "th": "หัวข้อ",
    "en": "หัวข้อ",
    "group": "การ์ดกิจกรรม 5",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ช่วงเวลาแห่งความสงบร่วมกัน",
      "en": "Shared Stillness Together"
    },
    "path": [
      "gallery",
      "cards",
      "4",
      "title"
    ]
  },
  {
    "key": "activity_gallery_cards_4_description",
    "th": "รายละเอียด",
    "en": "รายละเอียด",
    "group": "การ์ดกิจกรรม 5",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ผู้มาเยือนจากหลากหลายประเทศร่วมหลับตาทำใจให้สงบ ตระหนักรู้ความผ่อนคลายท่ามกลางบรรยากาศวัด",
      "en": "Visitors from around the world pause together in quiet breath meditation, stepping away from busy travel."
    },
    "path": [
      "gallery",
      "cards",
      "4",
      "description"
    ]
  },
  {
    "key": "activity_gallery_cards_4_metaLeft",
    "th": "ข้อความด้านล่างซ้าย",
    "en": "ข้อความด้านล่างซ้าย",
    "group": "การ์ดกิจกรรม 5",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "Peaceful Moment",
      "en": "Peaceful Moment"
    },
    "path": [
      "gallery",
      "cards",
      "4",
      "metaLeft"
    ]
  },
  {
    "key": "activity_gallery_cards_4_metaRight",
    "th": "ข้อความด้านล่างขวา",
    "en": "ข้อความด้านล่างขวา",
    "group": "การ์ดกิจกรรม 5",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สงบและผ่อนคลาย",
      "en": "Peace & Calm"
    },
    "path": [
      "gallery",
      "cards",
      "4",
      "metaRight"
    ]
  },
  {
    "key": "activity_gallery_cards_5_image",
    "th": "รูปภาพ",
    "en": "รูปภาพ",
    "group": "การ์ดกิจกรรม 6",
    "kind": "image",
    "limit": 1000,
    "defaults": {
      "th": "/images/activities/activity-6.jpg",
      "en": "/images/activities/activity-6.jpg"
    },
    "path": [
      "gallery",
      "cards",
      "5",
      "image"
    ]
  },
  {
    "key": "activity_gallery_cards_5_badge",
    "th": "ป้ายไฮไลต์",
    "en": "ป้ายไฮไลต์",
    "group": "การ์ดกิจกรรม 6",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "มิตรภาพและรอยยิ้ม",
      "en": "Cultural Exchange"
    },
    "path": [
      "gallery",
      "cards",
      "5",
      "badge"
    ]
  },
  {
    "key": "activity_gallery_cards_5_title",
    "th": "หัวข้อ",
    "en": "หัวข้อ",
    "group": "การ์ดกิจกรรม 6",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "รอยยิ้มและมิตรภาพอันอบอุ่น",
      "en": "Warm Hospitality & Friendship"
    },
    "path": [
      "gallery",
      "cards",
      "5",
      "title"
    ]
  },
  {
    "key": "activity_gallery_cards_5_description",
    "th": "รายละเอียด",
    "en": "รายละเอียด",
    "group": "การ์ดกิจกรรม 6",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สร้างความเข้าใจต่างวัฒนธรรมอย่างเป็นกันเอง พระนิสิตพร้อมต้อนรับและให้คำแนะนำอย่างเปิดกว้าง",
      "en": "Friendly cross-cultural connection where MCU student monks warmly greet and guide first-time visitors."
    },
    "path": [
      "gallery",
      "cards",
      "5",
      "description"
    ]
  },
  {
    "key": "activity_gallery_cards_5_metaLeft",
    "th": "ข้อความด้านล่างซ้าย",
    "en": "ข้อความด้านล่างซ้าย",
    "group": "การ์ดกิจกรรม 6",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "Cultural Exchange",
      "en": "Cultural Exchange"
    },
    "path": [
      "gallery",
      "cards",
      "5",
      "metaLeft"
    ]
  },
  {
    "key": "activity_gallery_cards_5_metaRight",
    "th": "ข้อความด้านล่างขวา",
    "en": "ข้อความด้านล่างขวา",
    "group": "การ์ดกิจกรรม 6",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ทุกคนร่วมได้",
      "en": "All welcome"
    },
    "path": [
      "gallery",
      "cards",
      "5",
      "metaRight"
    ]
  },
  {
    "key": "activity_etiquette_eyebrow",
    "th": "คำโปรยส่วน",
    "en": "คำโปรยส่วน",
    "group": "หัวข้อส่วนกิจกรรม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ข้อควรปฏิบัติสำหรับผู้ร่วมกิจกรรม",
      "en": "Visitor Etiquette"
    },
    "path": [
      "etiquette",
      "eyebrow"
    ]
  },
  {
    "key": "activity_etiquette_title",
    "th": "หัวข้อ",
    "en": "หัวข้อ",
    "group": "หัวข้อส่วนกิจกรรม",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ร่วมกิจกรรมกลางแจ้งอย่างสบายใจ",
      "en": "A Comfortable Outdoor Visit"
    },
    "path": [
      "etiquette",
      "title"
    ]
  },
  {
    "key": "activity_etiquette_items_0_title",
    "th": "หัวข้อ",
    "en": "หัวข้อ",
    "group": "ข้อแนะนำ 1",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "การแต่งกายสุภาพ",
      "en": "Dress Modestly"
    },
    "path": [
      "etiquette",
      "items",
      "0",
      "title"
    ]
  },
  {
    "key": "activity_etiquette_items_0_description",
    "th": "รายละเอียด",
    "en": "รายละเอียด",
    "group": "ข้อแนะนำ 1",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สวมใส่เสื้อผ้าสุภาพ ปกปิดหัวไหล่และหัวเข่า เพื่อแสดงความเคารพต่อสถานที่ศักดิ์สิทธิ์",
      "en": "Please wear clothing that covers your shoulders and knees out of respect for the monastic setting."
    },
    "path": [
      "etiquette",
      "items",
      "0",
      "description"
    ]
  },
  {
    "key": "activity_etiquette_items_1_title",
    "th": "หัวข้อ",
    "en": "หัวข้อ",
    "group": "ข้อแนะนำ 2",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "สวมรองเท้าเข้าร่วมได้",
      "en": "Keep Your Shoes On"
    },
    "path": [
      "etiquette",
      "items",
      "1",
      "title"
    ]
  },
  {
    "key": "activity_etiquette_items_1_description",
    "th": "รายละเอียด",
    "en": "รายละเอียด",
    "group": "ข้อแนะนำ 2",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "กิจกรรมจัดกลางแจ้งและนั่งเก้าอี้ สวมรองเท้าเข้าร่วมได้ เลือกคู่ที่เดินสบาย",
      "en": "We meet outdoors and sit on chairs. You can keep your shoes on; choose a pair that is comfortable for walking."
    },
    "path": [
      "etiquette",
      "items",
      "1",
      "description"
    ]
  },
  {
    "key": "activity_etiquette_items_2_title",
    "th": "หัวข้อ",
    "en": "หัวข้อ",
    "group": "ข้อแนะนำ 3",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "กิริยาที่สงบสำรวม",
      "en": "Respectful Presence"
    },
    "path": [
      "etiquette",
      "items",
      "2",
      "title"
    ]
  },
  {
    "key": "activity_etiquette_items_2_description",
    "th": "รายละเอียด",
    "en": "รายละเอียด",
    "group": "ข้อแนะนำ 3",
    "kind": "text",
    "limit": 2500,
    "defaults": {
      "th": "ตั้งเสียงโทรศัพท์เป็นระบบเงียบ สำรวมกาย วาจา และพูดคุยด้วยความเคารพเป็นมิตร",
      "en": "Turn mobile phones to silent mode. Speak softly and show kindness towards monks and fellow visitors."
    },
    "path": [
      "etiquette",
      "items",
      "2",
      "description"
    ]
  },
  {
    "key": "activity_card_visible_0",
    "th": "แสดงการ์ดนี้",
    "en": "Show this card",
    "group": "การ์ดกิจกรรม 1",
    "kind": "visible",
    "limit": 5,
    "defaults": {
      "th": "true",
      "en": "true"
    }
  },
  {
    "key": "activity_card_order_0",
    "th": "ลำดับแสดง",
    "en": "Display order",
    "group": "การ์ดกิจกรรม 1",
    "kind": "number",
    "limit": 12,
    "defaults": {
      "th": "1",
      "en": "1"
    }
  },
  {
    "key": "activity_card_visible_1",
    "th": "แสดงการ์ดนี้",
    "en": "Show this card",
    "group": "การ์ดกิจกรรม 2",
    "kind": "visible",
    "limit": 5,
    "defaults": {
      "th": "true",
      "en": "true"
    }
  },
  {
    "key": "activity_card_order_1",
    "th": "ลำดับแสดง",
    "en": "Display order",
    "group": "การ์ดกิจกรรม 2",
    "kind": "number",
    "limit": 12,
    "defaults": {
      "th": "2",
      "en": "2"
    }
  },
  {
    "key": "activity_card_visible_2",
    "th": "แสดงการ์ดนี้",
    "en": "Show this card",
    "group": "การ์ดกิจกรรม 3",
    "kind": "visible",
    "limit": 5,
    "defaults": {
      "th": "true",
      "en": "true"
    }
  },
  {
    "key": "activity_card_order_2",
    "th": "ลำดับแสดง",
    "en": "Display order",
    "group": "การ์ดกิจกรรม 3",
    "kind": "number",
    "limit": 12,
    "defaults": {
      "th": "3",
      "en": "3"
    }
  },
  {
    "key": "activity_card_visible_3",
    "th": "แสดงการ์ดนี้",
    "en": "Show this card",
    "group": "การ์ดกิจกรรม 4",
    "kind": "visible",
    "limit": 5,
    "defaults": {
      "th": "true",
      "en": "true"
    }
  },
  {
    "key": "activity_card_order_3",
    "th": "ลำดับแสดง",
    "en": "Display order",
    "group": "การ์ดกิจกรรม 4",
    "kind": "number",
    "limit": 12,
    "defaults": {
      "th": "4",
      "en": "4"
    }
  },
  {
    "key": "activity_card_visible_4",
    "th": "แสดงการ์ดนี้",
    "en": "Show this card",
    "group": "การ์ดกิจกรรม 5",
    "kind": "visible",
    "limit": 5,
    "defaults": {
      "th": "true",
      "en": "true"
    }
  },
  {
    "key": "activity_card_order_4",
    "th": "ลำดับแสดง",
    "en": "Display order",
    "group": "การ์ดกิจกรรม 5",
    "kind": "number",
    "limit": 12,
    "defaults": {
      "th": "5",
      "en": "5"
    }
  },
  {
    "key": "activity_card_visible_5",
    "th": "แสดงการ์ดนี้",
    "en": "Show this card",
    "group": "การ์ดกิจกรรม 6",
    "kind": "visible",
    "limit": 5,
    "defaults": {
      "th": "true",
      "en": "true"
    }
  },
  {
    "key": "activity_card_order_5",
    "th": "ลำดับแสดง",
    "en": "Display order",
    "group": "การ์ดกิจกรรม 6",
    "kind": "number",
    "limit": 12,
    "defaults": {
      "th": "6",
      "en": "6"
    }
  }
]
