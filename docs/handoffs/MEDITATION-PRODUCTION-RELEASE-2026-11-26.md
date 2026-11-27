# สรุปเผยแพร่สมาธิบนเว็บจริง

## เผยแพร่สองหน้าสมาธิและการ์ดหลังนั่งแล้ว — 26 พฤศจิกายน 2569

- เจ้าของยืนยันให้ขึ้นเว็บทันทีหลังปรับการ์ดแล้ว จึงเผยแพร่ production สำเร็จ: https://monkchat-guide.pages.dev/meditation (คู่มือ) และ /meditation/now (หน้าดวงแก้ว) พร้อมการ์ดหลังนั่งฉบับคำแนะนำทั้งไทย/อังกฤษ
- Cloudflare canonical deployment: 184539a1-1501-4002-9391-179672c418f0; unique URL https://184539a1.monkchat-guide.pages.dev; รุ่นก่อนคือ fbb5b2c9-0f16-4c74-ac74-a3421723edea
- สร้าง isolated approved snapshot ที่ Documents/.tmp/meditation-release-2026-11-26/source-approved; ชุดเผยแพร่คง CMS เดิมและ NisitPracticePage ก่อนเชื่อมเกม ไม่รวมเกม Antigravity ที่ยังไม่ผ่านตรวจ และไม่ทับไฟล์แอปใน Desktop checkout
- ชุดเผยแพร่ผ่าน types/lint/163 tests จาก 30 files/production build; HTTP ตรวจ 18 รายการ เทียบ canonical HTML และไฟล์สำคัญตรงกับ artifact, API เดิมตอบ401เมื่อไม่มีสิทธิ์, PWA manifest/SWตรงรุ่น
- ตรวจ UI บน canonical จริง: quiet เริ่ม/พัก/จบ, native result dialog กลางviewportที่360/390/768/1024/1440ไม่ล้น, คู่มือและการ์ดหลังนั่ง5ขนาดไม่ล้น, ข้อความอังกฤษถูกต้อง; เสียงนำจริงเล่น6.743วินาทีและพัก6.767วินาทีตามดวงแก้ว error=null พร้อมคำบรรยาย
- เบราว์เซอร์ที่มี PWA แคชเก่าอาจเห็น404ชั่วคราวที่routeใหม่ พบจริงและอัปเดตSW/โหลดใหม่แล้ว canonicalแสดงหน้าปัจจุบันได้ ถ้าผู้ใช้ยังเห็นรุ่นเดิมให้รีเฟรชหลังอัปเดต
- เสียงหยดน้ำ/ranking/ประวัติเวลาสะสมยังไม่ทำ ไม่มีการกล่าวอ้างว่าเก็บประวัติแล้ว ไม่เปลี่ยนDB/RLS/สิทธิ์หรือฟังก์ชันAPI ไม่เพิ่มแพ็กเกจ ไม่แก้ภาคนิพนธ์ ไม่commit/push
- หลักฐาน: .tmp/meditation-release-2026-11-26/approved-checks.json, production-http-checks.json, production-ui-checks.json, approved-source-manifest.json, deployment.json; tokenอัปโหลดชั่วคราวถูกลบแล้ว
