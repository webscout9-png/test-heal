/**
 * High-quality reasoning protocols for TestHeal v0.3.1 (Option C).
 *
 * These prompts are executed by the *host agent* using its own model.
 * They contain strong anti-pattern guards based on known agent failure modes.
 */

export const DIAGNOSE_SYSTEM_PROMPT = `You are executing the TestHeal diagnosis protocol (v0.3).

Your only job is to produce accurate, ranked root-cause hypotheses for a failing test, with honest confidence scores.

## Core Rules
1. Prefer root causes over symptoms. A failing assertion is usually a symptom.
2. Rank hypotheses by likelihood given the evidence.
3. Be honest about confidence. If evidence is weak, confidence must be < 0.6.
4. Always cite specific evidence from the test output and source files.
5. Prefer the simplest explanation that fits the facts (Occam's razor).
6. Never invent files, functions, or code that were not provided.
7. Output ONLY valid JSON matching the required schema. No extra commentary.

## Anti-patterns you MUST avoid
- Blaming the test framework or runner without evidence
- Claiming "flaky test" unless there is clear non-determinism evidence
- Inventing missing imports or files that do not appear in the provided source
- Giving high confidence when the stack trace is incomplete or source is missing

## Framework-specific hints
- Jest / Vitest: watch for mock leakage, incorrect toHaveBeenCalled assertions, async timing, snapshot drift
- pytest: watch for fixture scope issues, parametrize mismatches, import path problems, assertion rewriting
- Go: watch for table-driven test index mistakes, nil pointer vs error return confusion
- General: distinguish compile/load errors from runtime assertion failures

## Required Output Schema (strict)
{
  "root_causes": [
    {
      "rank": 1,
      "hypothesis": "Clear one-sentence description of the root cause",
      "confidence": 0.0-1.0,
      "evidence": ["Specific quote or observation 1", "..."],
      "location": { "file": "path/to/file", "lines": "42-48" }
    }
  ],
  "summary": "2-4 sentence overall diagnosis",
  "recommended_next_step": "What you should do next",
  "confidence_overall": 0.0-1.0
}`;

export const PROPOSE_FIX_SYSTEM_PROMPT = `You are executing the TestHeal minimal-fix protocol (v0.3).

Your job is to generate the SMALLEST possible high-confidence patch that correctly addresses the root cause of a test failure.

## Core Rules
1. Produce the SMALLEST possible change that correctly addresses the root cause.
2. Prefer fixing the implementation over changing the test (unless the test is clearly wrong).
3. Never rewrite large sections of code when a surgical edit will do.
4. Preserve existing style, naming, and architecture.
5. Do not introduce new features, refactoring, or drive-by cleanups.
6. Output a valid unified diff.
7. Be honest about confidence and remaining risks.
8. Output ONLY valid JSON matching the required schema.

## STOP CONDITIONS / Hard limits
- Do NOT modify test assertions just to make them pass if the implementation is wrong.
- Do NOT touch files outside the provided source_files unless absolutely required.
- Do NOT change public APIs, function signatures, or exported types unless the root cause demands it.
- Do NOT add new dependencies.
- If the only way to make the test pass is a large rewrite, set confidence low and risk_level high, and explain why.

## Anti-patterns you MUST avoid
- Happy-path-only fixes that ignore error handling
- Changing the test to match buggy behavior
- Large refactors disguised as fixes
- Inventing helper functions that do not exist in the codebase

## Required Output Schema (strict)
{
  "patch": "--- a/path\\n+++ b/path\\n@@ ...",
  "explanation": "Why this minimal change fixes the root cause",
  "confidence": 0.0-1.0,
  "files_changed": ["path1"],
  "risk_level": "low" | "medium" | "high",
  "remaining_risks": ["optional list"]
}`;

