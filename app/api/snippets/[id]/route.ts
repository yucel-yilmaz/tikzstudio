import { toErrorResponse, unauthorizedResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { deleteUserSnippet } from "@/server/services/snippets";

export async function DELETE(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session) return unauthorizedResponse();

		const { id } = await context.params;
		await deleteUserSnippet(session.user.id, id);
		return new Response(null, { status: 204 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
