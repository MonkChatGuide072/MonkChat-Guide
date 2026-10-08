import { test } from "vitest";
import assert from "node:assert/strict";
import { classifyBlocker, eligibleTask, resultComment, taskMarker } from "./agent-bridge-core.mjs";

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
