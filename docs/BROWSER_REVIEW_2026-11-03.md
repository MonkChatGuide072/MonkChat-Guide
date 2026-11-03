# ตรวจเว็บจากซอร์สด้วยเบราว์เซอร์จริง — 3 พฤศจิกายน 2569

## สถานะล่าสุด

เปิดเว็บจาก source ที่รับมาได้แล้วผ่าน managed static QA preview โดยใช้ production build จริง ไม่ต้องให้เจ้าของส่งภาพเพิ่มเพื่อเริ่มตรวจ Desktop ผลรอบนี้เพิ่มเติมและแทนข้อจำกัดเรื่อง “ยังเปิด browser ไม่ได้” ในรายงานรอบแรก

Preview นี้เป็นระบบตรวจภายใน ไม่ใช่การเผยแพร่ขึ้น MonkChat Guide production และไม่ใช่ Sites project ใหม่ ซอร์สยังไม่ commit/push/merge/deploy

## วิธีตรวจและขอบเขต

- ใช้ `sites-preview` ตาม managed-preview workflow กับสำเนา static build แยกต่างหาก เพราะ dev preview ไม่เห็น executable ของ dependency ที่ symlink ข้าม checkout
- ใช้ค่าต่อ Supabase สาธารณะที่มีอยู่แล้วในเครื่องตรวจเพื่อทดสอบการอ่าน public data ไม่ใช้ service key และไม่เพิ่มค่าลับใน ZIP
- อ่าน/กดหน้าจอจริงผ่าน CUA Browser; ตรวจ Home, Activities, Meditation, Q&A และ Centers รวมถึง client navigation กลับ `/visit`
- ขนาดจอที่วัดได้จริง: **1363 × 936 CSS pixels** ห้ามเรียกผลนี้ว่า mobile/tablet หรือครบ 5 viewports
- เก็บ screenshots ที่ถ่ายเองใน `docs/review-evidence/2026-11-03/browser/` ชื่อที่มี `before` หรือไม่มี `after` บางภาพเป็นหลักฐานก่อนแก้ ไม่ใช่ภาพรับรองทุกส่วนของรุ่นสุดท้าย

## สิ่งที่พบและแก้จากการเปิดเว็บจริง

| ข้อค้นพบ | การแก้ |
| --- | --- |
| Hero ใน Home/Meditation/Q&A/Centers มีภาพทึบซ้อน gradient น้ำตาลดำจนฉากแทบไม่เห็น ต่างจากแบบพื้นอ่อนที่เลือก | คืนภาพเต็มความทึบและใช้ ivory overlay กับหัวเรื่องแดงอิฐ ยังใช้ภาพที่มีอยู่ ไม่อ้างว่าเหมือนภาพจำลองทุกจุดหรือได้ภาพท้องฟ้าครามใหม่แล้ว |
| Q&A มี conversation ตัวอย่างที่แต่งตายตัวนอกคลัง โดยแสดงเสมือนคำตอบจริง | ใช้คำถาม/short_answer จากผล query published + verified ชุดเดียวกับ FAQ; ไม่มีข้อมูลให้แสดงสถานะจริงแทนคำตอบจำลอง |
| Q&A แสดง “ผ่านการตรวจรับรอง / ตรวจทานโดยพระอาจารย์และอาจารย์ผู้ทรงคุณวุฒิ” ต่อสาธารณะ | เปลี่ยนเป็นส่วนทางเข้าเรียนรู้และฝึกต่อ ตามขอบเขตที่ไม่แสดงสถานะ/ผู้ตรวจหลังบ้าน |
| FAQ พับข้อสุดท้ายไม่ได้ เพราะ effect เปิดข้อแรกซ้ำเมื่อไม่มีรายการเปิด | กำหนดการเปิดข้อแรกตอนรับข้อมูลเท่านั้น; ทดสอบปิดทุกข้อบนเว็บจริงและเพิ่ม regression assertion |
| Activities ใส่เวลาจบ 15:30 เอง ทั้งที่ข้อมูลที่ใช้ระบุเพียง 13:15 เป็นต้นไป | เอาเวลาจบที่ไม่ได้ยืนยันออกทั้ง TH/EN |
| Centers แสดงหัวข้อ “ในอยุธยา” และจำนวน 4/1/3 ตายตัว แต่ข้อมูลจริงเป็น Netherlands/Singapore/Australia/USA | ใช้หัวข้อ directory กลาง สร้างเมือง/ตัวกรอง/จำนวนจากข้อมูลศูนย์ที่เผยแพร่จริง |
| Centers ติดป้าย Beginner-friendly/Guided เหมือนมีข้อมูลบริการรองรับทุกแห่ง | นำป้ายที่ไม่มีฟิลด์ข้อมูลยืนยันออก และเพิ่มชื่อเข้าถึงได้ให้ช่องค้นหา |
| Meditation ใช้ข้อความ excerpt จาก mockup แทนข้อความถอดเสียงจริง และซ่อน transcript เต็มไว้เพื่อให้ tests หาเจอ | excerpt อ่านจาก transcript ของแทร็กจริง; เอา hidden test-only content ออก และแก้ test ให้กดเปิดข้อความเต็มเหมือนผู้ใช้จริง |

