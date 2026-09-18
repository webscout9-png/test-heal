# Contributing to TestHeal

Thank you for helping make AI coding agents more reliable.

## Philosophy

TestHeal exists because agents currently suck at the hardest part of the loop: understanding *why* a test failed and producing a *minimal, safe* fix.

Every contribution should strengthen one of these properties:

- **Precision** of root-cause analysis
- **Minimality** of proposed patches
- **Honesty** of confidence and risk scores
- **Safety** of the tool itself
- **Clarity** of the agent-facing contract

## High-priority areas

1. **Real LLM integration** — clean adapters for OpenAI, Anthropic, Google, local models (Ollama, LM Studio, vLLM)
2. **Static analysis hooks** — TypeScript compiler diagnostics, ESLint, mypy, go vet, etc.
3. **Evaluation harness** — a suite of real failing tests with known correct root causes and minimal fixes
4. **More frameworks** — better built-in understanding of pytest, Jest, Vitest, JUnit, Go testing, etc.
5. **Historical pattern matching** — learning from past failures in a repository

## Development setup

```bash
git clone https://github.com/webscout9-png/test-heal.git
cd test-heal
npm install
npm run dev
```

## Pull request guidelines

- Keep changes focused
- Prefer improving the core diagnosis/fix quality over adding many new tools
- Update schemas and prompts carefully — agents depend on them
- Add tests when possible
- Document any new environment variables or configuration

## Code of conduct

Be kind. We are building infrastructure that many agents (and therefore many developers) will rely on. Quality and safety matter more than speed.

## License

By contributing you agree that your contributions will be licensed under the MIT License.
