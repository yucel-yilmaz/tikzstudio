import { AppError, toErrorResponse } from "@/lib/errors";
import { env } from "@/lib/env";
import { getSessionFromHeaders } from "@/lib/session";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB — Mathpix limit
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

type MathpixResponse = {
	latex_simplified?: string;
	error?: string;
	error_info?: { code: string; message: string };
};

export async function POST(request: Request) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (!env.MATHPIX_APP_ID || !env.MATHPIX_APP_KEY) {
			throw new AppError(
				"VALIDATION_ERROR",
				"Img2LaTeX özelliği yapılandırılmamış. MATHPIX_APP_ID ve MATHPIX_APP_KEY gerekli.",
				503,
			);
		}

		const formData = await request.formData();
		const fileEntry = formData.get("image");

		if (!(fileEntry instanceof File)) {
			throw new AppError("BAD_REQUEST", "image alanı gerekli.", 400);
		}

		if (!ALLOWED_MIME.has(fileEntry.type)) {
			throw new AppError(
				"BAD_REQUEST",
				"Desteklenen formatlar: PNG, JPEG, WebP.",
				400,
			);
		}

		if (fileEntry.size > MAX_IMAGE_BYTES) {
			throw new AppError(
				"BAD_REQUEST",
				`Görüntü 4 MB'dan büyük olamaz (${(fileEntry.size / 1024 / 1024).toFixed(1)} MB).`,
				400,
			);
		}

		const buffer = await fileEntry.arrayBuffer();
		const base64 = Buffer.from(buffer).toString("base64");
		const dataUri = `data:${fileEntry.type};base64,${base64}`;

		const mathpixRes = await fetch("https://api.mathpix.com/v3/text", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				app_id: env.MATHPIX_APP_ID,
				app_key: env.MATHPIX_APP_KEY,
			},
			body: JSON.stringify({
				src: dataUri,
				formats: ["latex_simplified"],
				data_options: { include_latex: true },
			}),
		});

		if (!mathpixRes.ok) {
			const text = await mathpixRes.text().catch(() => "");
			throw new AppError(
				"UNKNOWN_ERROR",
				`Mathpix API hatası (${mathpixRes.status}): ${text.slice(0, 200)}`,
				502,
			);
		}

		const data = (await mathpixRes.json()) as MathpixResponse;

		if (data.error) {
			throw new AppError(
				"UNKNOWN_ERROR",
				`Mathpix: ${data.error_info?.message ?? data.error}`,
				502,
			);
		}

		const latex = data.latex_simplified?.trim() ?? "";

		if (!latex) {
			throw new AppError(
				"UNKNOWN_ERROR",
				"Görüntüden LaTeX çıkarılamadı. Daha net bir görüntü deneyin.",
				422,
			);
		}

		return Response.json({ latex });
	} catch (error) {
		return toErrorResponse(error);
	}
}
