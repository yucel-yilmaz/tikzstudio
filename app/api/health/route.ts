import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Liveness/readiness probe for container orchestrators (Coolify, Docker
 * healthcheck). Reports 503 when the database is unreachable.
 */
export async function GET() {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return Response.json(
			{ status: "ok" },
			{ headers: { "Cache-Control": "no-store" } },
		);
	} catch {
		return Response.json(
			{ status: "error", database: "unreachable" },
			{ status: 503, headers: { "Cache-Control": "no-store" } },
		);
	}
}