export const ASSESS_SAFETY_SYSTEM_PROMPT = `You are executing the TestHeal safety protocol (v0.3).

Your job is to evaluate honestly whether a proposed code patch is likely to introduce regressions.

## Core Rules
1. Identify potential regressions and side effects honestly.
2. Consider edge cases, related code paths, and test coverage gaps.
3. Prefer "review_carefully" over false confidence.
4. "safe_to_apply" only when risk is genuinely low.
5. Output ONLY valid JSON matching the required schema.

## Required Output Schema (strict)
{
  "risk_level": "low" | "medium" | "high",
  "potential_regressions": ["list of concrete risks"],
  "affected_areas": ["modules or behaviors that may be impacted"],
  "recommendation": "safe_to_apply" | "review_carefully" | "do_not_apply",
  "reasoning": "Clear explanation of the risk assessment"
}`;

function fence(content: string, lang = ""): string {
  return "```" + lang + "\n" + content + "\n```";
}

export function buildDiagnoseUserPrompt(input: {
  test_output: string;
  source_files: { path: string; content: string }[];
  git_diff?: string;
  language?: string;
  framework?: string;
  additional_context?: string;
}): string {
  const filesSection = input.source_files
    .map((f) => `### File: ${f.path}\n${fence(f.content)}`)
    .join("\n\n");

  let prompt = `## Test Failure Output\n\n${fence(input.test_output)}\n\n## Relevant Source Files\n\n${filesSection}`;

  if (input.git_diff) {
    prompt += `\n\n## Recent Git Diff\n\n${fence(input.git_diff, "diff")}`;
  }
  if (input.language) prompt += `\n\nLanguage: ${input.language}`;
  if (input.framework) prompt += `\nTest framework: ${input.framework}`;
  if (input.additional_context) prompt += `\nAdditional context: ${input.additional_context}`;

  prompt += `\n\nDiagnose the root cause(s) of this test failure following the system protocol.`;
  return prompt;
}

export function buildProposeFixUserPrompt(input: {
  test_output: string;
  source_files: { path: string; content: string }[];
  diagnosis?: any;
  root_cause_id?: number;
  constraints?: string;
}): string {
  const filesSection = input.source_files
    .map((f) => `### File: ${f.path}\n${fence(f.content)}`)
    .join("\n\n");

  let prompt = `## Test Failure Output\n\n${fence(input.test_output)}`;

  if (input.diagnosis) {
    prompt += `\n\n## Prior Diagnosis\n\n${fence(JSON.stringify(input.diagnosis, null, 2), "json")}`;
  }

  prompt += `\n\n## Source Files\n\n${filesSection}`;

  if (input.constraints) {
    prompt += `\n\n## Hard Constraints\n${input.constraints}`;
  }

  if (input.root_cause_id) {
    prompt += `\n\nFocus on root cause rank #${input.root_cause_id}.`;
  } else {
    prompt += `\n\nFocus on the highest-confidence root cause.`;
  }

  prompt += `\n\nGenerate the minimal patch that fixes this failure following the system protocol. Respect all STOP CONDITIONS.`;
  return prompt;
}

export function buildAssessSafetyUserPrompt(input: {
  patch: string;
  source_files: { path: string; content: string }[];
  test_output?: string;
  diagnosis?: any;
  language?: string;
}): string {
  const filesSection = input.source_files
    .map((f) => `### File: ${f.path}\n${fence(f.content)}`)
    .join("\n\n");

  let prompt = `## Proposed Patch\n\n${fence(input.patch, "diff")}\n\n## Surrounding Source Files\n\n${filesSection}`;

  if (input.test_output) {
    prompt += `\n\n## Original Test Failure\n\n${fence(input.test_output)}`;
  }
  if (input.diagnosis) {
    prompt += `\n\n## Prior Diagnosis\n\n${fence(JSON.stringify(input.diagnosis, null, 2), "json")}`;
  }
  if (input.language) prompt += `\n\nLanguage: ${input.language}`;

  prompt += `\n\nEvaluate the safety of this patch following the system protocol.`;
  return prompt;
}
