# รายงานการตรวจสอบความปลอดภัยของ Migration ล็อกคำตอบ Q&A (QA Content Lock Audit)

**เอกสารสำหรับ**: โครงการ MonkChat Guide\
**วันที่ตรวจสอบ**: 26 ตุลาคม 2026\
**ผู้จัดทำ**: Antigravity\
**ขอบเขตงาน**: ตรวจสอบ `supabase/migrations/20261025130443_lock_verified_qa_content.sql` เทียบกับ Migration, RLS, และ Triggers ทั้งหมด พร้อมขยาย `supabase/tests/qa_content_lock.sql`\

---

## 1. วัตถุประสงค์และกรอบการทำงาน (Objectives & Constraints)

1. **ทำงานคู่ขนานโดยไม่กระทบส่วนงานของ Codex**:
   - ไม่แตะต้องไฟล์หน้าบ้านที่ Codex ดูแล ได้แก่ `src/pages/VisitPage.tsx`, `src/pages/ProjectInfoPage.tsx`, `src/locales/`
   - ไม่แตะต้องเอกสารกลางโครงการ ได้แก่ `HANDOFF.md`, `CURRENT_SCOPE.md`, `DECISIONS.md` และโฟลเดอร์ `docs/field-trial/`
2. **ไม่ใช้ฐานข้อมูลโครงการจริง**:
   - ยึดหลักความปลอดภัย ไม่รันคำสั่งกับฐานข้อมูลโปรดักชันหรือสเตจจิ้งจริง
3. **ไม่รันคำสั่งในเทอร์มินัลในรอบนี้**:
   - ทำการวิเคราะห์เชิงตรรกะของโค้ด (Static Code Analysis) ตรวจสอบความถูกต้องของ SQL, Trigger functions, RLS policies และ pgTAP assertions
4. **ความโปร่งใสของ Gate การทดสอบ**:
   - ระบุชัดเจนว่า **Gate การทดสอบบนฐานข้อมูลยังไม่ผ่าน (Unpassed)** หากยังไม่มีฐานข้อมูลแบบทิ้งได้ (Disposable Database) หรือเครื่องมือ Containerization (Docker)
   - ไม่นำผล PGlite 9/9 เดิมมารายงานซ้ำเป็นผลตรวจใหม่

---

## 2. การวิเคราะห์เทียบกับโครงสร้างฐานข้อมูลและ RLS เดิม (Static Schema & RLS Analysis)

จากการตรวจสอบไฟล์ Migration ก่อนหน้าทั้งหมด:
1. `20260812152413_initial_schema.sql`:
   - โครงสร้างตาราง `public.qa_items` มีคอลัมน์สถานะ 3 ตัวที่เกี่ยวข้องกัน:
     - `content_status` (draft, published, archived)
     - `verification_status` (unverified, verified)
     - `is_published` (boolean)
   - โครงสร้างตาราง `public.qa_translations` มี Foreign Key เชื่อมไปยัง `qa_items.id` พร้อม `ON DELETE CASCADE`
2. `20260812152735_row_level_security.sql` และ `20260814022206_restrict_role_policies_to_authenticated.sql`:
   - RLS สำหรับ `public (anon)`: อนุญาตเฉพาะการ `SELECT` แถวที่ `is_published = true AND verification_status = 'verified'` ไม่อนุญาต `INSERT`, `UPDATE`, หรือ `DELETE`
   - RLS สำหรับ `team_member`: อนุญาต `SELECT`, `INSERT`, และ `UPDATE` ในตาราง `qa_items` และ `qa_translations`
3. `20260923020015_cms_account_access.sql`:
   - ให้สิทธิ์ตรวจสอบบทบาทผ่านฟังก์ชัน `private.get_user_role()` โดยอ่านจากตาราง `public.profiles`

---

## 3. ข้อบกพร่องที่พิสูจน์ได้และการแก้ไข (Provable Defects & Fixes)

จากการอ่านโค้ดจริงใน `supabase/migrations/20261025130443_lock_verified_qa_content.sql` ฉบับเดิม พบช่องโหว่ความปลอดภัยระดับฐานข้อมูล 3 จุด ดังนี้:

