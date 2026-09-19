import type { DiagnoseInput } from "../schemas.js";
import {
  DIAGNOSE_SYSTEM_PROMPT,
  buildDiagnoseUserPrompt,
} from "../prompts.js";

/**
 * diagnose_test_failure (Option C)
 *
 * Returns a complete reasoning package that the host agent
 * must execute with its own model. TestHeal never calls an LLM.
 */
export function diagnoseTestFailure(input: DiagnoseInput) {
  const userPrompt = buildDiagnoseUserPrompt(input);

  return {
    protocol: "test-heal/diagnose",
    version: "0.2.0",
    instruction:
      "Execute the following system prompt + user prompt with your own model. " +
      "Produce ONLY the required JSON output. Do not add extra commentary. " +
      "After you have the diagnosis, prefer calling propose_minimal_fix next.",
    system_prompt: DIAGNOSE_SYSTEM_PROMPT,
    user_prompt: userPrompt,
    required_output_schema: {
      root_causes: [
        {
          rank: "number",
          hypothesis: "string",
          confidence: "number (0-1)",
          evidence: ["string"],
          location: { file: "string", lines: "string (optional)" },
        },
      ],
      summary: "string",
      recommended_next_step: "string",
      confidence_overall: "number (0-1)",
    },
    notes: [
      "Prefer root causes over symptoms.",
      "Be honest about confidence.",
      "Cite specific evidence.",
      "Never invent code that was not provided.",
    ],
  };
}
