# Page-by-page interface review — 4 November 2026

Owner instruction: audit and improve every part of the website with unslop, one page at a time. This expands the prior Home-top-only visual scope. The existing product, content rules, real logo, warm heritage palette and approved full-width Home image / title below / five shortcuts remain the baseline.

Review approach: adapted from **unslop by Damir Sokolovsky (@heydamir), CC BY 4.0**, https://github.com/heydamir/unslop/tree/main/skills/unslop. Existing artwork and font families are retained; no new image prompt or generation was needed.

## Queue

| Order | Area | Status |
| --- | --- | --- |
| 1 | Home `/`, `/visit`, initial language selection | Implemented and checked as described below |
| Shared | Navigation, footer clearance, public chatbot | Changed for Home usability; cross-page checks continue with each page |
| 2 | Activities | Implemented and checked |
| 3 | Meditation and its supporting sections | Implemented and checked |
| 4 | Q&A and public chatbot states | Implemented and checked |
| 5 | Centers | Implemented and checked |
| 6 | Login and missing-page state | Next |
| 7 | Authenticated administration and private assistant | Pending; distinguish source review from a real authenticated session |

## Home: audit and direction

Mode: polish. Keep the approved composition and original assets.

- Product: help visitors find the Monk Chat schedule, meeting point and meditation audio.
- Character: calm, warm, direct.
- World: shaded Ayutthaya temple grounds, brick ruins and the existing cream surfaces.
- Moments: the approved panoramic scene and the existing activity images.
- Signature: the existing outline lotus at the meditation entry point.

Signs found:

1. Schedule values and descriptions used `truncate`; the time and location lost information on narrow screens.
2. Small labels used negative tracking, including 12px shortcut text.
3. Body text ranged down to 10.4–11.52px in the lower page.
4. Bold serif styling repeated on headings, card titles, labels and meta.
5. Uppercase tracked labels competed with the name and picture.
6. Location and contact sections mixed emoji with several outline icon sizes/strokes.
7. Resource descriptions were truncated; external resources appeared as many small pills.
8. Stretched sibling panels left a large empty area in the recommended-audio panel.
9. The language gate still used an old placeholder mark and an obsolete display name.
10. The chatbot launcher occupied almost the whole mobile width with a dark colored shadow.
11. Desktop navigation appeared from 768px, leaving little room for the bilingual brand and actions.
12. The chatbot did not explicitly return keyboard focus to its launcher on closing.

## Home: nine passes

1. **Spacing:** 48px mobile / 64px larger-screen section rhythm, consistent 20/24px panel padding, grouped schedule facts, 44px minimum actions. Existing five shortcuts remain 76/88px high.
2. **Color:** retain the existing cream, surface, maroon and terracotta tokens. Home has a quiet solid surface; the chatbot uses the same palette with a small neutral shadow.
3. **Icons:** new `GuideIcon.tsx` reuses the project's outline paths at a common 1.5 stroke. Replaced emoji in Home. Controls and body icons use an 18px box; the approved large shortcut icons stay 24px.
4. **Copy:** short English labels use sentence case. Kept the existing facts, language options, audio metadata and resource records. Clarified the existing Google Maps instruction without claiming that the scenic image is a GPS map.
5. **Type:** keep the existing Noto Sans Thai / Noto Serif Thai / Cinzel font setup. Body copy is generally 14px/24px; meta and mobile shortcut labels are at least 12px. Heading weights 600, interface emphasis 500; small text has normal tracking.
6. **Layout:** keep section order and all data flows. Mobile expectation cards use a compact image beside text; larger screens retain the card grid. Resource descriptions wrap. Recommendation/resources align to their own content instead of stretching a short panel. Tablet navigation uses the menu below 1024px. Language buttons and the menu toggle have 44px touch targets.
7. **Details:** schedule values wrap instead of hiding information; time fragments stay together. Preserved visible focus indicators, improved touch targets, linked the project accordion control to its panel. Chat opens with focus on the close control; Escape closes it and returns focus to the launcher.
8. **Visuals:** retain all existing images and the official logo. Hero crop and height settings from `6ceed4c` are unchanged. Replaced the language gate placeholder with the official logo; lower images load lazily.
9. **Motion:** color transitions for feedback; no new entrance animation, hover scaling, parallax or decorative loops. The existing meaningful loading spinner remains.

