/**
 * Compiles every official template (basic, math and academic) with the
 * sandbox image, using the same `docker run` hardening flags as the app,
 * and reports pass/fail per engine. Run after editing templates or the
 * compiler image:
 *
 *   npm run templates:verify                  # tectonic + pdflatex
 *   npm run templates:verify -- tectonic      # one engine
 *   npm run templates:verify -- tectonic,pdflatex ./out   # keep full-size PNGs
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

import { slugifyFilename } from "../lib/utils";
import { officialTemplates, templateFiles } from "../prisma/official-templates";
import { compileInSandbox } from "./lib/sandbox";

const engines = (process.argv[2] ?? "tectonic,pdflatex").split(",");
const previewDir = process.argv[3];
if (previewDir) mkdirSync(previewDir, { recursive: true });

let failures = 0;
for (const template of officialTemplates) {
	for (const engine of engines) {
		const result = compileInSandbox(templateFiles(template), engine);
		console.log(
			`${result.ok ? "OK  " : "FAIL"} ${engine.padEnd(9)} ${result.seconds.toFixed(1).padStart(5)}s  ${template.title}${result.ok ? "" : `\n       ${result.firstError ?? "no output"}`}`,
		);

		if (!result.ok) failures += 1;
		const png = path.join(result.outputDir, "output.png");
		if (result.ok && previewDir && existsSync(png)) {
			const slug = slugifyFilename(template.title);
			copyFileSync(png, path.join(previewDir, `${slug}.${engine}.png`));
		}
		result.cleanup();
	}
}

if (failures > 0) {
	console.error(`\n${failures} compile(s) failed.`);
	process.exit(1);
}
console.log("\nAll templates compiled.");
