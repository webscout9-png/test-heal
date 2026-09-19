import type { AssessSafetyInput } from "../schemas.js";
import {
  ASSESS_SAFETY_SYSTEM_PROMPT,
  buildAssessSafetyUserPrompt,
} from "../prompts.js";

/**
 * assess_fix_safety (v0.3)
 * Returns a reasoning package for honest risk evaluation + next_actions.
 */
export function assessFixSafety(input: AssessSafetyInput) {
  const userPrompt = buildAssessSafetyUserPrompt(input);

  return {
    protocol: "test-heal/assess-fix-safety",
    version: "0.3.0",
    instruction:
      "Execute the system_prompt + user_prompt with your own model. " +
      "Produce ONLY the required JSON. Be honest about risk. " +
      "Prefer 'review_carefully' over false confidence.",
    system_prompt: ASSESS_SAFETY_SYSTEM_PROMPT,
    user_prompt: userPrompt,
    required_output_schema: {
      risk_level: "low | medium | high",
      potential_regressions: ["string"],
      affected_areas: ["string"],
      recommendation: "safe_to_apply | review_carefully | do_not_apply",
      reasoning: "string",
    },
    next_actions: [
      {
        action: "apply_patch",
        when: "recommendation is safe_to_apply",
        note: "Apply the unified diff and re-run the relevant tests.",
      },
      {
        action: "human_review",
        when: "recommendation is review_carefully",
        note: "Present the patch + reasoning to the user before applying.",
      },
      {
        action: "reject_and_rethink",
        when: "recommendation is do_not_apply",
        note: "Do not apply. Go back to diagnose_test_failure or propose_minimal_fix with tighter constraints.",
      },
    ],
    anti_patterns_to_avoid: [
      "Do not mark a multi-file behavioral change as safe_to_apply without strong evidence",
      "Do not ignore edge cases or error-handling paths",
    ],
  };
}
