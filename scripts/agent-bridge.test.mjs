import { test } from "vitest";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { classifyBlocker, eligibleTask, resultComment, scopePaths, taskMarker } from "./agent-bridge-core.mjs";
import { buildReviewPatch } from "./agent-bridge-review.mjs";

const owner = "MonkChatGuide072";
const task = `${taskMarker}\n# Small documentation task\n\n## Scope\n- \`docs/RELAY_SMOKE_TEST.md\`\n\n## Out of Scope\n- No production edits`;
const issue = { number: 12, state: "open", title: "[relay] Small documentation task", body: task, user: { login: owner } };

test("accepts only owner-authored, explicitly scoped tasks", () => {
  assert.equal(eligibleTask(issue, owner), true);
  assert.equal(eligibleTask({ ...issue, user: { login: "stranger" } }, owner), false);
  assert.equal(eligibleTask({ ...issue, pull_request: {} }, owner), false);
  assert.equal(eligibleTask({ ...issue, body: task.replace("docs/RELAY_SMOKE_TEST.md", ".env.local") }, owner), false);
  assert.equal(eligibleTask({ ...issue, body: task.replace("docs/RELAY_SMOKE_TEST.md", "supabase/migration.sql") }, owner), false);
  assert.equal(eligibleTask({ ...issue, body: task.replace("- `docs/RELAY_SMOKE_TEST.md`", "- docs/RELAY_SMOKE_TEST.md do not edit anything else") }, owner), false);
  assert.equal(eligibleTask({ ...issue, body: task.replace("docs/RELAY_SMOKE_TEST.md", "../outside.md") }, owner), false);
  assert.deepEqual(scopePaths(issue), ["docs/RELAY_SMOKE_TEST.md"]);
});

test("publishes bounded status evidence without including task or logs", () => {
  const comment = resultComment(issue.number, {
    status: "ready_for_owner", baseCommit: "a".repeat(40), round: 1,
    checks: { lint: "PASS", test: "PASS", build: "PASS" },
    review: "RELAY_DECISION: PASS", files: ["docs/RELAY_SMOKE_TEST.md"],
    secret: "not for GitHub",
  });
  assert.match(comment, /ready_for_owner/);
  assert.match(comment, /docs\/RELAY_SMOKE_TEST.md/);
  assert.doesNotMatch(comment, /not for GitHub/);
  assert.doesNotMatch(comment, /Small documentation task/);
});

test("reports Antigravity timeout without publishing stderr or local paths", () => {
  const stderr = "private text C:\\Users\\Owner\\secret [agy] print timeout after 15m0s with turn in progress; returning partial output";
  const blocker = classifyBlocker(stderr);
  assert.equal(blocker, "antigravity_timeout");
  const comment = resultComment(12, {
    status: "blocked", baseCommit: "a".repeat(40), round: 1,
    checks: { lint: "not reached", test: "not reached", build: "not reached" },
    blocker, files: ["src/pages/VisitPage.tsx"],
  });
  assert.match(comment, /Antigravity timed out/);
  assert.doesNotMatch(comment, /private text|secret|C:\\Users|15m0s/);
  assert.equal(classifyBlocker("unrelated failure"), null);
});

test("shares a small scoped patch, but withholds secrets and out-of-scope edits", () => {
  const checkout = mkdtempSync(path.join(os.tmpdir(), "monkchat-bridge-review-"));
  const git = (...args) => {
    const result = spawnSync("git", args, { cwd: checkout, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  };
  try {
    git("init", "-q");
    mkdirSync(path.join(checkout, "docs"));
    const existing = path.join(checkout, "docs", "existing.md");
    writeFileSync(existing, "Original\n");
    git("add", "docs/existing.md");
    git("-c", "user.name=Bridge Test", "-c", "user.email=bridge@example.invalid", "commit", "-qm", "baseline");
    writeFileSync(existing, "Localized activity\n");
    const created = path.join(checkout, "docs", "new.md");
    writeFileSync(created, "A reviewed document\n");

    const patch = buildReviewPatch(checkout, ["docs/"], ["docs/existing.md", "docs/new.md"]);
    assert.match(patch, /\+Localized activity/);
    assert.match(patch, /\+A reviewed document/);
    assert.equal(buildReviewPatch(checkout, ["docs/new.md"], ["docs/existing.md"]), null);
    writeFileSync(created, "password=private-value\n");
    assert.equal(buildReviewPatch(checkout, ["docs/"], ["docs/existing.md", "docs/new.md"]), null);
  } finally {
    rmSync(checkout, { recursive: true, force: true });
  }
});
