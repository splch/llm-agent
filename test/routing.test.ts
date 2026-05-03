import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ROUTING, TASK_AXES, THINKING_LEVELS } from "../routing.ts";

const README = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const SKILL = readFileSync(
	new URL("../skills/expert-routing/SKILL.md", import.meta.url),
	"utf8",
);

test("every axis has at least one OpenRouter model with valid thinking", () => {
	for (const axis of TASK_AXES) {
		const config = ROUTING[axis];
		assert.ok(config, `missing config for ${axis}`);
		assert.ok(config.models.length > 0, `${axis} has no models`);
		for (const m of config.models) {
			assert.ok(
				m.model.startsWith("openrouter/"),
				`${axis}: '${m.model}' must be an openrouter/ id`,
			);
			if (m.thinking !== undefined) {
				assert.ok(
					(THINKING_LEVELS as readonly string[]).includes(m.thinking),
					`${axis}: invalid thinking level '${m.thinking}'`,
				);
			}
		}
	}
});

test("every axis has a non-empty system prompt and tools list", () => {
	for (const axis of TASK_AXES) {
		const c = ROUTING[axis];
		assert.ok(c.systemPrompt.trim().length > 0, `${axis} missing systemPrompt`);
		assert.ok(c.tools.trim().length > 0, `${axis} missing tools`);
	}
});

test("README documents every thinking level", () => {
	for (const level of THINKING_LEVELS) {
		assert.ok(
			README.includes(`\`${level}\``),
			`README missing thinking level '${level}'`,
		);
	}
});

test("expert-routing skill mentions every axis", () => {
	for (const axis of TASK_AXES) {
		assert.ok(
			SKILL.includes(`\`${axis}\``),
			`SKILL.md missing axis '${axis}'`,
		);
	}
});
