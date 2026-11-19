import { toProjectDetail } from "@/lib/dto";
import { AppError, toErrorResponse, unauthorizedResponse } from "@/lib/errors";
import { getI18n } from "@/lib/i18n/server";
import { ARCHIVE_LIMITS } from "@/lib/project-archive";
import { getSessionFromHeaders } from "@/lib/session";
import { importProjectArchive } from "@/server/services/project-archive";

/** Creates a new project from an uploaded .zip (e.g. an Overleaf export). */
export async function POST(request: Request) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session) {
			return unauthorizedResponse();
		}

		const formData = await request.formData();
		const file = formData.get("file");
		if (!(file instanceof File)) {
			throw new AppError("BAD_REQUEST", "zipRequired", 400);
		}
		if (file.size > ARCHIVE_LIMITS.maxArchiveBytes) {
			throw new AppError("VALIDATION_ERROR", "zipTooLarge", 400);
		}

		const { locale, t } = await getI18n();
		const requestedTitle = String(formData.get("title") ?? "").trim();
		const title = (
			requestedTitle ||
			file.name.replace(/\.zip$/i, "").trim() ||
			t("projects.importedDefaultTitle")
		).slice(0, 120);

		const { project, warnings } = await importProjectArchive({
			ownerId: session.user.id,
			archive: new Uint8Array(await file.arrayBuffer()),
			title,
			locale,
		});

		return Response.json(
			{ project: toProjectDetail(project), warnings },
			{ status: 201 },
		);
	} catch (error) {
		return toErrorResponse(error);
	}
}
