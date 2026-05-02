# llm-agent

Recursive sub-agents for [`llm`](https://llm.datasette.io). Any model can spawn any other model.

```sh
llm -m X -T agent --td "…"
```

That's the whole interface.

## Install

```sh
uv tool install llm
llm install llm-openrouter
llm keys set openrouter
llm aliases set ...
llm install -e .
```

## How it works

This plugin registers one tool — `agent(model, prompt, system="")` — that shells out to `llm` recursively. Each sub-agent is a fresh `llm` process with the same `agent` tool registered, so any agent can spawn its own sub-agents to arbitrary depth. Every call is logged to `~/.config/io.datasette.llm/logs.db`; replay any branch with `llm logs -c`.

```
parent (X)
├── agent("X", "…")
└── agent("Y", "…")
    ├── agent("Z", "…")
    └── agent("Z", "…")
```

## Routing

`AGENTS.md` (also symlinked as `CLAUDE.md` and `GEMINI.md`) is the routing manual every agent reads. It tracks benchmark data for LLMs to optimally call LLMs.

## Files

- `llm_agent.py` — the plugin (~15 lines)
- `pyproject.toml` — entry point
- `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` — sub-agent routing guide

## License

MIT.
