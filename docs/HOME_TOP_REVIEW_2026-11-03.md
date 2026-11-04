# Home upper section — approved scoped change

Owner instruction: “ใช่ปรับ ส่วนบนประมาณนั้นเลย ที่เหลืออย่าพึ่งไปยุ่ง”.

- Added `HomeHeroIntro.tsx`: full-width existing 1672×941 illustration, project title and description below it, five icon-above-label navigation shortcuts, Thai/English text and accessible focus treatment.
- `Layout.tsx` removes the outer width limit/padding only for `/` and `/visit`. Other route containers, shared header/footer/chatbot remain unchanged.
- `VisitPage.tsx` replaces only the old hero; restores the original constrained container for all content from the activity summary down. Verified exact text/code equality of that entire suffix after excluding the new enclosing div. Existing location/map/directions links remain there.
- Updated one existing language-selection test to assert the new visible English heading. No dependencies, application data, services, permissions, other page implementations, or global theme changed.

## Evidence

- Final code: 65 tests / 11 files passed; oxlint passed; `tsc -b && vite build` passed.
- Opened the production build in managed static QA preview through CUA, desktop browser 1363×936. Photo starts at x=0 and spans the document width. Thai/English introduction and five shortcut destinations inspected; clicked Activities and returned Home successfully.
- Responsive verification uses **same-origin iframe viewports**, not real mobile devices or browser device emulation. Frames 360, 390, 768, 1024, 1440px: document scrollWidth equals clientWidth; all five Thai buttons fit, minimum measured size 57.8×76px. Desktop scrollbars consume 15px inside each frame. Metrics saved in `review-evidence/2026-11-03/home-top/`.
- English “Meditation” initially exceeded the narrowest tile by 2px; adjusted English label sizing for narrow screens. Rechecked the 360px frame: all five labels have scrollWidth equal to clientWidth.
- Real screenshot evidence: desktop Thai and 390px iframe Thai. Screenshot reflects an existing project illustration, not the previously generated concept image.

## Boundaries

Ready with known limitations: no physical iPhone/iPad testing, no repeated CMS/private AI/database tests because those implementations were unchanged. The static QA preview cannot verify Pages Functions or deployment routing. No commit, push, migration or production deployment occurred.
