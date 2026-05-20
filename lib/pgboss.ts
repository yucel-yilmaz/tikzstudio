import { PgBoss } from "pg-boss";

declare global {
	// eslint-disable-next-line no-var
	var pgBoss: PgBoss | undefined;
	// eslint-disable-next-line no-var
	var pgBossReady: Promise<PgBoss> | undefined;
}

function createBoss(): PgBoss {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error("DATABASE_URL is required for pg-boss.");
	}

	return new PgBoss({
		connectionString,
		schema: "pgboss",
	});
}

/**
 * Get the singleton pg-boss instance. Starts the boss on first call and
 * memoises the start promise so concurrent callers get the same ready boss.
 */
export async function getBoss(): Promise<PgBoss> {
	if (globalThis.pgBoss) {
		return globalThis.pgBoss;
	}

	if (!globalThis.pgBossReady) {
		const boss = createBoss();
		boss.on("error", (error) => {
			console.error("[pg-boss] error:", error);
		});

		globalThis.pgBossReady = boss
			.start()
			.then((started) => {
				globalThis.pgBoss = started;
				return started;
			})
			.catch((error) => {
				// Clear the cached promise so the next caller retries fresh.
				globalThis.pgBossReady = undefined;
				throw error;
			});
	}

	return globalThis.pgBossReady;
}

export const COMPILE_QUEUE = "compile";

export type CompileJobPayload = {
	jobId: string;
};
