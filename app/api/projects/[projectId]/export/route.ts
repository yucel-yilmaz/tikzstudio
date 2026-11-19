import { toErrorResponse, unauthorizedResponse } from "@/lib/errors";
import { getLocale } from "@/lib/i18n/server";
import { getSessionFromHeaders } from "@/lib/session";
import { exportProjectArchive } from "@/server/services/project-archive";

/** Downloads all project files as a .zip (Overleaf-compatible layout). */
export async function GET(
	request: Request,
	context: { params: Promise<{ projectId: string }> },
) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session) {
			return unauthorizedResponse();
		}

		const { projectId } = await context.params;
		const { fileName, data } = await exportProjectArchive(
			session.user.id,
			projectId,
			await getLocale(),
		);
		return new Response(data, {
			headers: {
				"Content-Type": "application/zip",
				"Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
				"Cache-Control": "private, no-store",
			},
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}
