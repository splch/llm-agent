import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROUTING, TASK_AXES, THINKING_LEVELS } from "../routing.ts";

const README = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const SKILL = readFileSync(new URL("../skills/expert-routing/SKILL.md", import.meta.url), "utf8");
const LEVELS = THINKING_LEVELS as readonly string[];

test("routing config is valid and docs are exhaustive", () => {
	for (const axis of TASK_AXES) {
		const c = ROUTING[axis];
		assert.ok(c?.models.length, `${axis} has no models`);
		assert.ok(c.systemPrompt.trim() && c.tools.trim(), `${axis} missing prompt or tools`);
		for (const m of c.models) {
			assert.ok(m.model.startsWith("openrouter/"), `${axis}: '${m.model}' must be openrouter/`);
			if (m.thinking) assert.ok(LEVELS.includes(m.thinking), `${axis}: invalid thinking '${m.thinking}'`);
		}
		assert.ok(SKILL.includes(`\`${axis}\``), `SKILL.md missing axis '${axis}'`);
	}
	for (const l of THINKING_LEVELS) assert.ok(README.includes(`\`${l}\``), `README missing thinking '${l}'`);
});
