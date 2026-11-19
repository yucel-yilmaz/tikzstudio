/**
 * Compiles every high-school math template with the sandbox image, using the
 * same `docker run` hardening flags as the app, and reports pass/fail per
 * engine. Run after editing prisma/math-templates.ts or the compiler image:
 *
 *   npm run templates:verify                  # tectonic + pdflatex
 *   npm run templates:verify -- tectonic      # one engine
 *   npm run templates:verify -- tectonic,pdflatex ./out   # keep PNG previews
 */
import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { slugifyFilename } from "../lib/utils";
import { mathTemplates } from "../prisma/math-templates";

const engines = (process.argv[2] ?? "tectonic,pdflatex").split(",");
const previewDir = process.argv[3];
const image = process.env.DOCKER_COMPILER_IMAGE ?? "tikzlab-compiler:latest";
if (previewDir) mkdirSync(previewDir, { recursive: true });

let failures = 0;
for (const template of mathTemplates) {
	const files = template.files ?? [
		{ path: "main.tex", content: template.content ?? "", isMain: true },
	];
	const mainFile = files.find((file) => file.isMain) ?? files[0];

	for (const engine of engines) {
		const workspace = mkdtempSync(path.join(os.tmpdir(), "tpl-verify-"));
		const output = path.join(workspace, "output");
		mkdirSync(output);
		for (const file of files) {
			const target = path.join(workspace, file.path);
			mkdirSync(path.dirname(target), { recursive: true });
			writeFileSync(target, file.content);
		}

		const started = Date.now();
		const result = spawnSync(
			"docker",
			[
				"run",
				"--rm",
				"--network",
				"none",
				"--memory",
				"256m",
				"--cpus",
				"0.5",
				"--pids-limit",
				"64",
				"--read-only",
				"--tmpfs",
				"/tmp:rw,noexec,nosuid,size=64m",
				"--security-opt",
				"no-new-privileges",
				"--cap-drop",
				"ALL",
				"-v",
				`${workspace}:/workspace`,
				"-v",
				`${output}:/output`,
				image,
				engine,
				mainFile.path,
			],
			{ encoding: "utf8", timeout: 60_000 },
		);

		const ok =
			result.status === 0 && existsSync(path.join(output, "output.pdf"));
		const seconds = ((Date.now() - started) / 1000).toFixed(1);
		const firstError = `${result.stdout}${result.stderr}`
			.split("\n")
			.find((line) => /^!|^error:/.test(line));
		console.log(
			`${ok ? "OK  " : "FAIL"} ${engine.padEnd(9)} ${seconds.padStart(5)}s  ${template.title}${ok ? "" : `\n       ${firstError ?? "no output"}`}`,
		);

		if (!ok) failures += 1;
		if (ok && previewDir && existsSync(path.join(output, "output.png"))) {
			const slug = slugifyFilename(template.title);
			copyFileSync(
				path.join(output, "output.png"),
				path.join(previewDir, `${slug}.${engine}.png`),
			);
		}
		rmSync(workspace, { recursive: true, force: true });
	}
}

if (failures > 0) {
	console.error(`\n${failures} compile(s) failed.`);
	process.exit(1);
}
console.log("\nAll templates compiled.");
