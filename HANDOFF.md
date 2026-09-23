# MonkChat Guide - Project Handoff

## Production release completed — 2026-09-23

- Owner approval covered production database/server/frontend installation and commit/push. Migration `20260923020015_cms_account_access.sql` is applied; hosted read-only checks confirm the active-profile role predicate and both guard triggers. No real content or team account was created/edited.
- `team-management` is ACTIVE version 1, with JWT verification enabled. A real unauthenticated POST returned 401 / `Missing authorization header`.
- Implementation release: GitHub commit `f51a3c0054efde83b2b4c7bdf068a82f68a8e239`, PR #5 merged into `main` as `52dd291093d918e38bbd17dc71d1356e197fa3ca`. Cloudflare Pages reports successful preview and production deployments. Production deployment ID: `cd9eb544-5af5-496e-a99c-87ae9c8fe4eb`.
- Local HTTPS push lacked credentials, so the authorized GitHub connector uploaded the same changes. Remote/local content tree matched exactly (`f77d346cd73b356b5e23aada0dcdbe869aee5655`); the original local implementation checkpoint is `aa1ae09`. The checkout was then moved to `agent/release-record` from fetched `origin/main`, preserving the original branch.
- Release revalidation passed: 32 tests, lint, TypeScript/build, whitespace check, and all 20 isolated PostgreSQL checks. The temporary PGlite dependency had expired and was reinstalled outside the repository. No application dependency changes.
- Actual production browser checks: after one reload to update the cached application, `/visit` displayed the new language gate; Thai and English visitor content loaded; recommended audio and all five existing Bio Links were visible without login. An unauthenticated visit to `/admin/team` redirected to `/admin/login`, which displayed the new localized login note.
- Remaining verification: authenticated Owner/member list/create/edit/suspend operations and real device/responsive checks at 360/390/768/1024/1440. Secure browser sign-in previously returned `submission_failed`; the current browser has no signed-in CMS session. Do not claim authenticated CRUD or mobile verification has passed.
- Additional live-content finding: the recommended English subtitle object downloads successfully, but contains `WEBVTT` followed immediately by timing lines with inline cue text and no cue separators. It is not valid WebVTT, so the parser correctly yields no cues and the UI reports a caption error. Existing published tracks also include test-labeled content. These require content cleanup/review; no file or publication status was changed because manual content work is deferred.
- Existing Supabase advisor notices remain unchanged (elevated analytics/recommendation RPCs and disabled leaked-password protection). No new warning category was introduced by this migration. See prior notes for scope.

---

## Approved release in progress — 2026-09-23

- The owner explicitly approved production database installation, website release, and commit/push. This supersedes the prior missing-approval blocker. Do not request the same approval again.
- `cms_account_access` was successfully applied to project `jxrllzpqatoauxjuoqmo` as migration `20260923020015`; the local filename and regression harness now match the actual remote history. Do not reapply the earlier local timestamp.
- After an approval-service usage-limit interruption, `team-management` deployed successfully as ACTIVE version 1 with `verify_jwt=true`. It uses the existing project and production-origin allowlist; no account/content records were created or edited.
- Frontend release is proceeding from `agent/system-ui-foundation`. The implementation passed 32 application tests, 20 isolated database checks, TypeScript/build, lint and Deno entry checks in the previous phase. Hosted account creation/update and the 5 responsive viewports remain unverified.
- The earlier secure browser login returned `submission_failed`; no verified signed-in session was observed. Manual handoff was offered. Do not treat the supplied credentials as tested or use a lower-level credential-entry workaround.

---

## Release attempt and live inspection — 2026-09-23

