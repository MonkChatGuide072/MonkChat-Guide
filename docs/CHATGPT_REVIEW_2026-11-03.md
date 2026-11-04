# ผลตรวจ ZIP ออกแบบใหม่และชุดรวมแก้ไข — 3 พฤศจิกายน 2569

> อัปเดต: รอบต่อมาเปิด Desktop browser ได้แล้วและแก้เพิ่ม ผลล่าสุด 65 tests / 11 files ดู `BROWSER_REVIEW_2026-11-03.md` ข้อจำกัดในเอกสารนี้เป็นสถานะก่อนเปิด Preview

## ผลสรุป

ตรวจ source จาก Antigravity แล้ว พบว่าหน้าสาธารณะปรับใหม่จริง แต่ผู้ช่วย AI ส่วนตัวและมาตรการล็อก Q&A บางส่วนจากชุดรวมก่อนหน้าหายไป จึงจัดทำสำเนารวมที่คืนความสามารถเหล่านี้ โดยรักษา Home/Activities และหน้าตาสาธารณะจาก Anti ไว้

**สถานะ: แก้การถอยหลังของโค้ดที่พบและผ่าน checks ในเครื่องแล้ว ยังยืนยันความเหมือนภาพ/responsive จริงและความพร้อมใช้งานบนระบบจริงไม่ได้**

## ต้นทางและวิธีตรวจ

- ZIP ต้นฉบับ: `MonkChat-Guide-Anti-redesign-20261103.zip`
- SHA256 ต้นฉบับ: `cd0e77c7ac6dd7a9874cad056c3cc5ae3b81fbe6cc79d04f7f4978d2b8cb1054`
- ZIP มี 168 entries และใช้เครื่องหมาย backslash แบบ Windows; แปลงเป็น path ปกติในสำเนาตรวจ พร้อมตรวจ path traversal/symlink ก่อนแตก ไม่แก้ไฟล์แนบต้นฉบับ
- เทียบกับ source ที่ส่งให้ Anti ใน `MonkChat-Guide-Anti-start-20261103.zip` โดยไม่นับ CRLF/LF เป็นการเปลี่ยน logic
- package.json และ package-lock.json ตรงกับฐานเดิม ใช้ dependencies ที่มีอยู่ ไม่เพิ่ม dependency ให้แอป
- ตรวจ Supabase ด้วย PostgreSQL จำลองในเครื่องเท่านั้น ไม่มีการเขียนข้อมูล/Storage/DDL บนโครงการจริง

## ข้อค้นพบจากชุดต้นฉบับ

| ระดับ | ข้อค้นพบที่ตรวจยืนยันได้ | การดำเนินการในชุดรวม |
| --- | --- | --- |
| สูง | `/admin/assistant` และไฟล์หน้า/test หาย เมนูและการ์ด AI ใน CMS หาย endpoint `/api/monk-assistant` ถูกแทนด้วย HTTP 410 | คืนหน้า/route/ทางเข้า CMS/endpoint และ tests จากฐานรวมที่ตรวจไว้ก่อนหน้า |
| สูง | migration Q&A ถอยหลัง: trigger กลับไปทำงานหลัง trigger ที่ normalize ค่า, การล้าง publication/reviewer เมื่อ unverify และการล็อก reviewed ID หาย | คืน canonical migration ฉบับรวมเดิม และคืน expanded security checker |
| สูง | ทดสอบ migration ต้นฉบับด้วย expanded suite แล้วไม่ผ่านกรณี Owner คืน verified เป็น unverified: `is_published` ยังเป็น true แทน false | ชุดรวมผ่านกรณีนี้และ expanded suite ครบ 20 checks |
| สูง | ฟอร์มแก้ Q&A เสีย filtered write / ตรวจ zero-row / รับ 23514 เป็นล็อก รวมถึงการยกเลิก stale load และ reset fields | คืน form และ 6 tests จากฐานรวมเดิม |
| กลาง | รายงาน Anti ระบุ 106 tests / 21 files แต่ `npm test` ใน ZIP จริงได้ 42 tests / 10 files | บันทึกผลจริง ไม่ใช้ผลรายงานแทนหลักฐาน; ชุดรวมหลังคืนความสามารถได้ 64 tests / 11 files |
| กลาง | ไม่มี screenshots Home/Activities/Meditation/Q&A/Centers ตามรายงานอยู่ใน ZIP หรือไฟล์แนบที่ได้รับ มีเพียงภาพ preview การ์ดบอทเก่าและไอคอนแอป | ยังไม่รับรองการเทียบหน้าตาหรือ viewport ไม่สร้างภาพ mockup มาอ้างเป็นผลเว็บจริง |
| กลาง | fixture ทดสอบ AdminQAPage ใช้ role `team` ซึ่งไม่ตรง role จริง `team_member` | แก้ fixture ให้ตรงระบบจริง |
| ข้อความ | CTA ใน Activities ระบุฟังเสียง 5 นาที แม้หลักฐานเสียงจริงประมาณ 5:26 | เปลี่ยนเป็น “ฟังเสียงนำสมาธิ” โดยไม่ตัด/แก้เสียง |

## ส่วนที่ตรวจแล้วคงไว้จาก Anti

