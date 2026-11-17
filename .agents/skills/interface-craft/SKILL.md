---
name: interface-craft
description: Eliminates generic AI slop, cards-and-gradient templates, and stiff interactions. Combines Anti UI Slop, Frontend Design, Emil Design Engineering micro-interactions, Make Interfaces Feel Better tactile polish, and Vercel design guidelines for mobile-first Buddhist and international web applications.
---

# Interface Craft & Anti-Slop Guidelines (MonkChat Guide & DCI)

A unified design engineering standard adapted from the **10 Design & Anti-Slop Skills** (Anti UI Slop, Impeccable, Taste Skill, Frontend Design, UI UX Pro Max, Hallmark, Vercel Guidelines, Emil Design Engineering, Make Interfaces Feel Better, and Stageshow), tailored specifically for MonkChat Guide and Buddhist Dissemination Technology.

---

## 🚫 1. สิ่งต้องห้ามเด็ดขาด (The Banned AI Clichés)
เมื่อพัฒนาหรือปรับปรุงหน้าจอใดๆ ใน MonkChat Guide ห้ามใช้แพตเทิร์น "AI สำเร็จรูป" เหล่านี้เด็ดขาด:
- ❌ **การ์ด 3 ใบเรียงกันแบบลอยๆ (Generic 3-Card Grid):** ห้ามใช้การ์ดรูปทรงสี่เหลี่ยมโค้ง 3 ใบใส่ไอคอนหลวมๆ โดยไม่มีฟังก์ชันจริง
- ❌ **พื้นหลังไล่สีม่วง/น้ำเงินแบบ AI (Purple-Indigo AI Gradient / Glow Blobs):** ให้ใช้สีพื้นแบบมีน้ำหนักชัดเจน (Solid / Tinted Neutrals)
- ❌ **ไอคอนลอยในกล่องสี่เหลี่ยมพาสเทลมน (Pastel Squircle Icon Boxes):** ห้ามนำไอคอนทุกตัวไปใส่ในกรอบมน 40x40px ซ้ำๆ จนดูเหมือนแอปเด็กเล่น
- ❌ **การประดับอีโมจิพร่ำเพรื่อ (Emoji Overuse):** ห้ามใส่อีโมจิหน้าหัวข้อหรือหน้าปุ่มโดยไม่จำเป็น ให้ใช้ SVG Line Icon หรือ Typography ชัดๆ
- ❌ **ข้อความโฆษณาชวนเชื่อกลวงๆ (Hype & Puffery Copy):** ห้ามใช้คำอย่าง "สัมผัสประสบการณ์สุดล้ำ", "ปฏิวัติวงการ", "Seamless", "Supercharge" ให้บอกตรงๆ ว่าระบบทำอะไรได้

---

## 🎨 2. อัตลักษณ์และทิศทางภาพ (Monastic Dignity & Color Ramp)
- **Deep Midnight Navy (`#0B1528` / `#11223C`):** ให้ความรู้สึกสงบ นิ่ง สุขุม หนักแน่นดั่งราตรีกาลแห่งสมาธิ
- **Soft Gold (`#C59A41` / `#8F6419`):** สีทองดอกบวบ แสดงถึงพุทธศิลป์ ความเจริญรุ่งเรือง และสติปัญญา ใช้เฉพาะจุดโฟกัส (Master Action) เท่านั้น ไม่ทาเกลื่อนกล่น
- **Lotus Alabaster (`#F7F7F4` / `#F8FAFC`):** สีขาวนวลตา สบายตา ไม่สะท้อนแสงจ้า ช่วยให้อ่านบทอ่านและธรรมะได้ยาวนาน
- **Quiet Chrome:** ส่วนนำทางและขอบระบบต้องสงบนิ่งที่สุด เพื่อขับให้เนื้อหาธรรมะ เสียงนำสมาธิ และภาพสถาปัตยกรรมวัดโดดเด่นเพียงจุดเดียว

---

## 👆 3. สัมผัสที่แน่นและตอบสนองทันที (Make Interfaces Feel Better)
- **Touch Target ไม่ต่ำกว่า 44x44px:** ทุกปุ่มบนจอมือถือ (โดยเฉพาะปุ่มที่พระนิสิตต้องกดขณะยืนหรือเดินหน้างาน) ต้องแตะง่าย ไม่แตะพลาด
- **Scale on Press (`scale(0.96)`):** เมื่อกดปุ่มหรือการ์ด ต้องยุบตัวลงเล็กน้อยที่ `transform: scale(0.96)` ในเวลา `150ms ease-out` เพื่อให้ความรู้สึก tactile เหมือนกดสวิตช์จริง
- **Instant Response (< 150ms):** สวิตช์แท็บ ตัวกรองค้นหา หรือการแตะตัวเลข ต้องตอบสนองทันที ไม่หน่วง
- **Optical Icon Alignment:** ไอคอนรูปสามเหลี่ยมเล่นเสียง (Play) หรือลูกศร ต้องจัดชดเชยเยื้องไปข้างหน้า 1–2px ตามสายตามนุษย์ (ไม่ใช่แค่กึ่งกลางทางเรขาคณิต)

---

## 🌊 4. ความลื่นไหลและแอนิเมชันระดับวิศวกรรม (Emil Design Engineering)
- **ใช้ CSS Transitions แทน Keyframes ลอยๆ:** เพื่อให้ผู้ใช้สามารถแตะย้อนกลับหรือเปลี่ยนใจกลางคันได้โดยแอนิเมชันไม่สะดุด
- **Infrequent Stagger:** การเลื่อนเปิดหน้าจอแรกเข้า ให้สเต็ปจังหวะการโผล่ (Stagger) ห่างกันทีละ `80–100ms` พร้อม `translateY` เล็กน้อย (8–12px)
- **Live Waveform & Audio Scrubbing:** ระบบเสียงต้องมี Equalizer หรือแถบเวลาที่แตะรูดไปมาได้แบบเนียนตา ไม่กระตุก
- **เคารพ `prefers-reduced-motion`:** หากผู้ใช้ตั้งค่าลดการเคลื่อนไหว ให้เปลี่ยนเป็นการเฟดแบบ Opacity แทนการขยับเลื่อน

---

## 🔍 5. การตรวจรับงานและเช็กลิสต์คุณภาพ (Vercel Guidelines & Hallmark)
ก่อนส่งมอบงานทุกครั้ง ต้องตรวจเช็ก:
1. **Focus Ring ชัดเจน:** เมื่อกดปุ่ม Tab บนคีย์บอร์ด ต้องเห็นเส้นโฟกัสสีทองตัดขอบชัดเจนเพื่อความสะดวกในการเข้าถึง (Accessibility)
2. **Responsive Check ครบทุกขนาด:** ตรวจสอบทั้งมือถือเล็ก (360px, 390px), แท็บเล็ต (768px), และจอคอมพิวเตอร์ (1024px, 1440px) ห้ามมี Horizontal Scrollbar เล็ดลอด
3. **Form Error States แจ่มแจ้ง:** ฟอร์มทุกช่องต้องบอกชัดเจนเมื่อกรอกผิด พร้อมข้อความแนะนำวิธีแก้ไขที่สุภาพและเข้าใจง่าย
4. **ความสมบูรณ์แบบของโหมดออฟไลน์ (PWA):** ทุกฟังก์ชันสำคัญ (โดยเฉพาะเสียงสมาธิและคลังประโยคพระวินัย) ต้องทำงานได้ 100% แม้ไม่มีอินเทอร์เน็ต
