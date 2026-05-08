import { toProjectFileDto } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { updateFileSchema } from "@/server/schemas/project";
import {
	deleteProjectFileForUser,
	updateProjectFileForUser,
} from "@/server/services/projects";

export async function PATCH(
	request: Request,
	context: { params: Promise<{ projectId: string; fileId: string }> },
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

		const { projectId, fileId } = await context.params;
		const body = updateFileSchema.parse(await request.json());
		const file = await updateProjectFileForUser(
			session.user.id,
			projectId,
			fileId,
			body,
		);

		return Response.json(toProjectFileDto(file));
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function DELETE(
	request: Request,
	context: { params: Promise<{ projectId: string; fileId: string }> },
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

		const { projectId, fileId } = await context.params;
		await deleteProjectFileForUser(session.user.id, projectId, fileId);

		return new Response(null, { status: 204 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
