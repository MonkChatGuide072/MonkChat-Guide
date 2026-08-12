# ✅ APPROVED: MonkChat Guide Implementation Plan

This is a practical seven-day AI-assisted implementation plan for the MonkChat Guide prototype. 

## ✅ APPROVED: Proposed Technology Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Router
- **Backend & Auth**: Supabase JavaScript client
- **Localization**: i18next and react-i18next
- **PWA**: vite-plugin-pwa
- **Testing**: Vitest and React Testing Library
- **Deployment**: Cloudflare Pages Free

## General Development Rules
- **Languages**: Thai is the primary and default interface language. English is the secondary language. Users can switch languages. More languages can be added later without changing the application structure.
- **PWA Storage Rules**: Do not automatically cache meditation audio files for offline use. Offline audio playback is not required in the prototype. Cache only essential application files where appropriate.
- **Secure Team-Account Planning** (✅ *APPROVED*): Public users cannot register. Team accounts must be invitation-only. The first Owner account may be created manually during initial Supabase setup. Owner account-management actions use Supabase Edge Functions Free for creating or inviting Team Member accounts, activating or disabling team access, and updating team roles. The Supabase service-role key must exist only in Supabase server-side secrets, must never appear in frontend code, must never be committed to Git, and must never be stored in public environment variables.
- **Stop-and-Fix Rule**: If lint, type checking, tests, production build, or a critical user flow fails, fix it before moving to the next phase.

## Responsive Design Requirements
"Mobile-first" does not mean mobile-only. The complete application, including public pages and the CMS, must work on mobile phones, tablets, laptop computers, and desktop computers.
- **Layout Behavior**: Do not merely stretch the mobile layout across a desktop screen. Mobile public pages should use a clear single-column layout. Tablet and desktop layouts should use available space appropriately, including multiple columns where this improves usability. Navigation may adapt between mobile and desktop layouts.
- **CMS Tables**: Must remain usable on desktop and must not overflow on mobile. On small screens, complex CMS tables may change into cards or responsive lists.
- **Elements**: Forms, dialogs, audio controls, subtitles, buttons, and text must remain readable and usable at every supported screen size.
- **Constraints**: No important page should require horizontal scrolling.
- **Required Viewport Tests**: 360px (mobile), 390px (mobile), 768px (tablet), 1024px (laptop/tablet), 1440px (desktop).

## Development Checkpoints
After every approved phase, the AI must:
- Run the relevant checks.
- Update `HANDOFF.md`.
- Update `DECISIONS.md` if a decision changed.
- Create a Git checkpoint.
- Stop for Project Owner review before beginning the next major phase.

---

## Day 1: Project setup, Git, PWA foundation and mock-data structure
- Initialize the repository with the frontend stack.
- Set up Tailwind CSS for the initial styling direction (white, soft gold, deep navy).
- Configure PWA manifest and service workers (caching only essential app files).
- Scaffold the project directory structure and mock data.
- **Acceptance Checks**:
  - *What must work*: The base app loads with a calm, clean aesthetic.
  - *What must be tested*:
    - Verify that the web app manifest is valid and correctly linked.
    - Verify that the service worker registers successfully.
    - Verify PWA installability on a supported browser.
    - The browser does not need to display the installation prompt automatically.
    - Do not automatically cache meditation audio files.
    - Production build command.
  - *Requires Owner Approval*: Project structure and technology stack.

## Day 2: Public mobile interface and Thai-English language switching
- Build the BioPage, Meditation Area (mock audio), Q&A Section, and DCI Centers using mock data.
- Implement the i18n library, setting Thai as default and English as secondary.
- Ensure the UI is mobile-first and fully responsive.
- **Acceptance Checks**:
  - *What must work*: Public users can browse all mocked public pages and toggle between Thai and English.
  - *What must be tested*: Responsive support for public pages at 360px, 390px, 768px, 1024px, and 1440px viewports (no horizontal scrolling, appropriate use of columns).
  - *Requires Owner Approval*: Visual design and responsive layout across devices.

