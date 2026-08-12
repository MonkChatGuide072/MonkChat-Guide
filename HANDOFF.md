# MonkChat Guide - Project Handoff

## Current Project Status
- The four planning documents have been created and approved.
- React + Vite + TypeScript foundation completed.
- Tailwind CSS v4 foundation completed.
- React Router foundation completed with routes: `/`, `/meditation`, `/qa`, `/centers`, `/admin/login`, and Not Found (`*`).
- Thai is the default language; English switching works and persists in `localStorage`.
- Day 1 PWA foundation completed with `vite-plugin-pwa@1.3.0` and Thai web app manifest.
- Service worker uses `generateSW` strategy with application-shell caching and explicit audio exclusion.
- Standard browser PWA installation supported without custom popup prompts.
- Temporary original MC branding created (replaceable with final branding later).
- `@vite-pwa/assets-generator` and `sharp` removed; full and production `npm audit` report 0 vulnerabilities.
- Production-preview testing passed at 390px, 768px, and 1440px (manifest, icons, service worker, routing, offline shell verified).
- Application remains on mock/placeholder content.
- Supabase, authentication, and external deployment are not connected.
- Next step: complete the Day 1 mock-data structure and final Day 1 acceptance review.

## Completed Work
- Created initial project documentation.
- Updated REQUIREMENTS.md based on Project Owner feedback.
- Created the AI handoff system (HANDOFF.md, DECISIONS.md, and updated AGENTS.md).
- Updated language requirements: Thai is now the primary and default interface language.
- Reviewed and approved DATABASE_SCHEMA.md and updated DECISIONS.md.
- Reviewed and approved IMPLEMENTATION_PLAN.md and updated DECISIONS.md.
- Verified environment readiness and initialized Git repository on branch main.
- Created React + Vite + TypeScript foundation with Thai default and verified responsiveness.
- Configured Tailwind CSS v4, React Router, and i18next Thai-English localization foundation.
- Created project-local MonkChat Agent Skill (`.agents/skills/monkchat-safe-feature/SKILL.md`).
- Implemented and verified installable PWA foundation.

## Current Task
- Creating approved Git checkpoint for Day 1 PWA foundation.

## Exact Next Step
- Complete the Day 1 mock-data structure and final Day 1 acceptance review.

## Pending Content and Decisions
- AI-generated transcripts for the three audio files.
- Time-synchronized subtitle files.
- Ten verified Q&A items.
- Final BioPage links.
- Final branding files.
- Team member names and email addresses.
- Final confirmation of audio publication rights.

## Known Problems
- None at this stage.

## Files Changed in the Current Phase
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `index.html`
- `tsconfig.app.json`
- `public/monkchat-placeholder.svg`
- `public/favicon.ico`
- `public/pwa-64x64.png`
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- `public/maskable-icon-512x512.png`
- `public/apple-touch-icon-180x180.png`
- `HANDOFF.md`

## Actions That Must Not Be Started Yet
- Do not install extra packages beyond approved next steps.
- Do not connect external services (Supabase, Cloudflare, GitHub remote).
