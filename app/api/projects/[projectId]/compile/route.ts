import { toCompileJobDto } from "@/lib/dto";
import { toErrorResponse, unauthorizedResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { compileProjectSchema } from "@/server/schemas/project";
import {
	enqueueCompileForProject,
	getLatestCompileOutputForProject,
	getLatestPublicCompileOutput,
	listCompileHistoryForProject,
} from "@/server/services/compile";

export async function GET(
	request: Request,
	context: { params: Promise<{ projectId: string }> },
) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		const { projectId } = await context.params;
		const url = new URL(request.url);

		if (!session) {
			return publicCompileResponse(projectId);
		}

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
		if (!job) {
			// Not the owner (or never compiled): fall back to the public output.
			return publicCompileResponse(projectId);
		}

		return Response.json({ compileJob: toCompileJobDto(job) });
	} catch (error) {
		return toErrorResponse(error);
	}
}

/** Share-page view: the latest public output, without the owner's log. */
async function publicCompileResponse(projectId: string) {
	const job = await getLatestPublicCompileOutput(projectId);
	return Response.json({
		compileJob: job ? { ...toCompileJobDto(job), log: "" } : null,
	});
}

export async function POST(
	request: Request,
	context: { params: Promise<{ projectId: string }> },
) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session) {
			return unauthorizedResponse();
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
