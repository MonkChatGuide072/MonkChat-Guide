import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { classifyBlocker, eligibleTask, resultComment, resultMarker, taskMarker } from "./agent-bridge-core.mjs";

const owner = "MonkChatGuide072";
const repo = `${owner}/MonkChat-Guide`;
const sourceBranch = "chore/local-agent-relay";
const root = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".local", "share"), "MonkChatAgentBridge");
const jobs = path.join(root, "jobs");
const workerLock = path.join(root, "worker.lock");
const once = process.argv.includes("--once");
const dryRun = process.argv.includes("--dry-run");
const intervalMs = 60_000;

if (process.argv.slice(2).some((arg) => !["--once", "--dry-run"].includes(arg))) {
  throw new Error("Only --once and --dry-run are supported.");
}

function run(command, args, cwd = process.cwd(), timeout = 90_000) {
  const result = spawnSync(command, args, {
    cwd, encoding: "utf8", timeout, maxBuffer: 5 * 1024 * 1024, windowsHide: true,
  });
  if (result.error || result.status !== 0) {
    const detail = result.error?.message || result.stderr?.trim() || `exit ${result.status}`;
    throw new Error(`${path.basename(command)} failed: ${detail.slice(0, 350)}`);
  }
  return result.stdout;
}

function gh(args) { return JSON.parse(run("gh", ["api", ...args])); }

function npmCli() {
  if (process.env.npm_execpath && existsSync(process.env.npm_execpath)) return process.env.npm_execpath;
  const npm = process.platform === "win32"
    ? run("where.exe", ["npm"]).trim().split(/\r?\n/)[0]
    : run("which", ["npm"]).trim();
  const cli = path.join(path.dirname(npm), "node_modules", "npm", "bin", "npm-cli.js");
  if (!existsSync(cli)) throw new Error("npm-cli.js not found; start this worker with npm run agents:bridge.");
  return cli;
}

function readState(job) {
  const file = path.join(job, "bridge-state.json");
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
}

function saveState(job, state) {
  writeFileSync(path.join(job, "bridge-state.json"), JSON.stringify(state, null, 2) + "\n", "utf8");
}

function comments(number) {
  const entries = gh([`repos/${repo}/issues/${number}/comments?per_page=100`]);
  if (!Array.isArray(entries) || entries.length >= 100) throw new Error(`Issue #${number}: comment pagination required; inspect manually.`);
  return entries;
}

function alreadyReported(number) {
  return comments(number).some((entry) =>
    entry.user?.login?.toLowerCase() === owner.toLowerCase() &&
    entry.body?.startsWith(resultMarker(number)));
}

function postResult(number, state, job) {
  if (!alreadyReported(number)) {
    // Arguments are passed directly to gh. Issue text is never interpreted as a shell command.
    run("gh", ["api", `repos/${repo}/issues/${number}/comments`, "-X", "POST", "-f", `body=${resultComment(number, state.result)}`]);
  }
  saveState(job, { ...state, phase: "reported" });
}

function changedFiles(checkout) {
  const tracked = run("git", ["diff", "--name-only", "--no-renames", "-z", "HEAD"], checkout);
  const untracked = run("git", ["ls-files", "--others", "--exclude-standard", "-z"], checkout);
  return [...new Set((tracked + untracked).split("\0").filter(Boolean))]
    .filter((file) =>
      file !== ".agent-sync/TASK.md" && !file.startsWith(".agent-sync/runtime/"));
}

function relayEvidence(checkout) {
  const runtime = path.join(checkout, ".agent-sync", "runtime");
  const dirs = existsSync(runtime) ? readdirSync(runtime, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(path.join(runtime, entry.name, "state.json")))
    .map((entry) => entry.name).sort() : [];
  const dir = dirs.length ? path.join(runtime, dirs.at(-1)) : null;
  const state = dir ? JSON.parse(readFileSync(path.join(dir, "state.json"), "utf8")) : {};
  const round = state.round || 0;
  const checks = Object.fromEntries(["lint", "test", "build"].map((name) => {
    const log = dir && path.join(dir, `round-${round}-${name}.log`);
    return [name, log && existsSync(log) ? "completed (see local log)" : "not reached"];
  }));
  const reviewFile = dir && path.join(dir, `round-${round}-codex-review.md`);
  const firstLine = reviewFile && existsSync(reviewFile)
    ? readFileSync(reviewFile, "utf8").trimStart().split(/\r?\n/, 1)[0] : "";
  const review = /^RELAY_DECISION: (PASS|REVISE|BLOCKED)$/.test(firstLine)
    ? firstLine : "not reached";
  const agentStderr = dir && round ? path.join(dir, `round-${round}-antigravity.md.stderr.log`) : null;
  const blocker = state.status === "blocked" && agentStderr && existsSync(agentStderr)
    ? classifyBlocker(readFileSync(agentStderr, "utf8").slice(-4096)) : null;
  if (state.status === "ready_for_owner") {
    for (const name of ["lint", "test", "build"]) checks[name] = "PASS";
  }
  return { status: state.status || "blocked", round, checks, review, blocker };
}

