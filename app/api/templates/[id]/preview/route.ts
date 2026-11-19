import {
	notFoundResponse,
	toErrorResponse,
	unauthorizedResponse,
} from "@/lib/errors";
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
			return unauthorizedResponse();
		}

		const { id } = await context.params;
		await getAccessibleTemplate(session.user.id, id);
		const image = await readUserTemplatePreview(id).catch(() => null);
		if (!image) {
			return notFoundResponse("previewNotFound");
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
