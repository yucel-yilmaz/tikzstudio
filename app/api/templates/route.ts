import { toTemplateDto } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { listTemplates } from "@/server/services/templates";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const templates = await listTemplates(
      url.searchParams.get("category") ?? undefined,
      url.searchParams.get("search") ?? undefined,
    );

    return Response.json({
      templates: templates.map(toTemplateDto),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
