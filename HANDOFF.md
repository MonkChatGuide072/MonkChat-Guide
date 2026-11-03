# MonkChat Guide — Current Handoff

## ปรับ UI ทีละหน้า: Admin shell / Dashboard — 4 พฤศจิกายน 2569

- ต่อจาก Login/404 6411476c4776f4a1e4ac3a63f4d4317d88758656 เปลี่ยนเมนูคอมเป็น sidebar 240px และ drawer ต่ำกว่า 1024px มี aria-expanded/controls, Escape คืนโฟกัสและปิดเมื่อเปลี่ยนเส้นทาง ใช้โลโก้จริง พื้น neutral กับสีอิฐเป็น accent เดียว ลบแถบนำทางแนวนอนและสีรุ้งประจำโมดูล
- เพิ่ม AdminLayout.css เฉพาะ CMS ให้ปุ่ม 44px ช่องกรอก 16px/48px focus ชัด เนื้อหายาวตัดบรรทัด ไม่กระทบหน้าสาธารณะ คงรายการเมนู เงื่อนไข Owner และ handler signOut เดิม
- เพิ่ม 3 regression tests: Escape/focus/route close, ไม่แสดงเมนู Owner ให้ Team และไม่ย้ายหน้าเมื่อ signOut ล้มเหลว รวม 69 tests / 12 files ผ่าน lint และ TypeScript/PWA build ผ่าน
- เปิด Dashboard ด้วย isolated visual fixture ที่ใช้ข้อมูลจำลองและปฏิเสธ mutation ไม่มี credentials/network ไปฐานข้อมูล เห็นภาพคอมจริง ตรวจจอ 360px ไม่ล้น เปิดเมนูครบ 9 ลิงก์และ Escape คืนโฟกัสได้ นี่ไม่ใช่หลักฐานล็อกอิน CMS บัญชีจริง
- ถัดไปตรวจรายการและฟอร์ม Meditation → Q&A → Centers → BioLinks → ภาษา/ทีม/Analytics → ผู้ช่วยส่วนตัวทีละโมดูล ไม่ merge/deploy หรือเขียนฐานข้อมูลจริง


## ปรับ UI ทีละหน้า: Login และ 404 — 4 พฤศจิกายน 2569

- ต่อจาก Centers 542b8cf ปรับ LoginPage ให้ใช้โลโก้จริง โทนเดียวกับเว็บ เลิกป้าย Owner access ที่ไม่ตรงกับบัญชีทีม ปรับช่องกรอก 16px / สูง 48px ปุ่มและสถานะปฏิเสธอ่านง่าย เอาวงกลมตกแต่ง เงาสี และ hover movement ออก Layout ไม่แสดงแชทสาธารณะในเส้นทาง admin/login
- หน้า 404 ใช้หัวเรื่องอธิบายปัญหา โลโก้จริง สลับภาษาและปุ่มกลับ Home สูง 48px คงปลายทาง /
- รันเอง 66 tests / 11 files, lint, TypeScript/PWA build ผ่าน เทียบ auth hooks / submit / error handling / redirect กับฐานแล้วไม่เปลี่ยน ช่อง email/password ยัง required, autocomplete เดิม และปุ่มว่าง disabled ไม่ได้ส่ง credentials หรือทดสอบล็อกอินบัญชีจริง
- ตรวจ Chrome Login TH/EN 360/768/1440 ไม่ล้นแนวนอน ช่องกรอก 16px/48px ทั้งหมด หน้า 404 ตรวจเบราว์เซอร์และทางกลับ Home; ข้อจำกัด local QA route copy ไม่รับรอง HTTP fallback/status ของ hosting จริง
- คิวต่อไป AdminLayout และ Dashboard แล้วแยกตรวจรายการ/ฟอร์มแต่ละโมดูลด้วยข้อมูลจำลองแยกจากแอปจริง ไม่มีการข้าม auth ใน production หรือเขียนฐานข้อมูลจริง


## ปรับ UI ทีละหน้า: Centers — 4 พฤศจิกายน 2569

- ต่อจาก Q&A 5d90ad4fd8b0e0e11925c5dd914fa92bf4a12b83 ปรับ CentersPage.tsx: เลิกใช้ภาพอยุธยาซ้ำเป็นภาพแต่ละศูนย์ ใช้ชื่อ/เมือง/ประเทศ/ที่อยู่จริงแทน แสดงรายละเอียดเต็ม ปุ่มลิงก์กดง่ายและบอกบริบทศูนย์ ตัวกรองมือถือเป็น native select ส่วนจอใหญ่เป็นปุ่ม
- Search ส่งโฟกัสถึงผลลัพธ์ กรองเมืองตรงกับชื่อ/จำนวนจริง ไม่จับ York รวม New York มีผลค้นหาว่างและ Show all centers ล้างทั้งคำค้น/พื้นที่ เอาเอฟเฟกต์เลือกกรอบการ์ดที่ไม่มีข้อมูลเพิ่มออก คง Map/Website/Contact และ safe URL checks ทั้งหมด
- รันเอง 66 tests / 11 files, lint, TypeScript/PWA build ผ่าน เพิ่ม regression 1 test จึงเพิ่มจาก 65 เป็น 66 โดยทดสอบเมืองชื่อซ้อน การค้นหาและกลับดูทั้งหมด ไม่ลด tests เก่า เทียบ fetch logic/เงื่อนไข published กับฐานแล้วตรงกัน
- Chrome: เลือก Singapore ได้ 1 ศูนย์ ค้นไม่พบแล้วกลับดูครบ 4 ศูนย์ได้ native select มือถือใช้งานได้ ตรวจ TH/EN 360/390/768/1024/1440 ครบ ไม่มี horizontal overflow ทุกการ์ดและตัวกรองพอดี ตรวจ href/noopener ไม่ได้ยืนยันที่อยู่ศูนย์หรือเว็บไซต์ภายนอกแทนโครงการ
- หน้าสาธารณะหลัก Home → Activities → Meditation → Q&A → Centers ผ่านรอบ UI ตามลำดับแล้ว คิวต่อไปหน้าเข้าสู่ระบบ → 404 → หลังบ้าน รายงานรายหน้าอยู่ docs/UNSLOP_REVIEW_2026-11-04.md ไม่มี merge/deploy/แก้ฐานข้อมูลจริง และยังไม่อ้างว่า Windows รับงานแล้ว

