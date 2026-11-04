# MonkChat Guide - Decision Log

## Latest owner decision — 2026-11-04: visitor-facing identity and a breathing card

Use MonkChat Guide as the website/header/browser identity; explain Ayutthaya Monk Chat as the activity project. The owner clarified that “presentation” means the website's visitor-facing content, not slides or academic reporting. Remove academic/development report panels from public Home/Activities, retaining a short useful description of the activity. Add a separate, simple breathing card after closing the eyes: a few gentle deep breaths with a slow exhale, then natural breathing, as in the supplied script. Preparation now has six cards. Keep quiet sitting and after-session experiences unchanged. No changes to media, data/auth, costs or production deployment.


## Latest owner decision — 2026-11-04: three stages around the actual spoken session

The owner supplied the real English guidance and approved five short preparation cards. Add three stages: Before (5), Meditation time (one quiet image), and After (8 owner-requested experience prompts). Put all seven-base detail behind an optional disclosure with existing source links. Reflection pictures help visitors tell a monk about wandering, striving, ease, a crystal ball, feeling small, a Buddha image, brightness, or another/uncertain/no-image experience. Do not rank these or promise them. No response collection, timer, automatic slide progression, audio synchronization claim, database changes, or replacement of recorded media.


This document records the confirmed decisions made during the project's lifecycle.

For current scope and proposals still awaiting a decision, read CURRENT_SCOPE.md. Historical entries remain as a record and may have been superseded by later explicit owner instructions.

## Latest owner decision — 2026-11-04: sourced meditation picture guide

Replace the generic/draft meditation instructions with concise TH/EN Dhammakaya guidance from the owner-supplied Foundation page and the temple publication “ทางเดิน ของใจ ๗ ฐาน”. Show preparation and all seven bases as mobile picture cards before audio, with direct access to base 7. Remove public back-to-visitor-home shortcuts that duplicate the global Home link. Preserve the approved Home, actual audio/captions/transcripts, verified-answer policy and authorization. This decision supersedes preserving the old meditation teaching copy only; it does not approve database changes or production deployment.

## 1. Project Name
- **Decision**: Project name is MonkChat Guide.
- **Reason**: Official name provided by the project owner.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 2. Application Architecture
- **Decision**: Build a mobile-first PWA.
- **Reason**: Ensures accessibility on mobile devices without requiring native app store submissions.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 3. Prototype Languages
- **Decision**: Prototype languages: English and Thai.
- **Reason**: Covers the immediate needs of foreign visitors and internal MonkChat team members.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 4. Default Language
- **Decision**: Default interface language is English.
- **Reason**: Primary target audience for the public facing side is foreign visitors.
- **Status**: 🔄 SUPERSEDED
- **Date**: 2026-08-12

