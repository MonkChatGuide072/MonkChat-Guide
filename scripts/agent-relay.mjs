import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const syncDir = path.join(repoRoot, ".agent-sync");
const taskPath = path.join(syncDir, "TASK.md");
const runtimeRoot = path.join(syncDir, "runtime");
const lockPath = path.join(runtimeRoot, "relay.lock");
let lockOwned = false;
const execute = process.argv.includes("--execute");
const maxRoundsArg = process.argv.find((arg) => arg.startsWith("--max-rounds="));
const maxRounds = Number(maxRoundsArg?.split("=")[1] ?? 2);
const maxPromptChars = 160_000;
const maxDiffChars = 80_000;
const maxUntrackedReviewBytes = 1_000_000;
const resolvedCommands = new Map();

function cleanupLock() {
  if (!lockOwned) return;
  try {
    rmSync(lockPath, { force: true });
  } finally {
    lockOwned = false;
  }
}

process.once("exit", cleanupLock);
process.once("SIGINT", () => {
  cleanupLock();
  process.exit(130);
});
process.once("SIGTERM", () => {
  cleanupLock();
  process.exit(143);
});

function fail(message, exitCode = 1) {
  cleanupLock();
  console.error(`BLOCKED: ${message}`);
  process.exit(exitCode);
}

function resolveCommand(command) {
  if (process.platform !== "win32" || path.isAbsolute(command) || command.includes("/") || command.includes("\\")) {
    return command;
  }
  if (resolvedCommands.has(command)) return resolvedCommands.get(command);

  const lookup = spawnSync("where.exe", [command], {
    encoding: "utf8",
    windowsHide: true,
  });
  const candidates =
    lookup.status === 0
      ? lookup.stdout.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
      : [];
  const resolved =
    candidates.find((candidate) => /\.(exe|cmd|bat)$/i.test(candidate)) ??
    candidates[0] ??
    null;
  const value = resolved || command;
  resolvedCommands.set(command, value);
  return value;
}

function run(command, args, options = {}) {
  const result = spawnSync(resolveCommand(command), args, {
    cwd: repoRoot,
    encoding: "utf8",
    input: options.input,
    maxBuffer: 10 * 1024 * 1024,
    timeout: options.timeout,
    killSignal: "SIGTERM",
    windowsHide: true,
  });

  if (result.error) {
    return {
      status: 1,
      stdout: result.stdout ?? "",
      stderr: `${result.stderr ?? ""}\n${result.error.message}`.trim(),
    };
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function runGitRaw(args) {
  const result = run("git", args);
  if (result.status !== 0) {
    fail(`git ${args.join(" ")} failed: ${result.stderr.trim()}`);
  }
  return result.stdout.replace(/\r?\n$/, "");
}

function runGit(args) {
  return runGitRaw(args).trim();
}

function collectProjectContext() {
  const files = ["AGENTS.md", "REQUIREMENTS.md", "DECISIONS.md", "HANDOFF.md", "AGENT_RELAY.md"];
  return files
    .map((file) => `--- ${file} ---\n${readFileSync(path.join(repoRoot, file), "utf8")}`)
    .join("\n\n");
}

function parseAllowedPaths(taskText) {
  const scopeSection = taskText
    .split(/\r?\n##\s+/)
    .find((section) => /^Scope\s*\r?\n/i.test(section));
  if (!scopeSection) return { paths: [], invalid: [] };

  const scope = scopeSection.replace(/^Scope\s*\r?\n/i, "");
  const paths = [];
  const invalid = [];
  for (const line of scope.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)) {
    const match = /^[-*]\s+(?:`([^`]+)`|([^\s`]+))$/.exec(line);
    const candidate = (match?.[1] ?? match?.[2] ?? "").replaceAll("\\", "/").replace(/^\.\//, "");
    if (!/^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*\/?$/.test(candidate) ||
        candidate.split("/").includes("..") || candidate === "." || candidate === "/") {
      invalid.push(line);
      continue;
    }
    paths.push(candidate);
  }
  return { paths: [...new Set(paths)], invalid };
}

