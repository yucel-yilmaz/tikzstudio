import { spawn } from "node:child_process";
import {
	mkdir,
	mkdtemp,
	readFile,
	rm,
	stat,
	writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { isSafeProjectPath } from "@/lib/file-path";
import { inferCompileErrorCode } from "@/server/compiler/parser";
import type {
	CompileInput,
	CompileResult,
	CompilerAdapter,
} from "@/server/compiler/types";

export class DockerCompilerAdapter implements CompilerAdapter {
	async compile(input: CompileInput): Promise<CompileResult> {
		const startedAt = new Date();
		const sourceBytes = input.files.reduce((sum, file) => {
			return (
				sum +
				(file.binaryContent
					? file.binaryContent.length
					: Buffer.byteLength(file.content, "utf8"))
			);
		}, 0);

		if (sourceBytes > env.MAX_SOURCE_SIZE_KB * 1024) {
			throw new AppError(
				"VALIDATION_ERROR",
				"Source exceeds allowed size.",
				400,
				{
					limitKb: env.MAX_SOURCE_SIZE_KB,
				},
			);
		}

		const workRoot = env.COMPILE_WORK_DIR
			? path.resolve(env.COMPILE_WORK_DIR)
			: os.tmpdir();
		await mkdir(workRoot, { recursive: true });
		const workspace = await mkdtemp(path.join(workRoot, "tikzstudio-"));

		const outputDir = path.join(workspace, "output");
		await mkdir(outputDir, { recursive: true });

		try {
			for (const file of input.files) {
				// Defense in depth: paths are validated at the API boundary, but
				// never write outside the workspace even if a bad row slips in.
				const target = path.resolve(workspace, file.path);
				if (
					!isSafeProjectPath(file.path) ||
					!target.startsWith(`${workspace}${path.sep}`)
				) {
					throw new AppError(
						"SECURITY_BLOCKED",
						`Unsafe file path rejected: ${file.path}`,
						400,
					);
				}
				await mkdir(path.dirname(target), { recursive: true });
				if (file.binaryContent) {
					await writeFile(target, file.binaryContent);
				} else {
					await writeFile(target, file.content, "utf8");
				}
			}

			const args = [
				"run",
				"--rm",
				"--network",
				"none",
				"--memory",
				`${env.COMPILE_MEMORY_LIMIT_MB}m`,
				"--cpus",
				`${env.COMPILE_CPU_LIMIT}`,
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
				env.DOCKER_COMPILER_IMAGE,
				input.engine.toLowerCase(),
				input.mainFilePath,
			];

			// Biber pipeline runs 4 passes — allow 10× the standard timeout
			const timeoutMs =
				input.engine === "PDFLATEX_BIBER"
					? env.COMPILE_TIMEOUT_SECONDS * 1000 * 10
					: env.COMPILE_TIMEOUT_SECONDS * 1000;

			const { code, log, timedOut } = await this.runDocker(args, timeoutMs);
			const finishedAt = new Date();
			const pdfPath = path.join(outputDir, "output.pdf");
			const svgPath = path.join(outputDir, "output.svg");
			const pngPath = path.join(outputDir, "output.png");

			if (timedOut) {
				return {
					status: "TIMEOUT",
					log,
					errorCode: "TIMEOUT",
					pdfOutput: null,
					svgOutput: null,
					pngOutput: null,
					startedAt,
					finishedAt,
				};
			}

			if (code !== 0) {
				return {
					status: "FAILED",
					log,
					errorCode: inferCompileErrorCode(log),
					pdfOutput: null,
					svgOutput: null,
					pngOutput: null,
					startedAt,
					finishedAt,
				};
			}

			const fileInfo = await stat(pdfPath);
			if (fileInfo.size > env.MAX_OUTPUT_SIZE_MB * 1024 * 1024) {
				return {
					status: "FAILED",
					log: `${log}\nOutput exceeded maximum size.`,
					errorCode: "SECURITY_BLOCKED",
					pdfOutput: null,
					svgOutput: null,
					pngOutput: null,
					startedAt,
					finishedAt,
				};
			}

			let svgOutput: Buffer | null = null;
			const svgInfo = await stat(svgPath).catch(() => null);
			if (svgInfo) {
				if (svgInfo.size > env.MAX_OUTPUT_SIZE_MB * 1024 * 1024) {
					return {
						status: "FAILED",
						log: `${log}\nSVG output exceeded maximum size.`,
						errorCode: "SECURITY_BLOCKED",
						pdfOutput: null,
						svgOutput: null,
						pngOutput: null,
						startedAt,
						finishedAt,
					};
				}
				svgOutput = await readFile(svgPath);
			}

			let pngOutput: Buffer | null = null;
			const pngInfo = await stat(pngPath).catch(() => null);
			if (pngInfo) {
				pngOutput = await readFile(pngPath);
			}

			return {
				status: "SUCCESS",
				log,
				errorCode: null,
				pdfOutput: await readFile(pdfPath),
				svgOutput,
				pngOutput,
				startedAt,
				finishedAt,
			};
		} catch (error) {
			const finishedAt = new Date();
			const message =
				error instanceof Error ? error.message : "Compile failed.";
			return {
				status: "FAILED",
				log: message,
				errorCode: inferCompileErrorCode(message),
				pdfOutput: null,
				svgOutput: null,
				pngOutput: null,
				startedAt,
				finishedAt,
			};
		} finally {
			await rm(workspace, { recursive: true, force: true });
		}
	}

	private async runDocker(
		args: string[],
		timeoutMs = env.COMPILE_TIMEOUT_SECONDS * 1000,
	) {
		return new Promise<{ code: number | null; log: string; timedOut: boolean }>(
			(resolve) => {
				const child = spawn("docker", args, {
					cwd: process.cwd(),
					stdio: ["ignore", "pipe", "pipe"],
				});

				let log = "";
				let settled = false;

				const timeout = setTimeout(() => {
					settled = true;
					child.kill("SIGKILL");
					resolve({
						code: null,
						log: `${log}\nCompilation timed out.`,
						timedOut: true,
					});
				}, timeoutMs);

				child.stdout.on("data", (chunk: Buffer) => {
					log += chunk.toString("utf8");
				});

				child.stderr.on("data", (chunk: Buffer) => {
					log += chunk.toString("utf8");
				});

				child.on("close", (code) => {
					if (settled) {
						return;
					}

					clearTimeout(timeout);
					resolve({
						code,
						log,
						timedOut: false,
					});
				});
			},
		);
	}
}