## Home: verification

- Base: `6c44295641f1a11ef0ee84619d4aa3e609a82ff8` on `sync/anti-reviewed-20261103`.
- Ran `npm test -- --run`: 65 tests / 11 files passed. Ran `npm run lint`: passed. Ran TypeScript and production/PWA build: passed.
- Compared `VisitorHome` query/state logic against the base: unchanged. No database/auth/permission changes and no new dependency.
- Chrome desktop preview plus iframe layout widths 360/390/768/1024/1440, TH/EN: five shortcut labels fit with normal tracking; no document horizontal overflow in checked states. The schedule no longer uses ellipsis. This is desktop-browser layout testing, not real phone/tablet testing.
- Opened the project information, opened the public chatbot and closed it with Escape; observed focus return to the launcher. Opened the mobile menu and closed it with Escape.
- Existing tests cover language selection, safe translated links/tracks and loading/error handling. The redesigned initial language gate uses the same state/event handlers. Opened a fresh browser tab, verified the official brand/language controls in the accessibility tree and chose English; Home opened in English. No separate gate screenshot was captured.
- Screenshots and JSON measurements are retained locally and in the review conversation, not uploaded to the public source repository. Full-page post-edit screenshot hit a browser capture timeout; viewport inspection and DOM checks were used instead.
- The source audio/VTT timing discrepancy and unreviewed Meditation content remain outside this Home visual phase. No live private AI, real authenticated CMS, production deployment or real-device certification is claimed.

## Next handoff

Review Activities using the same palette, typography and outline icons. Keep only the existing confirmed activities, dates and conditions; do not restore draft proposals. Finish and verify one page before editing the next. Preserve the shared Git workflow; commit code and this record together, without image uploads or secrets.

## Activities phase

Direction: help visitors choose a session and find its schedule; calm/direct; the same shaded-temple world and existing warm palette; the two existing activity photos carry the detail; a quiet calendar outline marks schedule information. Mode: polish.

Audit: blurred gold blob in the header; repeated official/confirmed badges and green status dot; emoji mixed with SVG; tiny tracked capitals; a large three-color callout gradient; hover zoom and colored shadows; location/time written over pictures; a wide five-column table on phones; controls without consistent touch heights. Navigation also retained the previous page's scroll position.

Nine passes: (1) 48/64px section rhythm, 24px panels and 44px actions; (2) keep original warm neutral/brick colors and replace callout gradient with a quiet surface; (3) shared outline icons replace emoji; (4) shorter schedule labels, original two confirmed activity records and all schedule/condition values retained; (5) 14px readable body and weights 500/600; (6) mobile definition list / desktop table from the same data, location on a plain surface; (7) column header scopes and accordion controls, new pages scroll to top while hash anchors are excluded; (8) keep the original activity images without text overlays; (9) remove image hover zoom, use color-only feedback.

Verification: 65 tests / 11 files passed; lint and TypeScript/PWA build passed. Chrome desktop and TH/EN iframe widths 360/390/768/1024/1440: two activity cards and no document horizontal overflow. Mobile schedule has all five fields and no clipped field widths. Opened project details; verified the schedule link points to the existing section. Route entry was observed at scroll position zero. Screenshots/JSON stay local. QA-only route index copies support direct frame loading; production routing was not changed or certified by those copies. No draft proposals restored and no real content/DB changes.

Next: Meditation, including player controls, transcript, preparation and supplementary sections. Preserve audio, subtitle timing, text and publication rules; keep content concerns visible in the handoff rather than inventing replacements.

## Meditation phase

Direction: make listening, reading captions and finding preparation guidance straightforward; steady, clear, unhurried; the same temple/brick world; the existing meditation image and the working audio are the two moments; the outline lotus marks the practice entry. The audio source, caption timings, transcript, translations and draft content have not been rewritten.

