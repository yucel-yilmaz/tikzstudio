import {
	notFoundResponse,
	toErrorResponse,
	unauthorizedResponse,
} from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getSessionFromHeaders } from "@/lib/session";
import { slugifyFilename } from "@/lib/utils";
import { sanitizeSvg } from "@/server/compiler/sanitizer";
import {
	readCompileOutput,
	readCompilePngOutput,
	readCompileSvgOutput,
} from "@/server/compiler/storage";

type OutputFormat = "pdf" | "svg" | "png";

const CONTENT_TYPES: Record<OutputFormat, string> = {
	pdf: "application/pdf",
	svg: "image/svg+xml",
	png: "image/png",
};

export async function GET(
	request: Request,
	context: { params: Promise<{ jobId: string }> },
) {
	try {
		const session = await getSessionFromHeaders(request.headers);
		const { jobId } = await context.params;

		const job = await prisma.compileJob.findFirst({
			where: {
				id: jobId,
				project: {
					deletedAt: null,
					// Owners see their own outputs; anyone (signed in or not) may see
					// outputs of public projects.
					OR: [
						{ isPublic: true },
						...(session ? [{ ownerId: session.user.id }] : []),
					],
				},
			},
			include: { project: true },
		});

		if (!job) {
			return notFoundResponse("outputNotFound");
		}

		if (!session && !job.project.isPublic) {
			return unauthorizedResponse();
		}

		const searchParams = new URL(request.url).searchParams;
		const requested = searchParams.get("format");
		const format: OutputFormat =
			requested === "svg" || requested === "png" ? requested : "pdf";
		const outputUrl = {
			pdf: job.outputUrl,
			svg: job.svgOutputUrl,
			png: job.pngOutputUrl,
		}[format];

		if (!outputUrl) {
			return notFoundResponse("outputNotFound");
		}

		const download = searchParams.get("download") === "1";

		let body: Buffer;
		if (format === "svg") {
			body = Buffer.from(sanitizeSvg(await readCompileSvgOutput(jobId)));
		} else if (format === "png") {
			body = await readCompilePngOutput(jobId);
		} else {
			body = await readCompileOutput(jobId);
		}

		const fileName = `${slugifyFilename(job.project.title) || "tikzstudio-project"}.${format}`;
		const isPublic = job.project.isPublic;

		return new Response(new Uint8Array(body), {
			status: 200,
			headers: {
				"Content-Type": CONTENT_TYPES[format],
				"Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName}"`,
				"Cache-Control": isPublic
					? "public, max-age=60"
					: "private, max-age=60",
			},
		});
	} catch (error) {
		return toErrorResponse(error);
	}
}