## ปรับ UI ทีละหน้า: Q&A — 4 พฤศจิกายน 2569

- ต่อจาก Meditation 09541c8ecc1345f5bea1c644c9025205dfbaadc1 ปรับ QAPage.tsx: ภาพกับหัวเรื่องกระชับ ช่องค้นหากับหมวดอ่านง่าย ใช้เส้นไอคอน คำถามเป็น heading/button ที่ถูกโครงสร้างและมี aria-controls ปุ่ม Search ส่งโฟกัสไปผลลัพธ์ ปุ่ม Show all questions ล้างทั้งคำค้นและหมวด
- แก้ src/index.css ที่ font:inherit เขียนทับ utility ของ native controls ให้ฟอนต์/น้ำหนักที่กำหนดทำงาน โดยช่อง input/textarea/select ยังคง 16px; LanguageSwitcher ใช้ 14px / target 44px เพิ่มไอคอน search/book ใน GuideIcon
- รันเอง 65 tests / 11 files, lint, TypeScript/PWA build ผ่าน เพิ่มการตรวจ submit-focus/empty-category recovery ใน flow test เดิม และรอปุ่มคำถามที่โหลดแบบ async ก่อนกด ไม่ลด assertion เรื่องคลัง verified/published หรือบอทไม่เรียก AI ตรวจ logic โหลด/กรอง/จับคู่คำถามเทียบฐานแล้วไม่เปลี่ยน
- Chrome: ค้นไม่พบแล้วกด Search โฟกัสถึงหัวข้อผลลัพธ์ กลับมาดูทั้งหมดได้ 4 คำถาม พับคำตอบได้ บอทตอบจากคลังและปฏิเสธคำถามที่ไม่มีข้อมูล ตรวจ TH/EN 360/390/768/1024/1440 ไม่พบ horizontal overflow หมวดพอดีช่อง ภาพและผลวัดเก็บภายใน ไม่ใช่อุปกรณ์จริง
- ถัดไป Centers: ค้นหา/ภูมิภาค/ข้อมูลศูนย์/ลิงก์ปลอดภัย/ผลลัพธ์ว่าง คง source และเนื้อหาจริงเดิม รายละเอียดอยู่ docs/UNSLOP_REVIEW_2026-11-04.md ไม่มี merge/deploy หรือแก้ข้อมูลจริง

## ปรับ UI ทีละหน้า: Meditation — 4 พฤศจิกายน 2569

- ต่อจาก Activities f9dd39ecd823d10e27730206dd7082ae348f713e ปรับ MeditationPage และ BeginnerGuide / Supplementary / Player: หัวเรื่องกับภาพกระชับ ลิงก์ส่วนต่าง ๆ สั้น ไม่แสดงเลขหัวข้อซ้ำ ตัวอักษรอ่านง่าย metadata เป็นเส้นไอคอน ขั้นตอนมือถือเป็นแถว เนื้อหาถอดเสียงเต็มไม่ขังในกล่องเลื่อนเล็ก คงเสียง/ซับ/คำแนะนำ/สถานะร่างเดิม
- ส่วนร่วม GuideIcon เพิ่ม bookmark/share/user, VisitorBackLink ใช้สี/ขนาดควบคุมร่วม Layout ย้ายลายสมาธิขนาดใหญ่ไปท้ายหน้าแบบจางและเอาสีไล่เฉดพื้นหลังออก ไม่เปลี่ยนภาพ Home หรือเส้นทาง/สิทธิ์
- รันเอง 65 tests / 11 files, lint, TypeScript/PWA build ผ่าน แก้ assertion เก่าสองจุดให้ตรงหัวข้อเสียงที่เลิกใส่เลขซ้ำ ไม่ลด tests หรือการตรวจข้อมูล/ซับ เปิดเสียงจริงถึง 12.913 วินาที ยาว 326.147483 วินาที ไม่มี media error หยุดเสียงได้ เปิด transcript เต็ม บันทึก/ยกเลิก และพับขั้นตอนได้ ตรวจ TH/EN 360/390/768/1024/1440 ไม่พบ horizontal overflow ของหน้า/เครื่องเล่น/ขั้นตอน ไม่ใช่อุปกรณ์จริง
- ข้อจำกัดเดิมยังอยู่: ไม่ได้ฟังเทียบทุก cue, VTT 300s กับเสียง 326s, cue 19 และคำแนะนำที่เป็น Draft ยังต้องตรวจเนื้อหาก่อนเผยแพร่ ไม่รับรองแทนพระอาจารย์ ไม่แก้ข้อมูลจริง
- ถัดไป Q&A พร้อมค้นหา/หมวด/accordion/บอท ตรวจจากข้อมูล verified/published เดิม รายละเอียดและคิวอยู่ docs/UNSLOP_REVIEW_2026-11-04.md ส่ง branch เดิม ไม่ merge/deploy production

## ปรับ UI ทีละหน้า: Activities — 4 พฤศจิกายน 2569

