# การทำงานร่วม ChatGPT / Antigravity

## แหล่งงานร่วม

- Repository: `MonkChatGuide072/MonkChat-Guide`
- Branch งานรวมปัจจุบัน: `sync/anti-reviewed-20261103`
- สถานะล่าสุด: `HANDOFF.md`; ขอบเขตที่อนุมัติ: `CURRENT_SCOPE.md`
- ZIP เป็นสำเนาส่งออก ไม่มีการซิงก์อัตโนมัติ

## ก่อนรับงานบน Windows

1. ตรวจ git status, branch และ origin ในโครงการจริงก่อน ห้าม reset, clean หรือ checkout ทับไฟล์ค้าง ห้าม stash โดยไม่ตรวจงานก่อน
2. ดึง branch งานรวมโดยระบุ ref เต็ม เพื่อรองรับ checkout ที่ตั้ง fetch ไว้เฉพาะ main:

   ```sh
   git fetch origin refs/heads/sync/anti-reviewed-20261103:refs/remotes/origin/sync/anti-reviewed-20261103
   ```

3. ถ้ามีงานค้าง ให้เก็บโครงการเดิมไว้ เปิด worktree ใหม่จาก branch งานรวม แล้วเทียบ diff ก่อนรวมงาน Windows ที่ใหม่กว่า ห้ามแตก ZIP ทับโครงการเดิม
4. อ่าน AGENTS.md, CURRENT_SCOPE.md และ HANDOFF.md จาก branch ที่ดึงมาจริง ตรวจ commit ให้ตรงกับ checkpoint ที่ส่งต่อ
5. งาน Home ที่ยืนยันแล้วคือภาพเต็มขอบ ชื่อด้านล่าง และทางลัด 5 ช่อง คำสั่งเจ้าของ 4 พฤศจิกายนอนุมัติ audit/polish ทุกหน้าทีละหน้าแล้ว ให้ใช้ CURRENT_SCOPE.md และ docs/UNSLOP_REVIEW_2026-11-04.md เป็นคิวงาน UI โดยรักษาฟังก์ชัน/เนื้อหาเดิม

## ทุกครั้งที่ทำงานเสร็จ

- อัปเดตส่วนบน HANDOFF.md: แก้อะไร/ไฟล์ไหน, ผลตรวจที่รันเอง, สิ่งที่ยังไม่ตรวจ, งานถัดไป, branch/commit และสถานะ Windows/GitHub/production แยกกัน
- เปลี่ยน CURRENT_SCOPE.md เมื่อเจ้าของเปลี่ยนขอบเขต
- commit โค้ดพร้อมเอกสารใน checkpoint เดียวเมื่ออยู่ในขอบเขตที่อนุมัติ ห้ามส่งเฉพาะรายงานโดยไม่มี source ที่ตรงกัน
- ส่งผ่าน branch/PR ร่วม ตรวจ diff, npm test, npm run lint และ npm run build ก่อนรับงาน ห้าม force push ทับอีกฝั่ง
- รอบนี้อนุมัติ commit/push เพื่อส่งต่อเท่านั้น ไม่รวม merge main, migration หรือ production deployment

## ข้อจำกัด bridge เดิม

Bridge ใน PR #10 ยัง clone ฐาน chore/local-agent-relay แบบตายตัว ไม่รับ branch ใหม่อัตโนมัติ การมีไฟล์บน GitHub ไม่ใช่หลักฐานว่า Antigravity รับงานแล้ว ต้องมีผลจากเครื่อง Windows จึงบันทึกว่ารับงานสำเร็จได้ ไม่ติดตั้งหรือเปลี่ยนระบบเริ่มทำงานอัตโนมัติของ Windows ในรอบนี้
