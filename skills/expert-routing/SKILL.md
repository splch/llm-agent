---
name: expert-routing
description: Use when about to delegate a self-contained sub-task that fits one capability axis (e.g. reasoning, math, coding, agentic, multimodal, factuality).
---

# Expert Routing

The `expert` tool delegates a self-contained task to a specialized subagent on the best OpenRouter model for the axis. The extension picks the model and fallbacks; you pick the axis.

## When to delegate

All must hold:
- The task fits one capability axis better than the current model.
- The task is self-contained (describable without referring to "this conversation").
- Quality matters more than the cost of one extra model call.

Don't delegate trivial tasks, tight tool-use loops, or tasks whose context lives only in the conversation.

## Axes

Pick the most specific axis. Resolve ties toward the narrower axis (e.g. `coding-repo` over `agentic` for SWE work).

| Axis | Use for |
|---|---|
| `knowledge` | Encyclopedic recall, factual Q&A |
| `reasoning` | Multi-step deduction, planning, abstract analysis |
| `math` | Calculation, proofs, symbolic manipulation |
| `coding-single` | One-shot code: a function or single file |
| `coding-repo` | Multi-file SWE: refactors, features across files, debugging |
| `agentic` | Heavy tool-use orchestration |
| `browser-os` | Browser automation, computer-use, OS interaction |
| `long-context` | Very large inputs (long docs, logs, codebases) |
| `multimodal-image` | Image understanding, diagrams, screenshots |
| `multimodal-video` | Video understanding, temporal reasoning |
| `multilingual` | Translation, cross-lingual reasoning, non-English content |
| `instruction-following` | Strict format/constraint adherence |
| `factuality` | Verification, fact-checking, anti-hallucination |
| `safety` | Risk-sensitive content, ethical reasoning |
| `reliability` | Predictable, low-variance output |

## Writing the task

The subagent does **not** see this conversation. The brief must include the goal, the required output format, file paths, constraints, and what 'done' looks like.

```
✅ "Refactor src/auth/validators.ts to use zod schemas instead of manual checks.
    Preserve existing error messages. Tests in test/auth/validators.test.ts must
    still pass. Return a unified diff."
❌ "Fix the validators we discussed."
```

## Common mistakes

- **Wrong axis.** "Build a sorting algorithm" → `coding-single`, not `math` (the artifact is code).
- **Under-specified task.** If the subagent has to ask clarifying questions, the brief was too thin.
- **Over-delegation.** A 5-second answer doesn't need a delegation turn.
- **Stacking axes.** A task spanning `coding-repo` + `math` + `factuality` is a planning failure — split first.