function isForbiddenPath(file) {
  const parts = file.split("/");
  return parts.some((part) => /^\.env(?:\.|$)/i.test(part)) ||
    file === ".git" || file.startsWith(".git/") ||
    file === "supabase" || file.startsWith("supabase/") ||
    file === ".agent-sync/TASK.md" || file.startsWith(".agent-sync/runtime/");
}

function findUnexpectedPaths(changedPaths, allowedPaths) {
  return changedPaths.filter((file) =>
    isForbiddenPath(file) ||
    !allowedPaths.some((allowed) =>
      allowed.endsWith("/") ? file.startsWith(allowed) : file === allowed
    )
  );
}

function firstDecision(report) {
  const firstLine = report.trimStart().split(/\r?\n/, 1)[0]?.trim() ?? "";
  return /^RELAY_DECISION: (PASS|REVISE|BLOCKED)$/.exec(firstLine)?.[1] ?? null;
}

function firstWriterStatus(report) {
  const firstLine = report.trimStart().split(/\r?\n/, 1)[0]?.trim() ?? "";
  return /^RELAY_STATUS: (READY_FOR_REVIEW|BLOCKED)$/.exec(firstLine)?.[1] ?? null;
}

function changedPaths() {
  const tracked = runGitRaw(["diff", "--name-only", "--no-renames", "-z", "HEAD"])
    .split("\0").filter(Boolean);
  const untracked = runGitRaw(["ls-files", "--others", "--exclude-standard", "-z"])
    .split("\0").filter(Boolean);
  return [...new Set([...tracked, ...untracked])]
    .filter((file) => file !== ".agent-sync/TASK.md" && !file.startsWith(".agent-sync/runtime/"));
}

function nonRegularChangedPaths(paths) {
  return paths.filter((file) => {
    const absolute = path.join(repoRoot, file);
    try {
      return !lstatSync(absolute).isFile();
    } catch (error) {
      if (error.code === "ENOENT") return false; // A tracked deletion is safe to review.
      throw error;
    }
  });
}

function envMetadata() {
  const metadata = new Map();
  const pending = [repoRoot];
  while (pending.length) {
    const directory = pending.pop();
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(repoRoot, absolute).replaceAll("\\", "/");
      if (entry.isDirectory()) {
        if (entry.name === ".git" || entry.name === "node_modules" ||
            relative === ".agent-sync/runtime" || entry.name === "dist") continue;
        pending.push(absolute);
      }
      if (/^\.env(?:\.|$)/i.test(entry.name)) {
        const stat = lstatSync(absolute);
        metadata.set(relative, `${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}:${stat.mode}`);
      }
    }
  }
  return metadata;
}

function changedEnvPaths(before, after) {
  return [...new Set([...before.keys(), ...after.keys()])]
    .filter((file) => before.get(file) !== after.get(file));
}

function collectReviewDiff() {
  const trackedDiff = runGit([
    "diff",
    "HEAD",
    "--no-ext-diff",
    "--binary",
    "--",
    ".",
    ":(exclude).agent-sync/TASK.md",
    ":(exclude).agent-sync/runtime/**",
  ]);
  const untracked = runGit(["ls-files", "--others", "--exclude-standard"])
    .split("\n")
    .filter(Boolean)
    .filter((file) => file !== ".agent-sync/TASK.md" && !file.startsWith(".agent-sync/runtime/"));
  const additions = [];
  let unsafe = /^(?:GIT binary patch|Binary files .* differ)$/m.test(trackedDiff);

  for (const file of untracked) {
    const absolutePath = path.join(repoRoot, file);
    const fileStat = lstatSync(absolutePath);
    if (!fileStat.isFile()) {
      unsafe = true;
      additions.push(`--- UNTRACKED NON-REGULAR FILE: ${file} ---`);
      continue;
    }
    const size = fileStat.size;
    if (size > maxUntrackedReviewBytes) {
      unsafe = true;
      additions.push(`--- UNTRACKED LARGE FILE: ${file} (${size} bytes; content omitted) ---`);
      continue;
    }
    const buffer = readFileSync(absolutePath);
    if (buffer.includes(0)) {
      unsafe = true;
      additions.push(`--- UNTRACKED BINARY FILE: ${file} (${buffer.length} bytes) ---`);
      continue;
    }
    additions.push(`--- UNTRACKED FILE: ${file} ---\n${buffer.toString("utf8")}`);
  }

  return { text: [trackedDiff, ...additions].filter(Boolean).join("\n\n"), unsafe };
}

