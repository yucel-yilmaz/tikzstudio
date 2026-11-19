import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { isSafeProjectPath } from "@/lib/file-path";
import { mathTemplates } from "@/prisma/math-templates";

const warmup = readFileSync(
	path.join(process.cwd(), "docker/compiler/warmup-math.tex"),
	"utf8",
);

function sourcesOf(template: (typeof mathTemplates)[number]) {
	return template.files?.length
		? template.files.map((f) => f.content).join("\n")
		: (template.content ?? "");
}

describe("math templates", () => {
	it("have unique titles (the seed upserts by title)", () => {
		const titles = mathTemplates.map((t) => t.title);
		expect(new Set(titles).size).toBe(titles.length);
	});

	it.each(
		mathTemplates.map((t) => [t.title, t] as const),
	)("%s is a complete document with safe paths", (_title, template) => {
		const source = sourcesOf(template);
		expect(source).toContain("\\documentclass");
		expect(source).toContain("\\begin{document}");
		for (const file of template.files ?? []) {
			expect(isSafeProjectPath(file.path)).toBe(true);
		}
		if (template.files?.length) {
			expect(template.files.filter((f) => f.isMain)).toHaveLength(1);
		}
	});

	it.each(
		mathTemplates.map((t) => [t.title, t] as const),
	)("%s only uses TikZ libraries warmed for Tectonic", (_title, template) => {
		const source = sourcesOf(template);
		for (const match of source.matchAll(/\\usetikzlibrary\{([^}]*)\}/g)) {
			for (const lib of match[1].split(",").map((l) => l.trim())) {
				if (lib) expect(warmup).toMatch(new RegExp(`\\b${lib}\\b`));
			}
		}
	});

	it("load Turkish babel without the `=` shorthand", () => {
		for (const template of mathTemplates) {
			const source = sourcesOf(template);
			if (source.includes("{babel}")) {
				expect(source).toContain("shorthands=:!");
			}
		}
	});
});
