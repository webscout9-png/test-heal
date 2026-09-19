import type { DiagnoseInput } from "../schemas.js";
import {
  DIAGNOSE_SYSTEM_PROMPT,
  buildDiagnoseUserPrompt,
} from "../prompts.js";

/**
 * diagnose_test_failure (v0.3)
 * Returns a complete reasoning package + next_actions for the host agent.
 */
export function diagnoseTestFailure(input: DiagnoseInput) {
  const userPrompt = buildDiagnoseUserPrompt(input);

  return {
    protocol: "test-heal/diagnose",
    version: "0.3.0",
    instruction:
      "Execute the system_prompt + user_prompt with your own model. " +
      "Produce ONLY the required JSON. Do not add extra commentary. " +
      "After you have the diagnosis, follow the next_actions.",
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
    next_actions: [
      {
        action: "propose_minimal_fix",
        when: "After you have a clear highest-confidence root cause (confidence_overall >= 0.6)",
        note: "Pass the diagnosis object you just produced as the 'diagnosis' argument.",
      },
      {
        action: "gather_more_context",
        when: "If confidence_overall < 0.5 or evidence is weak",
        note: "Request additional source files, a longer stack trace, or the git diff, then re-call diagnose_test_failure.",
      },
    ],
    anti_patterns_to_avoid: [
      "Do not invent files or code that were not provided",
      "Do not blame the test framework without evidence",
      "Do not give high confidence when context is incomplete",
    ],
  };
}
