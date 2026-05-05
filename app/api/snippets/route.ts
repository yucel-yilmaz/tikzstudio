import { toSnippetDto } from "@/lib/dto";
import { toErrorResponse } from "@/lib/errors";
import { listSnippets } from "@/server/services/snippets";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const snippets = await listSnippets(
      url.searchParams.get("category") ?? undefined,
      url.searchParams.get("search") ?? undefined,
    );

    return Response.json({
      snippets: snippets.map(toSnippetDto),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
