import { toTemplateDto } from "@/lib/dto";
import { toErrorResponse, unauthorizedResponse } from "@/lib/errors";
import { localeFromHeaders } from "@/lib/i18n/config";
import { foldCase } from "@/lib/i18n/format";
import {
	categoryFromEnglish,
	templateToEnglish,
} from "@/lib/official-content-en";
import { getSessionFromHeaders } from "@/lib/session";
import type { CreateTemplateInput } from "@/lib/types";
import { createUserTemplate, listTemplates } from "@/server/services/templates";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const session = await getSessionFromHeaders(request.headers);
		const category = url.searchParams.get("category") ?? undefined;
		const search = url.searchParams.get("search") ?? undefined;

		if (localeFromHeaders(request.headers) !== "en") {
			const templates = await listTemplates(category, search, session?.user.id);
			return Response.json({ templates: templates.map(toTemplateDto) });
		}

		// English: official templates are stored with Turkish names, so search
		// the translated metadata (and the original) in memory.
		const query = search ? foldCase("en", search) : "";
		const templates = (
			await listTemplates(
				category ? categoryFromEnglish(category) : undefined,
				undefined,
				session?.user.id,
			)
		)
			.map((template) => ({
				original: template,
				dto: templateToEnglish(toTemplateDto(template)),
			}))
			.filter(
				({ original, dto }) =>
					!query ||
					[dto.title, dto.description, original.title, original.description]
						.filter(Boolean)
						.some((text) => foldCase("en", text as string).includes(query)),
			)
			.map(({ dto }) => dto);

		return Response.json({ templates });
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function POST(request: Request) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session) return unauthorizedResponse();

		const body = (await request.json()) as CreateTemplateInput;
		const template = await createUserTemplate(session.user.id, body);
		return Response.json(toTemplateDto(template), { status: 201 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
