# MonkChat Guide — Current Handoff

## บังคับล็อกอินก่อนเข้าหน้า `/nisit` ผ่าน `NisitProtectedRoute` (12 พฤศจิกายน 2569)

- **การป้องกันสิทธิ์เข้าถึง `/nisit`:**
  - สร้าง [src/components/NisitProtectedRoute.tsx](src/components/NisitProtectedRoute.tsx) และครอบ `<Route path="nisit">` ใน [src/App.tsx](src/App.tsx) ให้ผู้ที่ยังไม่ล็อกอิน บัญชีที่ถูกระงับ (`!profile.is_active`) หรือบทบาทที่ไม่ใช่ `'student' | 'team_member' | 'owner'` ถูก Redirect ไปยัง `/nisit/login` ทันที
  - ปรับ [src/pages/NisitLoginPage.tsx](src/pages/NisitLoginPage.tsx) ลบลิงก์และข้อความที่อ้างโหมดไม่ล็อกอินบน `/nisit` (เปลี่ยนลิงก์ด้านล่างจาก `/nisit` เป็น `/` กลับหน้าหลักเว็บไซต์)
  - เพิ่มเทสต์ `NisitProtectedRoute` ใน [src/pages/NisitPhase2Pages.test.tsx](src/pages/NisitPhase2Pages.test.tsx)
- **ผลตรวจหลังแก้ไข:**
  - `npm run lint` (`oxlint`): `0 warnings / 0 errors` (121 ไฟล์)
  - `npm run build` (`tsc -b && vite build`): ผ่าน (`✓ built`, `PWA v1.3.0`)
  - `npm test -- --run` (`vitest`): **15 test files / 97 tests passed**
  - Chrome Headless (`360/390/768/1024/1440 px`): เปิด `/nisit` ขณะยังไม่ล็อกอิน redirect ไป `/nisit/login` ครบทั้ง 5 ขนาด และไม่มี overflow หรือ error

## ปรับหน้า `/centers` ใช้ภาพสถานที่จริง ตรงตามแผนที่ + ตัวเลือกโซนในไทย/ต่างประเทศ (12 พฤศจิกายน 2569)

- **ภาพสถานที่จริงทั้ง 6 แห่ง (`public/images/centers/`):**
  - แยกข้อมูลและตรรกะการจับคู่ภาพไปที่ [src/content/centersDirectory.ts](src/content/centersDirectory.ts) (ใช้เฉพาะภาพสถานที่จริงที่ตรงตามตำแหน่งแผนที่เท่านั้น ศูนย์อื่นที่ยังไม่ยืนยันจะไม่ใส่ภาพจำลอง):
    - **ในประเทศไทย:** `th-ayothaya.jpg` (ศูนย์ปฏิบัติธรรมอโยธยา), `th-dhammakaya.jpg` (วัดพระธรรมกาย สำนักงานใหญ่ ปทุมธานี + ลิงก์แผนที่ทางการ `https://maps.app.goo.gl/YjxbKFSBEP8YEp7P8`)
    - **ต่างประเทศ:** `nl-afferden.jpg` (เนเธอร์แลนด์), `sg-punggol.jpg` (สิงคโปร์), `au-sydney.jpg` (ซิดนีย์), `us-azusa.jpg` (อาซูซา, แคลิฟอร์เนีย)
- **ตัวกรองโซนโลกและทวีปตาม `en.dhammakaya.net/branches/`:**
  - เพิ่มไอคอน `building` และ `compass` ใน [src/components/GuideIcon.tsx](src/components/GuideIcon.tsx) และปรับ [src/pages/CentersPage.tsx](src/pages/CentersPage.tsx) ให้เลือก `ทั้งหมด (ทั่วโลก)`, `ในประเทศไทย`, `ต่างประเทศ (สาขาทั่วโลก)` พร้อมชิปทวีป/เมือง และส่วนเชื่อมตรงไปยังเครือข่าย 6 ทวีปของ Dhammakaya Foundation (`Asia`, `Europe`, `UK`, `Americas`, `Oceania`, `Africa`)
- **ผลตรวจหลังแก้ไข:**
  - `npm run lint` (`oxlint`): `0 warnings / 0 errors` (120 ไฟล์)
  - `npm run build` (`tsc -b && vite build`): ผ่าน (`✓ built`, `PWA v1.3.0`)
  - `npm test -- --run` (`vitest`): **15 test files / 96 tests passed** (เพิ่มเทสต์หน้า `/centers` ใน [src/pages/PublicPages.test.tsx](src/pages/PublicPages.test.tsx))
  - Chrome Headless Audit (`360/390/768/1024/1440 px` พร้อมข้อมูล Supabase จริง): ตรวจครบ 6 การ์ด (`ทั้งหมด 6`, `ในประเทศไทย 2`, `ต่างประเทศ 4`) และไม่มี overflow หรือลิงก์วงในหลุด

## ปรับหน้า `/activities` แบบ 6 การ์ดภาพบรรยากาศจริง + แถบติดต่อสี Terracotta (11 พฤศจิกายน 2569)

- **โครงสร้างใหม่ของหน้ากิจกรรม:**
  - แยกเนื้อหาและข้อมูลภาพ 2 ภาษา (`TH`/`EN`) ไปที่ [src/content/activitiesContent.ts](src/content/activitiesContent.ts) และปรับการแสดงผลใน [src/pages/ActivitiesPage.tsx](src/pages/ActivitiesPage.tsx):
    - **Hero Header:** ป้ายวัดมหาธาตุ, ชื่อกิจกรรม `MONK CHAT & MEDITATION` และชิปข้อมูลสำคัญ (`Free Walk-in`, `ทุกวันจันทร์และวันศุกร์ 13:15 น. เป็นต้นไป`, `ใต้ร่มไม้ใหญ่ วัดมหาธาตุ`)
    - **แกลเลอรีบรรยากาศจริง 6 การ์ด (`3×2` บน Desktop):** ใช้ภาพถ่ายจริงจากวัดมหาธาตุ 6 ภาพใน `public/images/activities/activity-1.jpg` ถึง `activity-6.jpg` พร้อมลิงก์ไป `/meditation` และกล่องข้อแนะนำตารางกิจกรรม
    - **แถบติดต่อเน้นสี Terracotta (`#A33D19`):** ลิงก์ตรงเพจทางการ `MonkChat Ayutthaya` (`https://web.facebook.com/MonkChatAyutthaya/`) และปุ่ม `คุยกับแชทบอท` ที่สั่งเปิด `#reviewed-chatbot-panel` บน Header (ผ่าน [src/components/ChatbotServiceCard.tsx](src/components/ChatbotServiceCard.tsx) + [src/components/GuideIcon.tsx](src/components/GuideIcon.tsx)) พร้อมงดแสดงเบอร์/อีเมลจากภาพตัวอย่างที่ยังไม่ผ่านการยืนยัน
    - **ข้อแนะนำเบื้องต้น 3 ข้อ:** การแต่งกายสุภาพ, ถอดรองเท้า, กิริยาที่สงบสำรวม
- **ผลตรวจหลังแก้ไข:**
  - `npm run lint` (`oxlint`): `0 warnings / 0 errors` (119 files)
  - `npm run build` (`tsc -b && vite build`): ผ่าน (`✓ built`, `PWA v1.3.0`)
  - `npm test -- --run` (`vitest`): **15 test files / 95 tests passed** (เพิ่มเทสต์หน้า `/activities` 6 การ์ดและปุ่มแชทบอทใน [src/pages/PublicPages.test.tsx](src/pages/PublicPages.test.tsx))
  - Chrome Headless CDP Audit (`360/390/768/1024/1440 px`): **40/40 checks passed** (`failureCount: 0`)

## ซ่อนทางเข้า `/nisit` และ `/admin` ออกจากทุกส่วนสาธารณะ + ปิด PR ค้างเก่า (11 พฤศจิกายน 2569)

