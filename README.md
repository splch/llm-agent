# pi-expert-subagent

Pi extension that delegates tasks to expert sub-agents, automatically routing each task to the best OpenRouter model for the capability axis. Ships with a companion skill that teaches the parent agent how to classify tasks before delegating.

## Install

```bash
pi install npm:pi-expert-subagent          # global
pi install npm:pi-expert-subagent -l       # project-local
```

Set `OPENROUTER_API_KEY` in your environment, or run `/login` and pick OpenRouter.

## What it does

The extension exposes an `expert` tool and an `expert-routing` skill. The subagent runs in an isolated `pi -p` process with a focused system prompt and a tool subset chosen for the axis.

### Tool params

| Param | Type | Notes |
|---|---|---|
| `task_type` | enum | One of the axes defined in [`routing.ts`](./routing.ts) |
| `task` | string | Self-contained brief — the subagent does not see your conversation |
| `model` | string (optional) | Bypasses the fallback chain |
| `thinking` | enum (optional) | `off`, `minimal`, `low`, `medium`, `high`, `xhigh` |

## Routing

See [`routing.ts`](./routing.ts) for the per-axis model list, fallback order, system prompts, and tool subsets. All models go through OpenRouter; fallback engages on non-zero exit or empty stdout.

## Recursion

The extension propagates `PI_SUBAGENT_DEPTH` and refuses to delegate when `PI_SUBAGENT_DEPTH >= PI_SUBAGENT_MAX_DEPTH`. Set both to override; the default cap is small.

## Develop

```bash
pi -e .                  # load the local checkout in a pi session
npm test                 # validate the routing config (Node 22+)
```

## License

MIT