- User supplied an existing admin account and asked to continue. Credentials were not copied into source, scripts, documentation, or ordinary browser form-fill calls.
- Remote `main` is still `dd9822d5d75cea21dced92aa505fd1bfe4d08883`. The working branch remains `agent/system-ui-foundation`; no commit, push, or deployment occurred in this attempt.
- The attempted `cms_account_access` migration was **rejected by automatic approval review**: it requires explicit approval to write the production database and change authorization/suspension rules. Do not retry through SQL, CLI, or another indirect path. Obtain explicit production-release approval before retrying.
- A subsequent read-only check confirmed no migration history entry, no `cms_security_version()` function, and the original single profile still present. Edge Function/frontend deployment was left pending to avoid a partial release.
- Live browser: `/admin/login` renders the existing sign-in form; `/visit` opens the Thai/English language gate without 404. These observations concern the old deployed version, not the local changes.
- Secure browser authentication returned `submission_failed`; subsequent visible DOM remained on the login form without a verified signed-in signal. This does not establish that the supplied password is wrong. Do not bypass `browserAuth` with direct credential entry or an HTTP login request; use its permitted manual handoff if needed.
- Revalidation: all 32 tests and the production TypeScript/build passed again, as did `git diff --check`.
- Read-only Supabase security advisors currently warn about intentional elevated RPC access (`record_usage_event`, `set_recommended_track`) and disabled leaked-password protection. These are existing notices; no security settings or pricing plan were changed. Do not report zero security warnings.
- Next gate: explicit approval for applying the reviewed production migration and releasing the server/frontend (including the required Git checkpoint/push), followed by authenticated CMS verification. Original pending browser viewport and team-account tests still apply.

---

## Latest CMS checkpoint — 2026-09-23

This is the newest working-copy status. Earlier sections are historical; none proves that these changes are deployed.

- User authorized continuing the backend/CMS while deferring real-content entry. Existing public-page work is preserved on `agent/system-ui-foundation`; all changes remain uncommitted, with no push or deployment.
- Read-only hosted inspection confirmed that Languages and Team were placeholder UI modules, no Edge Functions were deployed, and `private.get_user_role()` did not filter `is_active`. No hosted database/account/content mutations were performed.
- Implemented `AdminLanguagesPage`: Owner add/edit/activate content languages, Team Member read-only access, immutable codes when editing, protected Thai/English core languages, localized loading/error/retry/success states, and confirmation of a returned database row before reporting a save.
- Implemented `AdminTeamPage` and server-side `team-management`: active Owner list/create/update Team Members; no role transfer, Owner suspension, or hard delete. Account creation uses a server-only service-role client; profile writes use the Owner JWT to preserve RLS and audit attribution. No automatic email is sent. Unavailable service disables creation; partial account creation reports a recovery-required state without deleting an account.
- Prepared migration `20260923012808_cms_account_access.sql`: inactive profiles receive no management role; protect profile identity/roles/Owner active status; revoke CMS profile deletion; protect core languages; add an Owner-only version check so the team endpoint stays closed until this migration is installed. **Not applied to the hosted project.**
- Fixed initial-session/profile readiness and stale profile results in `src/lib/auth.tsx`; recheck profiles on window focus; propagate sign-out errors. Updated route guards, login messaging and CMS sign-out UI.
- Added `AudioLanguageField` to track create/edit forms, replacing the previously forced Thai source language. Existing translations remain separate; rollback restores source language as well as duration.
- Created: `src/locales/management.ts`, `src/components/AudioLanguageField.tsx`, `src/lib/auth.test.tsx`, `src/lib/teamManagement.test.ts`, `src/pages/admin/ManagementPages.test.tsx`, `supabase/functions/team-management/{handler.ts,index.ts,deno.json,README.md}`, the migration above, and `scripts/check-cms-security.mjs`. Modified existing CMS/auth/i18n files and `supabase/config.toml` (explicit `verify_jwt = true`). No files removed.
- Verification: **32 automated tests passed across 6 files**; lint, TypeScript and production build passed; Deno type-check of the Edge entry passed with `--node-modules-dir=manual` using installed dependencies (direct Deno registry access was unavailable). Diff whitespace check passed.
- Database verification: **20 isolated PostgreSQL checks passed** using temporary PGlite and the actual initial schema/RLS/hardening/audit migrations with a minimal Auth shim. Covered allowed public language reads; denied public/member writes; no inactive role/content writes; Owner member creation/suspension with audit; blocked role escalation, Owner lockout, hard deletes, and core-language changes. This did not test the hosted Supabase gateway or Storage end to end.
- No application dependencies were added/removed. Deno and PGlite were used only as temporary validation tools. Existing free-tier services remain unchanged; no secrets were written to source or browser code.
- Still required before calling this phase production-ready: apply the reviewed migration, deploy the Edge Function and frontend, then verify real Owner/member login and CMS operations in an approved test environment. Verify layouts at 360/390/768/1024/1440 and real browser behavior. The earlier local cloud-browser access was blocked, so responsive CSS/jsdom coverage is not visual verification.
- Deployment order and partial-account recovery behavior are documented in `supabase/functions/team-management/README.md`. Commit still requires the owner's explicit instruction per the project skill; no new major phase started.

