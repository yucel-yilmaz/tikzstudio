import { toSnippetDto } from "@/lib/dto";
import { toErrorResponse, unauthorizedResponse } from "@/lib/errors";
import { localeFromHeaders } from "@/lib/i18n/config";
import { foldCase } from "@/lib/i18n/format";
import {
	categoryFromEnglish,
	snippetToEnglish,
} from "@/lib/official-content-en";
import { getSessionFromHeaders } from "@/lib/session";
import type { CreateSnippetInput } from "@/lib/types";
import { createUserSnippet, listSnippets } from "@/server/services/snippets";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const session = await getSessionFromHeaders(request.headers);
		const category = url.searchParams.get("category") ?? undefined;
		const search = url.searchParams.get("search") ?? undefined;

		if (localeFromHeaders(request.headers) !== "en") {
			const snippets = await listSnippets(category, search, session?.user.id);
			return Response.json({ snippets: snippets.map(toSnippetDto) });
		}

		// English: search the translated metadata (and the original) in memory.
		const query = search ? foldCase("en", search) : "";
		const snippets = (
			await listSnippets(
				category ? categoryFromEnglish(category) : undefined,
				undefined,
				session?.user.id,
			)
		)
			.map((snippet) => ({
				original: snippet,
				dto: snippetToEnglish(toSnippetDto(snippet)),
			}))
			.filter(
				({ original, dto }) =>
					!query ||
					[
						dto.title,
						dto.description,
						dto.trigger,
						original.title,
						original.description,
					]
						.filter(Boolean)
						.some((text) => foldCase("en", text as string).includes(query)),
			)
			.map(({ dto }) => dto);

		return Response.json({ snippets });
	} catch (error) {
		return toErrorResponse(error);
	}
}

export async function POST(request: Request) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session) return unauthorizedResponse();

		const body = (await request.json()) as CreateSnippetInput;
		const snippet = await createUserSnippet(session.user.id, body);
		return Response.json(toSnippetDto(snippet), { status: 201 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
