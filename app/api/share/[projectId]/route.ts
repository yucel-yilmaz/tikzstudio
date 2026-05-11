import { toProjectDetail } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { requirePublicProject } from "@/server/services/projects";

export async function GET(
	_request: Request,
	context: { params: Promise<{ projectId: string }> },
) {
	try {
		const { projectId } = await context.params;
		const project = await requirePublicProject(projectId);

		return Response.json(toProjectDetail(project));
	} catch (error) {
		return toErrorResponse(error);
	}
}
