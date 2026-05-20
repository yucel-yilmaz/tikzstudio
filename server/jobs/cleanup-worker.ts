import { readdir } from "node:fs/promises";
import path from "node:path";

import { CompileStatus } from "@/generated/prisma";
import { getBoss } from "@/lib/pgboss";
import { prisma } from "@/lib/prisma";
import {
	getArtifactRoot,
	removeCompileOutput,
} from "@/server/compiler/storage";

const CLEANUP_QUEUE = "cleanup";
const ARTIFACT_TTL_HOURS = 24;
const STALE_JOB_TIMEOUT_MINUTES = 30;

/**
 * On server start, mark any jobs stuck in RUNNING/PENDING as FAILED.
 * These were interrupted by a server crash or restart.
 */
export async function recoverStaleJobs(): Promise<void> {
	const staleThreshold = new Date(
		Date.now() - STALE_JOB_TIMEOUT_MINUTES * 60 * 1000,
	);

	const updated = await prisma.compileJob.updateMany({
		where: {
			status: { in: [CompileStatus.RUNNING, CompileStatus.PENDING] },
			createdAt: { lt: staleThreshold },
		},
		data: {
			status: CompileStatus.FAILED,
			log: "Derleme sunucu yeniden başlatma sırasında kesintiye uğradı.",
			errorCode: "UNKNOWN_ERROR",
			finishedAt: new Date(),
		},
	});

	if (updated.count > 0) {
		console.log(`[cleanup] recovered ${updated.count} stale compile job(s)`);
	}
}

async function runCleanup(): Promise<void> {
	await cleanOrphanedArtifacts();
	await pruneOldArtifacts();
}

/**
 * Delete disk artifacts for jobs older than ARTIFACT_TTL_HOURS where the
 * project has at least one newer successful compile.
 */
async function pruneOldArtifacts(): Promise<void> {
	const cutoff = new Date(Date.now() - ARTIFACT_TTL_HOURS * 60 * 60 * 1000);

	const oldJobs = await prisma.compileJob.findMany({
		where: {
			finishedAt: { lt: cutoff },
			outputUrl: { not: null },
		},
		select: { id: true, projectId: true },
	});

	if (oldJobs.length === 0) return;

	const projectIds = [...new Set(oldJobs.map((j) => j.projectId))];

	const latestByProject = await prisma.compileJob.findMany({
		where: {
			projectId: { in: projectIds },
			status: CompileStatus.SUCCESS,
		},
		orderBy: { finishedAt: "desc" },
		distinct: ["projectId"],
		select: { id: true, projectId: true },
	});

	const latestIdSet = new Set(latestByProject.map((j) => j.id));

	let pruned = 0;
	for (const job of oldJobs) {
		if (latestIdSet.has(job.id)) continue;
		try {
			await removeCompileOutput(job.id);
			await prisma.compileJob.update({
				where: { id: job.id },
				data: { outputUrl: null, svgOutputUrl: null },
			});
			pruned++;
		} catch {
			// ignore — artifact may already be missing
		}
	}

	if (pruned > 0) {
		console.log(`[cleanup] pruned artifacts for ${pruned} old job(s)`);
	}
}

/**
 * Remove artifact directories on disk that have no matching DB record.
 */
async function cleanOrphanedArtifacts(): Promise<void> {
	const artifactRoot = getArtifactRoot();

	let entries: string[];
	try {
		entries = await readdir(artifactRoot);
	} catch {
		return;
	}

	for (const entry of entries) {
		const job = await prisma.compileJob.findUnique({
			where: { id: entry },
			select: { id: true },
		});

		if (!job) {
			try {
				const { rm } = await import("node:fs/promises");
				await rm(path.join(artifactRoot, entry), {
					recursive: true,
					force: true,
				});
			} catch {
				// ignore
			}
		}
	}
}

export async function startCleanupWorker(): Promise<void> {
	const boss = await getBoss();

	await boss.createQueue(CLEANUP_QUEUE);

	await boss.work(CLEANUP_QUEUE, { batchSize: 1 }, async () => {
		try {
			await runCleanup();
		} catch (error) {
			console.error("[cleanup-worker] cleanup failed:", error);
		}
	});

	// Schedule cleanup to run every hour
	await boss.schedule(CLEANUP_QUEUE, "0 * * * *", {}, { tz: "UTC" });

	// Kick off an immediate run at startup
	await boss.send(CLEANUP_QUEUE, {});

	console.log("[cleanup-worker] started");
}