function writeText(filePath, content) {
  writeFileSync(filePath, `${content.trim()}\n`, "utf8");
}

function truncate(value, limit) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}\n\n[TRUNCATED BY RELAY]`;
}

function timestamp() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function saveState(runDir, state) {
  writeFileSync(
    path.join(runDir, "state.json"),
    `${JSON.stringify(state, null, 2)}\n`,
    "utf8",
  );
}

function isAllowedDirtyPath(line) {
  const filePath = line.slice(3).replaceAll("\\", "/");
  return filePath === ".agent-sync/TASK.md" || filePath.startsWith(".agent-sync/runtime/");
}

function ensureCommand(command) {
  const probe = run(command, ["--version"]);
  if (probe.status !== 0) {
    fail(`${command} is not installed, not on PATH, or not signed in correctly. ${probe.stderr.trim()}`);
  }
}

function runCodex(prompt, outputPath) {
  const result = run(
    process.env.CODEX_BIN || "codex",
    [
      "exec",
      "--sandbox",
      "read-only",
      "--output-last-message",
      outputPath,
      "-",
    ],
    { input: truncate(prompt, maxPromptChars), timeout: 16 * 60 * 1000 },
  );

  if (result.status !== 0) {
    writeText(`${outputPath}.stderr.log`, result.stderr || "Codex failed without stderr output.");
    fail(`Codex failed. See ${path.relative(repoRoot, `${outputPath}.stderr.log`)}`);
  }

  if (!existsSync(outputPath)) {
    writeText(outputPath, result.stdout || "Codex returned no final message.");
  }

  return readFileSync(outputPath, "utf8");
}

function runAntigravity(prompt, outputPath) {
  const result = run(
    process.env.AGY_BIN || "agy",
    [
      "-p",
      truncate(prompt, maxPromptChars),
      "--mode=accept-edits",
      "--output-format",
      "text",
      "--print-timeout",
      "15m",
    ],
    { timeout: 16 * 60 * 1000 },
  );
  writeText(outputPath, result.stdout || "Antigravity returned no standard output.");

  if (result.stderr.trim()) {
    writeText(`${outputPath}.stderr.log`, result.stderr);
  }
  if (result.status !== 0) {
    fail(`Antigravity failed. See ${path.relative(repoRoot, outputPath)}`);
  }

  return result.stdout;
}

function runNpm(args, options = {}) {
  const resolvedNpm = resolveCommand("npm");
  const npmCliCandidates = [
    process.env.npm_execpath,
    path.join(path.dirname(resolvedNpm), "node_modules", "npm", "bin", "npm-cli.js"),
  ].filter(Boolean);
  const npmCli = npmCliCandidates.find((candidate) => existsSync(candidate));

  if (!npmCli) {
    return {
      status: 1,
      stdout: "",
      stderr: "Unable to locate npm-cli.js for deterministic verification.",
    };
  }

  return run(process.execPath, [npmCli, ...args], options);
}

function verification(runDir, round) {
  const commands = [
    ["lint", ["run", "lint"]],
    ["test", ["run", "test"]],
    ["build", ["run", "build"]],
  ];
  const summaries = [];
  const details = [];
  let passed = true;

  for (const [name, args] of commands) {
    const result = runNpm(args, { timeout: 10 * 60 * 1000 });
    const log = [`$ npm ${args.join(" ")}`, result.stdout, result.stderr]
      .filter(Boolean)
      .join("\n");
    writeText(path.join(runDir, `round-${round}-${name}.log`), log);
    summaries.push(`${name}: ${result.status === 0 ? "PASS" : "FAIL"}`);
    if (result.status !== 0) {
      passed = false;
      details.push(`--- ${name} failure ---\n${truncate(log, 6_000)}`);
    }
  }

  return {
    passed,
    summary: summaries.join("\n"),
    details: details.length > 0 ? details.join("\n\n") : "No failed checks.",
  };
}

if (!Number.isInteger(maxRounds) || maxRounds < 1 || maxRounds > 3) {
  fail("--max-rounds must be an integer from 1 to 3.", 2);
}

if (!existsSync(path.join(repoRoot, "package.json")) || !existsSync(taskPath)) {
  fail("Run the relay from the MonkChat Guide repository root.");
}

const branch = runGit(["branch", "--show-current"]);
if (!branch || branch === "main" || branch === "master") {
  fail("The relay refuses to run on main, master, or a detached HEAD. Create a feature branch first.");
}
const baselineHead = runGit(["rev-parse", "HEAD"]);

const taskOriginal = readFileSync(taskPath, "utf8");
const task = taskOriginal.trim();
const { paths: allowedPaths, invalid: invalidScopeLines } = parseAllowedPaths(task);
const taskIsTemplate =
  !task ||
  task.includes("Replace this template") ||
  task.includes("Describe the exact result you want");
if (execute && taskIsTemplate) {
  fail("Complete .agent-sync/TASK.md before starting the relay.");
}
if (execute && invalidScopeLines.length > 0) {
  fail("## Scope must contain only bullet lines with one exact path each. Move prohibitions to ## Out of Scope.");
}
if (execute && allowedPaths.length === 0) {
  fail("List explicit file paths under ## Scope in .agent-sync/TASK.md before starting the relay.");
}
if (execute && allowedPaths.some(isForbiddenPath)) {
  fail("The task scope includes a prohibited path (.env, .git, Supabase, or relay runtime).");
}

const dirtyLines = runGitRaw(["status", "--porcelain"])
  .split("\n")
  .filter(Boolean);
const unexpectedDirty = dirtyLines.filter((line) => !isAllowedDirtyPath(line));

const planPreview = {
  mode: execute ? "execute" : "dry-run",
  branch,
  maxRounds,
  taskPath: path.relative(repoRoot, taskPath),
  taskReady: !taskIsTemplate && allowedPaths.length > 0,
  allowedPaths,
  codexRole: "read-only planner and reviewer",
  antigravityRole: "sole source-code writer",
  checks: ["npm run lint", "npm run test", "npm run build"],
  stopBefore: ["commit", "push", "merge", "deploy", "Supabase", "Cloudflare"],
};

console.log(JSON.stringify(planPreview, null, 2));

if (!execute) {
  if (taskIsTemplate) {
    console.log("NEXT: complete .agent-sync/TASK.md before using --execute.");
  }
  console.log("DRY RUN COMPLETE: no agent was invoked and no project file was changed.");
  process.exit(0);
}

if (unexpectedDirty.length > 0) {
  fail(`Unexpected working-tree changes exist:\n${unexpectedDirty.join("\n")}`);
}

ensureCommand(process.env.CODEX_BIN || "codex");
ensureCommand(process.env.AGY_BIN || "agy");

mkdirSync(runtimeRoot, { recursive: true });
if (existsSync(lockPath)) {
  fail("A relay lock already exists. Confirm no relay is running before removing it manually.");
}

writeText(lockPath, JSON.stringify({ pid: process.pid, branch, startedAt: new Date().toISOString() }));
lockOwned = true;
const runDir = path.join(runtimeRoot, timestamp());
mkdirSync(runDir, { recursive: true });
writeText(path.join(runDir, "task.md"), task);
const envBefore = envMetadata();

const state = {
  status: "running",
  branch,
  maxRounds,
  startedAt: new Date().toISOString(),
  completedAt: null,
  round: 0,
};
saveState(runDir, state);

const projectContext = truncate(collectProjectContext(), 55_000);
const safetyRules = `
Permanent constraints:
- Read AGENTS.md, REQUIREMENTS.md, DECISIONS.md, HANDOFF.md, and AGENT_RELAY.md first.
- Never commit, push, pull, merge, rebase, reset, stash, switch branches, create tags, or deploy.
- Never access or modify production, Supabase, Cloudflare, .env files, credentials, secrets, or billing.
- Never add paid APIs, install dependencies, run migrations, publish content, or perform broad deletion.
- Stay on the current branch and inside this repository.
- Respect the task scope. If the task requires a prohibited action or missing owner decision, report BLOCKED.
`;
const codexSafetyRules = safetyRules.replace(
  "- Read AGENTS.md, REQUIREMENTS.md, DECISIONS.md, HANDOFF.md, and AGENT_RELAY.md first.",
  "- The mandatory project documents are supplied below. Do not call tools, run commands, or inspect files.",
);

try {
  const planPath = path.join(runDir, "codex-plan.md");
  const planPrompt = `
