import { toCompileJobDto } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { compileProjectSchema } from "@/server/schemas/project";
import {
	enqueueCompileForProject,
	getLatestCompileOutputForProject,
	listCompileHistoryForProject,
} from "@/server/services/compile";

export async function GET(
	request: Request,
	context: { params: Promise<{ projectId: string }> },
) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session) {
			return Response.json({ compileJob: null });
		}

		const { projectId } = await context.params;
		const url = new URL(request.url);

		if (url.searchParams.get("history") === "1") {
			const limit = Number.parseInt(url.searchParams.get("limit") ?? "20", 10);
			const jobs = await listCompileHistoryForProject(
				session.user.id,
				projectId,
				Number.isFinite(limit) ? limit : 20,
			);
			return Response.json({ jobs: jobs.map(toCompileJobDto) });
		}

		const job = await getLatestCompileOutputForProject(
			session.user.id,
			projectId,
		);

		return Response.json({ compileJob: job ? toCompileJobDto(job) : null });
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function POST(
	request: Request,
	context: { params: Promise<{ projectId: string }> },
) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session) {
			return Response.json(
				{
					error: { code: "UNAUTHORIZED", message: "Authentication required." },
				},
				{ status: 401 },
			);
		}

		const { projectId } = await context.params;
		const body = compileProjectSchema.parse(
			await request.json().catch(() => ({})),
		);
		const job = await enqueueCompileForProject({
			ownerId: session.user.id,
			projectId,
			engine: body.engine,
			mainFileId: body.mainFileId,
		});

		return Response.json(toCompileJobDto(job), { status: 202 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
