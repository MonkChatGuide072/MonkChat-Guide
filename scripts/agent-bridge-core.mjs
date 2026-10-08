export const taskMarker = "<!-- monkchat-agent-bridge-task-v1 -->";
export const resultMarker = (number) => `<!-- monkchat-agent-bridge-result-v1:${number} -->`;

// Only return fixed labels. Agent stderr can contain task text or private local paths.
export function classifyBlocker(stderr) {
  return /\[agy\] print timeout after \d+[mh]/.test(stderr) ? "antigravity_timeout" : null;
}

const forbidden = (file) => file.split("/").some((part) => /^\.env(?:\.|$)/i.test(part)) ||
  file === ".git" || file.startsWith(".git/") ||
  file === "supabase" || file.startsWith("supabase/") ||
  file === ".agent-sync/TASK.md" || file.startsWith(".agent-sync/runtime/");

export function eligibleTask(issue, owner) {
  if (!Number.isSafeInteger(issue.number) || issue.number < 1 || issue.pull_request ||
      issue.state !== "open" || issue.user?.login?.toLowerCase() !== owner.toLowerCase() ||
      !issue.title?.startsWith("[relay] ") || typeof issue.body !== "string" ||
      !issue.body.startsWith(taskMarker + "\n") || issue.body.length > 12_000) return false;

  const task = issue.body.slice(taskMarker.length).trim();
  const section = task.split(/\r?\n##\s+/).find((part) => /^Scope\s*\r?\n/i.test(part));
  if (!section) return false;
  const lines = section.replace(/^Scope\s*\r?\n/i, "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (lines.length < 1 || lines.length > 20) return false;
  return lines.every((line) => {
    const match = /^[-*]\s+(?:`([^`]+)`|([^\s`]+))$/.exec(line);
    const file = match?.[1] ?? match?.[2] ?? "";
    return /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*\/?$/.test(file) &&
      !file.split("/").includes("..") && file !== "." && !forbidden(file);
  });
}

export function resultComment(number, result) {
  const status = ["ready_for_owner", "blocked", "revision_limit"].includes(result.status)
    ? result.status : "blocked";
  const files = (result.files ?? []).slice(0, 40)
    .map((file) => `- \`${String(file).replaceAll("`", "").replace(/[\r\n]/g, "")}\``);
  const checks = result.checks ?? {};
  return [
    resultMarker(number),
    `**Relay result: ${status}**`,
    `- Base commit: \`${result.baseCommit}\``,
    `- Round: ${result.round ?? 0}`,
    `- Checks: lint ${checks.lint ?? "not reached"}, test ${checks.test ?? "not reached"}, build ${checks.build ?? "not reached"}`,
    `- Codex review: ${result.review ?? "not reached"}`,
    ...(result.status === "blocked" && result.blocker === "antigravity_timeout"
      ? ["- Blocker: Antigravity timed out; local edits were preserved for review."] : []),
    `- Changed files (${(result.files ?? []).length}):`,
    ...(files.length ? files : ["- (none)"]),
    "- Local edits remain in the isolated Windows job checkout for owner review.",
    "- No commit, push, merge, deployment, or production update was performed.",
  ].join("\n");
}
