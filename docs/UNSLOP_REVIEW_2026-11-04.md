# Page-by-page interface review — 4 November 2026

Owner instruction: audit and improve every part of the website with unslop, one page at a time. This expands the prior Home-top-only visual scope. The existing product, content rules, real logo, warm heritage palette and approved full-width Home image / title below / five shortcuts remain the baseline.

Review approach: adapted from **unslop by Damir Sokolovsky (@heydamir), CC BY 4.0**, https://github.com/heydamir/unslop/tree/main/skills/unslop. Existing artwork and font families are retained; no new image prompt or generation was needed.

## Queue

| Order | Area | Status |
| --- | --- | --- |
| 1 | Home `/`, `/visit`, initial language selection | Implemented and checked as described below |
| Shared | Navigation, footer clearance, public chatbot | Changed for Home usability; cross-page checks continue with each page |
| 2 | Activities | Implemented and checked |
| 3 | Meditation and its supporting sections | Next |
| 4 | Q&A and public chatbot states | Pending |
| 5 | Centers | Pending |
| 6 | Login and missing-page state | Pending |
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
