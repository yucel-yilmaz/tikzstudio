import { prisma } from "@/lib/prisma";
import { slugifyFilename } from "@/lib/utils";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { readCompileOutput } from "@/server/compiler/storage";

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
    const job = await prisma.compileJob.findFirst({
      where: {
        id: jobId,
        project: {
          ownerId: session.user.id,
          deletedAt: null,
        },
      },
      include: {
        project: true,
      },
    });

    if (!job || !job.outputUrl) {
      return Response.json({ error: { code: "NOT_FOUND", message: "Output not found." } }, { status: 404 });
    }

    const download = new URL(request.url).searchParams.get("download") === "1";
    const buffer = await readCompileOutput(jobId);
    const fileName = `${slugifyFilename(job.project.title) || "tikzlab-project"}.pdf`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
