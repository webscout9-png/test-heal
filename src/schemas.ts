import { z } from "zod";

/**
 * Shared schemas for TestHeal tools.
 * Designed for maximum clarity and reliability when used by LLMs.
 */

export const SourceFileSchema = z.object({
  path: z.string().describe("Absolute or relative path to the source file"),
  content: z.string().describe("Full content of the file"),
});

export const DiagnoseInputSchema = z.object({
  test_output: z
    .string()
    .min(1)
    .describe(
      "Full test failure output including stack traces, assertion messages, and any relevant logs"
    ),
  source_files: z
    .array(SourceFileSchema)
    .min(1)
    .describe(
      "Relevant source files that may be involved in the failure. Prefer including the test file + the implementation under test."
    ),
  git_diff: z
    .string()
    .optional()
    .describe("Optional recent git diff that may have introduced the failure"),
  language: z
    .string()
    .optional()
    .describe("Programming language, e.g. typescript, python, go, java"),
  framework: z
    .string()
    .optional()
    .describe("Test framework, e.g. jest, vitest, pytest, junit, go test"),
  additional_context: z
    .string()
    .optional()
    .describe("Any extra context the agent has about the failure"),
});

export type DiagnoseInput = z.infer<typeof DiagnoseInputSchema>;

export const RootCauseSchema = z.object({
  rank: z.number(),
  hypothesis: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
  location: z
    .object({
      file: z.string(),
      lines: z.string().optional(),
    })
    .optional(),
});

export const DiagnoseOutputSchema = z.object({
  root_causes: z.array(RootCauseSchema),
  summary: z.string(),
  recommended_next_step: z.string(),
  confidence_overall: z.number().min(0).max(1),
});

export type DiagnoseOutput = z.infer<typeof DiagnoseOutputSchema>;

export const ProposeFixInputSchema = z.object({
  test_output: z.string().min(1),
  source_files: z.array(SourceFileSchema).min(1),
  diagnosis: DiagnoseOutputSchema.optional().describe(
    "Output from a previous diagnose_test_failure call. Strongly recommended."
  ),
  root_cause_id: z
    .number()
    .optional()
    .describe("Which ranked root cause to fix (1-based). Defaults to 1."),
  git_diff: z.string().optional(),
  language: z.string().optional(),
  framework: z.string().optional(),
  constraints: z
    .string()
    .optional()
    .describe(
      "Any constraints the agent must respect (e.g. 'do not change public API', 'keep existing test structure')"
    ),
});

export type ProposeFixInput = z.infer<typeof ProposeFixInputSchema>;

export const ProposeFixOutputSchema = z.object({
  patch: z.string().describe("Unified diff patch ready to apply"),
  explanation: z.string(),
  confidence: z.number().min(0).max(1),
  files_changed: z.array(z.string()),
  risk_level: z.enum(["low", "medium", "high"]),
  remaining_risks: z.array(z.string()).optional(),
});

export type ProposeFixOutput = z.infer<typeof ProposeFixOutputSchema>;

export const AssessSafetyInputSchema = z.object({
  patch: z.string().min(1).describe("The unified diff to evaluate"),
  source_files: z.array(SourceFileSchema).min(1),
  test_output: z.string().optional(),
  diagnosis: DiagnoseOutputSchema.optional(),
  language: z.string().optional(),
});

export type AssessSafetyInput = z.infer<typeof AssessSafetyInputSchema>;

export const AssessSafetyOutputSchema = z.object({
  risk_level: z.enum(["low", "medium", "high"]),
  potential_regressions: z.array(z.string()),
  affected_areas: z.array(z.string()),
  recommendation: z.enum([
    "safe_to_apply",
    "review_carefully",
    "do_not_apply",
  ]),
  reasoning: z.string(),
});

export type AssessSafetyOutput = z.infer<typeof AssessSafetyOutputSchema>;