- ต่อจาก Home checkpoint 6284bf94ce2491dae38caa6c8d12ba5f3ec0b630 ปรับ ActivitiesPage.tsx: ลดป้าย/อีโมจิ/เงา/สีไล่เฉด จัดเวลาและสถานที่บนพื้นเรียบ ใช้ body 14px น้ำหนัก 500/600 ปุ่มสูงอย่างน้อย 44px ตารางเป็นรายการ 5 ช่องบนมือถือจากข้อมูลชุดเดิม คงสองกิจกรรมที่ยืนยันแล้วและเงื่อนไขเดิมทุกข้อ
- Layout.tsx ให้หน้าใหม่เริ่มที่ด้านบน โดยเว้นเส้นทางที่มี hash anchor ไว้ รูปกิจกรรมเดิมไม่มี hover zoom และไม่ได้สร้างภาพใหม่
- รันเอง 65 tests / 11 files, lint, TypeScript/PWA build ผ่าน เปิด Chrome และกรอบทดสอบ 360/390/768/1024/1440 TH/EN ไม่พบ horizontal overflow และสองกิจกรรมแสดงครบ ตรวจเปิดข้อมูลโครงการและปลายทางลิงก์ตารางแล้ว ไม่ใช่อุปกรณ์จริง
- รายละเอียด audit / 9 passes / คิวงานอยู่ docs/UNSLOP_REVIEW_2026-11-04.md ถัดไป Meditation พร้อมส่วนประกอบ ยังไม่แก้เสียง/ซับหรือรับรองร่างธรรมะแทนโครงการ
- ส่งโค้ดพร้อมเอกสารผ่าน branch เดิม ไม่มี merge/deploy/แก้ฐานข้อมูล และยังไม่มีหลักฐานว่า Windows รับงานรอบนี้แล้ว

## ปรับ UI ทีละหน้า: Home — 4 พฤศจิกายน 2569

- เจ้าของอนุมัติให้ตรวจและปรับทุกส่วนของเว็บด้วย unslop ทีละหน้าแล้ว ข้อจำกัดเก่า “เฉพาะส่วนบน Home” ถูกแทนที่สำหรับ UI ดู CURRENT_SCOPE.md และ docs/UNSLOP_REVIEW_2026-11-04.md
- รอบ Home เปลี่ยน VisitPage.tsx, HomeHeroIntro.tsx และเพิ่ม GuideIcon.tsx: แก้วันเวลา/สถานที่โดนตัด ปรับ body 14px / meta อย่างน้อย 12px ลดน้ำหนักฟอนต์และ uppercase เปลี่ยนอีโมจิเป็นเส้นไอคอน จัด resource descriptions ให้ตัดบรรทัด คงทุก section และข้อมูลเดิม คงภาพเต็มขอบ/ชื่อใต้ภาพ/ทางลัด 5 ช่องและค่า crop เดิม
- หน้าเลือกภาษาใช้โลโก้/ชื่อจริง โดยเก็บ logic เลือกภาษาเดิม ส่วนร่วม Layout.tsx / LanguageSwitcher.tsx ปรับเมนูให้ใช้ drawer ต่ำกว่า 1024px ปุ่มสัมผัส 44px และระยะท้ายหน้า; ChatbotServiceCard.tsx ใช้พื้นครีม/สีอิฐ ปุ่มเปิดเล็กลง พร้อม Escape และคืนโฟกัส ไม่มีการเปลี่ยนคลังคำตอบ/กติกาบอท
- ผลรันเอง: 65 tests / 11 files, lint, TypeScript/build ผ่าน ตรวจ query/state ของ VisitorHome เทียบฐานแล้วไม่เปลี่ยน เปิด Chrome และกรอบ iframe 360/390/768/1024/1440 TH/EN ป้ายทางลัดพอดี ไม่มี horizontal overflow; กด project info, เมนูมือถือ, เปิด/ปิดแชท และตรวจคืนโฟกัสได้ ไม่ใช่การทดสอบอุปกรณ์จริง
- ภาพ/ผลวัดเก็บในสำเนาตรวจและแชต ไม่ส่งภาพหรือ .env ขึ้น GitHub รอบนี้ตรวจ Home เป็นหน้าแรก หน้าอื่นยังอยู่ในคิว ไม่อ้างว่าเสร็จทั้งเว็บไซต์
- งานถัดไป: Activities ตาม audit ก่อนแก้ แล้ว Meditation → Q&A → Centers → login/404 → หลังบ้าน สถานะรายหน้าอยู่ docs/UNSLOP_REVIEW_2026-11-04.md พระ/เจ้าของยังต้องตรวจเนื้อหาธรรมะและเสียง/ซับก่อนเผยแพร่
- ฐาน source 6c44295641f1a11ef0ee84619d4aa3e609a82ff8 บน sync/anti-reviewed-20261103; ไม่มี merge main, deploy production, ข้อมูลจริง หรือ API เสียเงิน ไม่อ้างว่า Windows ดึงงานแล้ว

## ChatGPT ตรวจรับส่วนบน Home จาก 6ceed4c — 4 พฤศจิกายน 2569