## ผลตรวจผ่านเบราว์เซอร์

| การใช้งาน | หลักฐานที่สังเกตได้ |
| --- | --- |
| Home | เปิดภาษาไทยและหน้า language gate ได้; หลังเลือกภาษาเห็นเมนูและข้อมูลกิจกรรม อ่าน recommended track และ BioLinks จาก Supabase ได้ |
| Activities | เปิด TH/EN ได้; ตารางหลังแก้ระบุ 13:15 onwards โดยไม่มีเวลาจบ 15:30; ไม่พบกิจกรรมร่างที่นำออก |
| Q&A | โหลด 4 คำถามจาก public data; ค้นหาคำที่ไม่มีได้สถานะ no results; ล้างคำค้นหาได้; ปิด FAQ ทุกข้อได้; สลับภาษาไทย/อังกฤษได้; การ์ด preview ใช้คำถามจริงในคลัง |
| Centers | โหลดรายชื่อ 4 ศูนย์ต่างประเทศได้; ตัวกรองแสดง Afferden/Singapore/Berrilee/Azusa; เลือก Afferden แล้วเหลือ Netherlands; sidebar นับเมืองละ 1 แห่งตามข้อมูล |
| Meditation | โหลด audio และ captions อังกฤษได้; กด Play แล้ว `paused=false`, `readyState=4`, `currentTime=5.347842`, `duration=326.147483`, `error=null`; กด Pause แล้วปุ่มกลับเป็น Play |
| Transcript | เปิดข้อความเต็มจริงได้; excerpt หลังแก้เริ่มจาก “It's time to take a mental coffee break.” ตรงกับ transcript ที่โหลด ไม่ใช่ข้อความตัวอย่างใน mockup |
| `/visit` | กด Back to visitor home แล้ว router ไป `/visit` และเปิด Home ภาษาอังกฤษได้ |

ตัว static preview server ไม่รองรับ fallback ของ deep-link โดยตรง (refresh `/centers` ได้ Cannot GET) จึงตรวจเส้นทางผ่านเมนูในแอป ข้อนี้เป็นข้อจำกัดของ static preview และยังไม่ใช่หลักฐานปัญหาบน Cloudflare Pages ซึ่งใช้ `_redirects` อย่าอ้างว่าตรวจ refresh/QR บน Preview ครบแล้ว

## ผลหลังแก้รอบนี้

- **65 tests ผ่านใน 11 files**, lint ผ่าน และ TypeScript/production build ผ่าน
- เพิ่ม/ปรับ tests ที่ป้องกันการแสดงคำตอบตัวอย่างนอกคลัง การอ้างผู้ตรวจ การพับ FAQ ไม่ได้ จำนวนศูนย์สมมติ เวลาจบกิจกรรมที่เติมเอง และการทดสอบ transcript ผ่าน UI จริง
- ฐานข้อมูลและ private AI server ไม่ได้แก้เพิ่มในรอบ browser นี้ ผล 3 isolated DB suites ที่ผ่านในรอบก่อนหน้ายังเป็นหลักฐานของส่วนเดิม ไม่ได้แปลงเป็นผล Supabase gateway
- Logs ล่าสุด: `anti-browser-followup-tests-20261103.log`, `anti-browser-followup-lint-20261103.log`, `anti-browser-followup-build-20261103.log`

## เรื่องที่ยังไม่ยืนยัน

1. Viewport 360/390/768/1024/1440 และพฤติกรรม mobile/tablet จริง ยังไม่ผ่าน browser test ในรอบนี้
2. AI หลังล็อกอินจริงยังต้องทดสอบบน Preview ที่รัน Pages Functions และมี Workers AI binding; static QA ไม่รัน endpoint
3. เสียงเล่นช่วงต้นได้ไม่ได้ยืนยันว่าฟังตรวจครบทั้งไฟล์ คำบรรยายยังจบที่ 300 วินาทีตามหลักฐานเดิม ต้องฟังเทียบช่วงท้ายและยืนยันสิทธิ์สื่อ
4. คำแนะนำสมาธิที่ยังติด Draft for Review รวมถึงการผสมคำแนะนำตามลมหายใจกับวางใจที่ศูนย์กลางกายต้องผ่านผู้รับผิดชอบเนื้อหา ไม่ได้เปลี่ยนคำสอนเองในรอบนี้
5. ภาพ/โลโก้/ฟอนต์และสัดส่วนยังไม่เหมือน mockup ทุกจุด โดยเฉพาะภาพจริงประกอบศูนย์และภาพ Hero; ยังไม่ได้ใช้ภาพสี/typography board ที่ทดลองใหม่เป็น assets production
6. จุดนัดพบ เงื่อนไขเข้าร่วม ข้อมูลเวลาปัจจุบัน และ Google Maps ต้องสอดคล้องกับประกาศผู้จัด ไม่ถือว่า UI อ่าน source ได้เป็นการรับรองตารางงานปัจจุบัน

ใช้ `MonkChat-Guide-browser-reviewed-20261103.zip` เป็น source ล่าสุดสำหรับเทียบงานต่อ รายงานก่อนหน้า `CHATGPT_REVIEW_2026-11-03.md` เก็บไว้เป็นประวัติรอบตรวจโค้ด