### ข้อบกพร่องที่ 1: การข้ามขั้นตอนฉบับร่างผ่าน Direct API ตอน INSERT (API Insert Bypass)
- **จุดที่พบ**: Trigger เดิมผูกไว้กับ `BEFORE UPDATE ON public.qa_items` เท่านั้น ไม่ได้ตรวจ `INSERT`
- **ปัญหาที่พิสูจน์ได้**: ผู้ใช้บทบาท `team_member` แม้หน้าเว็บ CMS จะบังคับให้สร้างเป็น draft unverified แต่หากเรียก Supabase Data API (REST API) โดยตรง (`POST /rest/v1/qa_items`) สามารถส่งค่า `verification_status = 'verified'` หรือ `content_status = 'published'` หรือ `is_published = true` ได้ทันที ทำให้คำตอบถูกเผยแพร่โดยไม่ผ่านการอนุมัติของ Owner
- **การแก้ไข**:
  - เปลี่ยน trigger เป็น `BEFORE INSERT OR UPDATE ON public.qa_items`
  - เพิ่มเงื่อนไขตรวจสอบสำหรับ `TG_OP = 'INSERT'`: หากผู้ใช้เป็น `team_member` และพยายามตั้งสถานะเป็น `verified`, `published`, หรือ `is_published = true` ให้โยนข้อผิดพลาด `23514 (check_violation)`

### ข้อบกพร่องที่ 2: การตรวจจับการแก้ไขสถานะไม่ครบถ้วนบนรายการที่ตรวจแล้ว (Incomplete Status Guard on UPDATE)
- **จุดที่พบ**: ใน Trigger function เดิม มีการเขียนเงื่อนไขป้องกัน `team_member` แก้ไขสถานะของรายการที่ตรวจแล้วไว้ดังนี้:
  ```sql
  IF (OLD.verification_status = 'verified' OR OLD.content_status = 'published' OR OLD.is_published)
    AND private.get_user_role() = 'team_member'
    AND NEW.content_status IS DISTINCT FROM OLD.content_status THEN
    RAISE EXCEPTION 'Only the owner may change the status of reviewed Q&A' ...
  ```
- **ปัญหาที่พิสูจน์ได้**: เงื่อนไขขึ้นอยู่กับ `NEW.content_status IS DISTINCT FROM OLD.content_status` เท่านั้น! หาก `team_member` ยิงคำสั่ง PATCH ไปที่ REST API โดยส่งเฉพาะ `verification_status = 'unverified'` หรือ `is_published = false` (โดยไม่เปลี่ยน `content_status`) คำสั่งจะผ่านเงื่อนไขนี้ไปได้ ทำให้ทีมงานสามารถปลดสถานะ verified หรือซ่อนโพสต์ได้โดยพลการ
- **การแก้ไข**:
  - ปรับเงื่อนไขให้ครอบคลุมทั้ง 3 คอลัมน์สถานะ:
    ```sql
    NEW.content_status IS DISTINCT FROM OLD.content_status
    OR NEW.verification_status IS DISTINCT FROM OLD.verification_status
    OR NEW.is_published IS DISTINCT FROM OLD.is_published
    ```

### ข้อบกพร่องที่ 3: สมาชิกในทีมสามารถเลื่อนขั้นเนื้อหาร่างให้ Verified/Published ได้ผ่าน Direct API
- **จุดที่พบ**: Trigger เดิมไม่มีเงื่อนไขสกัดกั้นการเลื่อนขั้น (Escalation) รายการที่ยังเป็น `unverified draft` ขึ้นไปเป็น `verified` หรือ `published` โดย `team_member`
- **ปัญหาที่พิสูจน์ได้**: แม้ UI CMS ของทีมงานจะไม่มีปุ่ม Approve/Publish แต่ RLS อนุญาตให้ `team_member` ทำการ `UPDATE` ตาราง `qa_items` ได้ หากส่งคำขอ PATCH มายัง Supabase API โดยตรง จะสามารถ verify คำตอบได้เอง
- **การแก้ไข**:
  - เพิ่มเงื่อนไขตรวจสอบการเลื่อนขั้นสถานะโดยเฉพาะ:
    ```sql
    IF private.get_user_role() = 'team_member' THEN
      IF (
        (OLD.verification_status IS DISTINCT FROM 'verified' AND NEW.verification_status = 'verified')
        OR (OLD.content_status IS DISTINCT FROM 'published' AND NEW.content_status = 'published')
        OR (NOT OLD.is_published AND NEW.is_published)
      ) THEN
        RAISE EXCEPTION 'Only the owner may verify or publish Q&A'
          USING ERRCODE = '23514';
      END IF;
    END IF;
    ```

