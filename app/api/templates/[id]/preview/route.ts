import { toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { readUserTemplatePreview } from "@/server/services/template-previews";
import { getAccessibleTemplate } from "@/server/services/templates";

/** Serves the preview image of a user template to its owner. */
export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session) {
			return Response.json(
				{
					error: { code: "UNAUTHORIZED", message: "Oturum açmanız gerekiyor." },
				},
				{ status: 401 },
			);
		}

		const { id } = await context.params;
		await getAccessibleTemplate(session.user.id, id);
		const image = await readUserTemplatePreview(id).catch(() => null);
		if (!image) {
			return Response.json(
				{ error: { code: "NOT_FOUND", message: "Önizleme bulunamadı." } },
				{ status: 404 },
			);
		}

		return new Response(new Uint8Array(image), {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "private, max-age=300",
			},
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}
