# Windows agent bridge (owner setup)

This bridge is a local process on the owner's Windows PC. It checks GitHub Issues every 60 seconds, runs the existing Codex–Antigravity relay for an eligible task in a **new isolated checkout**, then writes a small result comment on that Issue. The ChatGPT GitHub connection can create the Issue and read the comment; neither ChatGPT nor GitHub directly controls the Windows desktop. The PC must be on, connected, and running the bridge.

The bridge does not use a GitHub Actions self-hosted runner. It does not run arbitrary commands from an Issue. It accepts an open Issue only when the author and active `gh` account are `MonkChatGuide072`, its title begins `[relay] `, the body begins with the exact marker below, and `## Scope` lists exact allowed repository paths. It ignores pull requests and all other issues. The existing relay enforces scope and stops before commit, push, merge, or deployment. **An owner-authored Issue is permission to run a scoped local task, not permission to publish or release changes.** Because the repository is public, never put credentials or private material in the Issue.

## One-time setup on the owner's Windows PC

1. Install GitHub CLI if it is missing: `winget install --id GitHub.cli --source winget`. Sign in interactively with `gh auth login`, then check `gh auth status`. Use the same GitHub account as the repository owner. Never paste an access token into an Issue or this repository.
2. Ensure `node`, `npm`, `git`, `codex`, `agy`, and `gh` are available in a fresh PowerShell window. Codex and Antigravity should already be signed in under the existing subscriptions. Install no paid API keys.
3. After the bridge branch is reviewed and available on GitHub, clone or pull that branch into a separate folder. Run `npm ci` there once, then preview with `npm run agents:bridge -- --dry-run`.
4. Start `npm run agents:bridge`. Leave this PowerShell window open while you want it to receive work. `npm run agents:bridge -- --once` handles at most one task and exits. Closing the window stops polling; no Windows service or startup task is installed.

The process keeps each job in `%LOCALAPPDATA%\MonkChatAgentBridge\jobs\issue-N\checkout`. It does not delete those checkouts. The local `bridge-state.json` prevents automatic reruns. If a job is interrupted, the bridge reports `blocked` and preserves its checkout; inspect it manually before creating a new Issue. A `worker.lock` directory prevents two bridge processes from using the same jobs. If Windows force-terminates the worker and leaves that lock, check that no worker is running before manually removing only that lock directory.

## Task format

ChatGPT creates a GitHub Issue as the owner, with title `[relay] Short task name` and this body:

```markdown
<!-- monkchat-agent-bridge-task-v1 -->
# Short task name

## Goal
One focused, reviewable result.

## Scope
- `docs/RELAY_SMOKE_TEST.md`

## Acceptance Criteria
- State precisely what should be checked.

## Out of Scope
- No source changes, credentials, Supabase, Cloudflare, or production.
```

Only scope bullet paths can be edited by Antigravity. Put prohibitions under `## Out of Scope`. The worker posts status, base commit, round, check outcomes, review decision and changed filenames. It does **not** post raw agent output, diffs, or logs to a public Issue. A `ready_for_owner` result still requires a human to inspect the local changes before any commit or PR. ChatGPT can read the Issue result and send a follow-up task without asking the owner to relay text manually.

Each Issue runs once. For a revised task, create another Issue; do not edit the completed Issue and expect a rerun. The comment contains a short status, so code review still requires access to the local checkout or a separately approved Git branch/PR.

The source branch is currently fixed to `chore/local-agent-relay` until the relay PR is merged. Any later switch to `main` requires a reviewed bridge update. Running the bridge on the owner PC cannot be verified from this cloud workspace; use `--dry-run` and one small documentation task first.
