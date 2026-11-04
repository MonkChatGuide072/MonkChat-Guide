# Meditation picture guide and visitor navigation — 4 November 2026

## Latest refinement: breathing and visitor-facing copy

The owner confirmed a dedicated breathing card in the Before stage and clarified that public copy must address visitors, with no academic/development reporting. Before now has six cards: posture, close eyes/relax, breathe, let go, abdomen, clear sphere. The breathing card uses original static SVG arrows, localized “Breathe in / Breathe out” labels, and concise instructions from the supplied script: a few gentle deep breaths, slow exhale, then natural breathing. No timer or automatic animation was added.

MonkChat Guide is now the visible website identity (header/Home/gate/title/OG/footer/login/404/chatbot); Ayutthaya Monk Chat remains the activity project with the original logo. Home's former academic accordion is replaced by brief visitor information; Activities' academic accordion is removed. Internal context stays in these repository documents. Recorded media and data/auth logic are unchanged.

Verification: 71 tests / 12 files, lint and TypeScript/PWA build passed. Existing behavioural tests now navigate to card 3 of 6 and switch languages while retaining that card; Home asserts product/activity identities and absence of research/budget copy. Chrome checked the breathing card in TH/EN across 360/390/768/1024/1440: no document overflow, six cards, localized arrows, 16px main copy and an unclipped header name. These are browser viewports, not actual phone/iPad certification. Public content and exact new branch preview are checked before delivery; no production deployment or media synchronization claim.

---


## Latest implementation: three stages, based on the owner's actual session

The owner clarified that visitors first meet and talk briefly with a monk, then need a quick picture explanation before closing their eyes. The earlier nine-card introduction was too detailed for this job. The actual supplied English guidance is the source of the five condensed preparation cards; it is not a verbatim transcript of the existing recording.

| Stage | Content | Behaviour |
| --- | --- | --- |
| Before | Sit comfortably; close eyes and relax; set worries aside; attention at the abdomen; imagine a clear sphere | Five swipe cards; seven-base detail optional |
| Meditation time | One calm drawing of a monk beneath a tree | No carousel, timer or auto-play; link to the existing audio |
| After | Wandering; striving/tension; ease/lightness; clear sphere; feeling small; Buddha image; brightness; other/uncertain/no image | Eight conversation prompts; no ranking, promised outcome, interpretation or response storage |

TH/EN text is separate from rendering. Tab keyboard supports Left/Right/Home/End and focus follows selection. Carousel keyboard is bounded; inactive slides are inert and hidden from assistive technology. Changing stages leaves the actual audio player mounted. There is no attempt to auto-synchronize cards with a recording. New scene illustrations are original SVG additions, not copied source imagery or medical/attainment diagrams.

Verification: 71 tests across 12 files, lint and TypeScript/PWA build passed. A new behavioural regression covers stage switching, single-image meditation time, reflection content, no success score, unchanged audio element, language switching and tab focus. Existing source and keyboard tests now cover the optional seven-base detail and five-card primary sequence. Seven MeditationPage handlers/effects are unchanged against 923e199. Chrome checked 30 states (3 stages × 2 languages × 5 widths: 360/390/768/1024/1440), with no document overflow, minimum 44px visible control buttons, 16px main card copy and guide above audio. EN 360 first preparation card ends at 787.5px after shortening duplicate headings. End reaches the last reflection; Home returns to the first stage; optional base 7 can be opened. Evidence stays outside the Git branch.

Limits: viewport testing is not actual phone/iPad touch testing. Existing recording/subtitle timing and historical production/account checks are unchanged. No database mutation, audio/subtitle/transcript replacement, production merge or production deployment belongs to this change.

---


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
