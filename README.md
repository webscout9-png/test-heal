# TestHeal

**The missing reliability layer for AI coding agents — zero API cost.**

Gives Claude Code, Cursor, Gemini CLI, OpenCode and others a disciplined protocol for diagnosing and fixing failing tests. Uses the agent's own model. No API keys. No extra cost.

---

## Easiest ways to connect (pick one)

### 1. Claude Code — one command (easiest)

```bash
claude mcp add test-heal -- npx -y github:webscout9-png/test-heal
```

That's it. Restart the session or run `/mcp` to verify.

Remove later:
```bash
claude mcp remove test-heal
```

---

### 2. Any agent — one command with `add-mcp`

Works with Claude Code, Cursor, OpenCode, VS Code, Cline, and many more:

```bash
npx add-mcp github:webscout9-png/test-heal -y
```

Or target a specific agent:
```bash
npx add-mcp github:webscout9-png/test-heal -a cursor -y
npx add-mcp github:webscout9-png/test-heal -a claude-code -y
```

---

### 3. Cursor — one-click style

**Option A (recommended)**  
Create or edit `~/.cursor/mcp.json` (or `.cursor/mcp.json` in a project) and paste:

```json
{
  "mcpServers": {
    "test-heal": {
      "command": "npx",
      "args": ["-y", "github:webscout9-png/test-heal"]
    }
  }
}
```

Restart Cursor. Done.

**Option B**  
Cursor Settings → MCP → Add new MCP server → use the same command/args above.

---

### 4. From source (if you prefer)

```bash
git clone https://github.com/webscout9-png/test-heal.git
cd test-heal
npm install
npm run build
```

Then point any agent at:
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

---

## What you get after connecting

Three tools the agent can call:

| Tool | When to use |
|------|-------------|
| `diagnose_test_failure` | First step when a test fails |
| `propose_minimal_fix` | After diagnosis — forces a tiny, safe patch |
| `assess_fix_safety` | Before applying any non-trivial fix |

The agent runs the reasoning with **its own model**. TestHeal only supplies the protocol, schemas, and guardrails.

---

## Verify it works

In Claude Code:
```bash
claude mcp list
```
You should see `test-heal`.

Inside a session type `/mcp` and confirm it is connected.

Then ask the agent something like:
> A test is failing. Use the test-heal tools to diagnose it.

---

## Why this design

- **Zero cost** — no API keys, no external model calls
- **One command** to connect on most agents
- **Safe by default** — no shell execution, no file writes from the server itself
- **Open source** (MIT)

---

## Development

```bash
git clone https://github.com/webscout9-png/test-heal.git
cd test-heal
npm install
npm run build
npm run smoke
```

---

## License

MIT
