import { toProjectDetail } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { forkProjectForUser } from "@/server/services/projects";

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
		const project = await forkProjectForUser(session.user.id, projectId);

		return Response.json(toProjectDetail(project), { status: 201 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
