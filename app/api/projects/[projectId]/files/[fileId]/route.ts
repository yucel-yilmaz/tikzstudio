import { toProjectFileDto } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { updateFileSchema } from "@/server/schemas/project";
import { updateProjectFileForUser } from "@/server/services/projects";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string; fileId: string }> },
) {
  try {
    const session = await getSessionFromHeaders(request.headers);
    if (!session) {
      return Response.json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } }, { status: 401 });
    }

    const { projectId, fileId } = await context.params;
    const body = updateFileSchema.parse(await request.json());
    const file = await updateProjectFileForUser(session.user.id, projectId, fileId, body.content);

    return Response.json(toProjectFileDto(file));
  } catch (error) {
    return toErrorResponse(error);
  }
}