Audit: long hero with many pills and decorative circle; 2/1/3/4 navigation numbering; repeated numbered headings; emoji in metadata and stars as save icons; tiny captions/labels; heavy heading weights; colored shadows; repeated thumbnail competing on phones; zooming and rising practice cards; full transcript confined to a second small scroll area; large fixed background mark behind the player.

Nine passes: (1) consistent section/control spacing and 44px actions; (2) quiet cream/brick surfaces, no colored shadows; (3) common outline icons; (4) Listen/Prepare/Transcript/Practice tips navigation and unnumbered audio heading; (5) body 14px, meta >=12px, weights 500/600, no small negative tracking or italic transcript; (6) compact split hero, phone image above text, mobile 2-column section navigation, compact practice rows and normally flowing full transcript; (7) save aria-pressed and guide aria-controls; (8) original scene retained, decorative repeat thumbnail hidden on mobile, large fixed meditation mark moved to faint footer treatment; (9) remove practice-card hover zoom/rise, retain purposeful loading/player behavior.

Verification: 65 tests / 11 files, lint and TypeScript/PWA build passed. Two existing test assertions were updated only for the deliberately renamed audio heading; audio/seek/caption/language/filter assertions remain. Player fetch and media event logic compared equal to the base. Chrome playback reached 12.913 seconds, readyState 4, duration 326.147483 seconds and no media error; paused successfully. Opened full transcript, saved/unsaved a track and collapsed preparation. TH/EN at 360/390/768/1024/1440: no document, audio or preparation-grid horizontal overflow and all four section links exist. This is desktop browser/iframe verification, not physical devices. Share was not sent to another app or person.

Limit: this visual pass does not certify every caption cue. The 326s audio versus 300s VTT discrepancy, cue 19 and public Draft for Review sections still need the project's content decision before release. Draft badges remain visible; no reviewer approval has been invented.

Next: Q&A, including search/category/accordion states and the existing reviewed-answer chatbot; preserve verified/published filtering and avoid generative answers.

## Q&A phase

Direction: help visitors find an existing answer or continue with a monk; calm, readable, approachable; the same Ayutthaya world; the original monk photograph and actual answer text are the moments; small chat/search outlines mark the task. No answer text, publication policy or generative behavior was added.

Audit: large centered hero and washed-out photograph; small tracked capitals; emoji categories; all category pills on one horizontal strip; heavy colored shadow; a Search button without behavior; an empty-state action that cleared text but left an empty category selected; answer headings nested inside buttons; missing accordion panel associations. Also found the global unlayered `font: inherit` rule overriding control font utility weights.

Nine passes: (1) consistent spacing and 44/48px controls; (2) original cream/brick palette with quiet surfaces; (3) outline icons; (4) concise task labels without status claims; (5) readable body and actual medium control weights, while inputs/textarea/select stay 16px; (6) original photograph beside text on desktop / above on phones, wrapping categories, search input and submit stack on phones; (7) semantic search form moves focus to results, empty reset clears both search and category, proper heading/button and aria-controls; (8) retain the actual monk photo and real published answer preview; (9) color-only interaction feedback.

Verification: 65 tests / 11 files, lint and TypeScript/PWA build passed. Existing Q&A flow test now checks submit focus and recovery from an empty category; it awaits the asynchronously loaded question control instead of assuming it appears with the static page title. No assertion about verified/published filters or non-generative behavior was removed. The loading/filter/matching logic compared unchanged to the base. Chrome: search for an unmatched phrase, Search focuses qa-results-heading, Show all questions restores four loaded questions, accordion closes, chatbot returns a stored answer and declines an unknown question. Ten TH/EN layout states at 360/390/768/1024/1440 showed four questions, categories fitting and no document horizontal overflow. Final mobile check confirmed a 16px input, 14px category labels and 16px/500 question controls after the font reset correction. No real-device/IME certification is claimed.

Next: Centers, including region selection, complete center details, safe outgoing links and no-results recovery.

## Centers phase