---

## 4. ความครอบคลุมของชุดทดสอบที่ขยายใหม่ (`supabase/tests/qa_content_lock.sql`)

ชุดทดสอบ pgTAP ได้รับการขยายให้ครอบคลุมกรณีทดสอบระดับฐานข้อมูลอย่างรอบด้าน (End-to-End Database Invariants):

| หมวดการทดสอบ | รายละเอียดกรณีทดสอบ | ผลที่คาดหวัง |
|---|---|---|
| **Section 2: Team Member Restrictions** | Case A: ยิง INSERT สร้างรายการ pre-verified หรือ pre-published ผ่าน Direct API | **ปฏิเสธ** (Error 23514: check_violation) |
| | Case B: สร้างรายการร่าง (draft, unverified, is_published=false) | **อนุญาต** สำเร็จ |
| | Case C: สร้างคำแปลภาษาไทย/อังกฤษในสถานะ draft | **อนุญาต** สำเร็จ |
| | Case D: ยิง UPDATE เลื่อนขั้น draft เป็น verified หรือ published ผ่าน Direct API | **ปฏิเสธ** (Error 23514: check_violation) |
| **Section 3: Owner Workflow** | Owner ทำการตรวจรับรอง (verification_status='verified') และเผยแพร่ (content_status='published', is_published=true) | **อนุญาต** สำเร็จ |
| **Section 4: Reviewed Immutability** | Case E (Owner): Owner พยายามแก้ไขคำแปล, category หรือ source_reference ขณะที่ยังไม่ปลดเป็น draft | **ปฏิเสธ** (Error 23514) ป้องกันการแก้เนื้อหาที่ผ่านการตรวจโดยไม่ได้บันทึกรอบใหม่ |
| | Case F (Team Member): พยายามแก้ไขคำแปล หรือ metadata ของรายการที่ตรวจแล้ว | **ปฏิเสธ** (Error 23514) |
| | Case F (Team Member): พยายามปลดสถานะ content_status, verification_status หรือ is_published | **ปฏิเสธ** (Error 23514) |
| | Case F (Team Member): พยายาม INSERT หรือ DELETE คำแปลของรายการที่ตรวจแล้ว | **ปฏิเสธ** (Error 23514) |
| **Section 5: Demote & Re-review** | Owner ปลดสถานะกลับเป็น draft unverified | **อนุญาต** สำเร็จ |
| | Team Member ทำการแก้ไขเนื้อหาคำแปลและหมวดหมู่ในสถานะ draft | **อนุญาต** บันทึกการแก้ไขสำเร็จ |
| | Owner ทำการตรวจรับรองและเผยแพร่ใหม่อีกครั้ง | **อนุญาต** สำเร็จ |
| **Section 6: Public (anon) Role** | Public อ่านคำตอบและคำแปลที่ verified + published | **อนุญาต** อ่านได้ถูกต้อง |
| | Public พยายาม UPDATE คำแปลหรือ metadata ผ่าน API | **ปฏิเสธ** (insufficient_privilege) |
| **Section 7: Identity Immutability** | พยายามเปลี่ยน `language_code` หรือ `qa_item_id` ของคำแปล | **ปฏิเสธ** (Error 23514) |
| **Section 8: Cascade Deletion** | Owner สั่ง Archive และ Delete รายการหลัก | **อนุญาต** และ Foreign Key `ON DELETE CASCADE` ลบคำแปลที่เกี่ยวข้องออกอย่างสมบูรณ์ |