---

## Latest local work — 2026-09-23

This section records the current working copy. The sections below are historical and do not prove current deployment or account verification.

- User priority: improve the system and public website first; defer manual entry of real content.
- Branch: `agent/system-ui-foundation`, based on `dd9822d`. Changes are local and uncommitted; no push or deployment performed.
- Previous phase: rebuilt `/visit`, unified language switching, restored guest Bio Links, and added loading/error/empty states.
- This phase: public Meditation, Q&A and Centers improvements.
  - Meditation query now selects `source_language_code`. Selection follows the URL, including browser back/forward. Current-language filtering has no fallback to other translations.
  - Extracted `MeditationPlayer`: independent audio and subtitle loading/retry, media error handling, caption display and highlighting driven by playback/seek time. Changing track/language discards stale media responses. Audio uses `preload="none"`; large audio caching remains disabled.
  - Added WebVTT parsing with validation of timestamps and cue ranges. No real transcripts or subtitle files were created or edited.
  - Q&A retains verified + published queries, supports searching translated answers and expanding longer answers, and no longer exposes internal IDs as missing-question labels.
  - Center links accept only absolute HTTP(S) URLs without embedded credentials. Failed Bio Links no longer suppress loaded center details.
  - Added a shared bilingual visitor-home link on all three pages, replaced public emoji controls with SVGs, and improved wrapping and media sizing for narrow layouts.
- Created: `src/components/MeditationPlayer.tsx`, `src/components/VisitorBackLink.tsx`, `src/lib/publicContent.ts`, `src/lib/subtitles.ts`, `src/lib/subtitles.test.ts`, `src/pages/PublicPages.test.tsx`.
- Modified this phase: public Meditation/Q&A/Centers pages, Thai/English locale files, and this handoff. Earlier `/visit` changes remain in the same working tree.
- Packages added/removed this phase: none. No database writes, migrations, account changes, real-content edits, paid services, or secret handling.
- Verification: 14 automated tests passed across 3 files; lint, `tsc -b`, production build and diff whitespace check passed. New tests use mocked Supabase responses and media events, not production accounts or real audio playback.
- Still unverified: rendered layouts at 360/390/768/1024/1440, real audio/caption timing, and current Owner CMS login/edit flow. The prior cloud-browser attempt to open the local server was blocked; do not treat CSS review or jsdom tests as viewport verification.
- Next: review the public changes in a browser-accessible preview, then address CMS as a separate phase. Do not claim these edits are live; commit/push/deployment require the corresponding owner instruction.

---

> **หมายเหตุการทบทวนกรอบโครงงานจบปี 4 (อยู่ระหว่างการทบทวน ยังไม่อนุมัติให้เปลี่ยน REQUIREMENTS หรือโค้ด):**
> “MonkChat Guide เป็นเว็บไซต์ทางการของโครงการ และเป็นเครื่องมือช่วยพระนิสิตฝึกใช้สื่อนำนั่งสมาธิภาษาอังกฤษที่ผ่านการตรวจ พร้อมใช้ช่วยชาวต่างชาติหน้างาน ส่วนชาวต่างชาติสแกน QR เพื่อเข้าถึงสื่อและช่องทางศึกษาต่อ โดยเว็บไซต์ธรรมกายทางการเป็นแหล่งข้อมูลรายละเอียด”

---