You are the read-only planner for MonkChat Guide. Do not edit files or call tools.
${codexSafetyRules}

Mandatory project documents:
${projectContext}

Current task:
${task}

Return a concise implementation plan for Antigravity containing:
1. files or areas to inspect;
2. ordered implementation steps;
3. acceptance checks;
4. explicit non-goals and safety stops.
`;
  const plan = runCodex(planPrompt, planPath);
  let feedback = "No previous review. Follow the approved plan.";

  for (let round = 1; round <= maxRounds; round += 1) {
    state.round = round;
    saveState(runDir, state);

    const antigravityPath = path.join(runDir, `round-${round}-antigravity.md`);
    const implementationPrompt = `
You are the sole source-code writer for this relay round.
${safetyRules}

Task:
${task}

Codex plan:
${plan}

Latest Codex feedback:
${feedback}

Use only Antigravity's built-in workspace file reading and writing tools.
Do not use terminal, shell, command execution, Git, npm, browser, MCP, or network tools.
Read the required project documents using workspace file tools only.
Make only the requested workspace file changes.
Do not edit files under .agent-sync/runtime.
Do not run checks yourself; the relay runs deterministic checks after your edit.
Start your final response with exactly one of these lines:
RELAY_STATUS: READY_FOR_REVIEW
or
RELAY_STATUS: BLOCKED

