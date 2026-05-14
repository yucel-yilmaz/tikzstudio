import { toSnippetDto } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import type { CreateSnippetInput } from "@/lib/types";
import { createUserSnippet, listSnippets } from "@/server/services/snippets";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const session = await getSessionFromHeaders(request.headers);
		const snippets = await listSnippets(
			url.searchParams.get("category") ?? undefined,
			url.searchParams.get("search") ?? undefined,
			session?.user.id,
		);

		return Response.json({
			snippets: snippets.map(toSnippetDto),
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

		const body = (await request.json()) as CreateSnippetInput;
		const snippet = await createUserSnippet(session.user.id, body);
		return Response.json(toSnippetDto(snippet), { status: 201 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
