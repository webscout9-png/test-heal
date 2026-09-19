#!/usr/bin/env node
/**
 * TestHeal launcher
 *
 * Runs the TypeScript source directly via tsx so that
 * `npx github:webscout9-png/test-heal` works without a pre-built dist/.
 * This is the root-cause fix for agent connection failures.
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distEntry = path.join(root, "dist", "index.js");
const srcEntry = path.join(root, "src", "index.ts");

function run(command, args) {
  const child = spawn(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: false,
  });
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 1);
  });
  child.on("error", (err) => {
    console.error("TestHeal failed to start:", err.message);
    process.exit(1);
  });
}

// Prefer compiled dist when available (faster, no tsx needed)
if (fs.existsSync(distEntry)) {
  run(process.execPath, [distEntry]);
} else if (fs.existsSync(srcEntry)) {
  // Fallback: run TypeScript source with tsx (works for npx github: installs)
  run("npx", ["--yes", "tsx", srcEntry]);
} else {
  console.error(
    "TestHeal error: neither dist/index.js nor src/index.ts found.\n" +
      "If you cloned the repo, run: npm install && npm run build"
  );
  process.exit(1);
}
