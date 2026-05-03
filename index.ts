import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { basename } from "node:path";
import { StringEnum } from "@mariozechner/pi-ai";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { ROUTING, TASK_AXES, THINKING_LEVELS, type TaskAxis, type ThinkingLevel } from "./routing.js";

interface ExpertDetails {
	axis?: TaskAxis;
	model?: string;
	thinking?: ThinkingLevel;
	attempts?: number;
	reason?: string;
	depth?: number;
	maxDepth?: number;
	errors?: { model: string; exitCode: number; stderr: string }[];
}

const DEPTH_ENV = "PI_SUBAGENT_DEPTH";
const MAX_DEPTH_ENV = "PI_SUBAGENT_MAX_DEPTH";
const DEFAULT_MAX_DEPTH = 3;
const SIGKILL_GRACE_MS = 5000;
const MAX_OUTPUT_BYTES = 8 * 1024 * 1024;

function getPiInvocation(args: string[]): { command: string; args: string[] } {
	const script = process.argv[1];
	if (script && !script.startsWith("/$bunfs/root/") && existsSync(script)) {
		return { command: process.execPath, args: [script, ...args] };
	}
	if (!/^(node|bun)(\.exe)?$/i.test(basename(process.execPath))) {
		return { command: process.execPath, args };
	}
	return { command: "pi", args };
}

interface SpawnArgs {
	model: string;
	thinking?: ThinkingLevel;
	tools: string;
	systemPrompt: string;
	task: string;
	env: NodeJS.ProcessEnv;
	signal?: AbortSignal;
}

interface RunResult {
	ok: boolean;
	stdout: string;
	stderr: string;
	exitCode: number;
}

async function spawnSubagent(args: SpawnArgs): Promise<RunResult> {
	const piArgs = ["-p", "--no-session", "--model", args.model, "--tools", args.tools];
	if (args.thinking) piArgs.push("--thinking", args.thinking);
	if (args.systemPrompt) piArgs.push("--append-system-prompt", args.systemPrompt);
	piArgs.push(`Task: ${args.task}`);

	const { command, args: cmdArgs } = getPiInvocation(piArgs);

	return new Promise<RunResult>((resolve) => {
		const child = spawn(command, cmdArgs, {
			cwd: process.cwd(),
			shell: false,
			stdio: ["pipe", "pipe", "pipe"],
			env: args.env,
		});

		let stdout = "";
		let stderr = "";
		let settled = false;

		const killChild = () => {
			child.kill("SIGTERM");
			setTimeout(() => {
				if (!settled) child.kill("SIGKILL");
			}, SIGKILL_GRACE_MS).unref();
		};

		const overflowGuard = () => {
			if (stdout.length + stderr.length <= MAX_OUTPUT_BYTES || settled) return;
			stderr += `\n[killed: subagent output exceeded ${MAX_OUTPUT_BYTES} bytes]`;
			killChild();
		};

		child.stdin.on("error", () => {});
		child.stdin.end();
		child.stdout.on("data", (chunk) => {
			stdout += chunk.toString();
			overflowGuard();
		});
		child.stderr.on("data", (chunk) => {
			stderr += chunk.toString();
			overflowGuard();
		});

		const onAbort = () => {
			if (!settled) killChild();
		};
		args.signal?.addEventListener("abort", onAbort, { once: true });
		if (args.signal?.aborted) onAbort();

		const finish = (exitCode: number) => {
			if (settled) return;
			settled = true;
			args.signal?.removeEventListener("abort", onAbort);
			const trimmed = stdout.trim();
			resolve({
				ok: exitCode === 0 && trimmed.length > 0,
				stdout: trimmed,
				stderr: stderr.trim(),
				exitCode,
			});
		};

		child.on("close", (code) => finish(code ?? 0));
		child.on("error", (err) => {
			stderr += err.message;
			finish(1);
		});
	});
}