- ตรวจ source commit `6ceed4ce9a6e0cdf777d139181487d5f10f5a637` จาก GitHub ในสำเนาทดสอบแยก; diff จาก `cf93b4d` มีเฉพาะ `src/components/HomeHeroIntro.tsx` และ `HANDOFF.md` ไม่เปลี่ยนเนื้อหาตั้งแต่แถบวันเวลาลงไป
- รันเอง: `npm test -- --run` ผ่าน **65 tests / 11 files**, `npm run lint` ผ่าน, `npm run build` (รวม TypeScript และ PWA) ผ่าน และ `git diff --check` ผ่าน
- เปิด production build ใน static QA preview ด้วย Chrome: ตรวจ Desktop 1363×936 และกรอบ iframe 360/390/768/1024/1440px ทั้ง TH/EN ไม่มี horizontal overflow ในค่าที่วัด; เป็นกรอบทดสอบบน Desktop ไม่ใช่การทดสอบโทรศัพท์หรือ iPad จริง
- ยืนยันป้ายทั้ง 5 ช่องมีไอคอนเหนือชื่อ ขนาดจริง 12px บนกรอบมือถือและ 14px ตั้งแต่ breakpoint sm; ข้อความ TH/EN พอดีช่อง รวม Activities และ Meditate ตรวจ href และกดทางลัดสมาธิแล้วเปิด /meditation ได้
- ยืนยันภาพเดิมเต็มขอบ ไม่บิดสัดส่วน และ CSS ความสูง/object-position แยก breakpoint ตรงตามรายการแก้ไข ภาพ Desktop ที่เปิดตรวจเห็นยอดเจดีย์ แต่ยังครอปช่วงล่างของพระและผู้มาเยือน จึงไม่รับรองข้อความว่าเห็นคนเต็มตัวหรือไม่ตัดส่วนคนทุกขนาด; บนกรอบมือถือ 360px เห็นกลุ่มคนนั่งและยอดเจดีย์
- **ผลรับงานเฉพาะขอบเขตนี้**: สองจุดที่สั่งปรับผ่านตามหลักฐานข้างต้น พร้อมข้อจำกัดเรื่องการครอป Desktop ไม่แก้ UI เพิ่มหรือขยายไปหน้าอื่นในรอบตรวจ
- หลักฐานภาพ Desktop/กรอบมือถือและ JSON ผลวัดเก็บในสำเนาตรวจและแชต ไม่ส่งภาพหรือ .env ขึ้น GitHub
- **งานถัดไปก่อนตรวจรับทั้งระบบ**: ตรวจเทียบเสียงจริง 5:26 กับ VTT 5:00 และ cue 19 ที่ 04:12/04:15; ตรวจสถานะเนื้อหา Meditation ที่ยังแสดงป้าย Draft for Review ก่อนเผยแพร่ โดยยังไม่แก้ข้อมูลจริงหรือรับรองเนื้อหาแทนโครงการ
- Live private AI, authenticated CMS, Supabase gateway และอุปกรณ์จริงยังไม่ได้ยืนยันจากการตรวจรอบนี้ ไม่มี merge main, production deployment หรือการแก้ฐานข้อมูล

## ปรับปรุงการครอปภาพ Hero และทางลัดบน Home — 4 พฤศจิกายน 2569

- **Branch งานร่วม**: `sync/anti-reviewed-20261103` สำหรับ PR #17 (https://github.com/MonkChatGuide072/MonkChat-Guide/pull/17)
- **รายการปรับแก้เฉพาะส่วนบน Home (2 จุดตามข้อสั่งการ)**:
  1. **การครอปภาพ Hero แยกตามขนาดจอ (`HomeHeroIntro.tsx`)**:
     - ปรับ `object-position` และความสูงแยกตาม breakpoint เพื่อรักษาองค์ประกอบภาพทั้งพระภิกษุนั่งสมาธิและยอดโบราณสถาน/เจดีย์:
       - มือถือ (<640px): `h-[240px] object-[center_35%]` เห็นยอดเจดีย์ พระ และผู้ร่วมปฏิบัติธรรมครบถ้วน สัดส่วนภาพคงที่
       - แท็บเล็ต (>=640px): `sm:h-[360px] sm:object-[center_30%]`
       - คอมพิวเตอร์/เดสก์ท็อป (>=1024px): `lg:h-[460px] lg:object-[center_28%]`
       - จอขนาดใหญ่ (>=1280px / 1440px): `xl:h-[500px] xl:object-[center_26%]`
     - แก้ปัญหาปลายยอดเจดีย์ถูกตัดบนหน้าจอเดสก์ท็อป โดยคงการใช้ภาพเดิมเต็มความกว้างจอ ไม่ยืดภาพผิดสัดส่วน (ตรวจซ้ำพบว่า Desktop ยังครอปช่วงล่างของพระและผู้มาเยือน ดูผลตรวจด้านบน)
  2. **ขนาดตัวอักษรป้ายทางลัดและป้าย Meditate บนมือถือ (`HomeHeroIntro.tsx`)**:
     - ขยายขนาดตัวอักษรป้ายทางลัดบนมือถือเป็น **12px** (`text-xs font-semibold`) ตามเกณฑ์ขั้นต่ำ 12px และ `sm:text-sm` (14px) บนหน้าจอคอมพิวเตอร์
     - ปรับข้อความป้ายภาษาอังกฤษของทางลัดสมาธิเฉพาะจุดนี้จาก "Meditation" เป็น **"Meditate"** โดยคงปลายทางเส้นทางเดิม (`/meditation`) ครบถ้วน
     - ปรับระยะห่าง `gap-1 min-[390px]:gap-1.5 sm:gap-3` ทำให้ปุ่มทั้ง 5 ช่องและข้อความ "Activities" / "Meditate" ไม่ล้นหรือขึ้นบรรทัดใหม่อย่างไม่เหมาะสมบนจอ 360px และ 390px
  3. **การรักษาความสมบูรณ์ของระบบ**:
     - คงตราสัญลักษณ์ทางการ (อยุธยา มังค์แชท / Ayutthaya Monk Chat), สีเดิม, โครงสร้างเนื้อหาท่อนล่าง, ระบบค้นหา, ระบบสลับภาษา, และหน้าอื่นทั้งหมด