## 4.1. Primary and Default Language
- **Decision**: Thai is the primary and default interface language.
- **Reason**: Confirmed by the Project Owner. English remains available as a secondary supported language for foreign visitors. Users can switch between Thai and English.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 5. Future Language Scalability
- **Decision**: Support adding more languages later.
- **Reason**: The application will need to scale globally and accommodate more languages over time.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 6. Public User Accounts
- **Decision**: Public users do not need accounts.
- **Reason**: Lowers the barrier to entry so visitors can immediately access content by scanning a QR code.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 7. Team Accounts
- **Decision**: Owner and Team Members have individual login accounts.
- **Reason**: Allows secure, role-based access control for content management.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 8. Content Management Permissions
- **Decision**: Team Members can manage website content.
- **Reason**: Enables non-developers to maintain and update the platform's resources easily.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 9. Analytics
- **Decision**: Basic anonymous statistics are included.
- **Reason**: Provides insight into usage (track plays, completions, clicks) without violating user privacy.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 10. Budget Constraints
- **Decision**: Runtime and deployment budget: 0 THB.
- **Reason**: Explicitly requested to keep the prototype free; will use Supabase Free and Cloudflare Pages Free.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 11. Third-Party API Limits
- **Decision**: No paid APIs or AI APIs inside the deployed application.
- **Reason**: Ensures the project remains strictly within the 0 THB budget and prevents overage spending.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 12. Out of Scope Features
- **Decision**: Real-time rooms, ranking, matchmaking and native mobile apps are out of scope.
- **Reason**: Keeps the 1-week prototype focused on core requirements.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 13. Database Architecture
- **Decision**: The language-scalable database architecture is approved. Text translations will use separate translation tables.
- **Reason**: Ensures future scalability for additional languages without requiring schema alterations.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 14. Authentication and Roles
- **Decision**: Supabase Auth will manage team login. Owner and Team Member roles will be used.
- **Reason**: Provides a secure and straightforward role-based access control system.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 15. Role Permissions
- **Decision**: Only the Owner can verify Q&A and manage team roles. Team Members can add, edit, and archive content. Only the Owner can permanently delete archived content.
- **Reason**: Enforces strict governance over content deletion and team access.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 16. Anonymous Statistics Constraints
- **Decision**: Anonymous statistics must not store names, emails, IP addresses, or public user IDs.
- **Reason**: Protects user privacy while still tracking usage metrics.
- **Status**: 🔄 SUPERSEDED by Decision 16.1
- **Date**: 2026-08-12

## 16.1. Privacy-Preserving Unique Visitor Measurement
- **Decision**: Estimate unique visitors with a random browser-generated `visitor_id` and a temporary `session_id`. Continue to prohibit IP addresses, names, emails, user-agent strings, device details, and browser fingerprints. Add database-generated audit logs for authenticated Owner and Team Member content changes; only the Owner can read the complete audit history.
- **Reason**: The Project Owner approved anonymous unique-visitor measurement and accountable CMS activity history without collecting raw IP addresses or claiming to identify public visitors.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-15

## 17. Implementation Plan
- **Decision**: The seven-day implementation plan is approved.
- **Reason**: Confirmed by the Project Owner.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 18. Technology Stack
- **Decision**: The complete technology stack is approved (React, Vite, TypeScript, Tailwind CSS, React Router, Supabase JavaScript client, i18next and react-i18next, vite-plugin-pwa, Vitest and React Testing Library, Supabase Edge Functions Free, Cloudflare Pages Free).
- **Reason**: Confirmed by the Project Owner.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 19. Secure Team-Account Management
- **Decision**: Supabase Edge Functions Free will be used for secure team-account management. The Supabase service-role key must remain only in server-side secrets.
- **Reason**: Confirmed by the Project Owner for security.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 20. Responsive Support
- **Decision**: Responsive support is required at 360px, 390px, 768px, 1024px, and 1440px. Mobile-first means mobile-first, not mobile-only. Both public pages and the CMS must support phones, tablets, laptops, and desktop computers.
- **Reason**: Confirmed by the Project Owner.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 21. Public Routing & Flow
- **Decision**: `/` is the project info page. `/visit` is the public visitor entry point with a Language Gate.
- **Reason**: Separates the project's institutional identity from the immediate needs of foreign visitors.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-25

## 22. Strict Translation Fallback
- **Decision**: No silent fallbacks to other languages. Content is only shown if a translation exists for the selected UI language.
- **Reason**: Ensures visitors only see content they can understand, preventing mixed-language UI confusion.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-25

## 23. Recommended Meditation Tracks
- **Decision**: Owner can set `is_recommended` for meditation tracks (max 1 per `source_language_code`). Must be an atomic database action.
- **Reason**: Allows curation of the best audio tracks per spoken language without giving CMS team members arbitrary promotion power.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-25

## 24. Design Tokens & Assets
- **Decision**: Use strict colors (navy `#11223C`, gold `#A86100`, ivory `#FFFEF9`), Noto Sans Thai font, 8px spacing, and SVG pictograms. No emojis for system icons.
- **Reason**: Maintains a professional, calm, and cohesive visual identity.
- **Status**: ✅ CONFIRMED for the application shell; refined for the public Home by Decision 25
- **Date**: 2026-08-25

