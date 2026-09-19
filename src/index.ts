#!/usr/bin/env node

/**
 * TestHeal MCP Server — Option C (Agent-side intelligence)
 *
 * Gives AI coding agents a disciplined protocol for diagnosing
 * and fixing failing tests. TestHeal itself never calls any LLM.
 * It only returns carefully engineered prompts, schemas, and
 * instructions that the host agent executes with its own model.
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
const SERVER_VERSION = "0.2.0";

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
// Tool definitions
// ---------------------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "diagnose_test_failure",
        description:
          "Returns a complete reasoning package for diagnosing why a test failed. " +
          "The package contains a high-quality system prompt, the assembled context, " +
          "and the exact JSON schema you must produce. " +
          "Execute the package with your own model. Do not guess from raw test output.",
        inputSchema: zodToJsonSchema(DiagnoseInputSchema),
      },
      {
        name: "propose_minimal_fix",
        description:
          "Returns a reasoning package for generating the smallest possible high-confidence patch. " +
          "Strongly biased toward surgical edits. " +
          "Execute the package with your own model. Prefer calling diagnose_test_failure first.",
        inputSchema: zodToJsonSchema(ProposeFixInputSchema),
      },
      {
        name: "assess_fix_safety",
        description:
          "Returns a reasoning package for evaluating whether a proposed patch is safe. " +
          "Execute the package with your own model before applying any non-trivial fix.",
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
              `Provide valid test_output and at least one source file.`
          );
        }
        const result = diagnoseTestFailure(parsed.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "propose_minimal_fix": {
        const parsed = ProposeFixInputSchema.safeParse(args);
        if (!parsed.success) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid input for propose_minimal_fix: ${parsed.error.message}. ` +
              `Call diagnose_test_failure first when possible.`
          );
        }
        const result = proposeMinimalFix(parsed.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "assess_fix_safety": {
        const parsed = AssessSafetyInputSchema.safeParse(args);
        if (!parsed.success) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid input for assess_fix_safety: ${parsed.error.message}`
          );
        }
        const result = assessFixSafety(parsed.data);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}. Available tools: diagnose_test_failure, propose_minimal_fix, assess_fix_safety.`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new McpError(
      ErrorCode.InternalError,
      `TestHeal error while running ${name}: ${message}. ` +
        `Retry with complete context (full test output + relevant source files).`
    );
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`TestHeal MCP server v${SERVER_VERSION} (agent-side intelligence) running on stdio`);
}

main().catch((error) => {
  console.error("Fatal error starting TestHeal:", error);
  process.exit(1);
});
