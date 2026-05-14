import { toProjectFileDto } from "@/lib/dto";
import { AppError, toErrorResponse } from "@/lib/errors";
import { getSessionFromHeaders } from "@/lib/session";
import { uploadBinaryFileForUser } from "@/server/services/projects";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(
	request: Request,
	context: { params: Promise<{ projectId: string }> },
) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session)
			return Response.json({ error: "Unauthorized" }, { status: 401 });

		const { projectId } = await context.params;
		const formData = await request.formData();
		const fileEntry = formData.get("file");

		if (!(fileEntry instanceof File))
			throw new AppError("BAD_REQUEST", "file field required", 400);

		if (fileEntry.size > MAX_UPLOAD_BYTES)
			throw new AppError(
				"BAD_REQUEST",
				`Dosya 5 MB'dan büyük olamaz (${(fileEntry.size / 1024 / 1024).toFixed(1)} MB)`,
				400,
			);

		const filePath = (
			(formData.get("path") as string | null) ?? fileEntry.name
		).trim();

		if (!filePath)
			throw new AppError("BAD_REQUEST", "Geçersiz dosya yolu", 400);

		const buffer = new Uint8Array(
			(await fileEntry.arrayBuffer()) as ArrayBuffer,
		);
		const file = await uploadBinaryFileForUser(
			session.user.id,
			projectId,
			filePath,
			buffer,
		);

		return Response.json(toProjectFileDto(file), { status: 201 });
	} catch (error) {
		return toErrorResponse(error);
	}
}
