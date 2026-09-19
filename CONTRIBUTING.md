# Contributing to TestHeal

Thank you for helping make AI coding agents more reliable — without adding extra API costs.

## Philosophy (Option C)

TestHeal does **not** call any external AI.  
It only provides carefully engineered reasoning protocols (system prompts + schemas + instructions) that the host agent executes with its own model.

Every contribution should strengthen one of these properties:

- **Precision** of the diagnosis protocol
- **Minimality** bias of the fix protocol
- **Honesty** of the safety protocol
- **Clarity** of the agent-facing contract
- **Zero-cost** nature of the tool

## High-priority areas

1. Better framework-specific guidance (pytest, Jest, Vitest, JUnit, Go testing, etc.)
2. Stronger static-analysis flavored hints inside the prompts
3. Example reasoning packages with known-good outputs
4. Clearer instructions that help agents follow the protocol more reliably

## Development setup

```bash
git clone https://github.com/webscout9-png/test-heal.git
cd test-heal
npm install
npm run dev
```

## Pull request guidelines

- Keep changes focused
- Prefer improving the quality of the prompts and schemas
- Never introduce external LLM calls or API key requirements
- Document any new guidance clearly

## License

By contributing you agree that your contributions will be licensed under the MIT License.
