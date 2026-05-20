import { CompileStatus } from "@/generated/prisma";
import { COMPILE_QUEUE, type CompileJobPayload, getBoss } from "@/lib/pgboss";
import { prisma } from "@/lib/prisma";
import { runCompileJob } from "@/server/services/compile";

let workerStarted = false;

/**
 * Register the pg-boss worker that processes queued compile jobs.
 * Idempotent — calling it more than once is a no-op so it's safe to invoke
 * from the Next.js instrumentation hook on every server start.
 */
export async function startCompileWorker(): Promise<void> {
	if (workerStarted) return;

	const boss = await getBoss();
	workerStarted = true;
	await boss.createQueue(COMPILE_QUEUE);

	await boss.work<CompileJobPayload>(
		COMPILE_QUEUE,
		{ batchSize: 1, localConcurrency: 2 },
		async (jobs) => {
			for (const job of jobs) {
				const { jobId } = job.data;
				try {
					await runCompileJob(jobId);
				} catch (error) {
					console.error("[compile-worker] job failed:", jobId, error);
					const message =
						error instanceof Error ? error.message : "Compile job failed.";
					await prisma.compileJob
						.update({
							where: { id: jobId },
							data: {
								status: CompileStatus.FAILED,
								log: message,
								errorCode: "UNKNOWN_ERROR",
								finishedAt: new Date(),
							},
						})
						.catch((dbErr) => {
							console.error("[compile-worker] db update failed:", dbErr);
						});
					throw error;
				}
			}
		},
	);

	console.log("[compile-worker] started");
}