function executeIssue(issue, job) {
  const checkout = path.join(job, "checkout");
  const task = issue.body.slice(taskMarker.length).trim() + "\n";
  saveState(job, { phase: "running", issue: issue.number, taskHash: createHash("sha256").update(task).digest("hex") });
  run("git", ["clone", "--single-branch", "--branch", sourceBranch,
    `https://github.com/${repo}.git`, checkout], root, 180_000);
  const baseCommit = run("git", ["rev-parse", "HEAD"], checkout).trim();
  run("git", ["switch", "-c", `bridge/issue-${issue.number}`], checkout);
  mkdirSync(path.join(checkout, ".agent-sync"), { recursive: true });
  writeFileSync(path.join(checkout, ".agent-sync", "TASK.md"), task, "utf8");
  run(process.execPath, [npmCli(), "ci"], checkout, 10 * 60_000);
  // Relay can exit nonzero on a legitimate blocked/revision result; inspect its state below.
  const relay = spawnSync(process.execPath, ["scripts/agent-relay.mjs", "--execute"], {
    cwd: checkout, encoding: "utf8", timeout: 50 * 60_000,
    maxBuffer: 5 * 1024 * 1024, windowsHide: true,
  });
  if (relay.error) throw new Error(`relay failed: ${relay.error.message}`);
  const evidence = relayEvidence(checkout);
  if (relay.status !== 0 && evidence.status === "ready_for_owner") evidence.status = "blocked";
  return { ...evidence, baseCommit, files: changedFiles(checkout) };
}

function processIssue(issue) {
  const job = path.join(jobs, `issue-${issue.number}`);
  if (existsSync(job)) {
    const prior = readState(job);
    if (prior?.phase === "reported") return;
    if (prior?.phase === "report_pending") {
      postResult(issue.number, prior, job);
      return;
    }
    // Never repeat a partially completed job or overwrite files left by an agent.
    const checkout = path.join(job, "checkout");
    const result = {
      status: "blocked", baseCommit: "interrupted", round: 0, files: [],
      ...relayEvidence(checkout),
    };
    result.status = "blocked";
    const state = { phase: "report_pending", issue: issue.number, result };
    saveState(job, state);
    postResult(issue.number, state, job);
    console.error(`Issue #${issue.number}: interrupted local job at ${job}; inspect manually.`);
    return;
  }
  mkdirSync(job, { recursive: true });
  let result;
  try {
    result = executeIssue(issue, job);
  } catch (error) {
    const checkout = path.join(job, "checkout");
    let baseCommit = "clone failed";
    let files = [];
    if (existsSync(path.join(checkout, ".git"))) {
      try { baseCommit = run("git", ["rev-parse", "HEAD"], checkout).trim(); } catch { /* keep failure summary */ }
      try { files = changedFiles(checkout); } catch { /* keep failure summary */ }
    }
    result = {
      ...relayEvidence(checkout), status: "blocked",
      baseCommit, files,
    };
    console.error(`Issue #${issue.number}: ${error.message}`);
  }
  const state = { phase: "report_pending", issue: issue.number, result };
  saveState(job, state);
  postResult(issue.number, state, job);
  console.log(`Issue #${issue.number}: ${result.status}; local checkout: ${path.join(job, "checkout")}`);
}

function poll() {
  const account = gh(["user"]);
  if (account.login?.toLowerCase() !== owner.toLowerCase()) {
    throw new Error(`gh is signed in as ${account.login || "unknown"}; expected ${owner}.`);
  }
  const entries = gh([`repos/${repo}/issues?state=open&per_page=100&sort=created&direction=asc`]);
  if (!Array.isArray(entries) || entries.length >= 100) throw new Error("Issue pagination required; inspect queue manually.");
  const next = entries.find((issue) => {
    if (!eligibleTask(issue, owner)) return false;
    const state = readState(path.join(jobs, `issue-${issue.number}`));
    if (state?.phase === "reported") return false;
    if (state?.phase === "report_pending") return true;
    if (existsSync(path.join(jobs, `issue-${issue.number}`))) return true;
    return !alreadyReported(issue.number);
  });
  if (!next) return console.log("No pending owner-authored relay task.");
  if (dryRun) return console.log(`Eligible task #${next.number}: ${next.title} (dry run; no agent invoked)`);
  processIssue(next);
}

mkdirSync(jobs, { recursive: true });
mkdirSync(workerLock); // An existing or stale lock requires owner inspection; never start a second worker.
process.once("exit", () => { try { rmdirSync(workerLock); } catch { /* leave lock for inspection */ } });
console.log(`MonkChat agent bridge: ${repo}; source ${sourceBranch}; poll ${intervalMs / 1000}s`);
try { poll(); } catch (error) { console.error(error.message); if (once || dryRun) process.exitCode = 1; }
if (!once && !dryRun) setInterval(() => {
  try { poll(); } catch (error) { console.error(error.message); }
}, intervalMs);