## Day 3: Supabase database, storage, authentication and RLS
- Create the Supabase Free project.
- Implement the approved 11-table language-scalable database schema.
- Set up Supabase Storage for audio files.
- Configure Supabase Auth and strictly define Row Level Security (RLS) policies.
- **Acceptance Checks**:
  - *What must work*: The database schema is live and RLS restricts unauthorized access.
  - *What must be tested*: Attempting to read/write data publicly fails where expected.
  - *Requires Owner Approval*: Supabase initial configuration.

## Day 4: Team CMS and Owner account management
- Build the private CMS dashboard with explicitly included management interfaces for:
  - Languages
  - Meditation tracks
  - Meditation track translations
  - Transcripts
  - Time-synchronized subtitles
  - Q&A items
  - Q&A translations
  - DCI centers
  - DCI center translations
  - BioPage links
  - BioPage link translations
  - Archived content
- Implement the Owner account management interface via Supabase Edge Functions Free.
- Create the first Owner account manually.
- **Explicit Permissions**:
  - **Team Member**: Can add content, edit content, and archive content. Cannot verify Q&A. Cannot manage team accounts or roles. Cannot permanently delete archived content.
  - **Owner**: Has all Team Member permissions. Can verify Q&A, manage team accounts and roles, restore archived content, and permanently delete archived content.
- **Acceptance Checks**:
  - *What must work*: Owners and Team Members can log in and view appropriate CMS modules with correct permissions.
  - *What must be tested*: Content CRUD operations inside the CMS, and CMS responsive tables (adapting to cards/lists on 360px/390px and working seamlessly up to 1440px).
  - *Requires Owner Approval*: CMS usability and Owner account management logic.

## Day 5: Connect public pages to Supabase and add statistics
- Connect public pages to Supabase. Public production pages must stop displaying mock content after Supabase integration.
- Fetch real content (meditation tracks, Q&A, centers, links) from Supabase based on the selected language.
- Mock data and test fixtures must not be permanently deleted. Retain test fixtures for local development and automated testing, clearly separating them from real public content.
- Implement basic anonymous usage statistics recording (without collecting personal data).
- **Acceptance Checks**:
  - *What must work*: Public pages display data dynamically from the database.
  - *What must be tested*: Verify that changing language updates the fetched translations.
  - *Requires Owner Approval*: Data fetching logic and statistics implementation.

## Day 6: Automated checks, security review and browser testing
- Run comprehensive linting and TypeScript checks.
- Execute the automated testing framework.
- Verify security rules: confirm that permissions are enforced by Supabase Row Level Security (RLS), not only by hiding buttons in the interface. No service-role keys exposed, no public registration allowed.
- **Acceptance Checks**:
  - *What must work*: The application passes all security and code quality checks.
  - *What must be tested*: Security vulnerabilities, edge-case browser testing, final responsive viewport tests (360px to 1440px), and explicit role-permission testing for allowed and denied actions for all three user types:
    - **Public User**: Can read only published public content and verified/published Q&A. Cannot access the CMS. Cannot create, edit, archive, or delete content.
    - **Team Member**: Can access the CMS. Can add, edit, and archive content. Cannot verify Q&A. Cannot manage accounts or roles. Cannot permanently delete archived content.
    - **Owner**: Can access all CMS modules. Can verify Q&A. Can manage accounts and roles. Can restore or permanently delete archived content.
  - *Requires Owner Approval*: Readiness for preview deployment.

## Day 7: Preview deployment, real-content integration, final testing and documentation
- Create a preview deployment on Cloudflare Pages Free.
- Log into the CMS and add the real content (audio, subtitles, Q&A, links). If final content is unavailable, clearly marked demonstration content may be used, but must not be presented as verified real content. Unverified Buddhist Q&A must never be published as real public content.
- Record every missing real-content item in `HANDOFF.md`.
- Perform end-to-end testing of Thai and English content, and public/team flows on the live preview.
- The technical prototype may be considered complete if all system and demonstration flows pass, even when some final content remains pending.
- **Acceptance Checks**:
  - *What must work*: The fully integrated app runs flawlessly on the live URL.
  - *What must be tested*: All public flows and team flows on the preview deployment.
  - *Requires Owner Approval*: Final approval to mark the 1-week prototype as complete.