- `/` ใช้ VisitPage เป็น Home, `/visit` เป็น alias ที่ยังเข้าถึงได้ และมี `/activities` ใน router
- เมนู Home / Activities / Meditation / Q&A / Centers และหน้าตาสี Warm Heritage ใหม่ยังอยู่ครบ ไม่คืน Layout สาธารณะเป็นรุ่นเก่า
- หน้า Activities ใน source ไม่แสดง Friday Evening Chanting, Heritage Walk, Sunday ceremonies หรือ Retreats แล้ว ข้อเสนออยู่ `docs/content-review/ACTIVITIES_DRAFT_PROPOSALS.md` ซึ่งเป็นเอกสารนอก public build
- FAQ และบอทสาธารณะยัง query เฉพาะ published + verified + is_published และไม่แสดงข้อมูลแหล่งอ้างอิงในบริการบอท เพิ่ม assertion เดิมกลับมาว่าบอทสาธารณะไม่เรียก private AI endpoint
- เก็บการจัดหน้าสมาธิ Beginner Guide / player / transcript / supplementary และ subtitle parser จาก Anti; ไม่เปลี่ยนเนื้อหาธรรมะหรือสื่อออนไลน์
- แยก public `reviewedChatbotCopy` กับ private `assistantCopy` เพื่อให้การคืน AI ส่วนตัวไม่ทำให้บอทสาธารณะใช้ข้อความ/บริการผิดชุด

## ผลตรวจที่รันเอง

| ชุด | ผล |
| --- | --- |
| ZIP ต้นฉบับ: npm test | 42 tests ผ่าน / 10 files |
| ZIP ต้นฉบับ: npm run lint | ผ่าน |
| ZIP ต้นฉบับ: npm run build | ผ่าน รวม TypeScript และ PWA build |
| ZIP ต้นฉบับ: expanded Q&A DB suite | ไม่ผ่าน: unverify แล้วยังมี is_published=true |
| ชุดรวมแก้ไข: npm test | 64 tests ผ่าน / 11 files |
| ชุดรวมแก้ไข: npm run lint | ผ่าน |
| ชุดรวมแก้ไข: npm run build | ผ่าน รวม TypeScript และ PWA build |
| ชุดรวมแก้ไข: expanded Q&A DB suite | 20 checks ผ่าน |
| ชุดรวมแก้ไข: Windows Q&A migration suite | 9 checks ผ่าน |
| ชุดรวมแก้ไข: CMS DB suite | 20 checks ผ่าน |

สาม DB suites มีกรณีทับซ้อนกัน ไม่ใช่ 49 สถานการณ์อิสระ และไม่ใช่การทดสอบ Supabase REST gateway หรือบัญชีจริง หลักฐาน logs อยู่ `docs/review-evidence/2026-11-03/`

## เรื่องที่ยังตรวจไม่ได้/ยังค้าง

1. ไม่มี screenshots จริงของชุด Anti ในไฟล์ที่ได้รับ และสภาพแวดล้อม browser ที่มีเข้าถึง local server นี้ไม่ได้ จึงยังไม่ตรวจรับ 360/390/768/1024/1440px, สี/ฟอนต์จริง, การ crop ภาพ, mobile menu, keyboard และการบังเนื้อหาของ widget
2. สีฟ้าคราม/เขียวสนามหญ้าและฟอนต์ Cormorant Garamond / Noto Sans Thai Looped ที่ทดลองออกแบบในแชตเป็นข้อเสนอแยก ยังไม่ได้นำมาเปลี่ยนชุด Anti ในรอบตรวจนี้ ชุด Anti ยังโหลด Cinzel / Noto Sans Thai / Noto Serif Thai; CSS ประกาศ Inter แต่ไม่ได้โหลดใน index.html
3. ต้องทดสอบ AI ด้วยบัญชี active Owner/Team บน Preview ที่มี Workers AI binding `AI` และอยู่ใน Free plan ก่อนอ้างว่าใช้จริงผ่าน ชุดนี้คืนโค้ดพร้อมการตรวจสิทธิ์และข้อความร่างแล้ว ไม่ได้เรียก inference จริง
4. canonical migration ยังต้องผ่าน disposable Supabase/REST gateway ก่อนพิจารณาใช้กับฐานข้อมูลจริง ไม่รัน SQL บน production ในรอบนี้
5. เสียงตามหลักฐานเดิมยาวประมาณ 326.14 วินาที ขณะที่ metadata/VTT จบ 300 วินาที ยังต้องฟังเทียบคำแปล/จังหวะท้ายเสียงและยืนยันผู้บันทึก/สิทธิ์ใช้ ไม่ได้ยืดซับหรือตัดเสียงเอง
6. ข้อความเวลา/สถานที่/เข้าฟรี/ไม่ลงทะเบียนใน Activities เป็นข้อมูลตาม source Anti ไม่ใช่การตรวจตารางกิจกรรมกับผู้จัดใหม่ รายละเอียดจุดนัดพบใกล้พระปรางค์ยังต้องตรงกับข้อมูลเจ้าของ แผนที่เป็นภาพประกอบและ Google Maps link ค้นหาชื่อสถานที่ ไม่ใช่หลักฐานพิกัดจุดพบจริง
7. Home/Activities ใช้ชื่อเส้นทางใหม่ตาม source ที่ได้รับ; หน้า Home ครั้งแรกยังมี language gate ซึ่งต้องนำมาพิจารณาเมื่อเทียบกับภาพต้นแบบที่เห็น Hero ทันที

## ไฟล์ส่งต่อ

- ใช้ `MonkChat-Guide-reviewed-20261103.zip` เป็นสำเนารวมที่แก้ regression แล้ว ห้ามแตกทับ Windows checkout ที่ยังมีงานใหม่โดยไม่เทียบ
- รายงาน Anti เดิมยังอยู่ `docs/ANTI_REVIEW_REPORT.md` เป็นคำรายงานของต้นทาง; ผลที่ผู้ตรวจรันจริงให้ยึดเอกสารนี้
- บันทึกส่งต่องาน Anti เดิมเก็บใน `docs/history/HANDOFF-Anti-redesign-2026-11-03.md`
- ไม่มี commit, push, merge, deploy หรือ production migration ในรอบนี้
