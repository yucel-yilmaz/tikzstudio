/**
 * Renders a 480×360 PNG preview of every official template into
 * public/template-previews/<slug>.png (compiled with Tectonic in the
 * sandbox). The seed points each official template's previewUrl at it.
 * Re-run after adding or editing templates:
 *
 *   npm run templates:previews
 *
 * tests/server/template-previews.test.ts fails when a preview is missing.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
	DEFAULT_PROJECT_SOURCE,
	DEFAULT_TEMPLATE_PREVIEW_URL,
} from "../lib/defaults";
import { makeThumbnail } from "../lib/thumbnail";
import { slugifyFilename } from "../lib/utils";
import { officialTemplates, templateFiles } from "../prisma/official-templates";
import { compileInSandbox } from "./lib/sandbox";

const OUT_DIR = path.join(process.cwd(), "public/template-previews");

async function main() {
	rmSync(OUT_DIR, { recursive: true, force: true });
	mkdirSync(OUT_DIR, { recursive: true });

	const jobs = [
		{
			title: "Varsayılan TikZ (yeni boş proje)",
			fileName: path.basename(DEFAULT_TEMPLATE_PREVIEW_URL),
			files: [{ path: "main.tex", content: DEFAULT_PROJECT_SOURCE }],
		},
		...officialTemplates.map((template) => ({
			title: template.title,
			fileName: `${slugifyFilename(template.title)}.png`,
			files: templateFiles(template),
		})),
	];

	let failures = 0;
	for (const job of jobs) {
		const result = compileInSandbox(job.files, "tectonic");
		try {
			if (!result.ok) {
				failures += 1;
				console.log(`FAIL ${job.title}: ${result.firstError}`);
				continue;
			}
			const png = readFileSync(path.join(result.outputDir, "output.png"));
			const thumbnail = await makeThumbnail(png);
			writeFileSync(path.join(OUT_DIR, job.fileName), thumbnail);
			console.log(
				`OK   ${(thumbnail.length / 1024).toFixed(0).padStart(4)} KB  ${job.fileName}`,
			);
		} finally {
			result.cleanup();
		}
	}

	if (failures > 0) process.exit(1);
}

void main();