## 1. สถานะโครงการปัจจุบันและสิ่งที่ทำเสร็จแล้ว (Current Project Status)
- โครงการพัฒนาบน React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router v7 + Supabase + i18next + Vite PWA
- พัฒนาฟีเจอร์ Public Flow v0.2 ตามแผน Wireframe เรียบร้อย:
  - ระบบหน้าหลักใหม่แยกเป็น `ProjectInfoPage` (`/`) และ `VisitPage` (`/visit`)
  - `VisitPage` รองรับ Language Gate ครั้งแรก และแสดง Visitor Home (Hero, Nav Cards, Recommended Track CTA, BioLinks)
  - `MeditationPage`, `QAPage`, `CentersPage` มีการกรองเนื้อหาตามภาษาที่เลือกอย่างเข้มงวด (Strict Translation Filtering) ไม่มี silent fallback
  - เพิ่มสถานะ `is_recommended` พร้อม RPC Trigger ป้องกันการแก้ไขจาก Team Member และ Owner-only button ในหน้า Admin
- ผ่านการคอมไพล์ สร้าง Build และไม่มี TS/Lint/Whitespace error
- หน้าเว็บสาธารณะและระบบ CMS หลังบ้านเชื่อมต่อ Supabase ผ่าน Client-side SDK พร้อม RLS Security ตามสิทธิ์

---
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
- Created and verified typed mock content models and mock data foundation. Completed Day 1.
- Implemented public Home/BioPage interface using typed mock data and language-scalable translation utility.
- Implemented public Meditation interface with track selection, honest audio status, transcript, and subtitles.
- Implemented public Q&A prototype interface with search, status badges, verification notice, and content gating predicate.
- Implemented public DCI Centers interface with 5 neutral demonstration records and null-safe link handling.
- Completed combined Day 2 public-flow browser review; all pages, language switching, and responsive widths passed.
- Prepared local Supabase foundation (`@supabase/supabase-js`, CLI init, safe browser client, `.env.example`).
- Created local initial schema and RLS policy migrations for Supabase based on `DATABASE_SCHEMA.md`.
- Performed security audit and hardened database functions, RLS policies, search path, and profile access.
- Applied all 3 schema & hardening migrations to the remote Supabase project.
- Verified remote database synchronization (`npx supabase db push --dry-run`), CLI schema lint (`npx supabase db lint`), and Project Owner confirmation of 0 errors and 0 warnings in Supabase Security Advisor.
- Implemented Supabase Authentication scaffold (login page, protected routes, context, locale strings, error handling).
- Manually tested and verified Owner login flow, role authorization, sign-out, and protected route access.
- Created idempotent migration for `meditation-audio` Storage bucket and RLS policies (`20260812181301_storage_meditation_audio.sql`).
- Applied Storage migration to remote Supabase database and verified 0 lint errors/warnings.
- Implemented responsive Admin CMS shell, module subroutes, OwnerRoute guard, and reactive Thai/English language switching.
- Implemented Meditation CMS read-only list (fetches from Supabase, shows loading/empty/error/results states).
- Completed Day 4 Meditation CMS and Q&A CMS modules.
- Day 5 Step 1 DCI Centers and BioLinks CMS workflows fully completed and verified (committed).
- Day 5 Step 2 public Supabase integration fully completed and verified (committed):
  - Connected public Meditation, Q&A, DCI Centers, and BioLinks/homepage pages to the linked Supabase database.
  - Implemented strict status querying: meditation tracks (`published`), Q&A items (`published` AND `verified`), DCI centers (`published`), BioLinks (`published`).
  - Added language fallbacks (current UI language -> Thai -> first available translation) updating on language changes.
  - Setup signed URLs and dynamic WebVTT downloading/parsing for static subtitles on the Meditation page.
  - Handled tracks and records with missing audio, subtitles, or transcripts honestly.
  - Enforced http/https URL restrictions for homepage BioLinks.
  - Added loading, error/retry, and empty states.
  - Added secure Owner-only Publish and Unpublish actions for meditation tracks in `AdminMeditationPage.tsx`.
  - Created forward-only database migration `20260813215600_meditation_track_publication_security.sql` with triggers to enforce that Team Members cannot insert or update published meditation tracks. Applied remotely.
  - Added localized strings for meditation actions in `th/common.json` and `en/common.json`.
  - Verified all local compile, build, and check workflows pass cleanly.
