#!/usr/bin/env node

/**
 * TestHeal MCP Server — Option C (Agent-side intelligence) v0.3
 *
 * Gives AI coding agents a disciplined protocol for diagnosing
 * and fixing failing tests. TestHeal itself never calls any LLM.
 * It only returns carefully engineered prompts, schemas,
 * next_actions, and anti-pattern guards.
 *
 * Zero API cost. Zero external model calls.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";

import {
  DiagnoseInputSchema,
  ProposeFixInputSchema,
  AssessSafetyInputSchema,
} from "./schemas.js";
import { diagnoseTestFailure } from "./tools/diagnose.js";
import { proposeMinimalFix } from "./tools/propose-fix.js";
import { assessFixSafety } from "./tools/assess-safety.js";

const SERVER_NAME = "test-heal";
const SERVER_VERSION = "0.3.0";

const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ---------------------------------------------------------------------------
// Tool definitions — written for LLM selection accuracy
// ---------------------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "diagnose_test_failure",
        description:
          "Tool to perform structured root-cause diagnosis of a failing test. " +
          "Use when a test has failed and you do not yet have a high-confidence root cause. " +
          "Do NOT use when you already know the exact root cause, or when you only need to apply an already-diagnosed fix. " +
          "Returns a complete reasoning package (system prompt + context + required JSON schema) that you must execute with your own model, plus recommended next_actions.",
        inputSchema: zodToJsonSchema(DiagnoseInputSchema),
      },
      {
        name: "propose_minimal_fix",
        description:
          "Tool to generate the smallest possible high-confidence patch for a diagnosed test failure. " +
          "Use after diagnose_test_failure, or when the root cause is already clear. " +
          "Do NOT use to rewrite large sections of code, to change public APIs, or to modify tests unless the test itself is clearly wrong. " +
          "Returns a reasoning package that forces surgical edits. Prefer calling assess_fix_safety afterwards.",
        inputSchema: zodToJsonSchema(ProposeFixInputSchema),
      },
      {
        name: "assess_fix_safety",
        description:
          "Tool to evaluate whether a proposed patch is likely to introduce regressions. " +
          "Use before applying any non-trivial fix, especially changes that touch shared logic, multiple files, or core domain behavior. " +
          "Do NOT skip this step for medium or high risk changes. " +
          "Returns a reasoning package for honest risk assessment.",
        inputSchema: zodToJsonSchema(AssessSafetyInputSchema),
      },
    ],
  };
});

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "diagnose_test_failure": {
        const parsed = DiagnoseInputSchema.safeParse(args);
        if (!parsed.success) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid input for diagnose_test_failure: ${parsed.error.message}. ` +
              `Required: test_output (full failure text) and source_files (at least the test file + implementation under test). ` +
              `Example source_files entry: { "path": "src/foo.ts", "content": "...full file content..." }. ` +
              `Retry with complete context.`
          );
        }
        const result = diagnoseTestFailure(parsed.data);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "propose_minimal_fix": {
        const parsed = ProposeFixInputSchema.safeParse(args);
        if (!parsed.success) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid input for propose_minimal_fix: ${parsed.error.message}. ` +
              `Provide test_output + source_files. Strongly recommended: pass the diagnosis object from diagnose_test_failure. ` +
              `Retry with complete context.`
          );
        }
        const result = proposeMinimalFix(parsed.data);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "assess_fix_safety": {
        const parsed = AssessSafetyInputSchema.safeParse(args);
        if (!parsed.success) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid input for assess_fix_safety: ${parsed.error.message}. ` +
              `Required: patch (unified diff) and source_files. Optional but useful: diagnosis and original test_output.`
          );
        }
        const result = assessFixSafety(parsed.data);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}. Available tools: diagnose_test_failure, propose_minimal_fix, assess_fix_safety. ` +
            `Call diagnose_test_failure first when a test fails.`
        );
    }
  } catch (error) {
    if (error instanceof McpError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    throw new McpError(
      ErrorCode.InternalError,
      `TestHeal error while running ${name}: ${message}. ` +
        `Retry with full test output and the relevant source files. If the problem persists, open an issue at https://github.com/webscout9-png/test-heal/issues.`
    );
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`TestHeal MCP server v${SERVER_VERSION} (agent-side intelligence) running on stdio`);
}

main().catch((error) => {
  console.error("Fatal error starting TestHeal:", error);
  process.exit(1);
});
