# AGENTS.md — Sub-Agent Routing Guide

You have the `agent(model, prompt, system="")` tool. Use it to delegate work to whichever model fits the task best. When in doubt, escalate to a planner agent and ask it to decompose first.

> Snapshot: 2026-05-02. Re-run the benchmarks linked at the bottom every ~60 days; rankings shift.

## Which task for which model

- **Knowledge:** `openrouter/google/gemini-3.1-pro-preview`, fallback: `openrouter/openai/gpt-5.5`
- **Reasoning:** `openrouter/openai/gpt-5.5` (xhigh), `openrouter/anthropic/claude-opus-4.7`
- **Math:** `openrouter/openai/gpt-5.5` (xhigh), `openrouter/openai/gpt-5.4-pro`, fallback: `openrouter/deepseek/deepseek-v4-pro`
- **Coding (single-turn):** `openrouter/google/gemini-3.1-pro-preview`, `openrouter/google/gemini-3-flash-preview`
- **Coding (repo / SWE):** `openrouter/anthropic/claude-opus-4.7`, fallback: `openrouter/anthropic/claude-sonnet-4.6`, `openrouter/openai/gpt-5.4` (xhigh)
- **Agentic/tool:** `openrouter/anthropic/claude-opus-4.7`, `openrouter/z-ai/glm-5`, fallback: `openrouter/moonshotai/kimi-k2.6`.
- **Browser/OS:** `openrouter/anthropic/claude-opus-4.7`, fallback: `openrouter/anthropic/claude-sonnet-4.6`
- **Long-context:** `openrouter/google/gemini-3.1-pro-preview`, `openrouter/openai/gpt-5.2-codex` (xhigh), fallback: `openrouter/google/gemini-3-flash-preview`
- **Multimodal (image):** `openrouter/google/gemini-3.1-pro-preview`, fallback: `openrouter/google/gemini-3-flash-preview`.
- **Multimodal (video):** `openrouter/google/gemini-3.1-pro-preview`, fallback: `openrouter/google/gemini-3-flash-preview`
- **Multilingual:** `openrouter/google/gemini-3.1-pro-preview`
- **Instruction following:** `openrouter/x-ai/grok-4.3`, fallback: `openrouter/x-ai/grok-4.20-multi-agent`
- **Factuality:** `openrouter/google/gemini-3.1-pro-preview`
- **Safety:** `openrouter/anthropic/claude-opus-4.7`, `openrouter/anthropic/claude-sonnet-4.6`
- **Reliability/propensity:** `openrouter/google/gemini-3.1-pro-preview`, `openrouter/anthropic/claude-opus-4.7`

## Sources

**Aggregators**: [Artificial Analysis](https://artificialanalysis.ai/leaderboards/models), [LMArena](https://lmarena.ai/), [Vellum](https://www.vellum.ai/llm-leaderboard), [llm-stats](https://llm-stats.com/)

**Per-axis benchmarks**:
- Knowledge/reasoning: [HLE](https://agi.safe.ai/), [ARC-AGI](https://arcprize.org/leaderboard), [GPQA Diamond](https://artificialanalysis.ai/evaluations/gpqa-diamond)
- Math: [MathArena](https://matharena.ai/), [FrontierMath T4](https://epoch.ai/benchmarks/frontiermath-tier-4)
- Code: [SWE-Bench Pro](https://labs.scale.com/leaderboard/swe_bench_pro_public), [LiveCodeBench](https://livecodebench.github.io/leaderboard.html), [Aider](https://aider.chat/docs/leaderboards/)
- Agentic/tool: [METR HCAST](https://metr.org/measuring-autonomous-ai-capabilities/), [τ²-bench](https://artificialanalysis.ai/evaluations/tau2-bench), [BFCL](https://gorilla.cs.berkeley.edu/leaderboard.html), [HAL](https://hal.cs.princeton.edu/)
- Long-context: [LongBench v2](https://longbench2.github.io/)
- Multimodal: [MMMU-Pro](https://artificialanalysis.ai/evaluations/mmmu-pro), [Video-MME-v2](https://github.com/MME-Benchmarks/Video-MME-v2)
- Instruction/factuality: [IFBench](https://artificialanalysis.ai/evaluations/ifbench), SimpleQA
- Safety: [AILuminate](https://mlcommons.org/benchmarks/ailuminate/), [WMDP](https://github.com/centerforaisafety/wmdp)
