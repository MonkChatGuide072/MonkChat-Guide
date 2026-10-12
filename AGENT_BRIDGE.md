# Windows agent bridge (owner setup)

This bridge is a local process on the owner's Windows PC. It checks GitHub Issues every 60 seconds, runs the existing Codex–Antigravity relay for an eligible task in a **new isolated checkout**, then writes a small result comment on that Issue. The ChatGPT GitHub connection can create the Issue and read the comment; neither ChatGPT nor GitHub directly controls the Windows desktop. The PC must be on, connected, and running the bridge.

The bridge does not use a GitHub Actions self-hosted runner. It does not run arbitrary commands from an Issue. It accepts an open Issue only when the author and active `gh` account are `MonkChatGuide072`, its title begins `[relay] `, the body begins with the exact marker below, and `## Scope` lists exact allowed repository paths. It ignores pull requests and all other issues. The existing relay enforces scope and stops before commit, push, merge, or deployment. **An owner-authored Issue is permission to run a scoped local task, not permission to publish or release changes.** Because the repository is public, never put credentials or private material in the Issue.

When Antigravity reaches its print timeout, the result comment includes a fixed timeout label without posting raw logs or local paths. The checkout stays available for focused recovery; the bridge does not rerun the job automatically.

## One-time setup on the owner's Windows PC

1. Install GitHub CLI if it is missing: `winget install --id GitHub.cli --source winget`. Sign in interactively with `gh auth login`, then check `gh auth status`. Use the same GitHub account as the repository owner. Never paste an access token into an Issue or this repository.
2. Ensure `node`, `npm`, `git`, `codex`, `agy`, and `gh` are available in a fresh PowerShell window. Codex and Antigravity should already be signed in under the existing subscriptions. Install no paid API keys.
3. After the bridge branch is reviewed and available on GitHub, clone or pull that branch into a separate folder. Double-click `scripts/Install Bridge Autostart.cmd` **once** from that checkout. It installs a per-user Windows Startup shortcut and starts a hidden supervisor immediately. No administrator permission or paid service is required.
4. The installer takes over from an idle manual Bridge worker; if an active job exists, it lets that worker finish first. At later Windows sign-ins the supervisor starts automatically, fast-forwards only the clean `feature/local-agent-bridge` checkout from the exact owner repository, installs dependencies if needed, and restarts the worker after an exit. If the worker dies mid-task, the next worker reports it as blocked and preserves its checkout. Changes to this branch can execute locally on the next restart, so review branch changes before publishing them. To disable autostart, remove `MonkChat Agent Bridge.lnk` from the current user's Startup folder. The local logs are `%LOCALAPPDATA%\MonkChatAgentBridge\supervisor.log` and `worker.log`.

The process keeps each job in `%LOCALAPPDATA%\MonkChatAgentBridge\jobs\issue-N\checkout`. It does not delete those checkouts. The local `bridge-state.json` prevents automatic reruns. If a job is interrupted, the bridge reports `blocked` and preserves its checkout; inspect it before creating a new Issue. A `worker.lock` directory prevents two bridge processes from using the same jobs. The supervisor removes an empty stale lock only after checking that no Bridge worker is present; it does not delete job files.

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

Only scope bullet paths can be edited by Antigravity. Put prohibitions under `## Out of Scope`. The worker posts status, base commit, round, check outcomes, review decision and changed filenames. It also posts a small Git review patch when all changes are in the Issue scope, files are ordinary UTF-8 text, the patch is at most 40 KB, and a conservative secret scan passes. Otherwise it withholds the patch. The Issue and patch are public, so never scope private files or content. Raw agent output and logs stay local. A `ready_for_owner` result still requires a review before any commit or PR. ChatGPT can read the Issue result and send a follow-up task without asking the owner to relay text manually.

Each Issue runs once. For a revised task, create another Issue; do not edit the completed Issue and expect a rerun. If the patch is withheld, code review still requires access to the local checkout or a separately approved Git branch/PR.

The source branch is currently fixed to `chore/local-agent-relay` until the relay PR is merged. Any later switch to `main` requires a reviewed bridge update. Running the bridge on the owner PC cannot be verified from this cloud workspace; use `--dry-run` and one small documentation task first.