Then summarize changed files and any remaining uncertainty.
`;
    const antigravityReport = runAntigravity(implementationPrompt, antigravityPath);

    const currentBranch = runGit(["branch", "--show-current"]);
    const currentHead = runGit(["rev-parse", "HEAD"]);
    if (currentBranch !== branch || currentHead !== baselineHead) {
      state.status = "blocked";
      state.completedAt = new Date().toISOString();
      saveState(runDir, state);
      console.log("BLOCKED: Antigravity changed the branch or created a commit, which violates the relay boundary.");
      process.exitCode = 1;
      break;
    }

    const outOfScope = findUnexpectedPaths(changedPaths(), allowedPaths);
    const nonRegular = nonRegularChangedPaths(changedPaths());
    const envChanges = changedEnvPaths(envBefore, envMetadata());
    const taskChanged = readFileSync(taskPath, "utf8") !== taskOriginal;
    if (outOfScope.length || nonRegular.length || envChanges.length || taskChanged) {
      state.status = "blocked";
      state.completedAt = new Date().toISOString();
      saveState(runDir, state);
      console.log(
        "BLOCKED: An out-of-scope, protected, or non-regular file changed. Inspect the working tree; the relay did not undo edits. " +
        [...outOfScope, ...nonRegular, ...envChanges, ...(taskChanged ? [".agent-sync/TASK.md"] : [])].join(", ")
      );
      process.exitCode = 1;
      break;
    }

    if (firstWriterStatus(antigravityReport) === "BLOCKED") {
      state.status = "blocked";
      state.completedAt = new Date().toISOString();
      saveState(runDir, state);
      console.log(`BLOCKED: Antigravity reported a blocker in round ${round}.`);
      process.exitCode = 1;
      break;
    }
    if (firstWriterStatus(antigravityReport) !== "READY_FOR_REVIEW") {
      state.status = "blocked";
      state.completedAt = new Date().toISOString();
      saveState(runDir, state);
      console.log(`BLOCKED: Antigravity did not return the required relay status in round ${round}.`);
      process.exitCode = 1;
      break;
    }

    const checks = verification(runDir, round);
    const outOfScopeAfterChecks = findUnexpectedPaths(changedPaths(), allowedPaths);
    const nonRegularAfterChecks = nonRegularChangedPaths(changedPaths());
    const envChangesAfterChecks = changedEnvPaths(envBefore, envMetadata());
    if (outOfScopeAfterChecks.length || nonRegularAfterChecks.length || envChangesAfterChecks.length ||
        readFileSync(taskPath, "utf8") !== taskOriginal) {
      state.status = "blocked";
      state.completedAt = new Date().toISOString();
      saveState(runDir, state);
      console.log("BLOCKED: Verification changed a protected, out-of-scope, or non-regular file. Inspect the working tree.");
      process.exitCode = 1;
      break;
    }
    const { text: diff, unsafe: unsafeDiff } = collectReviewDiff();
    if (diff.length > maxDiffChars || unsafeDiff) {
      state.status = "blocked";
      state.completedAt = new Date().toISOString();
      saveState(runDir, state);
      console.log("BLOCKED: The change is too large, binary, or non-regular for complete Codex review.");
      process.exitCode = 1;
      break;
    }
    const status =
      runGitRaw(["status", "--short"])
        .split("\n")
        .filter(Boolean)
        .filter((line) => !isAllowedDirtyPath(line))
        .join("\n") || "(clean outside relay task/runtime files)";
    const reviewPath = path.join(runDir, `round-${round}-codex-review.md`);
    const reviewPrompt = `
