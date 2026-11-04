# AI Agent Instructions for MonkChat Guide

These are the permanent instructions for every AI agent working on this repository.

## ✅ CONFIRMED Project Constraints
- **Application Type**: Mobile-first Progressive Web Application (PWA).
- **Languages**: Thai (primary and default) and English (secondary). Users can switch between them.
- **Timeline**: The 1-week prototype was the starting plan. The later owner-provided schedule targets a November field trial and December report; read CURRENT_SCOPE.md before committing to feature deadlines.
- **Budget**: 0 THB (Free-tier only).
- Use **Supabase Free** for database, authentication, and file storage.
- Use **Cloudflare Pages Free** for deployment.
- Keep content separate from application logic. Use mock data until real content is ready.

## Security Rules
- Do NOT expose passwords, service keys, or secrets in source code.
- Always use environment variables for sensitive information.
- Ask for explicit user confirmation before running **destructive commands** (e.g., deleting databases, dropping tables, removing large sets of files).

## Coding Quality Expectations
- Write clean, modular, and well-documented code.
- Ensure all components are responsive and mobile-first.
- Do NOT use paid APIs. The current submission plan allows a private, authenticated monk-student draft assistant through Cloudflare Workers AI Free only. Public FAQ/chatbot answers remain non-generative. No paid-plan upgrade or overage is permitted. Read the 2026-11-03 scoped update in CURRENT_SCOPE.md.
- Do not require a paid domain or billing information.
- Do not enable automatic paid upgrades or overage spending.

## Buddhist & Meditation Content Rules
- Treat all Buddhist and meditation content with respect.
- Ensure audio and text (subtitles/transcripts) are accurately synchronized.
- UI should remain calm, clean, simple, and international (initial color direction: white, soft gold, deep navy).

## Verification & Completion
- **Commands for Verification**: Ensure linting, type checking, automated tests, and a production build command are used to verify code changes.
- **Definition of Done**: A development task is considered complete when it works on mobile screen sizes, passes all lint/type/test checks, builds successfully for production, and has been tested in both public and team-management flows.

## Handoff Rules
- Before starting work, read AGENTS.md, CURRENT_SCOPE.md, and the current HANDOFF.md. Consult REQUIREMENTS.md, DECISIONS.md, and the archived handoff only for a relevant historical question.
- Summarize the current status before making changes.
- Read CURRENT_SCOPE.md first for the current product direction and unresolved scope. REQUIREMENTS.md is the starting specification; where it conflicts with later explicit owner instructions, do not silently implement the older requirement.
- Read the short current HANDOFF.md before editing. Its linked archive is history, not current deployment state.
- Treat DECISIONS.md as the decision history.
- Update HANDOFF.md after each meaningful work phase.
- Never replace a confirmed decision without explicit owner approval.
- Keep one AI agent editing the project at a time.
- Prepare a Git checkpoint after each approved phase. Create a commit only when the Project Owner explicitly requests it.