Direction: find a real center and its contact options; practical, clear, calm; the same heritage brand surrounding geographic/address information; the existing introductory activity photo and actual center names/content carry the page; the outline pin marks location choices.

Audit: the same Ayutthaya image was labeled as every foreign center; decorative card selection changed only a border and was mouse-only; descriptions were clamped; category names were in a narrow horizontal strip; a Search button did nothing; no explicit no-results recovery; city substring matching could make York include New York despite separate counts; emoji, tiny labels, large shadows and hover lift; resources promised video/articles where links opened audio/Q&A.

Nine passes: (1) consistent padding/spacing, 44/48px actions; (2) existing quiet cream/brick palette; (3) outline icons; (4) search wording matches name/city/address, resource names match their destinations, no unsupported media claims; (5) 14px body/labels and medium weights, 16px fields; (6) cards use actual city/country/name/address rather than invented center photos, show full descriptions, native region select on phones and wrapping buttons above 640px; (7) exact city filtering, real search-submit focus, recovery clears both search/region, center link descriptions identify their card; removed purely decorative container selection while keeping all real outgoing actions; (8) retained the existing introductory photo and removed misleading repeated card photographs; (9) no card hover lift or enlarged shadows.

Verification: 66 tests / 11 files, lint and TypeScript/PWA build passed. One new regression test covers York vs New York, search-submit focus and restoring both records from an empty result. Fetch logic and published-only filters compared unchanged to the base; safe-URL checks remain and existing partial-data/error assertions still pass. Chrome: Singapore filter yields one real record, unmatched query shows recovery, Show all centers restores four, native phone selection of Singapore also works. All ten TH/EN layout states at 360/390/768/1024/1440 show four records and no document overflow; phone select has five options and 16px text, larger-screen buttons fit. Map/website/contact hrefs and noopener checked from the page; remote venue addresses and external-site availability were not independently certified. No live records or schema were changed.

Next: login, then the missing-page state; afterwards inspect the authenticated shell and management pages. Public visual work does not certify real authenticated CMS or live private inference.


## Login phase

Direction: authorized team access to the project's content; calm, legible, restrained; paper and brick; the official project mark is the sole visual moment; the existing maroon/terracotta action treatment is the signature.

Audit: placeholder logo, navy panel disconnected from the public brand, decorative circles, 2rem radii, colored shadows, uppercase Owner access despite team access, tiny bold labels, hover movement, unrelated public chatbot. Passes: 4px spacing, neutral tinted panels, official mark, accurate team context, readable 14px labels / 16px fields, proportionate split, 48px controls, remove circles/placeholder, color-only hover. The inactive/missing-profile state keeps its denial/sign-out behavior and semantic red.

Verification: 66 tests / 11 files, lint and TypeScript/PWA build passed. Auth hooks, submit handler, errors and redirect compared equal to the baseline. Chrome TH/EN 360/768/1440: no document overflow, both fields 16px and 48px, correct required/autocomplete attributes, empty submit disabled, no chatbot. No real credentials entered; this is not certification of live sign-in.

## Missing-page phase

Direction: help a visitor recover a missing route; clear, calm, familiar; the same project palette; official mark only; the outline Home action. Audit: oversized amber 404 as primary heading, small recovery control, unrelated slate/amber colors. Changed to descriptive H1, quiet 404 metadata, readable explanation, language control and 48px Home action. No content promises or new recovery features. The QA route is a static index copy to exercise React's wildcard, not a real hosting HTTP404/fallback check.


## CMS shell and dashboard phase

Direction: help authorized project members manage content without distraction; steady, exact, readable; paper/ink with the existing brick accent; the content and official mark are the moments; a quiet maroon selected navigation row is the signature. Audit: navy header, amber badge, undersized actions, tablet horizontal menu, missing menu state/Escape, rainbow module borders and hover shadows. Passes: consistent 16/24/32 rhythm, neutral surfaces and one action accent, official mark and 18px outline menu, contextual labels, weights 400/500/600, desktop 240px sidebar/mobile drawer, 44px controls plus ARIA/focus, remove filler, color-only feedback.

