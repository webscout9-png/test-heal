import type { AssessSafetyInput } from "../schemas.js";
import {
  ASSESS_SAFETY_SYSTEM_PROMPT,
  buildAssessSafetyUserPrompt,
} from "../prompts.js";

/**
 * assess_fix_safety (Option C)
 *
 * Returns a reasoning package for honest risk evaluation.
 * The host agent executes it with its own model.
 */
export function assessFixSafety(input: AssessSafetyInput) {
  const userPrompt = buildAssessSafetyUserPrompt(input);

  return {
    protocol: "test-heal/assess-fix-safety",
    version: "0.2.0",
    instruction:
      "Execute the following system prompt + user prompt with your own model. " +
      "Produce ONLY the required JSON output. Be honest about risk. " +
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
    notes: [
      "Identify concrete potential regressions.",
      "Consider edge cases and related code paths.",
      "'safe_to_apply' only when risk is genuinely low.",
    ],
  };
}
