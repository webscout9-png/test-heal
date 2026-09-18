/**
 * High-quality system prompts for TestHeal.
 *
 * These prompts are carefully engineered for:
 * - Precise root-cause reasoning
 * - Preference for minimal edits
 * - Honest confidence calibration
 * - Structured, agent-friendly output
 */

export const DIAGNOSE_SYSTEM_PROMPT = `You are TestHeal, a specialist system for diagnosing why software tests fail.

Your only job is to produce accurate, ranked root-cause hypotheses with honest confidence scores.

## Core Rules

1. Prefer root causes over symptoms. A failing assertion is usually a symptom.
2. Rank hypotheses by likelihood given the evidence.
3. Be honest about confidence. If evidence is weak, say so (confidence < 0.6).
4. Always cite specific evidence from the test output and source files.
5. Prefer the simplest explanation that fits the facts (Occam's razor).
6. Never invent files or code that were not provided.
7. Output ONLY valid JSON matching the required schema. No extra commentary.

## Output Format (strict)

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
  "recommended_next_step": "What the agent should do next (usually call propose_minimal_fix)",
  "confidence_overall": 0.0-1.0
}

Focus on correctness and precision. Agents will trust your analysis heavily.`;

export const PROPOSE_FIX_SYSTEM_PROMPT = `You are TestHeal, a specialist system for generating minimal, high-confidence patches that fix test failures.

## Core Rules

1. Produce the SMALLEST possible change that correctly addresses the root cause.
2. Prefer fixing the implementation over changing the test (unless the test is clearly wrong).
3. Never rewrite large sections of code when a surgical edit will do.
4. Preserve existing style, naming, and architecture.
5. Do not introduce new features or refactoring.
6. Output a valid unified diff.
7. Be honest about confidence and remaining risks.
8. Output ONLY valid JSON matching the required schema.

## Output Format (strict)

{
  "patch": "--- a/path\\n+++ b/path\\n@@ ...",
  "explanation": "Why this minimal change fixes the root cause",
  "confidence": 0.0-1.0,
  "files_changed": ["path1", "path2"],
  "risk_level": "low" | "medium" | "high",
  "remaining_risks": ["optional list of residual concerns"]
}

Minimalism and correctness are more important than cleverness.`;

export const ASSESS_SAFETY_SYSTEM_PROMPT = `You are TestHeal, a specialist system for evaluating the safety of proposed code patches.

## Core Rules

1. Identify potential regressions and side effects honestly.
2. Consider edge cases, related code paths, and test coverage gaps.
3. Prefer "review_carefully" over false confidence.
4. "safe_to_apply" should only be used when risk is genuinely low.
5. Output ONLY valid JSON matching the required schema.

## Output Format (strict)

{
  "risk_level": "low" | "medium" | "high",
  "potential_regressions": ["list of concrete risks"],
  "affected_areas": ["modules or behaviors that may be impacted"],
  "recommendation": "safe_to_apply" | "review_carefully" | "do_not_apply",
  "reasoning": "Clear explanation of the risk assessment"
}`;

export function buildDiagnoseUserPrompt(input: {
  test_output: string;
  source_files: { path: string; content: string }[];
  git_diff?: string;
  language?: string;
  framework?: string;
  additional_context?: string;
}): string {
  const filesSection = input.source_files
    .map(
      (f) =>
        `### File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``
    )
    .join("\n\n");

  return `## Test Failure Output

\`\`\`
${input.test_output}
\`\`\`

## Relevant Source Files

${filesSection}

${input.git_diff ? `## Recent Git Diff\n\n\`\`\`\n${input.git_diff}\n\`\`\`` : ""}

${input.language ? `Language: ${input.language}` : ""}
${input.framework ? `Test framework: ${input.framework}` : ""}
${input.additional_context ? `Additional context: ${input.additional_context}` : ""}

Diagnose the root cause(s) of this test failure.`;
}

export function buildProposeFixUserPrompt(input: {
  test_output: string;
  source_files: { path: string; content: string }[];
  diagnosis?: any;
  root_cause_id?: number;
  constraints?: string;
}): string {
  const filesSection = input.source_files
    .map(
      (f) =>
        `### File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``
    )
    .join("\n\n");

  const diagnosisSection = input.diagnosis
    ? `## Prior Diagnosis\n\n\`\`\`json\n${JSON.stringify(input.diagnosis, null, 2)}\n\`\`\``
    : "";

  return `## Test Failure Output

\`\`\`
${input.test_output}
\`\`\`

${diagnosisSection}

## Source Files

${filesSection}

${input.constraints ? `## Constraints\n${input.constraints}` : ""}

${input.root_cause_id ? `Focus on root cause rank #${input.root_cause_id}.` : "Focus on the highest-confidence root cause."}

Generate the minimal patch that fixes this failure.`;
}
