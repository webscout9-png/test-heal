import type { DiagnoseInput, DiagnoseOutput } from "../schemas.js";
import {
  DIAGNOSE_SYSTEM_PROMPT,
  buildDiagnoseUserPrompt,
} from "../prompts.js";

/**
 * diagnose_test_failure
 *
 * In the current open-source release we provide a strong structured
 * reasoning skeleton. The actual LLM call is left for the user to
 * configure (or can be added via environment variables).
 *
 * This design keeps the core safe, auditable, and free of hidden
 * API key requirements while still delivering high-quality prompts
 * and schemas that agents can rely on.
 *
 * Production deployments should wire this to their preferred model
 * (Claude, GPT-4o, Gemini, local models, etc.).
 */

export async function diagnoseTestFailure(
  input: DiagnoseInput
): Promise<DiagnoseOutput> {
  // Basic validation already done by Zod.

  // For the open-source core we return a carefully structured
  // placeholder that demonstrates the expected contract and
  // encourages proper LLM integration.
  //
  // Real implementations should replace the body of this function
  // with a call to an LLM using DIAGNOSE_SYSTEM_PROMPT +
  // buildDiagnoseUserPrompt(input).

  const promptPreview = buildDiagnoseUserPrompt(input);

  // Deterministic fallback for demonstration and offline use.
  // In real usage this is replaced by an LLM response.
  const fallback: DiagnoseOutput = {
    root_causes: [
      {
        rank: 1,
        hypothesis:
          "The test is failing due to a mismatch between expected and actual behavior in the code under test. A precise root cause requires LLM-backed analysis of the provided output and source.",
        confidence: 0.4,
        evidence: [
          "Test output was provided",
          `${input.source_files.length} source file(s) were supplied`,
          "This is the open-source fallback path — configure an LLM for production-grade diagnosis",
        ],
        location: input.source_files[0]
          ? { file: input.source_files[0].path }
          : undefined,
      },
    ],
    summary:
      "TestHeal received the failure context successfully. " +
      "For high-confidence root-cause analysis, connect an LLM backend " +
      "(see README). The tool schemas and prompts are production-ready.",
    recommended_next_step:
      "Configure an LLM (OPENAI_API_KEY, ANTHROPIC_API_KEY, or local model) " +
      "and re-run diagnose_test_failure, or manually inspect the failure using the provided context.",
    confidence_overall: 0.4,
  };

  // Future: real LLM call here.
  // const response = await callLLM({
  //   system: DIAGNOSE_SYSTEM_PROMPT,
  //   user: promptPreview,
  // });
  // return parseAndValidate(response);

  return fallback;
}
