# TestHeal

**The missing reliability layer for AI coding agents — zero API cost.**

Gives Claude Code, Cursor, Gemini CLI, OpenCode and others a disciplined protocol for diagnosing and fixing failing tests. Uses the agent's own model. No API keys. No extra cost.

---

## Easiest ways to connect (pick one)

### 1. Claude Code — one command

```bash
claude mcp add test-heal -- npx -y github:webscout9-png/test-heal
```

Verify:
```bash
claude mcp list
```

Remove later:
```bash
claude mcp remove test-heal
```

---

### 2. Any agent — one command with `add-mcp`

```bash
npx add-mcp github:webscout9-png/test-heal -y
```

---

### 3. Cursor — paste this config

Put in `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

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

Restart Cursor.

---

### 4. From source

```bash
git clone https://github.com/webscout9-png/test-heal.git
cd test-heal
npm install
npm run build
```

Then:
```json
{
  "mcpServers": {
    "test-heal": {
      "command": "node",
      "args": ["/absolute/path/to/test-heal/bin/run.js"]
    }
  }
}
```

---

## What was fixed (v0.3.3)

**Root cause of connection failures:**  
The package `bin` pointed at `dist/index.js`, but `dist/` is not committed to the repo. When agents ran `npx github:webscout9-png/test-heal`, the entry file was missing and the server failed to start.

**Fix:**  
A small pure-JS launcher (`bin/run.js`) now:
1. Uses `dist/index.js` if it exists (after a local build)
2. Otherwise runs the TypeScript source with `tsx` (works for `npx github:` installs)

No pre-build required to connect the server to an agent.

---

## Tools

| Tool | When to use |
|------|-------------|
| `diagnose_test_failure` | First step when a test fails |
| `propose_minimal_fix` | After diagnosis — forces a tiny, safe patch |
| `assess_fix_safety` | Before applying any non-trivial fix |

---

## License

MIT
