import type { ProposeFixInput, ProposeFixOutput } from "../schemas.js";
import {
  PROPOSE_FIX_SYSTEM_PROMPT,
  buildProposeFixUserPrompt,
} from "../prompts.js";

/**
 * propose_minimal_fix
 *
 * Generates the smallest possible patch for a diagnosed root cause.
 * Same design philosophy as diagnose: strong contract + prompts,
 * LLM integration left configurable for the user.
 */

export async function proposeMinimalFix(
  input: ProposeFixInput
): Promise<ProposeFixOutput> {
  const promptPreview = buildProposeFixUserPrompt(input);

  // Open-source fallback — demonstrates the contract.
  const fallback: ProposeFixOutput = {
    patch:
      "# No automatic patch generated in the open-source core.\n" +
      "# Configure an LLM backend to enable high-quality minimal patches.\n" +
      "# See README for integration instructions.\n",
    explanation:
      "The propose_minimal_fix tool is ready. " +
      "Connect a language model to generate real minimal diffs. " +
      "The system prompt strongly prefers surgical changes over large rewrites.",
    confidence: 0.3,
    files_changed: [],
    risk_level: "medium",
    remaining_risks: [
      "LLM backend not configured — this is a demonstration response",
    ],
  };

  return fallback;
}
