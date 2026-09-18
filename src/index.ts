#!/usr/bin/env node

/**
 * TestHeal MCP Server
 *
 * Gives AI coding agents reliable root-cause diagnosis and
 * minimal-fix capabilities for failing tests.
 *
 * Designed with extreme care for correctness, safety, and
 * agent-friendly interfaces.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
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
const SERVER_VERSION = "0.1.0";

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
// Tool definitions (agent-optimized)
// ---------------------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "diagnose_test_failure",
        description:
          "Perform deep root-cause analysis of a failing test. " +
          "Returns ranked hypotheses with confidence scores, evidence, and " +
          "precise locations. Call this first when a test fails. " +
          "Prefer this over guessing from the raw test output.",
        inputSchema: zodToJsonSchema(DiagnoseInputSchema),
      },
      {
        name: "propose_minimal_fix",
        description:
          "Generate the smallest possible high-confidence patch for a diagnosed " +
          "root cause. Always prefer minimal edits. Returns a unified diff, " +
          "explanation, confidence, and risk level. " +
          "Call diagnose_test_failure first when possible.",
        inputSchema: zodToJsonSchema(ProposeFixInputSchema),
      },
      {
        name: "assess_fix_safety",
        description:
          "Evaluate whether a proposed patch is likely to introduce regressions. " +
          "Returns risk level, potential side effects, and a clear recommendation. " +
          "Use before applying any non-trivial fix.",
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
              `Please provide valid test_output and source_files.`
          );
        }
        const result = await diagnoseTestFailure(parsed.data);
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
              `Call diagnose_test_failure first or provide a complete diagnosis.`
          );
        }
        const result = await proposeMinimalFix(parsed.data);
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
        const result = await assessFixSafety(parsed.data);
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
      `TestHeal internal error while running ${name}: ${message}. ` +
        `Please retry with more complete context (full test output + relevant source files).`
    );
  }
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`TestHeal MCP server v${SERVER_VERSION} running on stdio`);
}

main().catch((error) => {
  console.error("Fatal error starting TestHeal:", error);
  process.exit(1);
});