You are the read-only reviewer for MonkChat Guide. Do not edit files or call tools.
${codexSafetyRules}

Mandatory project documents:
${projectContext}

Task:
${task}

Implementation plan:
${plan}

Antigravity report:
${antigravityReport}

Deterministic checks:
${checks.summary}

Failed-check evidence:
${checks.details}

Git status:
${status}

Git diff:
${truncate(diff, maxDiffChars)}

Review correctness, scope, security, accessibility, responsive behavior, and whether the evidence satisfies the task.
The result cannot PASS if any deterministic check failed.
Start with exactly one decision line:
RELAY_DECISION: PASS
or
RELAY_DECISION: REVISE
or
RELAY_DECISION: BLOCKED
Then give concise evidence and, for REVISE, a numbered correction list for Antigravity.
`;
    feedback = runCodex(reviewPrompt, reviewPath);

    const decision = firstDecision(feedback);
    if (decision === "PASS" && checks.passed) {
      state.status = "ready_for_owner";
      state.completedAt = new Date().toISOString();
      saveState(runDir, state);
      console.log("READY FOR OWNER REVIEW: agents and checks passed. Nothing was committed, pushed, merged, or deployed.");
      break;
    }

    if (decision === "BLOCKED" || decision === null ||
        (decision === "PASS" && !checks.passed)) {
      state.status = "blocked";
      state.completedAt = new Date().toISOString();
      saveState(runDir, state);
      console.log(`BLOCKED: Codex reported a blocker in round ${round}.\n${feedback.trim()}`);
      process.exitCode = 1;
      break;
    }

    if (round === maxRounds) {
      state.status = "revision_limit";
      state.completedAt = new Date().toISOString();
      saveState(runDir, state);
      console.log("REVISION LIMIT REACHED: inspect the latest review before continuing manually.");
      process.exitCode = 2;
    }
  }
} finally {
  cleanupLock();
}
