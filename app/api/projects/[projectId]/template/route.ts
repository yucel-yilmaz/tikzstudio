import { toTemplateDto } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { saveAsTemplateSchema } from "@/server/schemas/project";
import { createTemplateFromProject } from "@/server/services/templates";

/** Saves the current state of a project (all files) as a personal template. */
export async function POST(
	request: Request,
	context: { params: Promise<{ projectId: string }> },
) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session) {
			return Response.json(
				{
					error: { code: "UNAUTHORIZED", message: "Oturum açmanız gerekiyor." },
				},
				{ status: 401 },
			);
		}

		const { projectId } = await context.params;
		const body = saveAsTemplateSchema.parse(
			await request.json().catch(() => ({})),
		);
		const template = await createTemplateFromProject(
			session.user.id,
			projectId,
			body,
		);

		return Response.json(toTemplateDto(template), { status: 201 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
