# AGENTS.md — Sub-Agent Routing Guide

You have the `agent(model, prompt, system="")` tool. Use it to delegate work to whichever model fits the task best. When in doubt, escalate to a planner agent and ask it to decompose first.

> Snapshot: 2026-05-02. Re-run the benchmarks linked at the bottom every ~60 days; rankings shift.

## Which task for which model

- **Knowledge:** `google/gemini-3.1-pro-preview`, fallback: `openai/gpt-5.5`
- **Reasoning:** `openai/gpt-5.5` (xhigh), `anthropic/claude-opus-4.7`
- **Math:** `openai/gpt-5.5` (xhigh), `openai/gpt-5.4-pro`, fallback: `deepseek/deepseek-v4-pro`
- **Coding (single-turn):** `google/gemini-3-pro-preview`, `google/gemini-3-flash-preview`
- **Coding (repo / SWE):** `anthropic/claude-opus-4.7`, fallback: `anthropic/claude-sonnet-4.6`, `openai/gpt-5.4` (xhigh)
- **Agentic/tool:** `anthropic/claude-opus-4.7`, `z-ai/glm-5`, fallback: `moonshotai/kimi-k2.6`.
- **Browser/OS:** `anthropic/claude-opus-4.7`, fallback: `anthropic/claude-sonnet-4.6`
- **Long-context:** `google/gemini-3.1-pro-preview`, `openai/gpt-5.2-codex` (xhigh), fallback: `google/gemini-3-flash-preview`
- **Multimodal (image):** `google/gemini-3.1-pro-preview`, fallback: `google/gemini-3-flash-preview`.
- **Multimodal (video):** `google/gemini-3-pro`, fallback: `google/gemini-3-flash-preview`
- **Multilingual:** `google/gemini-3.1-pro-preview`
- **Instruction following:** `x-ai/grok-4.3`, fallback: `x-ai/grok-4.20-multi-agent`
- **Factuality:** `google/gemini-3.1-pro-preview`
- **Safety:** `anthropic/claude-opus-4.7`, `anthropic/claude-sonnet-4.6`
- **Reliability/propensity:** `google/gemini-3.1-pro-preview`, `anthropic/claude-opus-4.7`

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
