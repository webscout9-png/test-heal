# TestHeal

**The missing reliability layer for AI coding agents — with zero API cost.**

TestHeal is an open-source MCP server that gives Claude Code, Cursor, Gemini CLI, OpenCode, Aider, Continue, and any other agent a **disciplined, high-quality protocol** for diagnosing and fixing failing tests.

Most coding agents treat test failures as just more text. They guess, invent new bugs, make oversized edits, or get stuck in loops. TestHeal forces them to follow a precise, minimal, and safety-conscious reasoning protocol — using **the agent's own model**.

> **Zero cost design**: TestHeal itself never calls any external AI. It only provides expert prompts, strict schemas, structured guidance, and next-action directives. The host agent does the actual thinking with the model it already has.

---

## Quick Start

### Option A — Run from source (recommended while unpublished)

```bash
git clone https://github.com/webscout9-png/test-heal.git
cd test-heal
npm install
npm run build
```

Then point your agent at it:

```json
{
  "mcpServers": {
    "test-heal": {
      "command": "node",
      "args": ["/absolute/path/to/test-heal/dist/index.js"]
    }
  }
}
```

Or use the dev entry:

```json
{
  "mcpServers": {
    "test-heal": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/test-heal/src/index.ts"]
    }
  }
}
```

### Option B — After publishing to npm

```bash
npx -y @test-heal/mcp-server
```

```json
{
  "mcpServers": {
    "test-heal": {
      "command": "npx",
      "args": ["-y", "@test-heal/mcp-server"]
    }
  }
}
```

No environment variables or API keys required.

---

## Tools

### 1. `diagnose_test_failure`
Use **first** when a test fails.  
Do **not** use when you already have a high-confidence root cause.

Returns a complete reasoning package + recommended next actions.

### 2. `propose_minimal_fix`
Use after diagnosis (or when the root cause is already clear).  
Do **not** use to rewrite large sections of code.

Forces the smallest possible high-confidence patch.

### 3. `assess_fix_safety`
Use before applying any non-trivial patch.  
Do **not** skip this step for changes that touch shared logic.

---

## Verify it works

```bash
npm install
npm run smoke
```

You should see `✅ Smoke test passed`.

---

## Design Principles

1. Minimalism first
2. Honesty about confidence
3. Agent-first UX (`next_actions`, clear schemas)
4. Zero cost
5. Safety by default
6. Transparency
7. Open source (MIT)

---

## License

MIT
