import { CompileStatus, type LatexEngine } from "@/generated/prisma";
import { DEFAULT_MAIN_FILE_PATH } from "@/lib/defaults";
import { AppError } from "@/lib/errors";
import { COMPILE_QUEUE, type CompileJobPayload, getBoss } from "@/lib/pgboss";
import { prisma } from "@/lib/prisma";
import { DockerCompilerAdapter } from "@/server/compiler/docker-adapter";
import {
	saveCompileOutput,
	saveCompileSvgOutput,
} from "@/server/compiler/storage";
import { requireOwnedProject } from "@/server/services/projects";

const compiler = new DockerCompilerAdapter();

const COMPILE_RATE_WINDOW_MS = 60_000;
const COMPILE_RATE_MAX = 5;

async function enforceCompileRateLimit(ownerId: string) {
	const recentCount = await prisma.compileJob.count({
		where: {
			project: { ownerId, deletedAt: null },
			createdAt: { gte: new Date(Date.now() - COMPILE_RATE_WINDOW_MS) },
		},
	});

	if (recentCount >= COMPILE_RATE_MAX) {
		throw new AppError(
			"RATE_LIMITED",
			`Çok fazla derleme isteği. Dakikada en fazla ${COMPILE_RATE_MAX} derleme yapabilirsiniz.`,
			429,
			{ retryAfterSeconds: 60 },
		);
	}
}

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

	await enforceCompileRateLimit(input.ownerId);

	const job = await prisma.compileJob.create({
		data: {
			projectId: project.id,
			engine: input.engine,
			status: CompileStatus.PENDING,
		},
	});

	const boss = await getBoss();
	const payload: CompileJobPayload = { jobId: job.id };
	await boss.send(COMPILE_QUEUE, payload);

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
			binaryContent: file.isBinary ? file.binaryContent : null,
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

export async function listCompileHistoryForProject(
	ownerId: string,
	projectId: string,
	limit = 20,
) {
	await requireOwnedProject(ownerId, projectId);
	return prisma.compileJob.findMany({
		where: {
			projectId,
			project: { ownerId, deletedAt: null },
		},
		orderBy: { createdAt: "desc" },
		take: Math.min(Math.max(limit, 1), 50),
	});
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
