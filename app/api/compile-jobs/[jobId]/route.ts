import { toCompileJobDto } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { getCompileJobForUser } from "@/server/services/compile";

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  try {
    const session = await getSessionFromHeaders(request.headers);
    if (!session) {
      return Response.json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } }, { status: 401 });
    }

    const { jobId } = await context.params;
    const job = await getCompileJobForUser(session.user.id, jobId);
    return Response.json(toCompileJobDto(job));
  } catch (error) {
    return toErrorResponse(error);
  }
}
