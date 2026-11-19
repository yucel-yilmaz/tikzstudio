import { CompileStatus } from "@/generated/prisma";
import { AppError } from "@/lib/errors";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/messages";
import { COMPILE_QUEUE, type CompileJobPayload, getBoss } from "@/lib/pgboss";
import { prisma } from "@/lib/prisma";
import { runCompileJob } from "@/server/services/compile";

let workerStarted = false;

/** Language of the project owner, for messages stored in the compile log. */
async function ownerLocale(jobId: string): Promise<Locale> {
	const job = await prisma.compileJob
		.findUnique({
			where: { id: jobId },
			select: { project: { select: { owner: { select: { locale: true } } } } },
		})
		.catch(() => null);
	const locale = job?.project.owner.locale;
	return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

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
					const locale = await ownerLocale(jobId);
					const message =
						error instanceof AppError
							? error.localizedMessage(locale)
							: error instanceof Error
								? error.message
								: getTranslator(locale)("compileLog.jobFailed");
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
