# Q&A ที่รับรองแล้ว: ขั้นตอนตรวจและนำขึ้นระบบ

สถานะ 3 พฤศจิกายน 2569: รวมกับไฟล์ Windows แล้ว ทดสอบใน PostgreSQL จำลองผ่าน ยังไม่ติดตั้งบน Supabase จริง

## Migration ฉบับเดียว

ใช้ `supabase/migrations/20261025130443_lock_verified_qa_content.sql` จาก Windows พร้อมการแก้ในรอบรวมงานนี้ ไฟล์ร่าง `20261102170228_lock_verified_qa_content.sql` ของชุดเตรียมส่งเดิมถูกนำออกจากชุดใช้งานเพื่อไม่ให้ติดตั้ง guard ซ้ำ และยังย้อนดูได้จาก archive ก่อนรวม

- คง guard สำหรับคำแปลที่ไม่ใช่ฉบับร่าง และห้ามเปลี่ยนตัวตน/ภาษา/รายการแม่ของคำแปล
- trigger `a_guard_reviewed_qa_item` ทำงานก่อน `enforce_qa_verification_trigger` เพื่อปฏิเสธคำขอแก้สถานะต้องห้าม ก่อน trigger เดิมปรับค่าคำขอให้เอง
- ล็อกหมวดหมู่ แหล่งอ้างอิง และ ID ของรายการที่ตรวจหรือเผยแพร่แล้ว
- เมื่อ Owner ถอนการรับรอง ต้องล้างการเผยแพร่ ผู้ตรวจ และวันที่ตรวจ เพื่อให้กลับมาแก้และตรวจใหม่อย่างชัดเจน
- หน้าฟอร์มคงการตรวจสถานะซ้ำก่อนบันทึก เพิ่มเงื่อนไข UPDATE เฉพาะ draft/unverified/not-published และต้องได้แถวตอบกลับก่อนรายงานว่าบันทึกสำเร็จ

## หลักฐานทดสอบ

- แอป 64 tests ผ่านใน 11 ไฟล์, lint, TypeScript/production build ผ่าน
- ชุด PostgreSQL จำลองใหม่: 20 checks ผ่าน
- ชุด migration เดิมจาก Windows: 9 checks ผ่าน
- ชุด CMS security เดิม: 20 checks ผ่านแยกอีกชุด
- ยังไม่ผ่าน Supabase แบบทิ้งได้/REST gateway, บัญชีจริง, concurrent sessions หรือการตรวจหน้าจอจริง ผล PGlite ไม่แทนเงื่อนไขเหล่านี้

## ก่อนติดตั้งจริง

1. ตรวจ migration history อีกครั้ง ผลอ่านล่าสุดยังไม่มี migration วันที่ 25 ตุลาคม
2. ใช้ migration ฉบับรวมนี้เพียงไฟล์เดียวบน Supabase ทดสอบที่ทิ้งได้ ไม่ใช้ข้อมูล/บัญชีจริงเป็น fixture
3. ทดสอบ Public อ่านได้เฉพาะคำตอบเผยแพร่แล้ว; Team แก้เฉพาะร่าง; Owner คืนร่าง → แก้ → ตรวจ/เผยแพร่ และทดสอบคำขอโดยตรง
4. ตรวจเนื้อหาที่รับรองแล้วให้ยังอ่านได้เหมือนเดิมหลังติดตั้ง ไม่มีการแก้คำตอบหรือข้อมูลบัญชีใน migration
5. พิจารณาติดตั้งจริงหลังผ่าน gate และมีคำสั่งเผยแพร่ที่ตรงกับขอบเขต

## ย้อนกลับเมื่อจำเป็น

การถอน guard จะคืนช่องแก้เนื้อหาตามสิทธิ์เดิม ไม่จำเป็นต้องถอน guard เพียงเพราะย้อนเวอร์ชันหน้าเว็บ

เมื่อได้รับอนุญาตให้ย้อน schema ให้ถอน trigger `a_guard_reviewed_qa_item` บน `public.qa_items` และ `guard_reviewed_qa_translation` บน `public.qa_translations` แล้วถอนฟังก์ชัน `private.guard_reviewed_qa_item()` กับ `private.guard_reviewed_qa_translation()` ใน transaction เดียว ห้ามลบตาราง/คำตอบ/คำแปลหรือปิด RLS

ยังไม่มีการ apply migration, commit, push, merge หรือ production deploy ในรอบนี้