- Day 6 final MVP testing, security review, performance check, and Cloudflare Pages deployment preparation completed successfully:
  - Validated local and remote migrations synchronization.
  - Passed database linting with 0 errors/warnings.
  - Verified role-based RLS and triggers secure owner-only actions.
  - Addressed oversized bundle warning by implementing React.lazy route-level code splitting (main bundle reduced significantly).
  - Configured visually neutral SVG spinner for Suspense fallback.
  - Prepared `public/_redirects` for Cloudflare Pages SPA fallback routing.
  - Created `README.md` documenting Cloudflare Pages deployment and Supabase Auth Redirect URL requirements.
  - Passed full test suite (lint, build, audit, git diff --check).
- **Day 6 is complete.**
- Anonymous analytics and CMS audit feature implemented locally after Project Owner approval:
  - Superseded the former ban on all public identifiers with a privacy-preserving random `visitor_id` and temporary `session_id`; raw IP addresses remain prohibited.
  - Added and applied forward-only migration `20260814190506_anonymous_analytics_and_admin_audit.sql`.
  - Added validated `record_usage_event` RPC and removed direct anonymous inserts into `usage_events`.
  - Added public session-start, page-view, audio-play, audio-complete, and BioPage-link-click tracking.
  - Added immutable `admin_audit_logs` populated by database triggers for authenticated CMS record changes.
  - Kept usage analytics available to authenticated CMS users while restricting complete audit history to the Owner.
  - Added responsive bilingual `/admin/analytics` dashboard with 7/30-day metrics, daily trend, masked visitor activity, and administrator activity history.
  - Local lint, TypeScript compilation, production build, locale JSON parsing, and diff checks pass.
  - Migration applied successfully to Supabase Production and is synchronized to remote migration version `20260814190506`.
  - Post-migration permission tests passed: Guest RPC works without direct table writes; Team Members can read usage analytics but not audit history; the Owner can read audit history.
  - All permission tests ran inside rolled-back transactions; no verification rows remain and the active Owner profile is unchanged.
  - Security Advisor reports two intentional warnings for the public/authenticated `SECURITY DEFINER` analytics RPC plus the existing Free-tier leaked-password warning. The RPC uses an empty `search_path`, explicit schemas, strict event validation, and least-privilege table grants.

## Current Task
- Anonymous analytics and CMS audit implementation is live in Supabase Production; direct GitHub Plugin publication to a feature branch and Draft PR is approved.

## Exact Next Step
- Review the Draft PR for `agent/anonymous-analytics-audit`, then merge only after the public and Admin changes are accepted. Review the production frontend flow before any Cloudflare deployment.

## 2. ฟีเจอร์ที่มีแล้วในระบบ (Implemented Features)
1. **Mobile-first PWA**:
   - รองรับ Web App Manifest (`manifest.webmanifest`), Service Worker สำหรับ Offline Shell (Vite PWA)
   - Responsive Layout ครอบคลุม 360px, 390px, 768px, 1024px, 1440px
2. **ระบบ 2 ภาษา (Thai & English)**:
   - ภาษาไทยเป็นค่าเริ่มต้น (Default) และภาษาอังกฤษเป็นภาษารอง สลับภาษาได้เรียลไทม์ผ่าน `i18next` พร้อมบันทึกใน `localStorage`
   - โครงสร้างฐานข้อมูลรองรับการขยายภาษาในอนาคต (แยกตาราง Translations)
3. **ระบบสมาธิ เสียงนำนั่ง Transcript และซับไตเติล (Meditation, Audio, Transcript, Subtitles)**:
   - เครื่องเล่นเสียง HTML5 Audio พร้อมแถบควบคุม
   - ซิงก์คำบรรยาย WebVTT แบบไดนามิกตามเวลาเล่นเสียง
   - แสดง Transcript ภาษาไทยและภาษาอังกฤษ
   - CMS จัดการแทร็กเสียง, อัปโหลดไฟล์ MP3 (จำกัด 25MB), จัดการเนื้อหา Transcript และซับไตเติล VTT
