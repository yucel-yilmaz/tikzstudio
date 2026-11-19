/**
 * Writes every official template into docker/compiler/warmup-templates/ so
 * the compiler image build compiles them with network access and Tectonic
 * caches every package, TikZ library and font they need (it runs with
 * --only-cached at request time). Run after adding or editing templates:
 *
 *   npm run warmup:sync      # then rebuild: npm run compiler:build
 *
 * tests/server/warmup-sync.test.ts fails when this directory is stale.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { slugifyFilename } from "../lib/utils";
import { officialTemplates, templateFiles } from "../prisma/official-templates";

export const WARMUP_DIR = path.join(
	process.cwd(),
	"docker/compiler/warmup-templates",
);

rmSync(WARMUP_DIR, { recursive: true, force: true });
for (const template of officialTemplates) {
	const dir = path.join(WARMUP_DIR, slugifyFilename(template.title));
	for (const file of templateFiles(template)) {
		const target = path.join(dir, file.path);
		mkdirSync(path.dirname(target), { recursive: true });
		writeFileSync(target, file.content);
	}
}
console.log(
	`Wrote ${officialTemplates.length} templates to ${path.relative(process.cwd(), WARMUP_DIR)}/`,
);
