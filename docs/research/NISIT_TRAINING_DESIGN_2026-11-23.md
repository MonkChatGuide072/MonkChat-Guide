# ผลปรับดีไซน์ส่วนฝึกพระนิสิต

## ปรับหน้าฝึกพระนิสิตครบทุกหมวด — 23 พฤศจิกายน 2569

- เจ้าของสั่งปรับความสวยงามโดยเน้นส่วนฝึกและให้ครบทุกหมวด ดำเนินการบน `C:/Users/VICTUS GAMING 16/Desktop/web/monkchat-guide-wt-nisit` ไม่คัด source เก่าใน Documents ทับงานล่าสุด และสำรองไฟล์ก่อนแก้ไว้ `.tmp/nisit-design/before/` ใน checkout Documents
- จัดหน้า `/nisit` ใหม่เป็นส่วนหัวกระชับ ทางลัดเริ่มฝึก เมนูเลือกหมวดด้านข้างบนเดสก์ท็อป/ปุ่มหมวดบนมือถือ และพื้นที่ฝึกหลัก ชู 5 หมวดฝึก (คำศัพท์ เสียง Q&A สถานการณ์ วิดีโอ) พร้อมเครื่องมือเสริมเดิมอีก 2 หมวด คงเนื้อหาและการทำงานเดิม
- ปรับการ์ดคำศัพท์ การอ่านประโยคภาษาอังกฤษ ตัวกรอง/คำตอบ Q&A หน้าโจทย์และข้อมูลย้อนกลับ รายการเสียงกับบทอ่าน วิดีโอ เครื่องมือ และการ์ดขอบคุณให้ใช้ธีมเดียวกัน เพิ่มเนื้อหานำทางสองภาษาแยกใน `src/content/nisitTrainingModules.ts` และ CSS ที่จำกัดขอบเขตใน `src/components/nisit/NisitTraining.css`
- คง deep link `?tab=...`, การระบุผู้ฝึก และส่วนบัญชีเดิม เพิ่มการตรวจคีย์บอร์ดครบ 7 หมวดด้วยลูกศร Home/End ไม่เปลี่ยน Auth/RLS/DB หรือไฟล์สื่อ ไม่เพิ่ม dependency และไม่มีค่าใช้จ่ายเพิ่ม
- ผลตรวจ: lint ผ่าน, TypeScript/production build ผ่าน, Vitest 117/117 ใน 19 ไฟล์ผ่าน, `git diff --check` ผ่าน ตรวจทั้ง 7 หมวดที่ 360/390/768/1024/1440 px ภาษาไทยและอังกฤษ ไม่พบหน้าเว็บล้นแนวนอน เปิดคำตอบ Q&A และตรวจคำตอบสถานการณ์ 1 ข้อแล้วออกก่อนจบรอบ ไม่เพิ่มผลรอบฝึกจากการเก็บภาพ
- ตรวจหน้า `/visit` และทางเข้า `/admin/login` แล้ว รูปแบบสาธารณะยังเดิม ส่วน local ไม่มีการเชื่อมต่อบัญชีจึงไม่อ้างว่าตรวจ CMS หลังล็อกอินจริงผ่าน การเชื่อมเสียง/VTT ในหมวดเสียงเป็นข้อจำกัดเดิมและไม่ได้แก้ในงานดีไซน์นี้
- พรีวิวในเครื่อง `http://127.0.0.1:4183/nisit` ภาพและผลตรวจอยู่ `outputs/nisit-training-design-2026-11-23/` ของ checkout Documents มี patch เฉพาะงานรอบนี้เทียบสำรองก่อนแก้และ verification manifest สำหรับ checkpoint รอเจ้าของดู ยังไม่ commit/push/deploy

### ไฟล์งานรอบนี้

- `src/pages/NisitPracticePage.tsx`
- `src/content/nisitTrainingModules.ts`
- `src/components/nisit/NisitTraining.css`
- `src/components/nisit/NisitVocabCards.tsx`
- `src/components/nisit/NisitFlashcards.tsx`
- `src/components/nisit/NisitAudioTeleprompter.tsx`
- `src/components/nisit/NisitVideoStudy.tsx`
- `src/components/nisit/NisitInteractiveDrill.tsx`
- `src/components/nisit/NisitFieldCockpit.tsx`
- `src/components/nisit/NisitThankYouCard.tsx`
- `src/components/nisit/NisitInteractiveDrill.test.tsx`
- `src/pages/HomeAndNisitPages.test.tsx`
