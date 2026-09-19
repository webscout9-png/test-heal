import { z } from "zod";

/**
 * Shared schemas — designed for maximum LLM selection accuracy.
 * Parameter descriptions include examples and constraints.
 */

export const SourceFileSchema = z.object({
  path: z
    .string()
    .describe(
      "Path to the source file, e.g. 'src/utils/parser.ts' or 'tests/test_parser.py'"
    ),
  content: z
    .string()
    .describe(
      "Full content of the file. Always send the complete file, not a snippet."
    ),
});

export const DiagnoseInputSchema = z.object({
  test_output: z
    .string()
    .min(1)
    .describe(
      "Full test failure output including stack traces, assertion messages, and relevant logs. Example: the complete stdout/stderr from 'npm test' or 'pytest'."
    ),
  source_files: z
    .array(SourceFileSchema)
    .min(1)
    .describe(
      "Relevant source files. Always include: (1) the failing test file, (2) the implementation under test. Optional: closely related helpers."
    ),
  git_diff: z
    .string()
    .optional()
    .describe(
      "Optional recent git diff (e.g. output of 'git diff HEAD~3'). Useful when the failure appeared after recent changes."
    ),
  language: z
    .string()
    .optional()
    .describe("Programming language, e.g. 'typescript', 'python', 'go', 'java'"),
  framework: z
    .string()
    .optional()
    .describe(
      "Test framework, e.g. 'jest', 'vitest', 'pytest', 'mocha', 'junit', 'go test'"
    ),
  additional_context: z
    .string()
    .optional()
    .describe(
      "Any extra context you already know (e.g. 'this started failing after the auth refactor')"
    ),
});

export type DiagnoseInput = z.infer<typeof DiagnoseInputSchema>;

export const ProposeFixInputSchema = z.object({
  test_output: z.string().min(1).describe("Full test failure output"),
  source_files: z
    .array(SourceFileSchema)
    .min(1)
    .describe("Relevant source files (test + implementation)"),
  diagnosis: z
    .any()
    .optional()
    .describe(
      "The JSON diagnosis object produced by following the diagnose_test_failure protocol. Strongly recommended."
    ),
  root_cause_id: z
    .number()
    .optional()
    .describe("Which ranked root cause to fix (1-based). Defaults to 1 (highest confidence)."),
  git_diff: z.string().optional(),
  language: z.string().optional(),
  framework: z.string().optional(),
  constraints: z
    .string()
    .optional()
    .describe(
      "Hard constraints, e.g. 'do not change public API', 'keep existing test structure', 'only edit src/parser.ts'"
    ),
});

export type ProposeFixInput = z.infer<typeof ProposeFixInputSchema>;

export const AssessSafetyInputSchema = z.object({
  patch: z
    .string()
    .min(1)
    .describe("The unified diff to evaluate, e.g. output of a minimal fix"),
  source_files: z
    .array(SourceFileSchema)
    .min(1)
    .describe("The source files that will be affected by the patch"),
  test_output: z.string().optional().describe("Original failing test output"),
  diagnosis: z.any().optional().describe("Prior diagnosis object if available"),
  language: z.string().optional(),
});

export type AssessSafetyInput = z.infer<typeof AssessSafetyInputSchema>;
