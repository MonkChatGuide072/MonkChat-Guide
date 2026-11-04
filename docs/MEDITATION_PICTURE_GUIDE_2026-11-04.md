# Meditation picture guide and visitor navigation — 4 November 2026

## Owner request and diagnosis

The screenshots show a back-to-visitor-home control despite an existing Home menu, and generic practice steps below the audio. The owner requested an urgent correction, a cute illustrated carousel above audio, and accurate Dhammakaya instructions emphasizing the seven bases.

Priority fixes: remove redundant back navigation; put preparation before listening; teach base locations through one clear illustration and a short explanation per card. Preserve the global Home link and unrelated pages rather than introducing history-dependent back behavior.

## Sources and content boundaries

- Dhammakaya Foundation, “Let’s practice”: https://en.dhammakaya.net/meditation-wisdom/lets-practice/ — posture, relaxing, resting attention, clear sphere and optional Samma-arahang.
- Wat Phra Dhammakaya, “ทางเดิน ของใจ ๗ ฐาน”: https://dhammakaya.com/4442 — seven locations, eye-level center of head, internal navel level, two finger breadths above base 6, gentle attention without searching or strain.
- Read on 4 November 2026. Text is an original concise paraphrase, not a copied article or a claim of project/teacher endorsement. New vector artwork is original code, not a reproduction of the site's images.

Content checks: bases 1–2 use the practitioner's right for men/left for women; base 3 is inside the head at eye level; base 4 at the palate; base 5 in the upper throat; base 6 inside the abdomen at navel level; base 7 two finger breadths above base 6. “นิ้วมือ” means finger breadths, not inches. The schematic highlights base 7 above base 6; it is not a medical/anatomical scale drawing. Preparation retains right leg over left, right hand on left and right index fingertip meeting left thumb. No claimed guaranteed health or spiritual outcome is added.

## Implementation

- `src/content/meditationGuide.ts`: separate TH/EN sourced copy and source links.
- `MeditationGuideVisual.tsx`: original gentle vector monk plus seven-position schematic; active point highlighted. Text remains real HTML for readability/accessibility.
- `MeditationBeginnerGuide.tsx` / `MeditationGuide.css`: nine cards: preparation, seven individual bases, gently resting attention. Native horizontal scroll/snap, previous/next, keyboard Left/Right/Home/End, no auto-rotation, current-card status, inactive slides hidden from assistive reading. Direct base-7 control.
- `MeditationPage.tsx`: compact heading → picture guide → existing audio → existing transcript → inline reviewed-answer chat. Old generic five-step/Draft supplementary blocks are no longer mounted. Existing media, storage, transcript and track-selection logic stay intact.
- Meditation, Q&A and Centers no longer render `VisitorBackLink`. The meaningful Centers activity resource now targets `/activities` instead of looping to the Home alias `/visit`. Global navigation still provides Home.
- A real 390×800 check found the floating chat button overlapping the next-card arrow. On Meditation only it now sits inline at the end; the widget remains floating on other public pages. Matching/publication policy and chat requests are unchanged.

## Verification

- 70 tests / 12 files, lint and TypeScript/PWA build passed. The previous guide test now checks source links, guide-before-audio order, seven-base navigation, language switching and retained transcript/media behavior. Added a meaningful keyboard/end-boundary/language-state regression; kept existing audio, filtering and permission tests.
- Chrome iframe widths 360/390/768/1024/1440, TH/EN: nine cards, 16px body copy, guide before audio, no document horizontal overflow and no redundant /visit back links. Initial card fits the phone reading area; controls are at least 44px. Corrected an oversized tablet/desktop illustration found during checking.
- Direct base-7 navigation and keyboard movement use horizontal scrolling only; observed page scrollY remains zero. Native scroll snapping is enabled; these are browser layout/input checks, not certification of physical phone/iPad gestures.
- Further final checks and preview source commit are recorded in HANDOFF.md. Internal screenshots/JSON are not uploaded to the public repository. No dependency, database, account, AI endpoint, actual audio or caption changes.