- ตามคำยืนยันเจ้าของโครงการ:
  - **ซ่อนทางเข้าวงในทั้งหมดจากผู้มาเยือน:** นำเมนู `พระนิสิต / Student Monks` และลิงก์ Footer `/nisit` กับ `/admin/login` ออกจาก [src/components/Layout.tsx](src/components/Layout.tsx) และนำการ์ด `"เข้ามุมฝึกพระนิสิต"` ออกจาก [src/pages/VisitPage.tsx](src/pages/VisitPage.tsx) โดยยังคงเข้าใช้งาน `/nisit`, `/nisit/login`, และ `/admin` ผ่าน URL โดยตรงได้ตามเดิม
  - **เก็บกวาด PR ค้างเก่า:** ปิด PR เก่าที่ถูกแทนที่แล้ว ได้แก่ `#7, #9, #10, #13, #15, #18` เหลือเฉพาะ `PR #22` เปิดอยู่
  - อัปเดต [src/pages/HomeAndNisitPages.test.tsx](src/pages/HomeAndNisitPages.test.tsx) ยืนยันว่าหน้าผู้มาเยือนและ `Layout` สาธารณะไม่แสดงทั้ง `a[href="/nisit"]` และ `a[href="/admin/login"]`

## ซ่อนทางเข้า `/nisit` ออกจากทุกส่วนสาธารณะ (รู้เฉพาะวงใน) — 11 พฤศจิกายน 2569

- ตามคำยืนยันเจ้าของโครงการ (**หน้าพระนิสิตต้องไม่โชว์สาธารณะ ให้รู้เฉพาะวงใน ไม่แสดงแก่นักท่องเที่ยว**):
  - นำเมนู `พระนิสิต / Student Monks` และลิงก์ `มุมฝึกพระนิสิต (/nisit)` ออกจาก Navigation หลัก, เมนูมือถือ และ Footer ของ [src/components/Layout.tsx](src/components/Layout.tsx)
  - นำการ์ดทางเข้า `"สำหรับพระนิสิต มจร · เข้ามุมฝึกพระนิสิต"` ออกจาก [src/pages/VisitPage.tsx](src/pages/VisitPage.tsx) (`/`, `/home`, `/visit`)
  - ยังคงเส้นทางตรง `/nisit` และ `/nisit/login` ไว้สำหรับพระนิสิตและทีมงานวงในเข้าใช้งานผ่าน URL โดยตรง
  - อัปเดต [src/pages/HomeAndNisitPages.test.tsx](src/pages/HomeAndNisitPages.test.tsx) ยืนยันว่าหน้าผู้มาเยือนและ `Layout` สาธารณะไม่แสดงลิงก์ `/nisit`

## ปรับความสอดคล้อง Header แชทบอท `/meditation`, PWA manifest, A11y และตรวจระบบจริง — 11 พฤศจิกายน 2569

- **งานที่ทำเพิ่มเติมใน branch `chore/monkchat-ux-a11y-audit-skill` (ยังไม่ commit/merge):**
  - **ปุ่มแชทบอทบน Header หน้า `/meditation`:** นำเงื่อนไขยกเว้น `/meditation` ออกใน [src/components/Layout.tsx](src/components/Layout.tsx) และนำการ์ด `<ChatbotServiceCard inline />` ด้านล่างออกจาก [src/pages/MeditationPage.tsx](src/pages/MeditationPage.tsx) เพื่อให้ปุ่มแชทบอทอยู่บน Header เหมือนกันครบทุกหน้าสาธารณะ (`/`, `/activities`, `/meditation`, `/qa`, `/centers`)
  - **PWA Manifest (`vite.config.ts`) & ขนาดภาพป้องกัน CLS (`width`/`height`):** อัปเดต `background_color` (`#F7F7F4`) และ `theme_color` (`#11223C`) ใน `vite.config.ts` ให้ตรงกับ [index.html](index.html) และชุดสี White/Navy/Gold; เติม `width`/`height` จริงให้ภาพใน [src/pages/ActivitiesPage.tsx](src/pages/ActivitiesPage.tsx) (`560×315`, `1672×941` พร้อมลด `pb-24` → `pb-8`), [src/pages/LoginPage.tsx](src/pages/LoginPage.tsx) (`1001×1024`), และ [src/pages/NotFoundPage.tsx](src/pages/NotFoundPage.tsx) (`1001×1024`)
  - **อัปเดตเทสต์:** เพิ่มการตรวจ Header Chatbot บน `/meditation` และไม่แสดงการ์ดแชทซ้ำท้ายหน้าใน [src/pages/HomeAndNisitPages.test.tsx](src/pages/HomeAndNisitPages.test.tsx) และ [src/pages/PublicPages.test.tsx](src/pages/PublicPages.test.tsx)
- **ผลตรวจหลังแก้ไขโค้ดและเทสต์:**
  - `vitest run --run`: **15 files / 94 tests passed**
  - `oxlint`: **0 warnings / 0 errors** บน 118 ไฟล์
  - `tsc -b && vite build`: ผ่าน (`PWA v1.3.0`, precache 67 entries / `2422.06 KiB`)
  - Chrome Headless CDP Audit: **45/45 checks** (`360/390/768/1024/1440 px` × 9 เส้นทาง) `failureCount: 0` (ไม่มี overflow, ไม่มีภาพขาด `width/height`, ไม่มีปุ่ม/ลิงก์ที่มองเห็น `< 44 px`, มีปุ่มแชทบอทบน Header หน้า `/meditation` ครบ)
