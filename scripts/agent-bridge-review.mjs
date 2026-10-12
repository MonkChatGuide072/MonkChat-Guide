import { spawnSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import path from "node:path";

const maxPatchBytes = 40_000;
const sensitive = /\b(?:password|secret|token|private.?key|service.?role|api.?key)\b|(?:sk-|ghp_|github_pat_)[A-Za-z0-9_-]{12,}|-----BEGIN [A-Z ]*PRIVATE KEY/i;

function git(checkout, args) {
  const result = spawnSync("git", args, {
    cwd: checkout, encoding: "utf8", timeout: 15_000, maxBuffer: 128 * 1024,
    windowsHide: true,
  });
  if (result.status !== 0 || typeof result.stdout !== "string") throw new Error("Unable to read a bounded Git review patch.");
  return result.stdout;
}

// Never publish raw stderr, ignored files, symlinks, binary files, or paths outside the Issue scope.
export function buildReviewPatch(checkout, scope, files) {
  try {
    if (!Array.isArray(scope) || !Array.isArray(files) || files.length < 1 || files.length > 20) return null;
    if (!files.every((file) => scope.some((allowed) =>
      allowed.endsWith("/") ? file.startsWith(allowed) : file === allowed))) return null;

    const contents = new Map();
    const decoder = new TextDecoder("utf-8", { fatal: true });
    for (const file of files) {
      let fullPath = checkout;
      for (const part of file.split("/")) {
        fullPath = path.join(fullPath, part);
        if (lstatSync(fullPath).isSymbolicLink()) return null;
      }
      const stat = lstatSync(fullPath);
      if (!stat.isFile() || stat.size > maxPatchBytes) return null;
      const bytes = readFileSync(fullPath);
      const content = decoder.decode(bytes);
      if (content.includes("\0")) return null;
      contents.set(file, content);
    }

    const tracked = new Set(git(checkout, ["ls-files", "--cached", "-z", "--", ...files]).split("\0").filter(Boolean));
    const trackedFiles = files.filter((file) => tracked.has(file));
    const untrackedFiles = files.filter((file) => !tracked.has(file));
    let patch = "";
    if (trackedFiles.length) {
      const stats = git(checkout, ["diff", "--numstat", "HEAD", "--", ...trackedFiles]);
      if (/^-\t-\t/m.test(stats)) return null;
      patch = git(checkout, ["diff", "--no-ext-diff", "--no-color", "--unified=3", "HEAD", "--", ...trackedFiles]);
    }
    for (const file of untrackedFiles) {
      const content = contents.get(file);
      if (!content || content.includes("\r")) return null;
      const lines = content.endsWith("\n") ? content.slice(0, -1).split("\n") : content.split("\n");
      patch += `diff --git a/${file} b/${file}\nnew file mode 100644\n--- /dev/null\n+++ b/${file}\n@@ -0,0 +1,${lines.length} @@\n`;
      patch += lines.map((line) => `+${line}\n`).join("");
      if (!content.endsWith("\n")) patch += "\\ No newline at end of file\n";
    }

    return patch && Buffer.byteLength(patch, "utf8") <= maxPatchBytes && !sensitive.test(patch)
      ? patch.trimEnd() : null;
  } catch {
    return null;
  }
}
