import { toProjectFileDto } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { createFileSchema } from "@/server/schemas/project";
import {
	createProjectFileForUser,
	listProjectFilesForUser,
} from "@/server/services/projects";

export async function GET(
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
		const files = await listProjectFilesForUser(session.user.id, projectId);

		return Response.json({
			files: files.map(toProjectFileDto),
		});
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
		const body = createFileSchema.parse(await request.json());
		const file = await createProjectFileForUser(
			session.user.id,
			projectId,
			body,
		);

		return Response.json(toProjectFileDto(file), { status: 201 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
