import type { AssessSafetyInput, AssessSafetyOutput } from "../schemas.js";
import { ASSESS_SAFETY_SYSTEM_PROMPT } from "../prompts.js";

/**
 * assess_fix_safety
 *
 * Evaluates the risk of applying a proposed patch.
 */

export async function assessFixSafety(
  input: AssessSafetyInput
): Promise<AssessSafetyOutput> {
  // Open-source fallback
  const fallback: AssessSafetyOutput = {
    risk_level: "medium",
    potential_regressions: [
      "Unable to perform deep analysis without an LLM backend",
    ],
    affected_areas: ["Unknown until full analysis is enabled"],
    recommendation: "review_carefully",
    reasoning:
      "Safety assessment requires model-backed reasoning over the patch and surrounding code. " +
      "Configure an LLM to unlock accurate risk evaluation. Always review patches before applying them.",
  };

  return fallback;
}
