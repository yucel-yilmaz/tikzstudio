import { toCompileJobDto } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getLatestPublicCompileOutputForProject } from "@/server/services/compile";

export async function GET(
	_request: Request,
	context: { params: Promise<{ projectId: string }> },
) {
	try {
		const { projectId } = await context.params;
		const job = await getLatestPublicCompileOutputForProject(projectId);

		return Response.json({ compileJob: job ? toCompileJobDto(job) : null });
	} catch (error) {
		return toErrorResponse(error);
	}
}