4. **ระบบถาม-ตอบธรรมะ (Q&A)**:
   - ค้นหาและกรองหมวดหมู่คำถาม-คำตอบ
   - ระบบสถานะ Verification (Verified / Unverified) และ Source Reference
   - Public แสดงเฉพาะคำถามที่ `published` + `verified` + `is_published = true` เท่านั้น
   - CMS จัดการสร้าง, แก้ไข, ตรวจสอบ (Verify โดย Owner), เผยแพร่/ยกเลิก, เก็บถาวร (Archive), และกู้คืน (Restore โดย Owner)
5. **ศูนย์ประสานงานต่างประเทศ (DCI Centers)**:
   - แสดงข้อมูลศูนย์ DCI พร้อมชื่อ ที่อยู่ ข้อมูลติดต่อ และลิงก์ภายนอกที่ปลอดภัย
   - CMS สำหรับเพิ่ม แก้ไข จัดการสถานะ และเก็บถาวร
6. **หน้าหลักและรวมลิงก์ (Home & BioPage)**:
   - การนำเสนอภาพรวมโครงการ MonkChat Guide
   - รายการลิงก์สำคัญ (BioLinks) พร้อมระบบจัดเรียงลำดับ (`display_order`) และตรวจสอบความปลอดภัยของ URL (`http://` หรือ `https://` เท่านั้น)
   - CMS สำหรับจัดการลิงก์และลำดับการแสดงผล
7. **ระบบจัดการเนื้อหา (Admin CMS)**:
   - เข้าสู่ระบบผ่าน Supabase Auth (`/admin/login`)
   - Dashboard สรุปภาพรวมและนำทางไปยังแต่ละโมดูล
   - Lazy-loading แยก Chunk สำหรับหน้า CMS ช่วยเพิ่มความเร็วในการโหลด
8. **ระบบสิทธิ์ผู้ใช้งาน (Roles & Permissions - Owner / Team Member)**:
   - **Owner**: จัดการได้ทุกส่วน, จัดการสมาชิกทีม (Role Management), ตรวจสอบความถูกต้องของ Q&A (Verification), เผยแพร่แทร็กสมาธิ, ลบถาวรข้อมูลที่เก็บถาวรแล้ว
   - **Team Member**: จัดการเนื้อหาฉบับร่าง (Draft), อัปโหลดไฟล์, แก้ไขเนื้อหา, เก็บถาวร (Archive) เนื้อหาที่ยังไม่ได้เผยแพร่ (ไม่สามารถ Verify/Publish หรือลบถาวรได้)
   - บังคับใช้สิทธิ์ผ่าน Database RLS Policies และ Triggers ร่วมกับ `private.get_user_role()`
9. **ระบบสถิติและการบันทึกประวัติ (Analytics & Audit Logging)**:
   - ตาราง `usage_events` บันทึกสถิติแบบไม่ระบุตัวตน (Track Play, Track Complete, BioLink Click) โดยไม่เก็บ IP หรือข้อมูลส่วนบุคคล
   - ฟิลด์ Audit ในทุกตารางหลัก (`created_at`, `updated_at`, `verified_by`, `verified_at`, `archived_at`)

---

## 3. สถานะ Supabase / Storage / Migrations ที่ตรวจได้จริง (Verifiable Supabase Status)
- **Local Migrations (ตรวจพบ 8 ไฟล์ในโฟลเดอร์ `supabase/migrations/`)**:
  1. `20260812152413_initial_schema.sql` (โครงสร้างตารางหลักและตารางแปลภาษา)
  2. `20260812152735_row_level_security.sql` (นโยบาย RLS เริ่มต้น)
  3. `20260812160457_security_advisor_hardening.sql` (ย้ายฟังก์ชันไป `private.get_user_role()`, Search Path Hardening)
  4. `20260812181301_storage_meditation_audio.sql` (สร้าง Storage Bucket `meditation-audio` และ RLS)
  5. `20260812195634_seed_initial_languages.sql` (ข้อมูลเริ่มต้นภาษา `th` และ `en`)
  6. `20260813015023_storage_meditation_subtitles.sql` (สร้าง Storage Bucket `meditation-subtitles` และ RLS)
  7. `20260813215600_meditation_track_publication_security.sql` (Trigger ป้องกัน Team Member เผยแพร่แทร็กเสียง)
  8. `20260814022206_restrict_role_policies_to_authenticated.sql` (จำกัด Role-based RLS Policies เฉพาะ `authenticated` แก้ปัญหา Guest Access)
