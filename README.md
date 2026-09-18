# TestHeal

**The missing reliability layer for AI coding agents.**

TestHeal is an open-source MCP server that gives Claude Code, Cursor, Gemini CLI, OpenCode, Aider, Continue, and any other agent **reliable root-cause diagnosis and minimal, high-confidence fixes** for failing tests.

Most coding agents treat test failures as just more text. They guess, invent new bugs, make oversized edits, or get stuck in loops. TestHeal is a specialized tool they can call to do the hard diagnostic work properly.

> **Responsibility notice**: This tool is designed to *assist* agents, not replace human judgment. Every fix it proposes should still be reviewed. We take the responsibility of shipping high-quality, safe defaults extremely seriously.

---

## Why this exists

Current coding agents are excellent at writing code but still weak at:

- Distinguishing root cause from symptoms
- Producing *minimal* patches instead of large rewrites
- Assessing whether a proposed fix is safe
- Avoiding regression-prone changes
- Breaking out of infinite fix loops

TestHeal is purpose-built to solve exactly these weaknesses.

---

## Features

- **Precise root-cause analysis** — ranked hypotheses with confidence scores
- **Minimal patches** — unified diffs that change as little as possible
- **Safety assessment** — risk of regressions + which other tests may be affected
- **Agent-optimized schemas** — clean JSON that LLMs parse reliably
- **LLM-friendly errors** — every error message tells the agent what to do next
- **Works with any model** — you bring your own LLM (OpenAI, Anthropic, local, etc.)
- **Zero arbitrary code execution by default** — safe by design

---

## Quick Start

### 1. Install

```bash
npm install -g @test-heal/mcp-server
# or run directly
npx -y @test-heal/mcp-server
```

### 2. Add to your agent

#### Claude Code / Claude Desktop
Add to your MCP config:

```json
{
  "mcpServers": {
    "test-heal": {
      "command": "npx",
      "args": ["-y", "@test-heal/mcp-server"],
      "env": {
        "OPENAI_API_KEY": "your-key-here"   // or ANTHROPIC_API_KEY, etc.
      }
    }
  }
}
```

#### Cursor
Go to Settings → MCP and add the same configuration.

#### Other agents (Gemini CLI, OpenCode, etc.)
Any client that supports the Model Context Protocol can use it.

---

## Tools Exposed

### 1. `diagnose_test_failure`

**Purpose**: Deep root-cause analysis of a failing test.

**Input**:
- `test_output` (string, required) — full failure output / stack trace
- `source_files` (array of {path, content}) — relevant source code
- `git_diff` (string, optional) — recent changes
- `language` (string, optional) — e.g. "typescript", "python"
- `framework` (string, optional) — e.g. "jest", "pytest", "vitest"

**Output**:
```json
{
  "root_causes": [
    {
      "rank": 1,
      "hypothesis": "...",
      "confidence": 0.87,
      "evidence": ["..."],
      "location": { "file": "...", "lines": "42-48" }
    }
  ],
  "summary": "...",
  "recommended_next_step": "call propose_minimal_fix with root_cause_id=1"
}
```

### 2. `propose_minimal_fix`

**Purpose**: Generate the smallest possible safe patch for a diagnosed root cause.

**Input**:
- Everything from diagnose + `root_cause_id` or full diagnosis object

**Output**:
```json
{
  "patch": "--- a/src/foo.ts\n+++ b/src/foo.ts\n@@ ...",
  "explanation": "...",
  "confidence": 0.91,
  "files_changed": ["src/foo.ts"],
  "risk_level": "low"
}
```

### 3. `assess_fix_safety`

**Purpose**: Evaluate whether a proposed patch is likely to introduce regressions.

**Output**:
```json
{
  "risk_level": "low" | "medium" | "high",
  "potential_regressions": ["..."],
  "affected_tests": ["..."],
  "recommendation": "safe to apply" | "review carefully" | "do not apply"
}
```

---

## Design Principles (we take this seriously)

1. **Minimalism first** — prefer 3-line fixes over 50-line rewrites
2. **Honesty about confidence** — never claim high confidence when evidence is weak
3. **Agent-first UX** — every response is structured so an LLM can act on it immediately
4. **Safety by default** — no shell execution, no unrestricted file writes
5. **Transparency** — the reasoning is visible and inspectable
6. **Open source forever** — MIT license, community-driven improvements welcome

---

## Architecture

```
Agent → MCP Protocol → TestHeal Server
                           │
                           ├─ Schema validation
                           ├─ Context assembly
                           ├─ Specialized diagnosis prompts
                           ├─ Minimal-edit reasoning
                           └─ Structured JSON response
```

The intelligence layer currently uses high-quality prompts + your configured LLM. Future versions will add:
- Static analysis integration (TypeScript, ESLint, mypy, etc.)
- Historical failure pattern matching
- Multi-agent internal debate for higher confidence

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

We welcome contributions that improve diagnosis accuracy, add language/framework support, or strengthen safety guarantees. See [CONTRIBUTING.md](CONTRIBUTING.md).

**High priority areas**:
- Better static analysis integration
- Support for more test frameworks
- Evaluation harness with real failing tests
- Local model support (Ollama, LM Studio, etc.)

---

## License

MIT

---

Built with the belief that AI coding agents deserve better tools for the hardest part of the job: **understanding why tests fail and fixing them safely**.
