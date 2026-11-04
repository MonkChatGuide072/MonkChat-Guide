# Centers: a gateway to continue practising — 2026-11-04

The owner clarified the page's job: after a short meditation with the Monk Chat team, an interested visitor can explore another place to practise. It is an invitation to learn more, not a course promotion or booking service.

## Public page

- Heading: เรียนรู้และฝึกสมาธิต่อ / Continue your practice.
- Neutral conditional introduction, then three destination cards: Ayothaya Meditation Center, Wat Phra Dhammakaya and Dhammakaya branch centers.
- Actions open destination-owned information in a new tab with noopener/noreferrer. The Ayothaya destination is Thai; temple contact and branch listing are English, disclosed in link labels where needed.
- A short practical note asks visitors to confirm session times, languages and participation conditions with each destination directly.
- Directory search/region filters and existing published cards remain available below. No promises about availability, English-speaking sessions, fees, eligibility or registration were added.

## Official sources checked

Retrieved on 2026-11-04 before implementing the links:

| Destination | Source used |
| --- | --- |
| Ayothaya Meditation Center | https://ayothayameditation.com/ and https://ayothayameditation.com/contact-us-2/ identify the center in Ayutthaya and its own contact channels. Link goes to its homepage. |
| Wat Phra Dhammakaya | https://en.dhammakaya.net/contact/ provides temple visitor/contact information. |
| Branch centers | https://en.dhammakaya.net/branches/ provides the foundation's branch directory and destination contacts. |

Only destination names and links with short original invitation copy are included. Changing course dates, fees, travel routes and reported benefits were deliberately not copied into the app. Recheck links if the destination websites move. Sources and verification records are internal documentation, not public report panels.

## Verification

71 tests / 12 files, lint and TypeScript/PWA build passed. The existing exact-city/reset regression now also checks the new page heading, all three external URLs and gateway-before-search DOM order. Existing search, language filtering, safe external URL and partial-link failure tests remain. Two CentersPage handlers/effects are unchanged against 8d0024e.

Chrome checked TH/EN at 360/390/768/1024/1440 (10 states): no document overflow, all three action links at least 44px high, expected heading and URLs, and the gateway before search. This is viewport testing, not an actual phone/iPad certification. The exact new branch preview is inspected before delivery. No changes to database records, CMS/auth, paid services or production deployment.