Dashboard uses the same modules and owner gating. AdminLayout.css scopes form font/targets/focus to CMS. Three meaningful navigation/error regressions bring the suite to 69 tests / 12 files; lint and TypeScript/PWA build passed. Read-only visual fixture imports actual page components with synthetic auth/data adapters, rejects mutations and is outside application source. It has no credentials and is not included in production build. Desktop rendered; 360px document width equals scroll width (345px after scrollbar), all 9 owner links fit the scrollable drawer; Escape closes and returns focus. Actual account sign-in, RLS/gateway, saved forms and live AI remain unverified.


## CMS Meditation phase — six pages

Pages reviewed in order: list, new, edit, audio upload, transcript, VTT subtitles. Direction: let the team identify draft media and edit the correct language; steady, readable, careful; neutral workspace with brick actions; actual track metadata and content are the moments; consistent language grouping. Audit: tiny bold labels, uppercase metadata, heavy headings/shadows, emoji, unrelated green/amber primary actions, mobile header/button squeezing, detached form labels. Nine passes use common spacing/neutral palette/retained outline icons/plain status copy/weights 400–600/44px controls and 16px fields/wrapping controls/semantic label associations/no decorative filler/no hover movement. Draft and replacement warnings remain.

Added 16 sibling label associations, named the audio file control and grouped subtitle language selection. Recommended now uses the existing localized label. Scoped CMS action links resist shrinking into single-character columns. Source handlers/effects compared byte-for-byte to baseline using TypeScript AST extraction. Existing fetch, validation, upload, storage and authorization calls remain. 69 tests / 12 files, lint and TypeScript/PWA build passed. Isolated synthetic fixture TH/EN at 360/1440 for all six pages (24 states): no document overflow, no visible button under 44px, all rendered text/select/textarea controls 16px with labels. This is presentation verification, not real upload/storage/RLS/account validation.


## CMS Q&A phase — three pages

Direction: distinguish draft editing from approved publication; careful, readable, exact; the same neutral workspace; actual question/answer and review metadata are the moments; consistent language groups. Audit: detached tiny bold labels, uppercase status/table headings, shadows, emoji notices, small actions and unnamed dismiss control. Passes follow the CMS spacing/color/icon/copy/type/layout/details/visual/motion rules above, adding 16 explicit label associations and a named outline dismiss control. Existing verification/publication labels, reviewer/source fields, fixed draft notices and lock behavior remain. Seven handlers/effects compared equal to base. 69 tests / 12 files, lint and TypeScript/PWA build passed. Synthetic fixture TH/EN at 360/1440 for all three pages: no document overflow, visible buttons >=44px, text/select/textarea fields 16px and named. No real record saved, approved or published.


## CMS Centers phase — three pages

Direction: maintain real center contact/location records; clear, careful, readable; the same neutral workspace; actual address and localized name are the moments; the shared language grouping is the signature. Audit: green primary actions, tiny bold form labels, mono URL labels, uppercase headings and emoji. Nine passes apply common spacing, single brick action accent, redundant icon removal, preserved plain copy, readable weights, wrapping actions, explicit labels, no new imagery and color-only feedback. Added 20 label/control associations; original publication/archiving and URL validation remain.

## CMS BioLinks phase — three pages

Direction: maintain the destination and order of visitor links; exact, calm, readable; the same workspace; actual link title/image is the moment; the shared language grouping remains. Audit: same type/action inconsistencies, unnamed inline order fields and dismiss controls. Added 8 label associations plus contextual names to both mobile/desktop order inputs, named dismiss controls, neutral sizing and 44px file-selector buttons. Sixteen Centers/BioLinks handlers/effects compared equal to base; no save, URL, storage or publication behavior changed.

Both modules: 69 tests / 12 files, lint and TypeScript/PWA build passed. Synthetic TH/EN 360/1440 six-page matrix has no document overflow or visible button under 44px. Inline order fields were found unnamed in the first English pass, fixed and rechecked in Thai; final cross-page pass checks the final English state. Text/select/textarea fields are 16px. No real data saved, uploaded, archived or published.
