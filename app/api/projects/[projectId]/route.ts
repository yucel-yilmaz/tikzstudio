import { toProjectDetail } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { updateProjectSchema } from "@/server/schemas/project";
import {
	requireOwnedProject,
	softDeleteProjectForUser,
	updateProjectForUser,
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
		const project = await requireOwnedProject(session.user.id, projectId);
		return Response.json(toProjectDetail(project));
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function PATCH(
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
		const body = updateProjectSchema.parse(await request.json());
		const project = await updateProjectForUser(
			session.user.id,
			projectId,
			body,
		);
		return Response.json(toProjectDetail(project));
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function DELETE(
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
		await softDeleteProjectForUser(session.user.id, projectId);
		return new Response(null, { status: 204 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
