import { AppError, toErrorResponse } from "@/lib/errors";
import { env } from "@/lib/env";
import { getSessionFromHeaders } from "@/lib/session";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

export type Img2LatexProvider = "docker" | "mathpix";

type OpenAIResponse = {
	choices?: Array<{ message?: { content?: string } }>;
	error?: { message: string };
};

type MathpixResponse = {
	latex_simplified?: string;
	error?: string;
	error_info?: { code: string; message: string };
};

async function callDockerModel(dataUri: string): Promise<string> {
	const url = `${env.DOCKER_MODEL_RUNNER_URL}/engines/llama.cpp/v1/chat/completions`;

	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			model: env.IMG2LATEX_MODEL,
			messages: [
				{
					role: "user",
					content: [
						{ type: "image_url", image_url: { url: dataUri } },
						{
							type: "text",
							text: "Extract the mathematical expression or formula from this image and return it as LaTeX. Return only the raw LaTeX code, no explanations, no markdown fences.",
						},
					],
				},
			],
			max_tokens: 1024,
		}),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new AppError(
			"UNKNOWN_ERROR",
			`Docker Model Runner hatası (${res.status}): ${text.slice(0, 200)}`,
			502,
		);
	}

	const data = (await res.json()) as OpenAIResponse;

	if (data.error) {
		throw new AppError("UNKNOWN_ERROR", `Model hatası: ${data.error.message}`, 502);
	}

	return data.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callMathpix(dataUri: string): Promise<string> {
	if (!env.MATHPIX_APP_ID || !env.MATHPIX_APP_KEY) {
		throw new AppError(
			"VALIDATION_ERROR",
			"Mathpix yapılandırılmamış. MATHPIX_APP_ID ve MATHPIX_APP_KEY gerekli.",
			503,
		);
	}

	const res = await fetch("https://api.mathpix.com/v3/text", {
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

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new AppError(
			"UNKNOWN_ERROR",
			`Mathpix API hatası (${res.status}): ${text.slice(0, 200)}`,
			502,
		);
	}

	const data = (await res.json()) as MathpixResponse;

	if (data.error) {
		throw new AppError(
			"UNKNOWN_ERROR",
			`Mathpix: ${data.error_info?.message ?? data.error}`,
			502,
		);
	}

	return data.latex_simplified?.trim() ?? "";
}

export async function POST(request: Request) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		if (!session) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await request.formData();
		const fileEntry = formData.get("image");
		const provider = (formData.get("provider") as Img2LatexProvider | null) ?? "docker";

		if (!(fileEntry instanceof File)) {
			throw new AppError("BAD_REQUEST", "image alanı gerekli.", 400);
		}

		if (!ALLOWED_MIME.has(fileEntry.type)) {
			throw new AppError("BAD_REQUEST", "Desteklenen formatlar: PNG, JPEG, WebP.", 400);
		}

		if (fileEntry.size > MAX_IMAGE_BYTES) {
			throw new AppError(
				"BAD_REQUEST",
				`Görüntü 4 MB'dan büyük olamaz (${(fileEntry.size / 1024 / 1024).toFixed(1)} MB).`,
				400,
			);
		}

		const dataUri = `data:${fileEntry.type};base64,${Buffer.from(await fileEntry.arrayBuffer()).toString("base64")}`;

		const latex =
			provider === "mathpix" ? await callMathpix(dataUri) : await callDockerModel(dataUri);

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