- **ผลการทดสอบระบบ (Verification Results)**:
  - **In-Browser Responsive Verification**: ตรวจสอบผ่าน Chrome DevTools Protocol ครบ 5 ขนาดหน้าจอ (360px, 390px, 768px, 1024px, 1440px) ทั้งภาษาไทยและภาษาอังกฤษ:
    - ไม่พบการเลื่อนแนวนอน (`scrollWidth <= clientWidth`) ในทุก viewport
    - ขนาดตัวอักษรป้ายทางลัดบนมือถือวัดค่าจริงได้ **12px** (และเดสก์ท็อป **14px**) ข้อความและปุ่มไม่ล้น (`allLabelsFit: true`)
    - ยอดเจดีย์และกลุ่มคนนั่งเป็นองค์ประกอบหลักของภาพ; ข้ออ้างว่าแสดงครบทุกขนาดถูกจำกัดด้วยผลตรวจซ้ำด้านบน เพราะ Desktop ยังครอปช่วงล่างของคน
    - บันทึกภาพถ่ายหน้าจอหลักฐานไว้ในเครื่องที่ `docs/review-evidence/2026-11-04/home-crop-shortcuts/` และในไดเรกทอรี artifacts (ไม่ส่งภาพขึ้น GitHub ตามข้อกำหนด)
  - **Automated Tests**: ผ่านครบทุกรายการ **65/65 tests passed** จาก 11 ไฟล์ทดสอบ (`npm test -- --run`)
  - **Lint Check**: **0 errors, 0 warnings** บน 182 ไฟล์ (`npm run lint` / `oxlint`)
  - **Production Build**: ผ่านสมบูรณ์ (`tsc -b && vite build`) สร้าง PWA Service Worker สำเร็จใน 284ms
- **สิ่งที่ยังค้าง / ข้อจำกัดตามจริง**:
  - เสียงนำสมาธิ: ไฟล์เสียงจริงยาว 5:26 นาที ส่วนคำบรรยาย VTT ยาว 5:00 นาที; จุดตัด Cue 19 ที่ 04:12 vs 04:15 ยังรอการตรวจเทียบกับไฟล์เสียงจริงจากพระอาจารย์
  - Cloudflare Workers AI: ผ่านการทดสอบระดับ mock suite ยังไม่ได้เชื่อมโยงบัญชี live inference จริง
  - นโยบายความปลอดภัยและงบประมาณ 0 บาท: ไม่มีการแตะต้องฐานข้อมูลจริง, ไม่มีการเปิด API เสียเงิน, ไม่มีการ merge เข้า main หรือ deploy production

## ChatGPT ตรวจซ้ำชุดแก้ไขจาก Windows — 4 พฤศจิกายน 2569

- ตรวจ source commit `7717ee1d0329164c7c150336581e14a35d22eb9f` จาก GitHub โดยแยกสำเนาทดสอบจาก Git tree ของ commit นี้ ไม่อ้างผลจากโฟลเดอร์ Windows แทน
- รันเอง: `npm test -- --run` ผ่าน 65 tests / 11 files, `npm run lint` ผ่าน, `npm run build` ซึ่งรวม TypeScript ผ่าน และ `git diff --check` ผ่าน
- ยืนยัน favicon PNG ใช้ `type="image/png"` และ HANDOFF แก้จำนวน tests ให้ตรง 65/11 แล้ว เหตุผลเรื่องสแกนโฟลเดอร์สำรองเป็นคำชี้แจงจาก Antigravity; ไม่ได้เปิดตรวจโฟลเดอร์สำรองบน Windows ด้วยตนเอง
- Diff จาก 1537043 ถึง 7717ee1 มีเพียง HANDOFF.md, index.html และ vite.config.ts; เพิ่ม exclude ของโฟลเดอร์สำรองตามรายงาน ไม่มีการลด/ลบ tests ใน commit นี้
- HomeHeroIntro และเนื้อหาท่อนล่างไม่ได้เปลี่ยนใน commit แก้ไขนี้ โลโก้จริงมาจาก commit 1537043 ก่อนหน้า ข้อเสนอ unslop เรื่องครอปภาพ/น้ำหนักหัวเรื่อง/ขนาดป้ายยังเป็นข้อเสนอ ไม่ได้แก้ UI เพิ่ม
- งานถัดไป: เจ้าของเลือกจุดเก็บรายละเอียดส่วนบน Home จากข้อเสนอ unslop แล้วจึงปรับเฉพาะจุดที่ยืนยัน รักษาภาพเต็มขอบ ชื่อใต้ภาพ ทางลัด 5 ช่อง และส่วนล่างเดิม
- ยังไม่ merge main/deploy/migrate; ยังไม่ยืนยัน live private AI, authenticated CMS, Supabase gateway หรืออุปกรณ์จริงจากการทดสอบรอบนี้


## รับงานและรวมงานเสร็จสมบูรณ์จาก Windows — 4 พฤศจิกายน 2569

- **Branch งานร่วม**: `sync/anti-reviewed-20261103` สำหรับ PR #17 (https://github.com/MonkChatGuide072/MonkChat-Guide/pull/17)
- **การรับงานจาก Git**: ดึง branch `sync/anti-reviewed-20261103` มาเปิด worktree แยก เปรียบเทียบกับงาน Windows ล่าสุด และรวมส่วนที่ขาดอย่างรอบคอบโดยไม่ reset หรือเขียนทับงานเดิม
- **งานหน้าตาส่วนบน Home ที่รวม**:
  - ใช้ `src/components/HomeHeroIntro.tsx`: ภาพแนวนอนเต็มความกว้างจอ (`monkchat-meditation-ruins.webp`), ชื่อและคำอธิบายอยู่ใต้ภาพ, และทางลัด 5 ปุ่มแบบไอคอนอยู่เหนือชื่อ รองรับทั้ง TH และ EN
  - ปรับ `src/components/Layout.tsx`: กำหนด `<main>` ให้เต็มความกว้างเฉพาะเส้นทาง `/` และ `/visit` เพื่อให้ภาพ Hero บนหน้าแรกกว้างชิดขอบจอตามบรีฟ โดยคง container และ padding ของหน้าอื่นและเนื้อหาท่อนล่างไว้เหมือนเดิม
