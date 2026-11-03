# MonkChat Guide — Current Handoff

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
