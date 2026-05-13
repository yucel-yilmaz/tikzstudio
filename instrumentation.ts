/**
 * Next.js instrumentation hook — runs once on server startup.
 * Used here to boot the pg-boss compile worker so background jobs are
 * processed without requiring a separate worker process.
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
	if (process.env.NEXT_RUNTIME !== "nodejs") return;

	// Skip during static build (`next build`) — DATABASE_URL might be a dummy
	// and there's no long-running server to host the worker.
	if (process.env.NEXT_PHASE === "phase-production-build") return;

	const { startCompileWorker } = await import("@/server/jobs/compile-worker");
	try {
		await startCompileWorker();
	} catch (error) {
		console.error("[instrumentation] failed to start compile worker:", error);
	}
}
