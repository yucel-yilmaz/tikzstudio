import { toProjectFileDto } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { listProjectFilesForUser } from "@/server/services/projects";

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  try {
    const session = await getSessionFromHeaders(request.headers);
    if (!session) {
      return Response.json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } }, { status: 401 });
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
