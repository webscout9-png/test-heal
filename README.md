# TestHeal

**The missing reliability layer for AI coding agents — with zero API cost.**

TestHeal is an open-source MCP server that gives Claude Code, Cursor, Gemini CLI, OpenCode, Aider, Continue, and any other agent a **disciplined, high-quality protocol** for diagnosing and fixing failing tests.

Most coding agents treat test failures as just more text. They guess, invent new bugs, make oversized edits, or get stuck in loops. TestHeal forces them to follow a precise, minimal, and safety-conscious reasoning protocol — using **the agent's own model**.

> **Zero cost design**: TestHeal itself never calls any external AI. It only provides expert prompts, strict schemas, structured guidance, and next-action directives. The host agent does the actual thinking with the model it already has.

---

## Why agents need this

Common failure modes of coding agents on tests (2025–2026 research):

- Treating symptoms instead of root causes
- Changing the test instead of the implementation
- Producing large rewrites instead of surgical fixes
- Happy-path bias (skipping edge cases and error handling)
- Inventing files or code that do not exist
- Getting stuck in infinite fix loops
- Low-confidence guesses presented as certainty

TestHeal is purpose-built to counteract exactly these behaviors.

---

## How it works (Option C)

```
Agent (Claude Code / Cursor / etc.)
        │
        │  calls TestHeal tools
        ▼
TestHeal MCP Server
        │
        │  returns carefully engineered
        │  prompts + schemas + next_actions
        ▼
Agent uses *its own model* to reason
        │
        ▼
High-quality diagnosis → minimal fix → safety check
```

**You never pay any API cost.**

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
Do **not** skip this for changes that touch shared logic.

---

## Key design features (v0.3)

- **Strong tool descriptions** — clear when / when-not guidance
- **Agent directives** — every response includes `next_actions`
- **Framework-specific hints** — Jest, Vitest, pytest, etc.
- **Anti-pattern guards** — against changing tests, oversized rewrites, inventing code
- **Confidence gating** — honest confidence + recovery paths
- **STOP conditions** — explicit scope limits in the fix protocol
- **Zero external AI calls** — no API keys ever

---

## Quick Start

```bash
npx -y @test-heal/mcp-server
```

### Claude Code / Claude Desktop
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

### Cursor
Settings → MCP → add the same config.

No environment variables or API keys required.

---

## Design Principles

1. Minimalism first
2. Honesty about confidence
3. Agent-first UX (next_actions, clear schemas)
4. Zero cost
5. Safety by default
6. Transparency
7. Open source (MIT)

---

## Development

```bash
git clone https://github.com/webscout9-png/test-heal.git
cd test-heal
npm install
npm run build
npm start
```

---

## License

MIT