## 25. Monk Chat Public Home
- **Decision**: `/` is the public Home for the Monk Chat project. It introduces what Monk Chat is, its purpose, activities, atmosphere, and related links, then presents MonkChat Guide as a supporting set of visitor tools. `/visit` remains the direct QR entry point. The Home extends the application palette with soft terracotta, clay pink, cream, sand, and muted sage so brick red is never used as a single heavy color. Its atmospheric imagery centers on meditation in fields with ancient Thai/Ayutthaya-style ruins. Use authentic project photos once approved; generated illustrations must be labeled and must not be represented as real activity photos.
- **Reason**: The public website has two distinct responsibilities: communicating the identity of the Monk Chat project and providing practical meditation, Q&A, and continuation guides.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-09-23
## 21. Public Entry-Point Structure
- **Decision**: The homepage introduces MonkChat Guide as a tool for monk students and international visitors. A dedicated public visitor route (`/visit`) gives direct access to Meditation, Q&A, and DCI Centers; visitor QR Codes will point to this route.
- **Reason**: Keeps the application aligned with its confirmed purpose: supporting monk students in leading meditation and providing basic information to international visitors.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-19

## 26. Non-generative Chatbot and AI Development Tools
- **Decision**: The requested chatbot must respond from prepared and reviewed answers. Do not use a deployed generative AI model to compose Buddhist answers. AI tools such as Codex and Antigravity may be used to design, implement, test, and document the project; that development method does not make the deployed chatbot an AI chatbot.
- **Reason**: The Project Owner explicitly distinguished using AI to build the system from the chatbot experienced by users and retained the 0 THB operating budget. An advisor proposal for AI answers outside the knowledge base is recorded as a proposal in CURRENT_SCOPE.md, not an approved runtime feature.
- **Status**: ✅ CONFIRMED for the non-generative chatbot direction; detailed interaction and content coverage remain to be designed.

### 2026-10-25 — Keep searchable Q&A and add a separate chatbot service card
- **Decision**: Preserve the existing `/qa` searchable FAQ. Show the reviewed-answer chatbot as an optional service card at the lower right of visitor pages. Do not replace Q&A or its content management flow.
- **Reason**: The Project Owner corrected the earlier interpretation after viewing the local prototype and explicitly requested an additive card.
- **Status**: ✅ CONFIRMED. Local implementation is pending owner review; the published website is unchanged.
- **Date**: 2026-10-25

### 2026-10-25 — Keep Q&A references in team management only
- **Decision**: Do not show source references or reviewer names on the public FAQ or chatbot card. Keep the original reference data for the protected Q&A management view.
- **Reason**: The Project Owner wants visitors to see the answer without its internal review details.
- **Status**: ✅ CONFIRMED. Local implementation is pending owner review; the published website is unchanged.

### 2026-11-03 — Submission integration: keep the public reviewed-answer bot and a separate private AI draft assistant

- **Decision**: Keep the latest Windows `/qa` and public service card non-generative and restricted to published, verified answers. Add the authenticated monk-student AI assistant separately at `/admin/assistant`, following the submission plan reviewed and accepted in the current conversation on 2–3 November. The exception to the earlier runtime-AI restriction applies only to that private draft assistant and Workers AI Free. No paid upgrade, public generated Buddhist answer, or automatic Q&A publication is authorized by this update.
- **Evidence context**: The owner accepted the reviewed plan and instructed work to start, then provided the requested Windows ZIP. This is a new scoped submission direction; it does not mean the 25 October non-generative decision was absent or the 14 October branch was the latest version.
- **Status**: Implementation/integration authorized in the current conversation; live inference, account verification and release checks remain pending. Existing production state is unchanged.
