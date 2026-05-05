import { toProjectDetail, toProjectSummary } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { createProjectSchema } from "@/server/schemas/project";
import { createProjectForUser, listUserProjects } from "@/server/services/projects";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromHeaders(request.headers);
    if (!session) {
      return Response.json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } }, { status: 401 });
    }

    const search = new URL(request.url).searchParams.get("search") ?? undefined;
    const projects = await listUserProjects(session.user.id, search);

    return Response.json({
      projects: projects.map(toProjectSummary),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromHeaders(request.headers);
    if (!session) {
      return Response.json({ error: { code: "UNAUTHORIZED", message: "Authentication required." } }, { status: 401 });
    }

    const body = createProjectSchema.parse(await request.json());
    const template = body.templateId
      ? await prisma.template.findUnique({
          where: { id: body.templateId },
        })
      : null;
    const project = await createProjectForUser({
      ownerId: session.user.id,
      title: body.title,
      description: body.description,
      templateContent: template?.content,
    });

    return Response.json(toProjectDetail(project), { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
