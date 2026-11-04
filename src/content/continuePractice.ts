/** Official destination links checked 2026-11-04. Details remain with each destination. */
export const practiceDestinations = [
  {
    id: 'ayothaya', icon: 'pin', href: 'https://ayothayameditation.com/',
    th: { title: 'ศูนย์ปฏิบัติธรรมอโยธยา', description: 'หากสะดวกฝึกต่อในอยุธยา ดูข้อมูลและสอบถามกิจกรรมกับทางศูนย์ได้', action: 'ดูเว็บไซต์ศูนย์' },
    en: { title: 'Ayothaya Meditation Center', description: 'If you would like to practise in Ayutthaya, explore the center’s information and ask about its activities.', action: 'Visit center website (Thai)' },
  },
  {
    id: 'dhammakaya', icon: 'lotus', href: 'https://en.dhammakaya.net/contact/',
    th: { title: 'วัดพระธรรมกาย', description: 'หากสนใจเรียนรู้เพิ่มเติมที่วัด ดูข้อมูลและติดต่อสอบถามก่อนวางแผนเดินทางได้', action: 'ดูข้อมูลติดต่อวัด (ภาษาอังกฤษ)' },
    en: { title: 'Wat Phra Dhammakaya', description: 'If you would like to learn more at the temple, find visitor information and contact the temple before planning your visit.', action: 'View temple contact details' },
  },
  {
    id: 'branches', icon: 'globe', href: 'https://en.dhammakaya.net/branches/',
    th: { title: 'ศูนย์สาขาวัดพระธรรมกาย', description: 'สำรวจศูนย์ในประเทศต่าง ๆ และสอบถามกิจกรรมกับศูนย์ที่คุณสนใจได้โดยตรง', action: 'สำรวจศูนย์สาขา (ภาษาอังกฤษ)' },
    en: { title: 'Dhammakaya branch centers', description: 'Explore centers in different countries and contact a center you are interested in about its activities.', action: 'Explore branch centers' },
  },
] as const
