import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { slugifyFilename } from "@/lib/utils";
import { officialTemplates, templateFiles } from "@/prisma/official-templates";

const WARMUP_DIR = path.join(process.cwd(), "docker/compiler/warmup-templates");

describe("compiler warm-up templates", () => {
	it("contain exactly the official templates (run `npm run warmup:sync`)", () => {
		const expected = officialTemplates.map((t) => slugifyFilename(t.title));
		expect(readdirSync(WARMUP_DIR).sort()).toEqual([...expected].sort());
	});

	it.each(
		officialTemplates.map((t) => [t.title, t] as const),
	)("%s is in sync (run `npm run warmup:sync`)", (_title, template) => {
		const dir = path.join(WARMUP_DIR, slugifyFilename(template.title));
		for (const file of templateFiles(template)) {
			const target = path.join(dir, file.path);
			expect(existsSync(target)).toBe(true);
			expect(readFileSync(target, "utf8")).toBe(file.content);
		}
		const main = templateFiles(template).find((file) => file.isMain);
		expect(main?.path).toBe("main.tex");
	});

	it("have unique slugs", () => {
		const slugs = officialTemplates.map((t) => slugifyFilename(t.title));
		expect(new Set(slugs).size).toBe(slugs.length);
	});
});