- **การรักษางาน Windows ล่าสุด**:
  - **อัตลักษณ์และตราสัญลักษณ์ทางการ**: ติดตั้งโลโก้ทางการ (ต้นพระศรีมหาโพธิ์สีทอง ธรรมจักร และพระภิกษุนั่งสมาธิ) ที่ `public/images/logo/ayutthaya-monk-chat-logo.png` และ `public/logo.png`, ติดตั้งในแถบเมนู (Navbar Header), ปรับ Favicon และ Meta tags ใน `index.html`
  - **ชื่อทางการ**: กำหนดชื่อโครงการเป็น "อยุธยา มังค์แชท" (TH) และ "Ayutthaya Monk Chat" (EN) ใน `src/locales/th/common.json`, `src/locales/en/common.json`, และ `index.html`
  - **แถบนำทาง (Navbar Header)**: เมนู 5 รายการชัดเจน ทั้ง Desktop และ Mobile drawer: 1. หน้าแรก (`/`), 2. กิจกรรม (`/activities`), 3. นำสมาธิ (`/meditation`), 4. ถาม-ตอบ (`/qa`), 5. ศูนย์ปฏิบัติธรรม (`/centers`)
  - **หน้ากิจกรรม (`ActivitiesPage.tsx`)**: แสดงเฉพาะกิจกรรมที่ได้รับการยืนยัน (Monk Chat ณ วัดมหาธาตุ เวลา 13:15 น. เป็นต้นไป, ฝึกสมาธิกำหนดลมหายใจ 5–10 นาที) ตัดเวลาสิ้นสุด 15:30 น. ที่เติมเองออก และแยกข้อเสนอร่างที่ยังไม่ยืนยันไว้ใน `docs/content-review/` ภายใน ไม่เผยแพร่สู่หน้าสาธารณะ
  - **ระบบถาม-ตอบและแชทบอท**: คงหน้า `/qa` และการ์ดแชทบอทสาธารณะ (`ChatbotServiceCard.tsx`) ตอบจากคลัง Q&A ที่ verified/published เท่านั้น ไม่เรียก AI และไม่แสดง source_reference
  - **ผู้ช่วยส่วนตัวหลังบ้าน (`/admin/assistant`)**: คืนหน้าและระบบตรวจสิทธิ์สำหรับพระนิสิต พร้อม `functions/api/monk-assistant.js` และชุดการทดสอบ
  - **เส้นทาง `/visit`**: คง alias สำหรับรองรับป้าย QR Code เดิมและลิงก์ภายนอก
- **ผลการทดสอบระบบ (Verification Results)**:
  - **Automated Tests**: ผ่านครบทุกรายการ **65/65 tests passed** จาก 11 ไฟล์ทดสอบ (`npm test -- --run`) (หมายเหตุ: ตัวเลข 115 tests ในรายงานรอบก่อนหน้าเกิดจาก vitest เผลอสแกนโฟลเดอร์สำรองในเครื่อง Windows ได้ตั้งค่า exclude ใน `vite.config.ts` เรียบร้อยแล้ว ยืนยันว่าชุดทดสอบจริงมี 65 tests / 11 files ตรงกันสมบูรณ์ทุกประการ)
  - **Favicon MIME Type**: แก้ไขใน `index.html` จาก `image/svg+xml` เป็น `type="image/png"` สำหรับ `/images/logo/ayutthaya-monk-chat-logo.png`
  - **Lint Check**: **0 errors, 0 warnings** บน 182 ไฟล์ (`npm run lint` / `oxlint`)
  - **Production Build**: ผ่านสมบูรณ์ (`tsc -b && vite build`) สร้าง PWA Service Worker สำเร็จใน 289ms
  - **In-Browser Responsive Verification**: ตรวจสอบเว็บจริงบน localhost:5173 ผ่าน Chrome DevTools Protocol ครบ 5 ขนาดหน้าจอ (360px, 390px, 768px, 1024px, 1440px) ทั้งภาษาไทยและภาษาอังกฤษ:
    - ส่วนบน Home: ภาพเต็มความกว้างจอ, ชื่อ/คำอธิบายใต้ภาพ, ทางลัด 5 ปุ่มพร้อมไอคอนเหนือชื่อ แสดงผลสมบูรณ์
    - ไม่พบการเลื่อนแนวนอน (`scrollWidth <= clientWidth`) ในทุก viewport
    - ตรวจสอบเส้นทาง `/visit`, `/activities`, `/meditation`, `/qa`, `/centers` โหลดและแสดงผลถูกต้อง
- **สิ่งที่ยังค้าง / ข้อจำกัดตามจริง**:
  - เสียงนำสมาธิ: ไฟล์เสียงจริงยาว 5:26 นาที ส่วนคำบรรยาย VTT ยาว 5:00 นาที; จุดตัด Cue 19 ที่ 04:12 vs 04:15 ยังรอการตรวจเทียบกับไฟล์เสียงจริงจากพระอาจารย์
  - Cloudflare Workers AI: ผ่านการทดสอบระดับ mock suite ยังไม่ได้เชื่อมโยงบัญชี live inference จริง
  - นโยบายความปลอดภัยและงบประมาณ 0 บาท: ไม่มีการแตะต้องฐานข้อมูลจริง, ไม่มีการเปิด API เสียเงิน, ไม่มีการ merge เข้า main หรือ deploy production