- **Remote Database Migrations**:
  - พบประวัติในรีโมท 10 Migrations ตรงกับ Local ทั้งหมด (กู้คืน `20260814190506` และ `20260818174242` จาก Git history สำเร็จ)
  - ทดสอบด้วย `npx supabase migration list` แล้วว่าสถานะตรงกับ Remote 100%
- **Storage Buckets**:
  - `meditation-audio` (Private, max 25MB, MIME: `audio/mpeg`, `audio/mp3`, etc.)
  - `meditation-subtitles` (Private, max 1MB, MIME: `text/vtt`)

---

## 4. สถานะ Git และ Branch / Worktree ที่ควรใช้ต่อ (Git Status)
- **Branch ปัจจุบัน**: `main`
- **สถานะการเชื่อมต่อ Remote**: เชื่อมกับ `origin` (`https://github.com/MonkChatGuide072/MonkChat-Guide.git`)
- **สถานะ Working Tree**: สะอาด (`working tree clean`) ก่อนการอัปเดตไฟล์นี้
- **Commit ล่าสุด**: `b464560 fix: restore anonymous published content access` (ตรงกับ `origin/main`)
- **Branch / Worktree ที่ควรใช้ต่อ**: ทำงานบน `main` หรือเปิด feature branch จาก `main` สำหรับงานที่มีการอนุมัติเฉพาะเจาะจง

---

## 5. สถานะเนื้อหาจริงในระบบ (Content Verification Status)
- ใน Source Code โครงการปัจจุบันยังคงมีไฟล์ Mock Data อยู่ใน `src/data/mock/`
- เนื้อหาที่เพิ่มหรือทดสอบก่อนหน้านี้ผ่านหน้า CMS เป็นข้อมูลทดสอบ (TEST Records) ซึ่งถูกกำหนดสถานะเป็น Draft / Unpublished
- **ข้อกำหนดความถูกต้อง**: เนื้อหาจริงใด ๆ ที่เพิ่มในระบบก่อนหน้านี้ หากยังไม่ได้ตรวจยืนยันในฐานข้อมูลแบบเป็นทางการ ให้ถือว่า **“ต้องตรวจซ้ำ”** และ **“ห้ามระบุว่าเผยแพร่แล้ว (Not Published)”** จนกว่าจะมีการตรวจสอบโดย Owner

---

## 6. ปัญหาและจุดที่ยังต้องตรวจสอบ (Known Issues to Verify)
1. **ปัญหา QR Code สแกนแล้วเกิด 404**:
   - ต้องตรวจสอบ URL ปลายทางที่สร้างใน QR Code ว่าตรงกับ Route ของแอปพลิเคชันหรือไม่ และตรวจสอบการทำงานของ SPA Redirects (`public/_redirects`) บน Production Hosting
2. **หน้า BioPage สำหรับผู้ใช้งานทั่วไป (Guest / Tourists)**:
   - ต้องตรวจยืนยันให้แน่ชัดว่า Guest และนักท่องเที่ยวสามารถเปิดหน้าแรก (`/`) และเข้าถึงข้อมูล BioLinks รวมถึงเนื้อหาสาธารณะได้ทันทีโดยไม่ต้องล็อกอินหรือมีสิทธิ์ Admin
3. **การตรวจสอบการ Deploy ของ Cloudflare Pages**:
   - ต้องตรวจยืนยันว่าการ Deploy บน Cloudflare Pages ทำงานจาก Commit ล่าสุดบน Branch `main` (`b464560` หรือใหม่กว่า) และตั้งค่า Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) ครบถ้วนถูกต้อง

---

