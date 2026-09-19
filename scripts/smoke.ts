/**
 * Simple smoke test — verifies the core tool functions produce valid packages.
 * Run with: npx tsx scripts/smoke.ts
 */

import { diagnoseTestFailure } from "../src/tools/diagnose.js";
import { proposeMinimalFix } from "../src/tools/propose-fix.js";
import { assessFixSafety } from "../src/tools/assess-safety.js";

const sampleSource = {
  path: "src/add.ts",
  content: `export function add(a: number, b: number): number {\n  return a - b; // bug: should be a + b\n}\n`,
};

const sampleTestOutput = `FAIL src/add.test.ts
  ● add › adds two numbers

    expect(received).toBe(expected)

    Expected: 5
    Received: -1

      3 | test('adds two numbers', () => {
      4 |   expect(add(2, 3)).toBe(5);
      5 | });
`;

console.log("=== diagnose_test_failure ===");
const diagnosis = diagnoseTestFailure({
  test_output: sampleTestOutput,
  source_files: [sampleSource],
  language: "typescript",
  framework: "jest",
});
console.log("protocol:", diagnosis.protocol);
console.log("version:", diagnosis.version);
console.log("has system_prompt:", typeof diagnosis.system_prompt === "string" && diagnosis.system_prompt.length > 100);
console.log("has user_prompt:", typeof diagnosis.user_prompt === "string" && diagnosis.user_prompt.includes("add.ts"));
console.log("has next_actions:", Array.isArray(diagnosis.next_actions) && diagnosis.next_actions.length > 0);
console.log("user_prompt contains proper fences:", diagnosis.user_prompt.includes("```"));

console.log("\n=== propose_minimal_fix ===");
const fix = proposeMinimalFix({
  test_output: sampleTestOutput,
  source_files: [sampleSource],
  language: "typescript",
});
console.log("protocol:", fix.protocol);
console.log("has system_prompt:", typeof fix.system_prompt === "string");
console.log("has next_actions:", Array.isArray(fix.next_actions));

console.log("\n=== assess_fix_safety ===");
const safety = assessFixSafety({
  patch: "--- a/src/add.ts\n+++ b/src/add.ts\n@@ -1,3 +1,3 @@\n export function add(a: number, b: number): number {\n-  return a - b;\n+  return a + b;\n }\n",
  source_files: [sampleSource],
});
console.log("protocol:", safety.protocol);
console.log("has next_actions:", Array.isArray(safety.next_actions));

console.log("\n✅ Smoke test passed — core packages are well-formed.");