- **ผลตรวจสภาพแวดล้อมจริง (Read-only diagnostic บน Production / PR #22 Preview / Supabase CLI):**
  - Supabase Migrations 14/14 และ Edge Functions 3 ตัว (`team-management` v3, `student-cohorts` v1, `student-register` v1) อัปขึ้นระบบและสถานะ `ACTIVE` ครบแล้ว และ `origin/main` รวม PR #19–#21 แล้ว (`f89a468`)
  - Endpoint `/meditation` บนพรีวิวล่าสุดโหลด `signedUrl` เสียง (.mp3) และ `meditation-subtitles` `.vtt` ได้จริง (`HTTP 200`); endpoint `/api/monk-assistant` ตอบ `401` เมื่อยังไม่ล็อกอิน (พร้อมใช้งานและตรวจสิทธิ์); และ CORS `CMS_ALLOWED_ORIGINS` เปิดรับ `https://monkchat-guide.pages.dev` (`204`) ส่วนพรีวิว (`71994abf.monkchat-guide.pages.dev`) ติด `403` ตามการตั้งค่าความปลอดภัย
  - **งานที่ยังรอการดำเนินการ / ตัดสินใจจากเจ้าของโครงการ:** (1) merge `PR #22` ขึ้น `main` เมื่อพร้อมเผยแพร่, (2) ล็อกอินบัญชี Owner จริงสร้าง Invite Code รุ่นแรกที่ `/admin/students` เพื่อทดสอบ E2E `/nisit/login` และ `/admin/assistant` บนโดเมนหลัก `monkchat-guide.pages.dev`, (3) ตรวจเสียงนำสมาธิ 326s กับซับ VTT และเพิ่มคลังเสียง/Q&A จริง (ปัจจุบันเห็นเผยแพร่ 1 เสียง EN 5 นาที และ 4 Q&A)

## รวมหน้าแรก `/` · `/home` · `/visit`, ไอคอนลัดคงค้าง, แชทบอทบน Header และโทนสี White/Navy/Gold — 11 พฤศจิกายน 2569

- **รวมหน้าแรกของผู้มาเยือน (`/` · `/home` · `/visit`):**
  - ตามคำยืนยันเจ้าของ (`/visit` คือหน้าแรกสำหรับชาวต่างชาติ ไม่ใช่หน้าซ้ำอีกหน้า) ปรับ `src/App.tsx` ให้ `/` (`index`), `/home` และ `/visit` เรนเดอร์ `src/pages/VisitPage.tsx` เพียงชุดเดียว (และ `src/pages/HomeOverviewPage.tsx` คงเป็น re-export เพื่อไม่ให้ import เดิมขาด)
  - เพิ่มการ์ดทางเข้า **`/nisit` ("สำหรับพระนิสิต มจร · เข้ามุมฝึกพระนิสิต")** ต่อจากตารางเวลาใน `VisitPage.tsx` พร้อมอัปเดตเมนูหลักและ Footer ใน `src/components/Layout.tsx`
- **แถบทางลัด 5 ไอคอนคงค้างในหน้าย่อย:**
  - แยกข้อมูลทางลัด 5 รายการไว้ใน `src/content/publicShortcuts.ts` (`/` หน้าแรก, `/activities` กิจกรรม, `/meditation` สมาธิ, `/qa` ถาม–ตอบ, `/centers` ศูนย์)
  - ให้ `src/components/HomeHeroIntro.tsx` แสดงบนหน้าแรก และให้ `Layout.tsx` แสดงแถบ 5 ไอคอนใต้ Header บนหน้าย่อย (`/activities`, `/meditation`, `/qa`, `/centers`) สำหรับจอมือถือ–แท็บเล็ต (`lg:hidden`) เพื่อให้ไอคอนไม่หายเมื่อกดเข้าหน้าย่อย
- **ย้ายปุ่มแชทบอทขึ้น Header (ไม่บังเนื้อหา):**
  - เพิ่มโหมด `placement="header"` ใน `src/components/ChatbotServiceCard.tsx` (เปิด dialog ผ่าน React Portal แตะด้านนอกหรือกด Escape เพื่อปิด, รักษา focus และรองรับปุ่ม trigger 44×44 px บนมือถือ) และย้ายการเรียกใช้ใน `Layout.tsx` จากมุมขวาล่างที่ลอยทับตัวอักษรขึ้น Header พร้อมตัด `pb-24` ส่วนเกินออก
- **ปรับชุดสีเป็น White + Soft Gold + Deep Navy ตาม `AGENTS.md` / `DECISIONS.md` #24:**
  - อัปเดต `src/index.css`, `index.html`, `Layout.tsx`, `LanguageSwitcher.tsx`, `HomeHeroIntro.tsx`, `MeditationGuide.css`, `MeditationGuideVisual.tsx`, `MeditationPlayer.tsx`, `MeditationSupplementary.tsx`, `VisitPage.tsx`, `ActivitiesPage.tsx`, `MeditationPage.tsx`, `QAPage.tsx`, `CentersPage.tsx`, และกลุ่ม `/nisit` (รวมถึงสีภาพ PNG ใน `NisitThankYouCard.tsx`) เป็นพื้นขาวสว่างสะอาด (`#F7F7F4` / `#FFFFFF`), ตัวอักษรและปุ่มกรมท่า (`#11223C` / `#16324F`), และทองสุภาพ (`#8F6419` / `#FAF5E8`) ให้เข้ากับภาพแบนเนอร์และภาพสถานที่จริง
- **ผลตรวจหลังแก้ไข:** ผ่าน `vitest run --run` **15 files / 94 tests**, `oxlint` (**0 warnings / 0 errors** บน 118 ไฟล์), `tsc -b && vite build`, `git diff --check`, และตรวจ Chrome headless screenshot ครบมือถือ (`360/390 px`) และเดสก์ท็อป (`1280 px`)

## สกิลตรวจ UX Flow / Accessibility (`.agents/skills/monkchat-ux-a11y-audit`) และปรับปรุง A11y — 11 พฤศจิกายน 2569

- **สกิลใหม่ในโปรเจกต์:**
  - `.agents/skills/monkchat-ux-a11y-audit/SKILL.md` — ขั้นตอนตรวจ UX Flow ของ MonkChat (`/`, `/home`, `/visit`, `/nisit`, `/nisit/login`, `/admin`), Keyboard/Focus, Form, และ WCAG Accessibility
  - `.agents/skills/monkchat-ux-a11y-audit/references/vercel-web-guidelines.md` — มาตรฐานจาก `vercel-labs/web-interface-guidelines` (MIT License) ที่ปรับให้สอดคล้องกับ Sentence case, Vite CSR PWA และ `AGENTS.md` / `unslop`
- **จุดที่แก้ไขจากผลตรวจรอบแรก:**
  - เพิ่ม Skip-to-content link (`#main-content` ใน `src/components/Layout.tsx` และ `#admin-main-content` ใน `src/components/AdminLayout.tsx`) พร้อม `min-h-11` บนลิงก์โลโก้หัวเว็บ
  - แก้ลำดับ Heading ใน `/nisit` (`src/components/nisit/NisitVocabCards.tsx`, `NisitAudioTeleprompter.tsx`, `NisitVideoStudy.tsx`, `NisitFlashcards.tsx`, `NisitThankYouCard.tsx`) เป็น `<h1>` → `<h2>` → `<h3>` ไม่ข้ามระดับ
  - เพิ่ม `getNextRovingTabIndex` ใน `src/content/nisitPractice.ts` และเชื่อมต่อปุ่มลูกศร (`ArrowLeft`/`ArrowRight`/`Home`/`End`) ใน `role="tablist"` บน `NisitPracticePage.tsx` และ `NisitLoginPage.tsx` พร้อม `name`, `autoComplete`, และ `spellCheck={false}`
  - ปรับขนาดตัวอักษรช่องค้นหาใน `src/pages/QAPage.tsx` เป็น `text-base` (`16 px`) และปรับลิงก์ `"View all FAQ →"` ใน `src/pages/VisitPage.tsx` เป็น `min-h-11` (`>= 44 px`)
  - ใส่ `width` / `height` HTML attribute บนรูปภาพหลักใน `Layout.tsx`, `AdminLayout.tsx`, `HomeOverviewPage.tsx`, `VisitPage.tsx`, `QAPage.tsx`, `CentersPage.tsx`, `NisitLoginPage.tsx`, และ `NisitThankYouCard.tsx`
- **ผลตรวจหลังแก้ไข:** ผ่าน `vitest` **15 files / 93 tests**, `oxlint` (**0 warnings / 0 errors** บน 117 ไฟล์), `tsc -b && vite build`, `git diff --check`, และ Chrome CDP A11y re-audit ครบ 9 เส้นทาง (`skipLinks: 1`, `skippedLevels: []`, `missingDimsImgs: []`, `qaSearchFontPx: 16`, `overflow: false`, และไม่มีลิงก์/ปุ่มที่มองเห็น `< 44 px`)

## ระบบบัญชีพระนิสิตประจำรุ่น · Cohort Invite Code · บทบาท `student` และ `/admin/students` (เฟส 2) — 10 พฤศจิกายน 2569

- **ฐานงานและ branch:** แตกจาก `feat/home-visit-nisit-phase1` (commit `55ff83f`, PR #20) เป็น branch ใหม่ `feat/nisit-student-accounts-phase2` ใน worktree `..\monkchat-guide-wt-nisit` (ยังไม่ commit/push, ยังไม่ merge เข้า `main`, ยังไม่ apply migration หรือ deploy production)
- **ฐานข้อมูลและความปลอดภัย (`supabase/migrations/20261110170000_student_cohorts_and_practice.sql`):**
  - ขยาย `public.profiles` รองรับบทบาท `'student'` (`role IN ('owner', 'team_member', 'student')`) และคอลัมน์ `student_code` (`4011001–6911060` unique), `cohort_year` (`40–69`), `dharma_name` พร้อมอัปเดต `private.guard_managed_profile()` ให้ฝั่ง client แก้ไข `id`, `role`, `student_code`, `cohort_year` ไม่ได้
  - เพิ่มตาราง `public.student_cohort_invites` (เก็บ `invite_code_hash` SHA-256, `code_hint`, `max_uses`, `used_count`, `expires_at`; Owner อ่านได้อย่างเดียว) และฟังก์ชัน atomic `public.claim_student_cohort_invite(p_code_hash, p_cohort_year)` (`SECURITY DEFINER`, ให้สิทธิ์ `service_role` เท่านั้น) พร้อม `public.student_security_version()` (= 2) และ trigger audit log
  - เพิ่มตาราง `public.student_practice_progress` (`module_type IN ('vocab_lesson', 'qa_flashcard', 'audio_track')`, `item_key`) โดยนิสิตอ่าน/เพิ่ม/ลบเฉพาะรายการของตนเอง และ Owner อ่านความคืบหน้าได้
  - เพิ่ม Storage `SELECT` RLS policy สำหรับ `TO authenticated` บน `meditation-audio` (เฉพาะเผยแพร่แล้ว), `meditation-subtitles` (เฉพาะเผยแพร่แล้ว), และ `bio-link-images` เพื่อไม่ให้บัญชี `'student'` ติด 403
- **Edge Functions และสิทธิ์หลังบ้าน:**
  - เพิ่ม `supabase/functions/_shared/studentAuth.ts` ตรวจรหัสนิสิต 7 หลัก, แปลงเป็นอีเมลภายใน `@student.monkchat.invalid` (RFC 2606), บังคับรหัสผ่าน 12–128 ตัวและปฏิเสธ `ID = Password` กับ `monkchat+ID`
  - เพิ่ม `supabase/functions/student-register/` (`verify_jwt = false`) สำหรับพระนิสิตสมัครเองด้วย Cohort Invite Code
  - เพิ่ม `supabase/functions/student-cohorts/` (`verify_jwt = true`, เฉพาะ active `'owner'` และตรวจ `student_security_version() = 2`) สำหรับสร้าง/ระงับรหัสเชิญรุ่น ดูรายชื่อและยอดฝึก แก้ชื่อ–ฉายา ระงับบัญชี และรีเซ็ตรหัสชั่วคราวแบบสุ่ม 14 ตัวอักษร
  - ปรับ `supabase/functions/team-management/index.ts` คัดกรอง `.in('role', ['owner', 'team_member'])` ใน `list()` ไม่ให้นิสิตปะปนในหน้า `/admin/team`, และตั้งค่า `[functions.student-cohorts]` / `[functions.student-register]` ใน `supabase/config.toml`
- **หน้าเว็บและคอมโพเนนต์ (`src/`):**
  - อัปเดต `src/lib/auth.tsx` (เพิ่ม `role: 'student'`, `student_code`, `cohort_year`, `dharma_name`) และเพิ่ม `src/lib/studentPractice.ts`
  - เพิ่ม `src/pages/NisitLoginPage.tsx` (`/nisit/login`) สำหรับล็อกอิน 7 หลักและลงทะเบียนด้วย Cohort Invite Code
  - ปรับ `src/pages/LoginPage.tsx` (`/admin/login`) ไม่ให้ auto-redirect บัญชี `'student'` เข้า `/admin` พร้อมแสดงปุ่มกลับ `/nisit` และออกจากระบบ
  - อัปเดต `src/pages/NisitPracticePage.tsx`, `src/components/nisit/NisitVocabCards.tsx`, และ `src/components/nisit/NisitFlashcards.tsx` รองรับซิงก์ความก้าวหน้าลง `student_practice_progress` เมื่อล็อกอินเป็น `'student'`, เปลี่ยนรหัสผ่านเองได้ (คงกฎ 12+ ตัวและห้าม `ID=Password`/`monkchat+ID`), และคงโหมดฝึกบนเครื่อง (`localStorage`) สำหรับผู้ไม่ล็อกอิน
  - เพิ่ม `src/pages/admin/AdminStudentsPage.tsx` (`/admin/students`, เฉพาะ `<OwnerRoute>`) พร้อมเพิ่มเมนูใน `src/components/AdminLayout.tsx`, การ์ดใน `src/pages/admin/AdminDashboardPage.tsx`, และ route ใน `src/App.tsx`
- **การตรวจและการทดสอบ:**
  - เพิ่ม `src/lib/studentAuth.test.ts` (11 unit/handler tests) และ `src/pages/NisitPhase2Pages.test.tsx` (4 integration tests)
  - ผ่าน `vitest run --run` 15 files / 91 tests, `oxlint` (0 warnings, 0 errors บน 117 files), `tsc -b && vite build`, `git diff --check`, และ Chrome CDP responsive check (`360/390/768/1024/1440 px` บน `/nisit`, `/nisit/login` และแท็บลงทะเบียน ไม่มี horizontal overflow และ input font >= 16 px)
  - **ข้อจำกัดที่ยังไม่ได้ทดสอบจริง (ต้องทำเมื่อขึ้นระบบจริง):** ยังไม่ได้ run SQL migration ขึ้นฐานข้อมูล Supabase จริง และยังไม่ได้ deploy `student-register` / `student-cohorts` เพื่อยิงทดสอบ End-to-End กับ Supabase Auth จริง
- **ลำดับการ deploy เมื่อเจ้าของอนุมัติ (ห้ามสลับลำดับ):**
  1. รัน migration `20261110170000_student_cohorts_and_practice.sql` บน Supabase ก่อน (เพื่อให้ตาราง, คอลัมน์, และ `student_security_version() = 2` พร้อมทำงาน)
  2. ตรวจและตั้งค่า `CMS_ALLOWED_ORIGINS` (รวม origin ของเว็บจริงและ preview ที่อนุญาต) ก่อน deploy Edge Functions `student-register`, `student-cohorts`, และ `team-management`
  3. สร้าง Cohort Invite Code รุ่นแรกผ่าน `/admin/students` ด้วยบัญชี Owner

## แยกฝั่ง `/` · `/home` · `/visit` · `/nisit` (เฟส 1) และคง `/admin` — 10 พฤศจิกายน 2569

- **ฐานงานและ branch:** แตกจาก `origin/feat/responsive-home-banner` (PR #19 commit `1b3d188`) เป็น branch ใหม่ `feat/home-visit-nisit-phase1` ใน worktree `..\monkchat-guide-wt-nisit` (ยังคง `PR #19` และ worktree เดิมไว้ครบ ไม่มีการ merge เข้า `main` หรือ deploy production)
- **สิ่งที่พัฒนาในเฟส 1 (ไม่แก้ฐานข้อมูล/Migration):**
  - แยก `src/components/LanguageGate.tsx` เป็นคอมโพเนนต์กลางสำหรับจุดเข้า QR
  - เพิ่มหน้า `src/pages/HomeOverviewPage.tsx` สำหรับ `/` และ `/home`: แสดง Language Gate ก่อนเลือกภาษา, แบนเนอร์ Hero จาก PR #19 (`src/components/HomeHeroIntro.tsx`), ตารางเวลา, ภาพรวม Ayutthaya Monk Chat และทางแยกเข้า `/visit` (หลักสำหรับนักท่องเที่ยว) กับ `/nisit` (มุมฝึกพระนิสิต)
  - ปรับ `src/pages/VisitPage.tsx` (`/visit`) เป็นหน้าหลักฝั่งนักท่องเที่ยว: เพิ่มส่วนบรรยากาศจริง 2 คอลัมน์, การ์ดสมาธิเข้าใจง่าย 3 ขั้นตอนจาก `preparationCards` + `MeditationGuideVisual`, และสถานที่ปฏิบัติธรรมที่ยืนยันแล้วจาก `src/content/continuePractice.ts` พร้อมคง Recommended Audio, Bio Links และกติกาความปลอดภัยเดิมครบ
  - เพิ่มมุมฝึกพระนิสิต `src/pages/NisitPracticePage.tsx` (`/nisit`) พร้อมข้อมูลและตัวช่วยใน `src/content/nisitPractice.ts` แยก 5 แท็บ:
    1. `src/components/nisit/NisitVocabCards.tsx` — การ์ดนำนั่งสมาธิคู่คำศัพท์ คำอ่านไทย และคำแนะนำการสื่อสาร
    2. `src/components/nisit/NisitAudioTeleprompter.tsx` — ตัวเล่นเสียงนำสมาธิพร้อมบทพูดวิ่งตามซับ VTT (กดที่ท่อนเพื่อกระโดดเวลาเสียงไปซ้อมพูดซ้ำได้ทันที)
    3. `src/components/nisit/NisitVideoStudy.tsx` — แหล่งเรียนรู้ทางการที่ยืนยันแล้ว และตัวเปิดวิดีโอ YouTube ห้องเรียนแบบปลอดภัย (`youtube-nocookie.com`)
    4. `src/components/nisit/NisitFlashcards.tsx` — คลังถาม–ตอบฝึกความมั่นใจ (คัดเฉพาะรายการ `published + verified` ชุดเดียวกับระบบหลัก)
    5. `src/components/nisit/NisitThankYouCard.tsx` — สมุดจดชื่อผู้มาเยือนและตัวสร้างการ์ดขอบคุณ PNG หน้างาน (ทำงานเฉพาะบนเครื่อง `localStorage` ไม่ส่งชื่อขึ้น DB และมีปุ่มล้างข้อมูลท้ายวัน)
  - ปรับ `src/App.tsx` และ `src/components/Layout.tsx` ให้รองรับ `/`, `/home`, `/visit`, `/nisit`, ซ่อนการ์ดแชทลอยบน `/nisit`, และคง `/admin/*` ตามเดิมทุกประการ
- **ชุดทดสอบและผลตรวจ:** เพิ่ม `src/pages/HomeAndNisitPages.test.tsx` (ทดสอบตัวตรวจรหัส 7 หลัก `4011001–6911060`, safe YouTube parser, `/home`, `/visit`, และครบทั้ง 5 แท็บใน `/nisit`) ผ่าน `vitest` ครบ 13 files / 76 tests, `oxlint`, `tsc -b && vite build` และตรวจผ่าน Chrome CDP ทุกเส้นทางบน 360–1440 px ไม่มี horizontal overflow
- **งานเฟส 2 ที่ยังรอทำต่อ:**
  1. ตัดสินใจ/รวม **PR #19** เข้า `main` และตรวจผลซับ VTT 05:26 ร่วมกับพระอาจารย์
  2. เมื่อพร้อมขึ้นเฟส 2: เพิ่ม Migration/RLS Role `student`, ระบบสมัครด้วย **Invite Code ประจำรุ่น** + รหัส 7 หลัก + ตั้งรหัสผ่านเอง 12+ ตัว (อีเมลภายใน `.invalid`) เพื่อเก็บประวัติฝึกของนิสิตลงฐานข้อมูลจริงอย่างปลอดภัย (ไม่ใช้ `ID = Password` หรือ `monkchat + รหัส`)

## ส่งต่อแบนเนอร์หน้าแรกให้ Antigravity — 10 พฤศจิกายน 2569

- ตามคำขอเจ้าของ เปลี่ยนภาพแบนเนอร์หน้าแรกเป็นแบบ Ayutthaya Monk Chat ที่มีโลโก้และข้อความตามภาพที่เลือก ใช้ `picture` ใน `HomeHeroIntro.tsx` เลือก WebP ตามช่วงจอที่ 640 และ 1280 px คงโครงหน้าเดิมทั้งภาษาไทยและอังกฤษ รวมถึงหน้าเลือกภาษาและทางลัด 5 รายการ
- หลังตรวจภาพจากมือถือและ Mi Pad ลดความสูงกรอบจาก 240/360/460/500 เป็น 190/280/320/400 px และจัดข้อความใหม่บนไฟล์ WebP มือถือ 1170 × 570, แท็บเล็ต 2048 × 640 และคอม 2696 × 800 px ที่ความกว้างเกินประมาณ 2049 px กรอบเพิ่มตามความกว้างจอเพื่อรักษาข้อความในภาพ
- ชุดย่อผ่าน 71 tests / 12 files, lint และ TypeScript/PWA build ตรวจ Chrome ที่ 320/390/639/640/768/1024/1160/1280/1440/2560 px ว่าเลือกไฟล์ถูกและไม่มีหน้าล้น ตรวจที่ viewport จำลอง 390 × 680 และ 1160 × 670 เห็นทางลัดครบโดยไม่เลื่อน ตรวจหน้าล็อกอินทีมงานผ่านการ redirect ของผู้เยี่ยมชม ส่วนบัญชีทีมงานจริงและการดูชุดย่อบนอุปกรณ์จริงเป็นงานตรวจต่อ
- ฐานงาน `main` ที่ 3255f39 ใช้ branch `feat/responsive-home-banner` และ PR #19 สำหรับ Cloudflare Preview ให้ Antigravity ตรวจสถานะ checkout บน Windows และเทียบกับ branch นี้ก่อนแก้ เมื่อเจ้าของตรวจพรีวิวและอนุมัติการเผยแพร่ จึงรวม PR เข้า `main` เพื่อขึ้นเว็บหลัก

## เผยแพร่เว็บหลักตามคำยืนยันเจ้าของ — 4 พฤศจิกายน 2569

- เจ้าของยืนยันครบ 3 ขั้นตอนอย่างชัดเจน: PR #17 Draft → Ready → merge main → deploy production จึงดำเนินการตามคำยืนยันล่าสุด แทนข้อจำกัดพรีวิวในบันทึกก่อนหน้าเฉพาะรอบนี้
- PR #17 merged สำเร็จที่ 55b2afefdbe168c01b88dec98aa01dd458542c48 จาก head 8d91de44e56677653c7165e6055b1ca15c6dcdff; merge tree 4ae6876e9894470cfe06966f614500a4926fff3e ตรงกับ source ที่ตรวจแล้ว จึงใช้ผล 71 tests / 12 files, lint และ TypeScript/PWA build จากชุดนั้น ไม่มี source code เปลี่ยนระหว่าง release
- Cloudflare Pages production deployment 06222416-b0c7-4354-a7cd-0bacf1239b00 สถานะ success จาก merge commit เว็บหลัก https://monkchat-guide.pages.dev/ ไม่ใช่แค่ preview; production branch main และ env public connection เดิม ไม่เปลี่ยน settings/bindings/DB
- ตรวจบน URL เว็บหลักจริง: /centers มี 3 destination links และรายการเผยแพร่ 4 แห่ง ไม่มี alert ภาพโหลดครบ; /meditation มี 6 preparation cards / 1 quiet image / 8 reflection cards และ audio element; /qa มีช่องค้นหา ไม่มี alert; /activities ไม่มี report panel/alert; Home เลือก English แล้วชื่อ MonkChat Guide กับ 5 shortcuts; alias /visit ยังเข้า Home ได้ ไม่มี alert และไม่มี academic/budget copy
- บันทึกหลักฐาน screenshot ภายใน checkpoints/production-gateway-20261104.jpg ไม่ส่งภาพ/.env ขึ้น GitHub; ผลตรวจนี้เป็น public browser smoke check ไม่ใช่ยืนยันบัญชีจริง Owner/Team, live private AI หรือเสียง/ซับทุกวินาที ประเด็นเดิมยังอยู่ในรายงานก่อนหน้า ไม่มี migration/เผยแพร่คำตอบใหม่
- หลัง release ใช้ main เป็นฐานรับงานล่าสุดตาม WORKFLOW.md ไม่ใช้ ZIP ทับ Windows และยังไม่มีหลักฐานว่า Antigravity ดึง main แล้ว Previous production c93437006334165bcca3c5339e3b7536de5b6e89 / deployment 752487fc-6986-4afd-8786-a34df354793a เก็บในประวัติสำหรับเทียบย้อนหลัง รอบปิดงานนี้เพิ่มเฉพาะเอกสารสถานะหลัง deploy


## Centers เป็น gateway สำหรับเรียนรู้และฝึกต่อ — 4 พฤศจิกายน 2569

- ต่อจาก source 8d0024efbd0015b8bc3eec127d0cda40a71a39eb ตามคำชี้แจงเจ้าของ /centers ให้ผู้ที่ลองสมาธิแล้วสนใจเลือกไปต่อ เปลี่ยน hero เป็น “เรียนรู้และฝึกสมาธิต่อ” / “Continue your practice” พร้อมข้อความเชิญสำรวจแบบมีเงื่อนไขตามความสนใจ
- เพิ่ม 3 ช่องทางก่อนค้นหา: อโยธยา → https://ayothayameditation.com/ ; วัดพระธรรมกาย → https://en.dhammakaya.net/contact/ ; ศูนย์สาขา → https://en.dhammakaya.net/branches/ เปิดเว็บไซต์ภายนอกโดยตรง ระบุภาษาปลายทางในปุ่มเมื่อจำเป็น และแนะนำให้สอบถามเวลา ภาษา เงื่อนไขกับสถานที่ก่อนเดินทาง ไม่เพิ่มสมัคร/จอง/ค่าใช้จ่าย/กำหนดการ
- แยกข้อมูลลิงก์และคำเชิญใน src/content/continuePractice.ts ตรวจเว็บไซต์เจ้าของสถานที่ด้วย web retrieval วันที่ 4 พ.ย. 2569; source ยังใช้รายการ published / safe links / strict language filtering เดิม Search form ย้ายลงหลัง gateway; fetch/effects 2 ชุดเทียบฐาน 8d0024e ตรงกัน ไม่แก้ DB/CMS/Auth
- รันเอง 71 tests / 12 files, lint, TypeScript/PWA build ผ่าน ขยาย regression เดิมให้ตรวจหัวข้อใหม่ ลิงก์ 3 แห่ง ลำดับก่อน Search และยังทดสอบ York ไม่ปน New York / empty search reset ตามเดิม Chrome TH/EN 360/390/768/1024/1440 รวม 10 สถานะ: ไม่ล้นแนวนอน ปุ่มลิงก์ >=44px และ gateway อยู่ก่อน Search ทุกขนาด
- รายละเอียด: docs/CENTERS_GATEWAY_2026-11-04.md ภาพหลักฐานอยู่ภายใน ไม่ส่งขึ้น GitHub ส่ง checkpoint branch ร่วม ไม่ merge main/deploy production และไม่อ้างว่า Windows ดึงงานแล้ว


## ชื่อ MonkChat Guide / ข้อความสาธารณะ / การ์ดหายใจ — 4 พฤศจิกายน 2569

- ต่อจาก 3067c5d3a6f283959834ddbc9d79fffe5c179ec6 ตามคำยืนยันล่าสุด ชื่อ header, Home, language gate, title/OG, footer, login/404 และบอทใช้ MonkChat Guide; คงโลโก้เดิมและโครงการ Ayutthaya Monk Chat ในคำแนะนำกิจกรรม ไม่เปลี่ยนโครงหน้าที่อนุมัติ
- นำรายงานวิชาการ/งบ Free-tier/คำอธิบายกระบวนการพัฒนาออกจาก Home และ Activities แทน Home ด้วยคำแนะนำกิจกรรมสั้น ๆ ข้อมูลภายในยังเก็บในเอกสาร ไม่ย้ายลงหน้าอื่นสาธารณะ ย่อ beforeIntro ให้เป็นคำแนะนำผู้มาเยือนโดยตรง
- เพิ่มการ์ดหายใจเป็นใบ 3 จาก 6: ท่านั่ง / หลับตาผ่อนคลาย / หายใจ / ปล่อยวาง / กลางท้อง / ดวงแก้ว ภาพ SVG ลูกศรเข้า–ออกและป้าย TH/EN ตรงภาษา บอกให้หายใจเข้าลึกอย่างสบาย ผ่อนออกช้า ๆ สองสามครั้งแล้วกลับเป็นธรรมชาติ ไม่มี timer/auto-animation หมวดช่วงนั่งและหลังนั่ง รวมฐานแบบเปิดเพิ่ม คงเดิม
- ตรวจเอง 71 tests / 12 files, lint, TypeScript/PWA build ผ่าน ปรับ regression เดิมให้ตรวจหายใจใบ 3/6 และคงการ์ดหายใจเมื่อเปลี่ยนภาษา ส่วน VisitPage ตรวจชื่อหลักพร้อมชื่อกิจกรรมและไม่มีข้อความวิจัย/งบเดิม ไม่เพิ่มชุดทดสอบซ้ำสำเนา
- Chrome ตรวจการ์ดหายใจ TH/EN 360/390/768/1024/1440 รวม 10 สถานะ: 6 การ์ด, ป้ายเข้า–ออกตรงภาษา, ข้อความหลัก 16px, ไม่มี document overflow และชื่อ MonkChat Guide บน header ไม่ตัดคำ ตรวจ public Home/Activities และพรีวิวล่าสุดก่อนส่ง ไม่มีเปลี่ยนไฟล์เสียง/ซับ/ถอดเสียง auth/DB/backend ไม่ merge/deploy production และไม่อ้างว่าเครื่อง Windows ดึงงานแล้ว



## การ์ดก่อนนั่ง / ช่วงนั่ง / หลังนั่ง — 4 พฤศจิกายน 2569

- ต่อจาก source 923e199e992674818ea0d75e3639f12520165ff0 ตามบทนำนั่งจริงที่เจ้าของส่ง และคำสั่งเพิ่มการ์ด 3 หมวด เปลี่ยนจากลำดับหลัก 9 ใบเป็นก่อนนั่ง 5 ใบ (ท่านั่ง / หลับตาผ่อนคลาย / ปล่อยวาง / กลางท้อง / ดวงแก้ว), ช่วงนั่งภาพเดียว, หลังนั่ง 8 ใบ ไม่มี auto-slide หรือจับเวลา
- หมวดหลังนั่ง: ใจฟุ้ง / พยายามจนเกร็ง / เบาสบาย / ดวงกลมใส / ตัวเล็ก / องค์พระภายใน / แสงสว่าง / อย่างอื่นหรือยังไม่แน่ใจ รวมไม่เห็นภาพใด ใช้ประโยคช่วยเล่าให้พระฟัง ไม่รับรองว่าเป็นผลที่ทุกคนต้องพบ ไม่ตีความขั้นธรรม และไม่มีคะแนน/เก็บข้อมูลตอบกลับ
- ฐาน 1–7 อยู่ในส่วนเปิดอ่านเพิ่มเติมของก่อนนั่ง มีปุ่มไปฐาน 7 และลิงก์แหล่งเดิม; หมวดช่วงนั่งมี SVG พระใต้ต้นไม้ 1 ภาพ ไม่มีการ์ดลูกศร ปุ่มฟังลิงก์ไปเครื่องเล่นเดิม ไม่ auto-play หรือหยุดเสียงเมื่อเปลี่ยนหมวด
- ข้อความ TH/EN อยู่ src/content/meditationGuide.ts, UI อยู่ MeditationBeginnerGuide.tsx / MeditationGuide.css, ภาพวาดเดิมขยายเป็นภาพประกอบตามสถานการณ์ใน MeditationGuideVisual.tsx; ย่อ subtitle ของ MeditationPage เท่านั้น ตัวจัดการเสียง/บันทึก/แชร์/ถอดเสียง 7 ชุดเทียบ source 923e199 ตรงกัน ไม่มีแก้ media/auth/backend
- รันเอง: 71 tests / 12 files, lint, TypeScript/PWA build ผ่าน เพิ่ม regression ครบสามหมวด/คีย์บอร์ด tabs/การ์ดท้าย/สลับภาษา/เครื่องเล่น node เดิมไม่ถูก remount พร้อมปรับข้อทดสอบก่อนหน้าให้ตรงการย่อ 5 ใบและฐานแบบ optional
- Chrome TH/EN 360/390/768/1024/1440 ครบ 30 สถานะ: ไม่มี document overflow, guide ก่อน audio ทุกหมวด, ปุ่มควบคุม >=44px, ข้อความหลักการ์ด 16px, ก่อนนั่ง 5 ภาพ / ช่วงนั่ง 1 ภาพ / หลังนั่ง 8 ภาพ EN จอ 360 การ์ดก่อนนั่งใบแรกจบที่ y=787.5 หลังย่อหัวข้อซ้ำ ตรวจ End ไปท้ายหลังนั่ง / Home กลับหมวดแรก / เปิดฐาน 7 ได้จริง
- ข้อจำกัด: ตรวจ viewport ผ่าน Chrome ไม่ใช่อุปกรณ์สัมผัสจริง บทเจ้าของเป็นฐานการย่อภาพ แต่ยังไม่อ้างว่าตรงไฟล์เสียงทุกคำหรือทุกวินาที ไม่มีเปลี่ยนเสียง/ซับ/Transcript และไม่มี merge main/deploy production ส่งผ่าน branch/PR เดิม ไม่ส่ง ZIP ทับ Windows; รายละเอียดรอบนี้ใน docs/MEDITATION_PICTURE_GUIDE_2026-11-04.md


## แก้ UX และคู่มือภาพฐานทั้ง 7 ตามคำสั่งล่าสุด — 4 พฤศจิกายน 2569

- ต่อจาก bc3cd084271330e94804cd31cb9beb53580911b0 เจ้าของแจ้งภาพจุดย้อนกลับและขอคู่มือวัดพระธรรมกายเป็นการ์ดเลื่อนเหนือเสียง รอบนี้ทำตามคำสั่งใหม่เฉพาะหน้าสาธารณะ/คู่มือ ไม่ขยายไป backend
- เอา VisitorBackLink ออกจาก Meditation, Q&A และ Centers ทั้งหมด ใช้ Home ในเมนูหลักตามเดิม Resource ร่วมกิจกรรมจาก Centers ไป /activities โดยตรง ปิดจุดวนกลับ Home ซ้ำที่ท้ายคู่มือสมาธิเดิม
- เปลี่ยน MeditationBeginnerGuide เป็น 9 การ์ดภาพ: เตรียมท่านั่ง → ฐาน 1–7 → วางใจเบา ๆ พร้อมไปฐาน 7 ตรง ๆ, ปุ่มก่อน/ถัดไป, คีย์บอร์ด, native horizontal scroll/snap และสถานะการ์ด ไม่มี auto-slide ย้ายเหนือเครื่องเล่นเสียงและย่อหัวหน้าให้เห็นการ์ดในจอมือถือ
- เนื้อหา TH/EN แยกใน src/content/meditationGuide.ts ย่อยจากหน้า Let's practice ของ Dhammakaya Foundation และ “ทางเดิน ของใจ ๗ ฐาน” ของวัดพระธรรมกาย มีลิงก์ฉบับเต็ม เน้น 6 ภายในกลางท้องระดับสะดือ / 7 สูงขึ้นสองนิ้วมือ รวมด้านซ้ายขวาของผู้ฝึก ไม่ใช้คำแนะนำลมหายใจทั่วไปแทนวิธีนี้
- วาดภาพน่ารักใหม่ด้วย SVG ใน source จึงคุมตำแหน่ง/ตัวเลขและขยายได้ชัด ไม่คัดภาพเว็บหรือใช้ภาพ AI วางจุดกายวิภาค คำแนะนำเก่า/ป้าย Draft ใน BeginnerGuide และ Supplementary ไม่ถูก render บนหน้าสมาธิแล้ว ไม่อ้างการรับรองจากพระอาจารย์แทนเจ้าของ
- ทดสอบจอ 390×800 พบแชทลอยบังลูกศรจริง จึงเพิ่ม inline mode ให้ ChatbotServiceCard และย้ายไปท้ายหน้าสมาธิ Layout งด floating เฉพาะเส้นทางนี้ หน้าอื่นยังลอยตามเดิม Matching / verified-published filtering / การตอบจากคลังเดิมไม่เปลี่ยน
- รันเอง 70 tests / 12 files, lint และ TypeScript/PWA build ผ่าน เพิ่ม regression คีย์บอร์ด/ขอบการ์ด/คงฐานเมื่อเปลี่ยนภาษา และปรับ test คู่มือเก่าให้ตรวจลำดับก่อนเสียง แหล่งเนื้อหา ฐาน 7 และ transcript/audio เดิม ไม่ลด tests ด้านข้อมูลหรือสิทธิ์
- Chrome TH/EN ที่ 360/390/768/1024/1440 ตรวจ 9 การ์ด เนื้อหา 16px ไม่มี document overflow คู่มือก่อนเสียง; 360×800 EN การ์ดแรกจบที่ y=793 และแชทเป็น static อยู่ท้ายหน้าไม่ทับลูกศร ไปฐาน 7 ตรงแล้ว scrollY ยัง 0 แชท inline เปิดได้กว้าง 313px ในหน้า 345px และ Escape ปิดได้ Q&A/Centers ไม่มี back /visit และยังมีแชทเดิม
- รายละเอียดและแหล่งอ้างอิง: docs/MEDITATION_PICTURE_GUIDE_2026-11-04.md ไม่มีแก้ไฟล์เสียง/ซับ/ถอดเสียงหรือฐานข้อมูล ไม่มี merge main/deploy production ภาพหลักฐานเก็บภายในตามเดิม พรีวิวใช้ Git integration ของ branch ร่วม ตรวจ source commit ให้ตรงกับ deployment ก่อนส่งลิงก์



## ปิดงาน UI ชุดเดิมบนพรีวิวออนไลน์ — 4 พฤศจิกายน 2569

- เจ้าของย้ำให้จบงานเดิม ไม่ขยายไปตั้งค่าระบบหลังบ้าน รอบนี้จึงไม่เปลี่ยน UI เพิ่ม ไม่แก้ฐานข้อมูล/บัญชี/Workers AI หรือ production
- งาน UI ที่ตรวจแล้วอยู่ที่ source commit 115b0539081b776676d079d25cd6cb563624d677 ครบ 27 routed page components ผล 69 tests / 12 files, lint และ build จากรอบโค้ดล่าสุดยังใช้ได้ รอบนี้แก้เฉพาะเอกสาร
- ตรวจ Cloudflare จริงพบว่า Git integration ขึ้น Preview สำเร็จอัตโนมัติแล้ว deployment 96eebf40-5f26-4662-9591-79ca8083368b ผูก source commit ข้างต้น: https://96eebf40.monkchat-guide.pages.dev/ (จึงแก้ความเข้าใจเดิม: ยังไม่ deploy production แต่มี preview ออนไลน์แล้ว)
- เปิดพรีวิวออนไลน์ผ่าน Chrome: เลือกภาษา Home → Activities → Meditation → Q&A → Centers → /visit ทั้ง TH/EN ตรวจรวม 10 route/language states ไม่พบ alert หรือ document horizontal overflow ภาพ Home และโลโก้โหลดครบ หน้า /visit ยังเป็น Home ตามเดิม ไม่ใช่ fixture
- งานปรับ UI เดิมปิดรอบและพร้อมให้ตรวจจากลิงก์จริง ไม่ผลักการทำ UI ที่เสร็จแล้วกลับไปให้ Antigravity ทำซ้ำ รายละเอียดรายหน้าอยู่ docs/UNSLOP_REVIEW_2026-11-04.md
- ข้อจำกัดบัญชีจริง/AI/เสียงและซับในบันทึกก่อนหน้ายังเป็นข้อจำกัดของระบบ ไม่ได้รวมเป็นงานตกแต่งเพิ่มเติมหรืออ้างว่าแก้เสร็จ รอบนี้ไม่มี merge main หรือแทน production


## รอบ UI ครบเส้นทางและส่งตรวจรวม — 4 พฤศจิกายน 2569

- ต่อจาก Centers/BioLinks fb086c847e567aec0d0083ddcca6fba58d9bac8a เก็บภาษา ทีมงาน สถิติ ผู้ช่วยส่วนตัว และสถานะปฏิเสธสิทธิ์ พร้อมตรวจรวมหน้าสาธารณะ 5 หน้า + Login/404 + หลังบ้าน 20 หน้า รวม 27 page components (Home มี alias /visit)
- CMS ใช้ neutral workspace, accent อิฐ, โลโก้เดิม, ปุ่ม 44px/ช่องกรอก 16px/48px; Analytics เลิกสีรุ้งประจำตัวเลขและบอกช่วงที่เลือกด้วย aria-pressed; ผู้ช่วยใช้หัวเรื่อง/คำถาม/คำตอบร่างอ่านง่าย คง review/no-source notices ทั้งหมด ไม่เปลี่ยน AI endpoint หรือพฤติกรรมเผยแพร่
- ตรวจ error/empty แล้วพบข้อความ read-only/next step ที่ล้าสมัยและคีย์แปลขาด จึงแก้ข้อความ UI TH/EN ให้ตรงฟังก์ชัน เพิ่มชื่อ optional/error/session ที่หาย ถอด emoji ที่ตกค้างและกำหนด role=alert ให้แผง error การสแกน static translation keys ของ pages/components ไม่พบคีย์ขาด
- ตรวจ source: handlers/effects 57 ชุดตรงกับฐาน, auth.tsx/supabase.ts/functions/api/monk-assistant.js ไม่เปลี่ยน และเงื่อนไข ProtectedRoute/OwnerRoute ตรงเดิม (เปลี่ยนเฉพาะ loading/denial presentation)
- ผลรันเองล่าสุด: 69 tests / 12 files, lint, TypeScript/PWA build ผ่าน จำนวนเพิ่มจากฐาน 65 เพราะ regression 4 ข้อ (Centers 1 และ Admin navigation 3) ไม่ได้สแกนสำเนาสำรองเพิ่ม; หลังจากนั้นมีเพียง trim whitespace และเอกสาร
- Chrome: หลังบ้านทั้ง 20 หน้า TH/EN ที่ 360/768/1440 รวม 120 สถานะ ไม่มี document overflow, ปุ่มที่แสดงไม่ต่ำกว่า 44px และทุก input/select/textarea ที่แสดงมีชื่อ ช่องข้อความ/เลือก/ไฟล์/textarea 16px ตรวจเปิดฟอร์มภาษา/ทีมทั้งสองภาษา, 30-day range, error/empty/verified-lock/Team read-only/Owner denial และคำตอบร่างจำลองพร้อม no-source notice แล้ว เก็บ targeted rechecks หลังแก้ข้อความและคีย์แปล
- CMS ใช้ isolated visual fixture นอก source แอป ด้วยข้อมูล/บัญชี/คำตอบจำลองและปฏิเสธ mutation ไม่ใช่การล็อกอินบัญชีจริงหรือ live AI; ไม่มี fixture ใน production bundle ส่วน /admin ของแอปจริงใน QA preview ทดสอบ guest แล้ว redirect /admin/login ได้ ไม่มี bypass auth ใน source
- รายละเอียด audit/direction/แต่ละหน้าอยู่ docs/UNSLOP_REVIEW_2026-11-04.md ภาพและ JSON เก็บภายใน ไม่อัปโหลดภาพ/.env หรือรหัสลับขึ้น GitHub ไม่ merge/deploy/แก้ฐานข้อมูล และยังไม่อ้างว่า Windows/Anti รับงานแล้ว

### งานรับต่อก่อนเผยแพร่

1. Antigravity อ่านหัว branch sync/anti-reviewed-20261103 และเอกสารนี้ แล้วเทียบกับงาน Windows ผ่าน worktree ตาม WORKFLOW.md ไม่แตก ZIP ทับงาน
2. ทดสอบบัญชีจริง Owner/Team: เข้า–ออกระบบ สร้าง/แก้ร่าง อัปโหลดเสียง/ซับ สิทธิ์เผยแพร่และล็อก Q&A รวม private AI แบบใช้งานจริงในสภาพแวดล้อมทดสอบ (รอบ UI นี้ยังไม่ยืนยัน RLS/gateway/live inference)
3. ตรวจเสียง 326s กับ VTT 300s, cue 19, สิทธิ์สื่อ/ผู้บรรยาย และตัดสิน Draft เนื้อหาสมาธิที่ยังค้าง ก่อนอ้างว่าพร้อมเผยแพร่
4. ตรวจโทรศัพท์/iPad จริงและรวมผล ก่อนพิจารณา merge/deploy production แยกจากรอบ UI นี้



## ปรับ UI ทีละหน้า: CMS Centers / BioLinks 6 หน้า — 4 พฤศจิกายน 2569

- ต่อจาก Q&A 82c034e17a43c9af421ee9fb686b2db0eeb19610 ตรวจรายการ/สร้าง/แก้ไขศูนย์ แล้วรายการ/สร้าง/แก้ไขลิงก์ ปรับ typography, primary action, notices และระยะปุ่มร่วม เชื่อม label ฟอร์ม 28 จุด เพิ่มชื่อช่องลำดับลิงก์พร้อมชื่อรายการ และปุ่มปิดข้อความ ใช้ file selector 44px
- handlers/effects 16 ชุดเทียบฐานตรงกัน ไม่เปลี่ยน URL checks, draft/publication/archive/restore, confirm, storage หรือ write payloads
- รันเอง 69 tests / 12 files, lint, TypeScript/PWA build ผ่าน ตรวจ synthetic fixture TH/EN 360/1440 ทั้ง 6 หน้า ไม่ล้นและปุ่มไม่ต่ำกว่า 44px พบช่องลำดับลิงก์ไม่มีชื่อในรอบแรกจึงแก้และตรวจซ้ำ ทุกช่อง text/select/textarea 16px ไม่มีการสร้าง/แก้/เผยแพร่ข้อมูลจริง
- ถัดไปภาษา ทีมงาน สถิติ ผู้ช่วยส่วนตัว และตรวจรวมรอบท้าย ไม่มี merge/deploy


## ปรับ UI ทีละหน้า: CMS Q&A 3 หน้า — 4 พฤศจิกายน 2569

- ต่อจาก CMS Meditation c79d3f70b26b5f29165a3d669b53a546073cfa57 ตรวจรายการ สร้าง และแก้ไข ปรับน้ำหนักฟอนต์ ปุ่มสูง 44px สี primary เดียว ลด uppercase/emoji/เงา เชื่อม label กับ control 16 จุด และตั้งชื่อปุ่มปิดข้อความ คงสถานะ verification/content/publication แหล่งอ้างอิงและ notice ทั้งหมด
- เทียบ handlers/effects 7 ชุดกับฐานตรงกัน ไม่เปลี่ยน filtered writes, stale-load/verified-content locks หรือสิทธิ์
- รันเอง 69 tests / 12 files, lint, TypeScript/PWA build ผ่าน ตรวจ fixture TH/EN 360/1440 ครบ 3 หน้า รวม 12 สถานะ ไม่ล้นหน้า ไม่มีปุ่มต่ำกว่า 44px ทุก text/select/textarea 16px และมี label ไม่มีการบันทึก/เผยแพร่คำตอบจริง
- คิวถัดไป Centers → BioLinks → ภาษา/ทีม/Analytics → ผู้ช่วยส่วนตัว ไม่มี merge/deploy


## ปรับ UI ทีละหน้า: CMS Meditation 6 หน้า — 4 พฤศจิกายน 2569

- ต่อจาก Admin shell 74fbc219cc23796079397323da01e70aabb42f80 ตรวจรายการ สร้าง แก้ไข อัปโหลดเสียง ถอดความ และซับทีละหน้า ปรับหัวเรื่อง/ปุ่ม/notice ให้สอดคล้องกัน ลดตัวหนา ป้าย uppercase ตัวอักษร 10/11px และเงา เปลี่ยน Recommended ให้แปลตามภาษา เชื่อม label กับ control รวม 16 จุดพร้อม label เลือกไฟล์เสียงและกลุ่มภาษาซับ
- จัดหัวฟอร์มและปุ่มให้ wrap บนมือถือ เพิ่ม scoped action-link sizing กันปุ่มยุบเป็นทีละตัวอักษร คงสถานะ Draft/Unpublished/คำเตือนเปลี่ยนไฟล์และ confirmation ทุกข้อ
- Source integrity เปรียบเทียบ handlers/effects กับฐาน ผลอยู่ unslop-admin-meditation-integrity.log ไม่มีการเปลี่ยน fetch/save/upload/validation หรือ auth
- รันเอง 69 tests / 12 files, lint, TypeScript/PWA build ผ่าน ตรวจ isolated fixture TH/EN 360/1440 ทั้ง 6 หน้า รวม 24 สถานะ ไม่ล้นหน้า ปุ่มไม่ต่ำกว่า 44px ช่องข้อความ/เลือก/textarea 16px และมี label ไม่อัปโหลดไฟล์หรือบันทึกข้อมูลจริง
- ถัดไป CMS Q&A แล้ว Centers/BioLinks/ภาษา/ทีม/Analytics/ผู้ช่วยส่วนตัว ไม่มี merge/deploy


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
