/**
 * Compiles a set of files with the compiler image using the same hardening
 * flags as the app's DockerCompilerAdapter. Shared by the template scripts.
 */
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

export type SandboxFile = { path: string; content: string; isMain?: boolean };

export type SandboxResult = {
	ok: boolean;
	seconds: number;
	firstError: string | null;
	/** Directory holding output.pdf / output.svg / output.png. */
	outputDir: string;
	cleanup(): void;
};

export function compileInSandbox(
	files: SandboxFile[],
	engine: string,
	image = process.env.DOCKER_COMPILER_IMAGE ?? "tikzlab-compiler:latest",
): SandboxResult {
	const mainFile = files.find((file) => file.isMain) ?? files[0];
	const workspace = mkdtempSync(path.join(os.tmpdir(), "tpl-sandbox-"));
	const outputDir = path.join(workspace, "output");
	mkdirSync(outputDir);
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
			`${outputDir}:/output`,
			image,
			engine,
			mainFile.path,
		],
		{ encoding: "utf8", timeout: 60_000 },
	);

	return {
		ok: result.status === 0 && existsSync(path.join(outputDir, "output.pdf")),
		seconds: (Date.now() - started) / 1000,
		firstError:
			`${result.stdout}${result.stderr}`
				.split("\n")
				.find((line) => /^!|^error:/.test(line)) ?? null,
		outputDir,
		cleanup: () => rmSync(workspace, { recursive: true, force: true }),
	};
}
