# pi-expert-subagent

Pi extension that delegates self-contained sub-tasks to an `expert` subagent running on the best OpenRouter model for the chosen capability axis. Ships a companion `expert-routing` skill that teaches the parent agent how to classify tasks before delegating.

## Install

```bash
pi install npm:pi-expert-subagent          # global
pi install npm:pi-expert-subagent -l       # project-local
```

Set `OPENROUTER_API_KEY` in the environment, or run `/login` and pick OpenRouter.

## Tool params

- `task_type` — capability axis (see [`routing.ts`](./routing.ts) and the `expert-routing` skill)
- `task` — self-contained brief; the subagent does not see your conversation
- `model` *(optional)* — bypass the axis fallback chain
- `thinking` *(optional)* — `off`, `minimal`, `low`, `medium`, `high`, `xhigh`

## Routing

[`routing.ts`](./routing.ts) holds per-axis model lists, fallback order, system prompts, and tool subsets. Fallback engages on non-zero exit or empty stdout.

## Recursion

Depth is propagated via `PI_SUBAGENT_DEPTH` and capped by `PI_SUBAGENT_MAX_DEPTH` (default `3`).

## Develop

```bash
pi -e .            # load the local checkout in a pi session
npm test           # validate the routing config (Node 22+)
```

MIT.
