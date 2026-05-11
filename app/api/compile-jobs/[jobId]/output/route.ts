import { toErrorResponse } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getSessionFromHeaders } from "@/lib/session";
import { slugifyFilename } from "@/lib/utils";
import {
	readCompileOutput,
	readCompileSvgOutput,
} from "@/server/compiler/storage";

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
					...(session ? { ownerId: session.user.id } : { isPublic: true }),
				},
			},
			include: { project: true },
		});

		if (!job) {
			return Response.json(
				{ error: { code: "NOT_FOUND", message: "Output not found." } },
				{ status: 404 },
			);
		}

		if (!session && !job.project.isPublic) {
			return Response.json(
				{
					error: { code: "UNAUTHORIZED", message: "Authentication required." },
				},
				{ status: 401 },
			);
		}

		const searchParams = new URL(request.url).searchParams;
		const format = searchParams.get("format") === "svg" ? "svg" : "pdf";
		const outputUrl = format === "svg" ? job.svgOutputUrl : job.outputUrl;

		if (!outputUrl) {
			return Response.json(
				{ error: { code: "NOT_FOUND", message: "Output not found." } },
				{ status: 404 },
			);
		}

		const download = searchParams.get("download") === "1";
		const buffer =
			format === "svg"
				? await readCompileSvgOutput(jobId)
				: await readCompileOutput(jobId);
		const extension = format === "svg" ? "svg" : "pdf";
		const fileName = `${slugifyFilename(job.project.title) || "tikzlab-project"}.${extension}`;
		const isPublic = job.project.isPublic;

		return new Response(buffer, {
			status: 200,
			headers: {
				"Content-Type": format === "svg" ? "image/svg+xml" : "application/pdf",
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
