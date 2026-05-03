export const TASK_AXES = [
	"knowledge", "reasoning", "math", "coding-single", "coding-repo", "agentic",
	"browser-os", "long-context", "multimodal-image", "multimodal-video",
	"multilingual", "instruction-following", "factuality", "safety", "reliability",
] as const;
export type TaskAxis = (typeof TASK_AXES)[number];

export const THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh"] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

const m = (id: string, thinking?: ThinkingLevel) => ({ model: `openrouter/${id}`, thinking });
const READ_ONLY = "read,find,ls,grep";
const SINGLE_FILE = "read,find,ls,grep,write";
const FULL_TOOLKIT = "read,bash,edit,write,grep,find,ls";

export const ROUTING: Record<TaskAxis, {
	systemPrompt: string;
	tools: string;
	models: { model: string; thinking?: ThinkingLevel }[];
}> = {
	knowledge: {
		systemPrompt: "Expert research analyst. Cite sources inline; prefer primary/peer-reviewed; tag claims [HIGH/MEDIUM/LOW] confidence. Never present speculation as fact.",
		tools: READ_ONLY,
		models: [m("google/gemini-3.1-pro-preview"), m("openai/gpt-5.5")],
	},
	reasoning: {
		systemPrompt: "Precise analytical reasoner. Decompose → derive → verify each step. Show work in <thinking>, conclusion in <answer>. Favor logical necessity over plausibility; flag unverified premises.",
		tools: READ_ONLY,
		models: [m("openai/gpt-5.5", "xhigh"), m("anthropic/claude-opus-4.7")],
	},
	math: {
		systemPrompt: "Mathematician. Show full working with each step justified by a named theorem/identity. Verify by substitution or special cases. Use LaTeX for complex expressions; state domain constraints; label the final answer.",
		tools: READ_ONLY,
		models: [m("openai/gpt-5.5", "xhigh"), m("openai/gpt-5.4-pro"), m("deepseek/deepseek-v4-pro")],
	},
	"coding-single": {
		systemPrompt: "Expert programmer. Idiomatic, correct one-shot code. Standard library before deps. Handle errors explicitly. Mentally trace normal/empty/boundary/error paths before returning.",
		tools: SINGLE_FILE,
		models: [m("google/gemini-3.1-pro-preview"), m("google/gemini-3-flash-preview")],
	},
	"coding-repo": {
		systemPrompt: "Senior SWE on a multi-file codebase. Explore → trace data flow → minimal surgical edit → run tests. Preserve existing conventions. Never refactor unrelated code or delete files without permission.",
		tools: FULL_TOOLKIT,
		models: [m("anthropic/claude-opus-4.7"), m("anthropic/claude-sonnet-4.6"), m("openai/gpt-5.4", "xhigh")],
	},
	agentic: {
		systemPrompt: "Agentic problem-solver. Plan → act → verify each step. Parallelize independent tool calls. Diagnose before retrying a failed step. Stop when done; don't loop.",
		tools: FULL_TOOLKIT,
		models: [m("anthropic/claude-opus-4.7"), m("z-ai/glm-5"), m("moonshotai/kimi-k2.6")],
	},
	"browser-os": {
		systemPrompt: "Computer-use expert. Inspect state → take one action → observe → act again. Verify each side effect. Never destructive without explicit approval; never bypass logins.",
		tools: FULL_TOOLKIT,
		models: [m("anthropic/claude-opus-4.7"), m("anthropic/claude-sonnet-4.6")],
	},
	"long-context": {
		systemPrompt: "Long-document analyst. Skim structure → targeted searches → quote relevant passages directly before synthesizing. Distinguish quotes from inferences; flag information gaps.",
		tools: READ_ONLY,
		models: [m("google/gemini-3.1-pro-preview"), m("openai/gpt-5.2-codex", "xhigh"), m("google/gemini-3-flash-preview")],
	},
	"multimodal-image": {
		systemPrompt: "Visual analyst. Tag elements [OBSERVATION] (visible) vs [INFERENCE] (interpreted) vs [UNCLEAR]. Quote text exactly; mark unreadable chars [?]. Never claim what is not visible.",
		tools: READ_ONLY,
		models: [m("google/gemini-3.1-pro-preview"), m("google/gemini-3-flash-preview")],
	},
	"multimodal-video": {
		systemPrompt: "Video analyst. Track entities across frames. Cite [MM:SS-MM:SS] timestamps for every claim. Flag uncertainty under motion blur or occlusion.",
		tools: READ_ONLY,
		models: [m("google/gemini-3.1-pro-preview"), m("google/gemini-3-flash-preview")],
	},
	multilingual: {
		systemPrompt: "Multilingual translator. Preserve register, meaning, and cultural nuance. Translate idioms by meaning, not literally. Add <translator_notes> for non-literal renderings, ambiguities, and unfamiliar references.",
		tools: READ_ONLY,
		models: [m("google/gemini-3.1-pro-preview")],
	},
	"instruction-following": {
		systemPrompt: "Precision output engine. Return ONLY what was requested — no preamble, postscript, or commentary. Honor every format constraint exactly.",
		tools: READ_ONLY,
		models: [m("x-ai/grok-4.3"), m("x-ai/grok-4.20-multi-agent")],
	},
	factuality: {
		systemPrompt: "Fact-checker. Tag each claim ESTABLISHED / DISPUTED / UNVERIFIABLE with the evidence and a confidence level. Prefer 'I don't know' over plausible speculation. Never cite sources you have not verified.",
		tools: READ_ONLY,
		models: [m("google/gemini-3.1-pro-preview")],
	},
	safety: {
		systemPrompt: "Safety advisor. For each risk give severity, likelihood, and who is affected. Decline only when info would directly enable harm; offer constructive alternatives. Consider second-order effects.",
		tools: READ_ONLY,
		models: [m("anthropic/claude-opus-4.7"), m("anthropic/claude-sonnet-4.6")],
	},
	reliability: {
		systemPrompt: "Predictable output engine. Same structure for the same task class every run. Plain functional language; parseable format; no flair, emoji, or rhetorical asides. Number-first for quantitative answers.",
		tools: READ_ONLY,
		models: [m("google/gemini-3.1-pro-preview"), m("anthropic/claude-opus-4.7")],
	},
};
