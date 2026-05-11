import { CompileStatus, type LatexEngine } from "@/generated/prisma";
import { DEFAULT_MAIN_FILE_PATH } from "@/lib/defaults";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { DockerCompilerAdapter } from "@/server/compiler/docker-adapter";
import {
	saveCompileOutput,
	saveCompileSvgOutput,
} from "@/server/compiler/storage";
import { requireOwnedProject } from "@/server/services/projects";

const compiler = new DockerCompilerAdapter();

export async function enqueueCompileForProject(input: {
	ownerId: string;
	projectId: string;
	engine: LatexEngine;
	mainFileId?: string;
}) {
	const project = await requireOwnedProject(input.ownerId, input.projectId);
	const mainFile =
		(input.mainFileId
			? project.files.find((file) => file.id === input.mainFileId)
			: project.files.find((file) => file.isMain)) ??
		project.files.find((file) => file.path === DEFAULT_MAIN_FILE_PATH);

	if (!mainFile) {
		throw new AppError("MISSING_FILE", "Main file not found.", 400);
	}

	const job = await prisma.compileJob.create({
		data: {
			projectId: project.id,
			engine: input.engine,
			status: CompileStatus.PENDING,
		},
	});

	void runCompileJob(job.id).catch(async (error) => {
		const message =
			error instanceof Error ? error.message : "Compile job failed.";
		await prisma.compileJob.update({
			where: { id: job.id },
			data: {
				status: CompileStatus.FAILED,
				log: message,
				errorCode: "UNKNOWN_ERROR",
				finishedAt: new Date(),
			},
		});
	});

	return job;
}

export async function runCompileJob(jobId: string) {
	const job = await prisma.compileJob.findUnique({
		where: { id: jobId },
		include: {
			project: {
				include: {
					files: true,
				},
			},
		},
	});

	if (!job) {
		throw new AppError("NOT_FOUND", "Compile job not found.", 404);
	}

	const mainFile =
		job.project.files.find((file) => file.isMain) ?? job.project.files[0];
	if (!mainFile) {
		throw new AppError("MISSING_FILE", "No files available for compile.", 400);
	}

	await prisma.compileJob.update({
		where: { id: job.id },
		data: {
			status: CompileStatus.RUNNING,
			startedAt: new Date(),
			log: null,
			errorCode: null,
			outputUrl: null,
			svgOutputUrl: null,
		},
	});

	const result = await compiler.compile({
		jobId: job.id,
		projectId: job.projectId,
		engine: job.engine,
		mainFilePath: mainFile.path,
		files: job.project.files.map((file) => ({
			path: file.path,
			content: file.content,
		})),
	});

	if (result.pdfOutput) {
		await saveCompileOutput(job.id, result.pdfOutput);
	}

	if (result.svgOutput) {
		await saveCompileSvgOutput(job.id, result.svgOutput);
	}

	return prisma.compileJob.update({
		where: { id: job.id },
		data: {
			status: result.status,
			log: result.log,
			errorCode: result.errorCode,
			outputUrl: result.pdfOutput ? `/api/compile-jobs/${job.id}/output` : null,
			svgOutputUrl: result.svgOutput
				? `/api/compile-jobs/${job.id}/output?format=svg`
				: null,
			startedAt: result.startedAt,
			finishedAt: result.finishedAt,
		},
	});
}

export async function getCompileJobForUser(ownerId: string, jobId: string) {
	const job = await prisma.compileJob.findFirst({
		where: {
			id: jobId,
			project: {
				ownerId,
				deletedAt: null,
			},
		},
	});

	if (!job) {
		throw new AppError("NOT_FOUND", "Compile job not found.", 404);
	}

	return job;
}

export async function getLatestCompileOutputForProject(
	ownerId: string,
	projectId: string,
) {
	const job = await prisma.compileJob.findFirst({
		where: {
			projectId,
			status: CompileStatus.SUCCESS,
			outputUrl: {
				not: null,
			},
			project: {
				ownerId,
				deletedAt: null,
			},
		},
		orderBy: {
			finishedAt: "desc",
		},
	});

	return job;
}