---

## 5. ผลการตรวจที่ทำจริงและสิ่งที่ยังทดสอบไม่ได้ (Verification Results & Gaps)

### ผลการตรวจที่ทำจริง (Verified in this phase):
1. **Static Analysis & Schema Conformance**:
   - ฟังก์ชัน trigger ทั้งสองตัว (`private.guard_reviewed_qa_item`, `private.guard_reviewed_qa_translation`) ปฏิบัติตามมาตรฐานความปลอดภัย `SECURITY INVOKER` และ `SET search_path = ''` ป้องกัน Search Path Hijacking
   - มีคำสั่ง `REVOKE ALL ON FUNCTION ... FROM PUBLIC, anon, authenticated` เพื่อป้องกันการเรียกใช้งานฟังก์ชันภายในโดยตรง
   - มีการใช้ `FOR UPDATE` ใน `guard_reviewed_qa_translation` เพื่อป้องกัน Race Condition จากคำขอแก้ไขคำแปลที่ส่งมาพร้อมกับการเผยแพร่
2. **Logic Completeness**:
   - ตรรกะสกัดกั้นทั้ง 3 จุดบกพร่องได้รับการแก้ไขและครอบคลุมทุกช่องทางการส่งข้อมูล (INSERT / UPDATE)

### สิ่งที่ยังทดสอบไม่ได้และสถานะ Gate (Testing Gate Status):
- **สถานะ Gate ฐานข้อมูล: ยังไม่ผ่าน (UNPASSED)**
- **เหตุผลและข้อจำกัด**:
  1. เครื่องผู้พัฒนาไม่มี Docker / Podman ทำให้ไม่สามารถสตาร์ท Local Supabase เพื่อรัน `supabase test db` (pgTAP) ได้
  2. ห้ามรันคำสั่งกับฐานข้อมูลโครงการจริงโดยเด็ดขาด เพื่อป้องกันผลข้างเคียงต่อข้อมูล
  3. ไม่นำผลรัน PGlite 9/9 เดิมมารายงานซ้ำ เนื่องจาก PGlite เดิมจำลองสภาพแวดล้อมไม่ครบถ้วน (ขาด RLS แท้จริงบางส่วน และไม่ได้รันผ่านไฟล์ SQL Test ทั้งหมด)
- **เงื่อนไขในการปลด Gate**:
  - เมื่อมี Disposable Database ชั่วคราว (เช่น Local Docker หรือ Supabase Branching / Isolated Test DB) ให้นำไฟล์ `supabase/tests/qa_content_lock.sql` ไปรันเพื่อยืนยันผลการทดสอบทั้งหมดผ่าน pgTAP อย่างเป็นทางการ

---

## 6. สรุปไฟล์ที่มีการเปลี่ยนแปลง (Modified Files Summary)

1. `supabase/migrations/20261025130443_lock_verified_qa_content.sql`:
   - ปรับแก้ Trigger และฟังก์ชัน `guard_reviewed_qa_item()` ให้ครอบคลุม `BEFORE INSERT OR UPDATE` ปิดช่องโหว่ Direct API bypass และ Privilege escalation ของ `team_member`
2. `supabase/tests/qa_content_lock.sql`:
   - ขยายชุดทดสอบ pgTAP ให้ครอบคลุมทุกกรณีอนุญาตและปฏิเสธของ `public`, `team_member`, `owner`, Direct API tampering, Demotion to draft, Re-publishing, และ Cascade deletion
3. `docs/antigravity/QA_LOCK_AUDIT.md`:
   - บันทึกรายงานการตรวจสอบฉบับนี้

*หมายเหตุ: ไม่มีการแตะต้องไฟล์ฝั่งหน้าบ้าน (`src/pages/VisitPage.tsx`, `src/pages/ProjectInfoPage.tsx`, `src/locales/`), เอกสารสนาม (`docs/field-trial/`), และเอกสารกลาง (`HANDOFF.md`, `CURRENT_SCOPE.md`, `DECISIONS.md`) ตามข้อกำหนดการแบ่งงานกับ Codex อย่างเคร่งครัด*
