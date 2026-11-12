---
name: monkchat-ux-a11y-audit
description: >-
  Full-system UX flow, information architecture, and WCAG accessibility audit
  for MonkChat Guide. Combines Vercel Web Interface Guidelines (MIT) with
  MonkChat user journeys across QR landing, visitor showcase, student training,
  and admin CMS. Use when asked to review UX, check accessibility/WCAG, audit
  user flows, check keyboard focus/ARIA/labels, or perform a full UI/UX inspection.
---

# MonkChat UX Flow & Accessibility Audit

Run a comprehensive UX journey and accessibility inspection without violating MonkChat Guide rules (`AGENTS.md`, `monkchat-safe-feature`, and `unslop`).

## Rule Precedence

1. **Project Rules (`AGENTS.md` + `monkchat-safe-feature`)**: 0 THB free-tier only, Thai primary/English secondary, role separation (`anon`, `student`, `team_member`, `owner`), verified Q&A only, device-local visitor notes.
2. **Visual Craft (`unslop`)**: Calm temple aesthetic, Sentence case copy, zero emojis/glows/slop, consistent icon set (`GuideIcon`).
3. **MonkChat UX Flows (below)** + **Adapted Interface Guidelines** in [references/vercel-web-guidelines.md](./references/vercel-web-guidelines.md). Keep Sentence case and Vite CSR PWA architecture over Next.js/Title Case rules.

## Audit Workflow

Read [references/vercel-web-guidelines.md](./references/vercel-web-guidelines.md) before inspecting code or pages.

### 1. Code-Level Accessibility & Interface Pass
Scan target pages/components in `src/` for:
- **Semantics & Landmarks**: Single clear `<main>`, skip-to-content usability, hierarchical headings (`h1` -> `h2` -> `h3`), `<button>` vs `<Link>` vs clickable `<div>`/`<span>`.
- **Forms & Auth**: Associated `<label htmlFor>` / wrapped label, `inputMode`, `autoComplete`, `spellCheck={false}` on codes/emails, `>= 16px` (`text-base`) inputs, accessible validation (`role="alert"`, inline fix hints).
- **Focus & Keyboard**: `:focus-visible` rings intact (no bare `outline-none`), `ArrowLeft`/`ArrowRight`/`Home`/`End` support on `role="tab"` bars where appropriate, no keyboard traps, sticky header not occluding focused targets.
- **Media, Contrast & CLS**: `<img width height>` or stable aspect ratios, `alt` text (`""` for decorative icons), `aria-hidden="true"` on inline SVGs inside labeled controls, `aria-live="polite"`/`role="status"`, transcripts/subtitles synced for audio.

### 2. MonkChat UX Flow & Heuristic Pass
Trace each primary user journey end-to-end and count clicks, friction, and recovery paths:
- **Visitor QR Journey (`/` -> `LanguageGate` -> `/home` -> `/visit`, `/meditation`, `/qa`)**:
  - Can an international visitor switch language and reach the meditation guide or Q&A in minimal taps?
  - Are visitor actions clearly distinct from Student (`/nisit`) and Staff (`/admin`) paths?
  - If Supabase audio/Q&A fails to load, is there a clear Retry or fallback path?
- **Student Monk Training Journey (`/nisit` <-> `/nisit/login`)**:
  - Is the difference between guest local practice and signed-in 7-digit Cohort account (`4011001–6911060`) immediately understandable in Thai & English?
  - Are password rules (>= 12 chars, rejecting `ID=Password` and `monkchat+ID`) explained *before* failing submit?
  - Does Visitor Notes / Thank-You Card clearly state data stays strictly on the device?
- **Team / Owner CMS Journey (`/admin/login` -> `/admin` -> `/admin/students`)**:
  - Does signing in as `student` show a calm non-CMS path back to `/nisit`?
  - In `/admin/students`, are one-time secrets (Cohort Invite Code / temp password reset) impossible to miss and easy to copy/dismiss?

### 3. Live Rendered Verification Pass (when preview/browser available)
Inspect desktop (`1440px`), tablet (`768px`, `1024px`), and mobile (`360px`, `390px`) in headless browser / CDP:
- Document horizontal overflow = `0`
- Interactive touch targets (`button`, `a`, `input`, `select`) `>= 44px` height
- Input/select font size `>= 16px`
- Tab order & active element focus visibility check across header, main CTA, tabs, and forms
- Broken images (`naturalWidth === 0`), missing `alt`, unlabeled controls, or console errors = `0`

## Output Format

Default to **audit-only reporting** unless the user asks to apply fixes. Group findings strictly by severity using `file:line` references:

- **Critical (Accessibility / Broken Flow)**: Blocks keyboard/screen-reader users or breaks a primary task.
- **UX Friction (Medium)**: Confusing flow, extra clicks, unclear error/empty recovery, sticky occlusion, or mobile ergonomics risk.
- **Minor Polish (Low)**: Image dimensions/CLS, minor ARIA refinements (`aria-hidden`, `role="tablist"` keyboard nav, `tabular-nums`, `min-w-0`), or copy clarity.
- **UX Journey Summary & Verified Passes**: Click counts per flow and checks verified passing (note explicitly any checks limited to static/mocked vs live browser inspection).

