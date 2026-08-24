# MonkChat Guide - Project Handoff

> **หมายเหตุการทบทวนกรอบโครงงานจบปี 4 (อยู่ระหว่างการทบทวน ยังไม่อนุมัติให้เปลี่ยน REQUIREMENTS หรือโค้ด):**
> “MonkChat Guide เป็นเว็บไซต์ทางการของโครงการ และเป็นเครื่องมือช่วยพระนิสิตฝึกใช้สื่อนำนั่งสมาธิภาษาอังกฤษที่ผ่านการตรวจ พร้อมใช้ช่วยชาวต่างชาติหน้างาน ส่วนชาวต่างชาติสแกน QR เพื่อเข้าถึงสื่อและช่องทางศึกษาต่อ โดยเว็บไซต์ธรรมกายทางการเป็นแหล่งข้อมูลรายละเอียด”

---

## 1. สถานะโครงการปัจจุบันและสิ่งที่ทำเสร็จแล้ว (Current Project Status)
- โครงการพัฒนาบน React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router v7 + Supabase + i18next + Vite PWA
- พัฒนาฟีเจอร์ Public Flow v0.2 ตามแผน Wireframe เรียบร้อย:
  - ระบบหน้าหลักใหม่แยกเป็น `ProjectInfoPage` (`/`) และ `VisitPage` (`/visit`)
  - `VisitPage` รองรับ Language Gate ครั้งแรก และแสดง Visitor Home (Hero, Nav Cards, Recommended Track CTA, BioLinks)
  - `MeditationPage`, `QAPage`, `CentersPage` มีการกรองเนื้อหาตามภาษาที่เลือกอย่างเข้มงวด (Strict Translation Filtering) ไม่มี silent fallback
  - เพิ่มสถานะ `is_recommended` พร้อม RPC Trigger ป้องกันการแก้ไขจาก Team Member และ Owner-only button ในหน้า Admin
- ผ่านการคอมไพล์ สร้าง Build และไม่มี TS/Lint/Whitespace error
- หน้าเว็บสาธารณะและระบบ CMS หลังบ้านเชื่อมต่อ Supabase ผ่าน Client-side SDK พร้อม RLS Security ตามสิทธิ์

---

## 2. ฟีเจอร์ที่มีแล้วในระบบ (Implemented Features)
1. **Mobile-first PWA**:
   - รองรับ Web App Manifest (`manifest.webmanifest`), Service Worker สำหรับ Offline Shell (Vite PWA)
   - Responsive Layout ครอบคลุม 360px, 390px, 768px, 1024px, 1440px
2. **ระบบ 2 ภาษา (Thai & English)**:
   - ภาษาไทยเป็นค่าเริ่มต้น (Default) และภาษาอังกฤษเป็นภาษารอง สลับภาษาได้เรียลไทม์ผ่าน `i18next` พร้อมบันทึกใน `localStorage`
   - โครงสร้างฐานข้อมูลรองรับการขยายภาษาในอนาคต (แยกตาราง Translations)
3. **ระบบสมาธิ เสียงนำนั่ง Transcript และซับไตเติล (Meditation, Audio, Transcript, Subtitles)**:
   - เครื่องเล่นเสียง HTML5 Audio พร้อมแถบควบคุม
   - ซิงก์คำบรรยาย WebVTT แบบไดนามิกตามเวลาเล่นเสียง
   - แสดง Transcript ภาษาไทยและภาษาอังกฤษ
   - CMS จัดการแทร็กเสียง, อัปโหลดไฟล์ MP3 (จำกัด 25MB), จัดการเนื้อหา Transcript และซับไตเติล VTT
4. **ระบบถาม-ตอบธรรมะ (Q&A)**:
   - ค้นหาและกรองหมวดหมู่คำถาม-คำตอบ
   - ระบบสถานะ Verification (Verified / Unverified) และ Source Reference
   - Public แสดงเฉพาะคำถามที่ `published` + `verified` + `is_published = true` เท่านั้น
   - CMS จัดการสร้าง, แก้ไข, ตรวจสอบ (Verify โดย Owner), เผยแพร่/ยกเลิก, เก็บถาวร (Archive), และกู้คืน (Restore โดย Owner)
5. **ศูนย์ประสานงานต่างประเทศ (DCI Centers)**:
   - แสดงข้อมูลศูนย์ DCI พร้อมชื่อ ที่อยู่ ข้อมูลติดต่อ และลิงก์ภายนอกที่ปลอดภัย
   - CMS สำหรับเพิ่ม แก้ไข จัดการสถานะ และเก็บถาวร
6. **หน้าหลักและรวมลิงก์ (Home & BioPage)**:
   - การนำเสนอภาพรวมโครงการ MonkChat Guide
   - รายการลิงก์สำคัญ (BioLinks) พร้อมระบบจัดเรียงลำดับ (`display_order`) และตรวจสอบความปลอดภัยของ URL (`http://` หรือ `https://` เท่านั้น)
   - CMS สำหรับจัดการลิงก์และลำดับการแสดงผล
