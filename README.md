# TestHeal

**The missing reliability layer for AI coding agents — with zero API cost.**

TestHeal is an open-source MCP server that gives Claude Code, Cursor, Gemini CLI, OpenCode, Aider, Continue, and any other agent a **disciplined, high-quality process** for diagnosing and fixing failing tests.

Most coding agents treat test failures as just more text. They guess, invent new bugs, make oversized edits, or get stuck in loops. TestHeal forces them to follow a precise, minimal, and safety-conscious reasoning protocol — using **the agent's own model**.

> **Zero cost design**: TestHeal itself never calls any external AI. It only provides expert prompts, strict schemas, and structured guidance. The host agent does the actual thinking with the model it already has.

---

## Why this exists

Current coding agents are excellent at writing code but still weak at:

- Distinguishing root cause from symptoms
- Producing *minimal* patches instead of large rewrites
- Assessing whether a proposed fix is safe
- Avoiding regression-prone changes
- Breaking out of infinite fix loops

TestHeal solves these weaknesses by giving the agent a specialist protocol to follow.

---

## How it works (Option C architecture)

```
Agent (Claude Code / Cursor / etc.)
        │
        │  calls TestHeal tools
        ▼
TestHeal MCP Server
        │
        │  returns carefully engineered
        │  prompts + schemas + instructions
        ▼
Agent uses *its own model* to reason
        │
        ▼
High-quality diagnosis / minimal fix / safety assessment
```

**You never pay any API cost.** The agent already has a powerful model.

---

## Features

- **Precise root-cause protocol** — ranked hypotheses with confidence scores
- **Minimal patch protocol** — strongly biased toward surgical edits
- **Safety assessment protocol** — honest risk evaluation
- **Agent-optimized schemas** — clean JSON that LLMs parse reliably
- **LLM-friendly errors** — every error tells the agent what to do next
- **Zero external AI calls** — no API keys, no cost, no vendor lock-in
- **Safe by design** — no arbitrary code execution

---

## Quick Start

### 1. Install / Run

```bash
npx -y @test-heal/mcp-server
```

Or install globally:

```bash
npm install -g @test-heal/mcp-server
```

### 2. Add to your agent

#### Claude Code / Claude Desktop
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

#### Cursor
Settings → MCP → Add the same configuration.

#### Other agents
Any client that supports the Model Context Protocol can use it. No environment variables or API keys needed.

---

## Tools

### 1. `diagnose_test_failure`

Returns a complete reasoning package the agent should execute with its own model:

- High-quality system prompt focused on root-cause analysis
- Assembled context (test output + source files + optional diff)
- Exact JSON schema the agent must produce
- Clear next-step guidance

### 2. `propose_minimal_fix`

Returns a reasoning package that forces the agent to generate the **smallest possible** high-confidence patch.

### 3. `assess_fix_safety`

Returns a reasoning package for honest risk evaluation before applying any fix.

---

## Design Principles

1. **Minimalism first** — prefer 3-line fixes over 50-line rewrites
2. **Honesty about confidence** — never claim high confidence when evidence is weak
3. **Agent-first UX** — every response is structured so an LLM can act on it immediately
4. **Zero cost** — no external model calls, ever
5. **Safety by default** — no shell execution, no unrestricted file writes
6. **Transparency** — the full reasoning protocol is visible and inspectable
7. **Open source forever** — MIT license

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

## Contributing

We welcome contributions that improve the quality of the reasoning protocols, add language/framework-specific guidance, or strengthen safety.

High priority areas:
- Better framework-specific hints (pytest, Jest, Vitest, etc.)
- Stronger static-analysis flavored guidance
- Evaluation examples with known good diagnoses

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT

---

Built with the belief that AI coding agents deserve better tools for the hardest part of the job — and that those tools should not cost the maintainer (or the user) extra API fees.
