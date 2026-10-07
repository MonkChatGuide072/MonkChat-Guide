import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("./agent-relay.mjs", import.meta.url));
const temporary = mkdtempSync(path.join(os.tmpdir(), "monkchat-relay-scope-"));

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", windowsHide: true });
  if (result.error) throw result.error;
  return result;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function git(...args) {
  const result = run("git", args, temporary);
  assert(result.status === 0, `git ${args.join(" ")} failed: ${result.stderr}`);
}

try {
  mkdirSync(path.join(temporary, "scripts"));
  mkdirSync(path.join(temporary, ".agent-sync"));
  copyFileSync(source, path.join(temporary, "scripts", "agent-relay.mjs"));
  writeFileSync(path.join(temporary, "package.json"), '{"type":"module"}\n');
  const taskPath = path.join(temporary, ".agent-sync", "TASK.md");

  git("init", "-q", "-b", "ci-relay-scope");
  writeFileSync(taskPath, "# Relay scope check\n");
  git("add", ".");
  git("-c", "user.name=CI", "-c", "user.email=ci@example.invalid", "commit", "-qm", "Test fixture");

  writeFileSync(taskPath, [
    "# Windows parser check",
    "",
    "## Goal",
    "Check the relay task scope parser without invoking either agent.",
    "",
    "## Scope",
    "- `docs/RELAY_SMOKE_TEST.md`",
  ].join("\n"));
  const valid = run(process.execPath, ["scripts/agent-relay.mjs"], temporary);
  assert(valid.status === 0 && /"taskReady": true/.test(valid.stdout),
    `Valid exact path rejected: ${valid.stdout}\n${valid.stderr}`);

  writeFileSync(taskPath, [
    "# Windows parser check",
    "",
    "## Goal",
    "Reject ambiguous scope before invoking either agent.",
    "",
    "## Scope",
    "- `docs/RELAY_SMOKE_TEST.md`",
    "- Do not edit `src/App.tsx`",
  ].join("\n"));
  const invalid = run(process.execPath, ["scripts/agent-relay.mjs"], temporary);
  assert(invalid.status === 0 && /"taskReady": false/.test(invalid.stdout),
    `Ambiguous scope appeared ready: ${invalid.stdout}\n${invalid.stderr}`);

  const blocked = run(process.execPath, ["scripts/agent-relay.mjs", "--execute"], temporary);
  assert(blocked.status !== 0 && /Scope must contain only bullet lines/.test(blocked.stderr),
    `Execute did not reject ambiguous scope: ${blocked.stdout}\n${blocked.stderr}`);
  console.log("Relay scope checks passed without invoking Codex or Antigravity.");
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