7. **ระบบจัดการเนื้อหา (Admin CMS)**:
   - เข้าสู่ระบบผ่าน Supabase Auth (`/admin/login`)
   - Dashboard สรุปภาพรวมและนำทางไปยังแต่ละโมดูล
   - Lazy-loading แยก Chunk สำหรับหน้า CMS ช่วยเพิ่มความเร็วในการโหลด
8. **ระบบสิทธิ์ผู้ใช้งาน (Roles & Permissions - Owner / Team Member)**:
   - **Owner**: จัดการได้ทุกส่วน, จัดการสมาชิกทีม (Role Management), ตรวจสอบความถูกต้องของ Q&A (Verification), เผยแพร่แทร็กสมาธิ, ลบถาวรข้อมูลที่เก็บถาวรแล้ว
   - **Team Member**: จัดการเนื้อหาฉบับร่าง (Draft), อัปโหลดไฟล์, แก้ไขเนื้อหา, เก็บถาวร (Archive) เนื้อหาที่ยังไม่ได้เผยแพร่ (ไม่สามารถ Verify/Publish หรือลบถาวรได้)
   - บังคับใช้สิทธิ์ผ่าน Database RLS Policies และ Triggers ร่วมกับ `private.get_user_role()`
9. **ระบบสถิติและการบันทึกประวัติ (Analytics & Audit Logging)**:
   - ตาราง `usage_events` บันทึกสถิติแบบไม่ระบุตัวตน (Track Play, Track Complete, BioLink Click) โดยไม่เก็บ IP หรือข้อมูลส่วนบุคคล
   - ฟิลด์ Audit ในทุกตารางหลัก (`created_at`, `updated_at`, `verified_by`, `verified_at`, `archived_at`)

---

## 3. สถานะ Supabase / Storage / Migrations ที่ตรวจได้จริง (Verifiable Supabase Status)
- **Local Migrations (ตรวจพบ 8 ไฟล์ในโฟลเดอร์ `supabase/migrations/`)**:
  1. `20260812152413_initial_schema.sql` (โครงสร้างตารางหลักและตารางแปลภาษา)
  2. `20260812152735_row_level_security.sql` (นโยบาย RLS เริ่มต้น)
  3. `20260812160457_security_advisor_hardening.sql` (ย้ายฟังก์ชันไป `private.get_user_role()`, Search Path Hardening)
  4. `20260812181301_storage_meditation_audio.sql` (สร้าง Storage Bucket `meditation-audio` และ RLS)
  5. `20260812195634_seed_initial_languages.sql` (ข้อมูลเริ่มต้นภาษา `th` และ `en`)
  6. `20260813015023_storage_meditation_subtitles.sql` (สร้าง Storage Bucket `meditation-subtitles` และ RLS)
  7. `20260813215600_meditation_track_publication_security.sql` (Trigger ป้องกัน Team Member เผยแพร่แทร็กเสียง)
  8. `20260814022206_restrict_role_policies_to_authenticated.sql` (จำกัด Role-based RLS Policies เฉพาะ `authenticated` แก้ปัญหา Guest Access)
- **Remote Database Migrations**:
  - พบประวัติในรีโมท 10 Migrations ตรงกับ Local ทั้งหมด (กู้คืน `20260814190506` และ `20260818174242` จาก Git history สำเร็จ)
  - ทดสอบด้วย `npx supabase migration list` แล้วว่าสถานะตรงกับ Remote 100%
- **Storage Buckets**:
  - `meditation-audio` (Private, max 25MB, MIME: `audio/mpeg`, `audio/mp3`, etc.)
  - `meditation-subtitles` (Private, max 1MB, MIME: `text/vtt`)

---

## 4. สถานะ Git และ Branch / Worktree ที่ควรใช้ต่อ (Git Status)
- **Branch ปัจจุบัน**: `main`
- **สถานะการเชื่อมต่อ Remote**: เชื่อมกับ `origin` (`https://github.com/MonkChatGuide072/MonkChat-Guide.git`)
- **สถานะ Working Tree**: สะอาด (`working tree clean`) ก่อนการอัปเดตไฟล์นี้
- **Commit ล่าสุด**: `b464560 fix: restore anonymous published content access` (ตรงกับ `origin/main`)
- **Branch / Worktree ที่ควรใช้ต่อ**: ทำงานบน `main` หรือเปิด feature branch จาก `main` สำหรับงานที่มีการอนุมัติเฉพาะเจาะจง

---

