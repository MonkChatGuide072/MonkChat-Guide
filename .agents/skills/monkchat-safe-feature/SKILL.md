---
name: monkchat-safe-feature
description: Use this skill whenever implementing, modifying, testing, reviewing, or preparing a Git checkpoint for a MonkChat Guide application feature.
---

# MonkChat Safe Feature

Follow `AGENTS.md` as the permanent source of project rules.

## Before editing

- Read `HANDOFF.md` and inspect Git status.
- Read only the planning documents relevant to the current task.
- Inspect existing code before proposing changes.
- Ask the Project Owner when a missing decision would materially change the result.
- Keep each task small and reviewable.

## Project safeguards

- Maintain the 0 THB runtime and deployment budget.
- Use only approved free-tier services and free open-source packages.
- Never expose passwords, API keys, service-role keys, or other secrets.
- Never put server secrets in browser code.
- Do not run destructive commands without explicit Project Owner approval.
- Preserve unrelated user changes.
- Keep Thai as the primary and default interface language.
- Keep content separate from application logic.
- Never publish unverified Buddhist Q&A as real content.

## Implementation rules

- Implement only the approved task.
- Do not install unrelated packages.
- Maintain responsive support from 360px through 1440px.
- Prevent horizontal scrolling on important pages.
- Keep Public User, Team Member, and Owner permissions separate.
- Do not connect external services unless the current task explicitly requires it.

## Verification

Run all relevant available checks:

- Lint
- Type checking
- Automated tests
- Production build
- git diff --check

For UI changes, verify the relevant pages at:

- 360px
- 390px
- 768px
- 1024px
- 1440px

For authentication or database permission changes, test allowed and denied actions separately for:

- Public User
- Team Member
- Owner

Fix required checks before declaring the task complete.

## Handoff

Report:

- Files created, modified, or removed
- Packages installed or removed
- Verification results
- Security or free-tier concerns
- Current Git status
- Recommended next step

Do not create a Git commit unless the Project Owner explicitly requests it.

Update `HANDOFF.md` only when requested or when completing an approved checkpoint.

Stop for Project Owner review before starting another major task.
