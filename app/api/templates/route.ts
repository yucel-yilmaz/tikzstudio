import { toTemplateDto } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import type { CreateTemplateInput } from "@/lib/types";
import { createUserTemplate, listTemplates } from "@/server/services/templates";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const session = await getSessionFromHeaders(request.headers);
		const templates = await listTemplates(
			url.searchParams.get("category") ?? undefined,
			url.searchParams.get("search") ?? undefined,
			session?.user.id,
		);

		return Response.json({
			templates: templates.map(toTemplateDto),
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function POST(request: Request) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session)
			return Response.json({ error: "Unauthorized" }, { status: 401 });

		const body = (await request.json()) as CreateTemplateInput;
		const template = await createUserTemplate(session.user.id, body);
		return Response.json(toTemplateDto(template), { status: 201 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
