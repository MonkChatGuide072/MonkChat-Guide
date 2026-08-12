# AI Agent Instructions for MonkChat Guide

These are the permanent instructions for every AI agent working on this repository.

## ✅ CONFIRMED Project Constraints
- **Application Type**: Mobile-first Progressive Web Application (PWA).
- **Languages**: Thai (primary and default) and English (secondary). Users can switch between them.
- **Timeline**: 1-week prototype development period.
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
- Do NOT use paid APIs (no OpenAI, Gemini, or other AI APIs inside the deployed app).
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
- Before starting work, read AGENTS.md, REQUIREMENTS.md, HANDOFF.md and DECISIONS.md.
- Summarize the current status before making changes.
- Treat REQUIREMENTS.md as the product source of truth.
- Treat DECISIONS.md as the decision history.
- Update HANDOFF.md after each meaningful work phase.
- Never replace a confirmed decision without explicit owner approval.
- Keep one AI agent editing the project at a time.
- Create a Git checkpoint after each approved phase once Git is initialized.
