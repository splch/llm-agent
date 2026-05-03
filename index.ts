import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { basename } from "node:path";
import { promisify } from "node:util";
import { StringEnum } from "@mariozechner/pi-ai";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { ROUTING, TASK_AXES, THINKING_LEVELS } from "./routing.js";

const DEPTH = "PI_SUBAGENT_DEPTH";
const MAX_DEPTH = "PI_SUBAGENT_MAX_DEPTH";
const DEFAULT_MAX = 3;
const MAX_OUT = 8 * 1024 * 1024;
const exec = promisify(execFile);

function piCmd(args: string[]): { bin: string; args: string[] } {
	const bin = process.execPath;
	if (!/^(node|bun)(\.exe)?$/i.test(basename(bin))) return { bin, args };
	const script = process.argv[1];
	return script && existsSync(script) ? { bin, args: [script, ...args] } : { bin: "pi", args };
}

const Params = Type.Object({
	task_type: StringEnum(TASK_AXES, {
		description: "Capability axis. See the `expert-routing` skill for axis descriptions and decision rules.",
	}),
	task: Type.String({
		description: "Self-contained brief: goal, output format, paths, constraints, and what 'done' looks like — the subagent cannot see this conversation.",
	}),
	model: Type.Optional(Type.String({ description: "Override OpenRouter model id; bypasses the axis fallback chain." })),
	thinking: Type.Optional(StringEnum(THINKING_LEVELS, { description: "Override thinking level." })),
});

export default function (pi: ExtensionAPI) {
	pi.registerTool({
		name: "expert",
		label: "Expert subagent",
		description: "Delegate a sub-task to an expert subagent on the OpenRouter model best suited to the chosen capability axis.",
		promptSnippet: "Reach for `expert` when a sub-task fits one capability axis better than the current model.",
		promptGuidelines: [
			`\`expert\` capability axes: ${TASK_AXES.join(", ")}.`,
			"`expert` runs in a fresh pi process and cannot see this conversation — pass everything it needs in `task`.",
			"See the `expert-routing` skill for axis decision rules and examples before calling `expert`.",
		],
		parameters: Params,
		async execute(_id, params, signal) {
			const depth = +(process.env[DEPTH] ?? 0) || 0;
			const max = +(process.env[MAX_DEPTH] ?? 0) || DEFAULT_MAX;
			if (depth >= max) {
				return {
					content: [{ type: "text", text: `Cannot delegate: subagent depth limit reached (depth=${depth}, max=${max}). Complete this task without further delegation.` }],
					details: { reason: "max_depth_exceeded", depth, max },
				};
			}
			const cfg = ROUTING[params.task_type];
			const candidates = params.model
				? [{ model: params.model, thinking: params.thinking }]
				: cfg.models.map((c) => ({ model: c.model, thinking: params.thinking ?? c.thinking }));
			const env = { ...process.env, [DEPTH]: String(depth + 1), [MAX_DEPTH]: String(max), PI_OFFLINE: "1" };
			const errors: { model: string; code: number | string; stderr: string }[] = [];
			for (const c of candidates) {
				if (signal?.aborted) break;
				const args = ["-p", "--no-session", "--model", c.model, "--tools", cfg.tools];
				if (c.thinking) args.push("--thinking", c.thinking);
				if (cfg.systemPrompt) args.push("--append-system-prompt", cfg.systemPrompt);
				args.push(`Task: ${params.task}`);
				const { bin, args: cmd } = piCmd(args);
				try {
					const p = exec(bin, cmd, { env, maxBuffer: MAX_OUT, signal });
					p.child.stdin?.end();
					const { stdout } = await p;
					const out = stdout.trim();
					if (out) {
						return {
							content: [{ type: "text", text: out }],
							details: { axis: params.task_type, model: c.model, thinking: c.thinking, attempts: errors.length + 1 },
						};
					}
					errors.push({ model: c.model, code: 0, stderr: "(empty stdout)" });
				} catch (e: any) {
					const code = e.code ?? (e.signal ? `signal:${e.signal}` : 1);
					errors.push({ model: c.model, code, stderr: String(e.stderr ?? e.message ?? "").slice(-500) });
				}
			}
			const summary = errors.map((e, i) => `  ${i + 1}. ${e.model} (exit=${e.code}): ${e.stderr || "(no stderr)"}`).join("\n");
			return {
				content: [{ type: "text", text: `All ${errors.length} candidate model(s) failed for axis "${params.task_type}":\n${summary}` }],
				details: { axis: params.task_type, errors },
			};
		},
	});
}