## ส่งงานขึ้น GitHub สำเร็จ — 3 พฤศจิกายน 2569

- Draft PR #17: https://github.com/MonkChatGuide072/MonkChat-Guide/pull/17
- Branch: `sync/anti-reviewed-20261103`; source checkpoint: `b038e5d24d3d382fc0b7597b8603319e7fddf47e`
- ตรวจ source tree บน GitHub ตรงกับชุดที่เตรียม: `2f8de60bdb0d39341d5387b13d39a432066347a7`; อ่านกลับ HANDOFF.md, CURRENT_SCOPE.md, WORKFLOW.md, HomeHeroIntro.tsx และ VisitPage.tsx แล้วตรงกัน
- โค้ดและเอกสาร 63 ไฟล์อยู่ใน branch เดียว พร้อมให้ดึงจาก Git แทนการใช้ ZIP; ไม่รวมภาพใหม่/.env/node_modules/dist หรือเอกสารร่างภายใน
- ยังไม่ merge main, deploy production, ติดตั้ง migration หรือยืนยันว่า Windows/Antigravity รับงานแล้ว


เจ้าของยืนยันให้ส่งโค้ดและเอกสาร 63 ไฟล์ไปยัง GitHub สาธารณะ MonkChatGuide072/MonkChat-Guide บน branch sync/anti-reviewed-20261103 แล้ว หลังชี้แจงปลายทางและชุดไฟล์ โดยสั่ง “อัพดิ้รออะไร” ไม่รวมภาพ/.env และไม่ merge/deploy production

## จุดส่งต่องานร่วมผ่าน Git — 3 พฤศจิกายน 2569

- เจ้าของสั่งให้รวมโค้ดและเอกสารผ่าน Git หลังชี้แจงเรื่อง ZIP แล้ว จึงอนุมัติ checkpoint/push branch สำหรับส่งต่อ ไม่รวม merge/deploy production
- Branch งานร่วม: `sync/anti-reviewed-20261103` ใน `MonkChatGuide072/MonkChat-Guide` ฐาน main ที่ `c93437006334165bcca3c5339e3b7536de5b6e89`
- รวม source ล่าสุดที่ได้รับจาก Antigravity งานซ่อมที่ตรวจแล้ว และการปรับเฉพาะส่วนบน Home ที่อนุมัติ ไม่ได้ออกแบบหน้าอื่นเพิ่มในรอบซิงก์
- ภาพหลักฐานเก็บไว้ในแชต/สำเนาต้นทาง ไม่รวมภาพใน branch สาธารณะ เนื่องจาก automatic approval review ปฏิเสธการอัปโหลดภาพโดยยังไม่พบคำอนุมัติที่ชัดเจนสำหรับปลายทางนี้
- ใช้ไฟล์ใน branch เป็นช่องทางส่งต่องาน อ่าน `CURRENT_SCOPE.md` และ `WORKFLOW.md`; ZIP เป็นสำเนาส่งออก
- ยังไม่มีหลักฐานว่า Windows/Antigravity ดึง branch หรืออ่านเอกสารแล้ว ห้ามรายงานว่าฝั่ง Windows อัปเดตแล้ว
- Bridge ใน PR #10 ใช้ฐาน `chore/local-agent-relay` แบบตายตัว ไม่ได้ติดตาม branch นี้โดยอัตโนมัติ จึงไม่ส่งงานเข้าคิวเดิมโดยอ้างว่าจะรับ source ล่าสุดได้
- เอกสารแบบร่างเนื้อหาใน docs/content-review/ เก็บในสำเนาต้นทางภายใน ไม่ส่งขึ้น repository สาธารณะ; ไม่ลบไฟล์ต้นฉบับ
- คง branch/PR เก่าทั้งหมดไว้ โดยเฉพาะ CMS PR #15 และ bridge PR #9/#10 ไม่รวม/ปิด/ทับงานเหล่านั้นในรอบนี้
- ผลตรวจของ source ชุดนี้: 65 tests / 11 files, lint และ TypeScript/build ผ่าน; รายงานภาพจริงและข้อจำกัดอยู่ docs/HOME_TOP_REVIEW_2026-11-03.md


## ประวัติสถานะก่อนซิงก์ Git — 3 พฤศจิกายน 2569

- เจ้าของต้องการให้บันทึกการเปลี่ยนแปลงในเอกสารที่ตกลงไว้ และไม่ใช้การส่ง ZIP ไปมาเป็นขั้นตอนหลักทุกครั้ง
- งาน Home ล่าสุดและเอกสารในไฟล์นี้อยู่ใน `/workspace/scratch/4af56bce1759/anti-integrated-20261103` ซึ่งเป็นสำเนารวมจาก ZIP ไม่ใช่ checkout ที่มี `.git` และไม่ใช่โฟลเดอร์ Windows ของ Antigravity
- อัปเดต `HANDOFF.md`, `CURRENT_SCOPE.md` และ `docs/HOME_TOP_REVIEW_2026-11-03.md` แล้ว การบันทึกเอกสารนี้ไม่เท่ากับซิงก์ไฟล์เข้าเครื่อง Windows หรือ GitHub
- ยังไม่มี commit/push/deploy ของงานส่วนบน Home และยังไม่มีหลักฐานว่า Antigravity ได้รับหรือรวมงานชุดนี้ ห้ามรายงานว่าฝั่ง Windows อัปเดตแล้ว
- ขั้นต่อไปของงานส่งต่อคือเทียบงานที่ยังไม่บันทึกของทั้งสองฝั่ง แล้วรวมโค้ดและเอกสารผ่าน repository/branch ที่ใช้ร่วมกัน โดยรักษางานใหม่บน Windows ห้ามแตก ZIP ทับโครงการทั้งชุด
- ไฟล์ `MonkChat-Guide-home-top-20261103.zip` เป็นสำเนาส่งออก ไม่ใช่แหล่งงานที่ซิงก์ร่วมกัน ผู้ทำงานต่อให้อ่านส่วนนี้และรายการแก้ด้านล่างก่อนเริ่ม

