import type { ProposeFixInput } from "../schemas.js";
import {
  PROPOSE_FIX_SYSTEM_PROMPT,
  buildProposeFixUserPrompt,
} from "../prompts.js";

/**
 * propose_minimal_fix (Option C)
 *
 * Returns a reasoning package that forces the host agent
 * to generate the smallest possible high-confidence patch
 * using its own model.
 */
export function proposeMinimalFix(input: ProposeFixInput) {
  const userPrompt = buildProposeFixUserPrompt(input);

  return {
    protocol: "test-heal/propose-minimal-fix",
    version: "0.2.0",
    instruction:
      "Execute the following system prompt + user prompt with your own model. " +
      "Produce ONLY the required JSON output containing a minimal unified diff. " +
      "Strongly prefer surgical changes. After generating the patch, consider calling assess_fix_safety.",
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
    notes: [
      "Smallest possible change that correctly fixes the root cause.",
      "Prefer fixing implementation over changing the test.",
      "Do not rewrite large sections when a surgical edit will do.",
      "Preserve existing style and architecture.",
    ],
  };
}
