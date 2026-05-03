---
name: expert-routing
description: Use when about to delegate a self-contained sub-task that fits one capability axis (e.g. reasoning, math, coding, agentic, multimodal, factuality).
---

# Expert Routing

The `expert` tool delegates a self-contained task to a specialized subagent running on the best OpenRouter model for that capability axis. The extension picks the model and fallbacks; you pick the axis.

## When to use

Delegate when **all** hold:
- The task fits one capability axis better than the current model.
- The task is self-contained (you can describe it without referring to "this conversation").
- The cost of getting it wrong outweighs the cost of one extra model call.

Don't delegate:
- Trivial tasks the current model can answer in one breath.
- Tasks whose context lives only in this conversation and is hard to write down.
- Tight tool-use loops where latency matters more than quality.

## Choosing the axis

Pick the most specific axis that fits. Resolve ties toward the narrower axis (e.g. `coding-repo` over `agentic` for SWE work).

| Axis | Use for |
|---|---|
| `knowledge` | Encyclopedic recall, factual Q&A, "what is X" |
| `reasoning` | Multi-step deduction, planning, abstract analysis |
| `math` | Calculation, proofs, symbolic manipulation, formal math |
| `coding-single` | One-shot code: a function, snippet, single file |
| `coding-repo` | Multi-file SWE: refactors, features across files, debugging |
| `agentic` | Heavy tool-use orchestration, multi-step action chains |
| `browser-os` | Browser automation, computer-use, OS interaction |
| `long-context` | Tasks over very large inputs (long docs, large codebases, logs) |
| `multimodal-image` | Image understanding, diagrams, screenshots |
| `multimodal-video` | Video understanding, temporal reasoning |
| `multilingual` | Translation, cross-lingual reasoning, non-English content |
| `instruction-following` | Strict format/constraint adherence, structured output |
| `factuality` | Verification, fact-checking, anti-hallucination |
| `safety` | Risk-sensitive content, ethical reasoning |
| `reliability` | Predictable, consistent output, low variance |

## Writing the task

The subagent does **not** see this conversation. Make `task` a complete brief:
- The goal in one sentence.
- The required output format.
- Necessary context: file paths, prior decisions, constraints, examples.
- What "done" looks like.

```
✅ "Refactor src/auth/validators.ts to use zod schemas instead of manual checks.
    Preserve existing error messages. Tests in test/auth/validators.test.ts must
    still pass. Return a unified diff."

❌ "Fix the validators we discussed."
```

## Common mistakes

- **Wrong axis.** "Build a sorting algorithm" → `coding-single`, not `math`. The artifact is code.
- **Under-specified task.** If the subagent has to ask clarifying questions, your brief was too thin.
- **Over-delegation.** Delegating a 5-second answer wastes a turn.
- **Stacking axes.** A task that spans `coding-repo` + `math` + `factuality` is a planning failure — split it first.