## ปรับเฉพาะส่วนบน Home ตามภาพที่เจ้าของอนุมัติ — 3 พฤศจิกายน 2569

- ภาพแนวนอนเต็มขอบจอ ย้ายชื่อ/คำอธิบายลงใต้ภาพ และเพิ่มทางลัด 5 ช่อง ไอคอนอยู่เหนือชื่อ รองรับ TH/EN
- ใช้ภาพโครงการเดิมขนาด 1672×941; จำกัดการเปลี่ยน container เฉพาะ `/` และ `/visit` แถบเมนูส่วนกลางและหน้าอื่นไม่เปลี่ยน
- เทียบ source ตั้งแต่แถบวันเวลาลงไปแล้วตรงกับก่อนแก้ทุกข้อความ/องค์ประกอบ ยกเว้นเพิ่ม div ครอบเพื่อคงความกว้างเดิม
- 65 tests / 11 files, lint, TypeScript/build ผ่าน; เปิดเว็บจริง Desktop และตรวจ responsive ผ่าน iframe widths 360/390/768/1024/1440 ไม่มีหน้าเว็บล้นแนวนอน ยังไม่ใช่การทดสอบอุปกรณ์จริง
- รายละเอียดและภาพ: docs/HOME_TOP_REVIEW_2026-11-03.md ไม่มี commit/push/deploy

## ผลเปิดเว็บจริงและแก้ต่อ — 3 พฤศจิกายน 2569

- ใช้ managed static QA preview เปิดเว็บจาก source ได้แล้ว และตรวจ Desktop 1363×936 ผ่าน CUA ด้วยตนเอง ข้อจำกัดเดิมเรื่องยังเปิด browser ไม่ได้ถูกแทนที่สำหรับ Desktop
- ตรวจ Home/Activities/Meditation/Q&A/Centers และ client route /visit; สลับ TH/EN, FAQ ค้นหา/พับ และกรองศูนย์ได้
- เล่น/หยุดเสียงจริงได้ เครื่องเล่นอ่าน 326.147483 วินาทีและโหลด captions; ยังไม่ฟังเทียบทุก cue หรือช่วงท้าย
- แก้ Q&A preview ให้ใช้คลังจริง เอาคำอ้างการรับรองออก แก้ accordion; ใช้จำนวน/เมืองศูนย์จากข้อมูลจริง เอาเวลาจบ 15:30 ที่เติมเองออก และใช้ transcript excerpt จริง
- ปรับ Hero ให้สว่างตามทิศทางภาพพื้นอ่อนที่เลือก โดยรักษาภาพและองค์ประกอบเดิม ยังไม่ใช่การรับรองว่าเหมือนภาพทุกจุด
- ผลล่าสุด 65 tests / 11 files ผ่าน, lint/build ผ่าน; ยังไม่ยืนยัน mobile/tablet, live AI หรือ Supabase gateway
- รายงานล่าสุด: docs/BROWSER_REVIEW_2026-11-03.md; มีภาพจริงที่ถ่ายเองใน docs/review-evidence/2026-11-03/browser/
- Source ล่าสุด: MonkChat-Guide-browser-reviewed-20261103.zip; ไม่มี commit/push/merge/deploy


## ตรวจ source จาก Antigravity และคืนงานรวม — 3 พฤศจิกายน 2569

- ฐานงานหน้าตา: MonkChat-Guide-Anti-redesign-20261103.zip; เก็บ Home/Activities และหน้าสาธารณะใหม่ไว้
- คืน private AI /admin/assistant และ endpoint จากชุดรวมก่อนหน้า พร้อมการตรวจสิทธิ์ Owner/Team และข้อความร่าง บอทสาธารณะยังใช้เฉพาะคลังคำตอบที่ตรวจและเผยแพร่แล้ว
- คืนการล็อก Q&A, filtered writes, stale-load handling, canonical migration ฉบับเดียว และ tests จากฐานรวม
- รันเองก่อนแก้: 42 tests / 10 files, lint/build ผ่าน; migration เดิมไม่ผ่าน expanded case คืนร่างแล้วยังเผยแพร่
- รันเองหลังแก้: 64 tests / 11 files, lint/build ผ่าน; DB suites 20 + 9 + 20 checks ผ่านใน PostgreSQL จำลอง มีกรณีทับซ้อน ไม่ใช่ Supabase gateway
- ไม่มี screenshots ที่รายงานไว้ในชุดไฟล์ที่ได้รับ จึงยังไม่ผ่าน visual/viewport verification
- ยังไม่ทดสอบ live AI, CMS บัญชีจริง, Supabase gateway หรือฟังเทียบเสียง 5:26 กับซับ 5:00
- ผลตรวจหลักและข้อจำกัด: docs/CHATGPT_REVIEW_2026-11-03.md; logs: docs/review-evidence/2026-11-03/
- บันทึก Anti เดิม: docs/history/HANDOFF-Anti-redesign-2026-11-03.md
- ใช้ source ชุด MonkChat-Guide-reviewed-20261103.zip สำหรับเทียบงานต่อ ไม่มี commit/push/merge/deploy หรือ production migration ในรอบนี้