function readEnvInt(name: string, fallback: number): number {
	const n = Number.parseInt(process.env[name] ?? "", 10);
	return Number.isFinite(n) && n >= 0 ? n : fallback;
}

const ExpertParams = Type.Object({
	task_type: StringEnum(TASK_AXES, {
		description: "Capability axis. See the `expert-routing` skill for axis descriptions and decision rules.",
	}),
	task: Type.String({
		description:
			"Task brief, complete on its own. Include the goal, output format, file paths, constraints, and what 'done' looks like — the subagent cannot see this conversation.",
	}),
	model: Type.Optional(
		Type.String({
			description:
				"Optional model override as a fully-qualified OpenRouter string (e.g. 'openrouter/<vendor>/<model>'). Bypasses the axis fallback chain.",
		}),
	),
	thinking: Type.Optional(
		StringEnum(THINKING_LEVELS, { description: "Optional thinking-level override. Use 'xhigh' for reasoning-heavy tasks, 'off' for simple lookups, 'medium' as a balanced default." }),
	),
});

export default function (pi: ExtensionAPI) {
	pi.registerTool({
		name: "expert",
		label: "Expert subagent",
		description:
			"Delegate a sub-task to an expert subagent on the OpenRouter model best suited to the chosen capability axis.",
		promptSnippet:
			"Reach for `expert` when a sub-task fits one capability axis better than the current model.",
		promptGuidelines: [
			`Capability axes: ${TASK_AXES.join(", ")}.`,
			"The subagent runs in a fresh pi process and cannot see this conversation — pass everything it needs in `task`.",
			"See the `expert-routing` skill for axis descriptions, decision rules, and examples.",
		],
		parameters: ExpertParams,
		async execute(_toolCallId, params, signal) {
			const depth = readEnvInt(DEPTH_ENV, 0);
			const maxDepth = readEnvInt(MAX_DEPTH_ENV, DEFAULT_MAX_DEPTH);
			if (depth >= maxDepth) {
				const details: ExpertDetails = { reason: "max_depth_exceeded", depth, maxDepth };
				return {
					content: [
						{
							type: "text",
							text: `Cannot delegate: subagent depth limit reached (depth=${depth}, max=${maxDepth}). Complete this task without further delegation.`,
						},
					],
					details,
				};
			}

			const axis = params.task_type;
			const config = ROUTING[axis];
			const candidates = params.model
				? [{ model: params.model, thinking: params.thinking }]
				: config.models.map((m) => ({
						model: m.model,
						thinking: params.thinking ?? m.thinking,
					}));

			const childEnv: NodeJS.ProcessEnv = {
				...process.env,
				[DEPTH_ENV]: String(depth + 1),
				[MAX_DEPTH_ENV]: String(maxDepth),
				PI_OFFLINE: "1",
			};

			const errors: NonNullable<ExpertDetails["errors"]> = [];
			for (const choice of candidates) {
				if (signal?.aborted) break;
				const result = await spawnSubagent({
					model: choice.model,
					thinking: choice.thinking,
					tools: config.tools,
					systemPrompt: config.systemPrompt,
					task: params.task,
					env: childEnv,
					signal,
				});
				if (result.ok) {
					const details: ExpertDetails = {
						axis,
						model: choice.model,
						thinking: choice.thinking,
						attempts: errors.length + 1,
					};
					return {
						content: [{ type: "text", text: result.stdout }],
						details,
					};
				}
				errors.push({
					model: choice.model,
					exitCode: result.exitCode,
					stderr: result.stderr.slice(-500),
				});
			}

			const summary = errors
				.map((e, i) => `  ${i + 1}. ${e.model} (exit=${e.exitCode}): ${e.stderr || "(no stderr)"}`)
				.join("\n");
			const details: ExpertDetails = { axis, errors };
			return {
				content: [
					{
						type: "text",
						text: `All ${errors.length} candidate model(s) failed for axis "${axis}":\n${summary}`,
					},
				],
				details,
			};
		},
	});
}
