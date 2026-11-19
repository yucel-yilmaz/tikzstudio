import { toProjectDetail } from "@/lib/dto";
import { AppError, toErrorResponse } from "@/lib/errors";
import { ARCHIVE_LIMITS } from "@/lib/project-archive";
import { getSessionFromHeaders } from "@/lib/session";
import { importProjectArchive } from "@/server/services/project-archive";

/** Creates a new project from an uploaded .zip (e.g. an Overleaf export). */
export async function POST(request: Request) {
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

		const formData = await request.formData();
		const file = formData.get("file");
		if (!(file instanceof File)) {
			throw new AppError("BAD_REQUEST", "ZIP dosyası gerekli.", 400);
		}
		if (file.size > ARCHIVE_LIMITS.maxArchiveBytes) {
			throw new AppError(
				"VALIDATION_ERROR",
				"ZIP dosyası en fazla 20 MB olabilir.",
				400,
			);
		}

		const requestedTitle = String(formData.get("title") ?? "").trim();
		const title = (
			requestedTitle ||
			file.name.replace(/\.zip$/i, "").trim() ||
			"İçe aktarılan proje"
		).slice(0, 120);

		const { project, warnings } = await importProjectArchive({
			ownerId: session.user.id,
			archive: new Uint8Array(await file.arrayBuffer()),
			title,
		});

		return Response.json(
			{ project: toProjectDetail(project), warnings },
			{ status: 201 },
		);
	} catch (error) {
		return toErrorResponse(error);
	}
}
