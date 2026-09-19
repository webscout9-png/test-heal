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

export const ProposeFixInputSchema = z.object({
  test_output: z.string().min(1),
  source_files: z.array(SourceFileSchema).min(1),
  diagnosis: z
    .any()
    .optional()
    .describe(
      "Output from a previous diagnose_test_failure reasoning step. Strongly recommended."
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

export const AssessSafetyInputSchema = z.object({
  patch: z.string().min(1).describe("The unified diff to evaluate"),
  source_files: z.array(SourceFileSchema).min(1),
  test_output: z.string().optional(),
  diagnosis: z.any().optional(),
  language: z.string().optional(),
});

export type AssessSafetyInput = z.infer<typeof AssessSafetyInputSchema>;
