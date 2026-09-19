import type { ProposeFixInput } from "../schemas.js";
import {
  PROPOSE_FIX_SYSTEM_PROMPT,
  buildProposeFixUserPrompt,
} from "../prompts.js";

/**
 * propose_minimal_fix (v0.3)
 * Returns a reasoning package that forces surgical edits + next_actions.
 */
export function proposeMinimalFix(input: ProposeFixInput) {
  const userPrompt = buildProposeFixUserPrompt(input);

  return {
    protocol: "test-heal/propose-minimal-fix",
    version: "0.3.0",
    instruction:
      "Execute the system_prompt + user_prompt with your own model. " +
      "Produce ONLY the required JSON containing a minimal unified diff. " +
      "Respect all STOP CONDITIONS. After generating the patch, follow next_actions.",
    system_prompt: PROPOSE_FIX_SYSTEM_PROMPT,
    user_prompt: userPrompt,
    required_output_schema: {
      patch: "string (unified diff)",
      explanation: "string",
      confidence: "number (0-1)",
      files_changed: ["string"],
      risk_level: "low | medium | high",
      remaining_risks: ["string (optional)"],
    },
    next_actions: [
      {
        action: "assess_fix_safety",
        when: "Always recommended before applying the patch, especially if risk_level is medium or high",
        note: "Pass the generated patch and the same source_files.",
      },
      {
        action: "apply_and_retest",
        when: "Only after assess_fix_safety returns safe_to_apply or you have carefully reviewed a medium-risk patch",
        note: "Apply the unified diff, then re-run the failing test(s).",
      },
    ],
    anti_patterns_to_avoid: [
      "Do not change the test just to make it pass if the implementation is wrong",
      "Do not rewrite large sections when a surgical edit will do",
      "Do not invent new helper functions that do not exist",
      "Do not touch files outside the provided source_files unless strictly required",
    ],
  };
}