## 5. สถานะเนื้อหาจริงในระบบ (Content Verification Status)
- ใน Source Code โครงการปัจจุบันยังคงมีไฟล์ Mock Data อยู่ใน `src/data/mock/`
- เนื้อหาที่เพิ่มหรือทดสอบก่อนหน้านี้ผ่านหน้า CMS เป็นข้อมูลทดสอบ (TEST Records) ซึ่งถูกกำหนดสถานะเป็น Draft / Unpublished
- **ข้อกำหนดความถูกต้อง**: เนื้อหาจริงใด ๆ ที่เพิ่มในระบบก่อนหน้านี้ หากยังไม่ได้ตรวจยืนยันในฐานข้อมูลแบบเป็นทางการ ให้ถือว่า **“ต้องตรวจซ้ำ”** และ **“ห้ามระบุว่าเผยแพร่แล้ว (Not Published)”** จนกว่าจะมีการตรวจสอบโดย Owner

---

## 6. ปัญหาและจุดที่ยังต้องตรวจสอบ (Known Issues to Verify)
1. **ปัญหา QR Code สแกนแล้วเกิด 404**:
   - ต้องตรวจสอบ URL ปลายทางที่สร้างใน QR Code ว่าตรงกับ Route ของแอปพลิเคชันหรือไม่ และตรวจสอบการทำงานของ SPA Redirects (`public/_redirects`) บน Production Hosting
2. **หน้า BioPage สำหรับผู้ใช้งานทั่วไป (Guest / Tourists)**:
   - ต้องตรวจยืนยันให้แน่ชัดว่า Guest และนักท่องเที่ยวสามารถเปิดหน้าแรก (`/`) และเข้าถึงข้อมูล BioLinks รวมถึงเนื้อหาสาธารณะได้ทันทีโดยไม่ต้องล็อกอินหรือมีสิทธิ์ Admin
3. **การตรวจสอบการ Deploy ของ Cloudflare Pages**:
   - ต้องตรวจยืนยันว่าการ Deploy บน Cloudflare Pages ทำงานจาก Commit ล่าสุดบน Branch `main` (`b464560` หรือใหม่กว่า) และตั้งค่า Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) ครบถ้วนถูกต้อง

---

## 7. ข้อจำกัดถาวรของโครงการ (Permanent Constraints)
- **งบประมาณ 0 บาท**: ใช้งานเฉพาะ Free-tier (Supabase Free, Cloudflare Pages Free, GitHub Free) ไม่เปิดใช้งานฟีเจอร์ที่ต้องจ่ายเงินหรือเสี่ยงต่อค่าใช้จ่ายส่วนเกิน
- **ภาษา**: ภาษาไทยเป็นค่าเริ่มต้น (Primary & Default) ภาษาอังกฤษเป็นภาษารอง (Secondary)
- **ห้ามใช้ Paid AI API**: ห้ามติดตั้งหรือเรียกใช้ OpenAI API, Gemini API หรือ AI API แบบเสียค่าใช้จ่ายในโค้ดที่ Deploy
- **ความปลอดภัยของ Secrets**: ห้ามนำ Service-role Key, รหัสผ่าน หรือ Secret ใด ๆ ใส่ในโค้ดฝั่ง Client / Browser
- **หลักธรรมและเนื้อหาพระพุทธศาสนา**: ห้ามเผยแพร่คำตอบหรือเนื้อหาธรรมะที่สร้างจาก AI โดยอัตโนมัติ ทุกคำตอบ Q&A ต้องผ่านการตรวจสอบและอนุมัติจาก Project Owner
- **การจัดการไฟล์เสียง**: ห้าม Cache ไฟล์เสียงขนาดใหญ่ลงเครื่อง Client/Service Worker โดยอัตโนมัติ เพื่อป้องกันการเกินขีดจำกัด Bandwidth และ Storage ของ Free-tier

---

## 8. สิ่งที่ห้ามทำต่อโดยไม่ได้รับอนุมัติ (Prohibited Actions Without Approval)
- ห้ามแก้ไขโค้ดแอปพลิเคชัน โครงสร้างฐานข้อมูล หรือไฟล์อื่น ๆ
- ห้ามแก้ไขไฟล์ `REQUIREMENTS.md` หรือ `DECISIONS.md`
- ห้ามรันคำสั่ง Migration หรือปรับแก้ Database Schema
- ห้าม Deploy หรือแก้ไขการตั้งค่า Cloudflare Pages
- ห้ามแก้ไขหรือสร้าง QR Code ใด ๆ
- ห้าม commit หรือ push ไปยัง GitHub
- ห้ามรันคำสั่งที่เป็นอันตรายหรือทำลายข้อมูล

---

## 9. ขั้นตอนถัดไปเพียง 1 ขั้นตอน (Exact Next Step)
- รายงานผลลัพธ์การพัฒนา Public Flow v0.2 และการกู้คืน/สร้าง Migration `20260825000000_add_is_recommended.sql` ให้ Owner ตรวจ พร้อมส่ง diff ห้าม commit, push หรือ deploy จนกว่าจะได้รับคำสั่งยืนยัน