## 7. ข้อจำกัดถาวรของโครงการ (Permanent Constraints)
- **งบประมาณ 0 บาท**: ใช้งานเฉพาะ Free-tier (Supabase Free, Cloudflare Pages Free, GitHub Free) ไม่เปิดใช้งานฟีเจอร์ที่ต้องจ่ายเงินหรือเสี่ยงต่อค่าใช้จ่ายส่วนเกิน
- **ภาษา**: ภาษาไทยเป็นค่าเริ่มต้น (Primary & Default) ภาษาอังกฤษเป็นภาษารอง (Secondary)
- **ห้ามใช้ Paid AI API**: ห้ามติดตั้งหรือเรียกใช้ OpenAI API, Gemini API หรือ AI API แบบเสียค่าใช้จ่ายในโค้ดที่ Deploy
- **ความปลอดภัยของ Secrets**: ห้ามนำ Service-role Key, รหัสผ่าน หรือ Secret ใด ๆ ใส่ในโค้ดฝั่ง Client / Browser
- **หลักธรรมและเนื้อหาพระพุทธศาสนา**: ห้ามเผยแพร่คำตอบหรือเนื้อหาธรรมะที่สร้างจาก AI โดยอัตโนมัติ ทุกคำตอบ Q&A ต้องผ่านการตรวจสอบและอนุมัติจาก Project Owner
- **การจัดการไฟล์เสียง**: ห้าม Cache ไฟล์เสียงขนาดใหญ่ลงเครื่อง Client/Service Worker โดยอัตโนมัติ เพื่อป้องกันการเกินขีดจำกัด Bandwidth และ Storage ของ Free-tier

---

## 8. สิ่งที่ห้ามทำต่อโดยไม่ได้รับอนุมัติ (Prohibited Actions Without Approval)
- ห้ามแก้ไขโค้ดแอปพลิเคชัน โครงสร้างฐานข้อมูล หรือไฟล์อื่น ๆ
- ห้ามแก้ไขไฟล์ `REQUIREMENTS.md` หรือ `DECISIONS.md`
- ห้ามรันคำสั่ง Migration หรือปรับแก้ Database Schema
- ห้าม Deploy หรือแก้ไขการตั้งค่า Cloudflare Pages
- ห้ามแก้ไขหรือสร้าง QR Code ใด ๆ
- ห้าม commit หรือ push ไปยัง GitHub
- ห้ามรันคำสั่งที่เป็นอันตรายหรือทำลายข้อมูล

---

## 9. ขั้นตอนถัดไปเพียง 1 ขั้นตอน (Exact Next Step)
- รายงานผลลัพธ์การพัฒนา Public Flow v0.2 และการกู้คืน/สร้าง Migration `20260825000000_add_is_recommended.sql` ให้ Owner ตรวจ พร้อมส่ง diff ห้าม commit, push หรือ deploy จนกว่าจะได้รับคำสั่งยืนยัน
## Known Problems
- No known production guest-access blocker remains; commit `b464560` restored anonymous published-content access.
- The frontend code is not yet pushed or deployed, so Production will not begin recording the new browser events until that release occurs.
- No database blocker remains. Frontend release remains pending Draft PR review and merge.

## Files Changed in the Current Phase
- `AGENTS.md` (read only; unchanged)
- `REQUIREMENTS.md`
- `DECISIONS.md`
- `DATABASE_SCHEMA.md`
- `HANDOFF.md`
- `src/App.tsx`
- `src/components/AdminLayout.tsx`
- `src/components/UsageTracker.tsx` (new)
- `src/lib/analytics.ts` (new)
- `src/pages/HomePage.tsx`
- `src/pages/MeditationPage.tsx`
- `src/pages/admin/AdminAnalyticsPage.tsx` (new)
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/locales/th/common.json`
- `src/locales/en/common.json`
- `src/types/content.ts`
- `supabase/migrations/20260814190506_anonymous_analytics_and_admin_audit.sql` (new)

## Actions That Must Not Be Started Yet
- Do not deploy the frontend to Cloudflare until the Git checkpoint is pushed and the production public/Admin flows are reviewed.

## Public Entry-Point Phase (2026-08-19)
- The Project Owner approved a clearer public journey without changing Buddhist content, database schema, or CMS permissions.
- Homepage now presents two paths: a Monk Student/Team field-guide entry and a Visitor entry.
- Added the public `/visit` route with direct links to Meditation, Q&A, and DCI Centers. This is the intended destination for visitor QR Codes.
- Local lint, TypeScript, and production build passed in a clean feature worktree.
