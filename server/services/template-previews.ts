import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { CompileStatus } from "@/generated/prisma";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { makeThumbnail } from "@/lib/thumbnail";
import { readCompilePngOutput } from "@/server/compiler/storage";

/**
 * Preview images of user templates live outside the compile artifact
 * directory, which the cleanup worker prunes.
 */
function previewPath(templateId: string) {
	return path.join(
		path.resolve(process.cwd(), env.TEMPLATE_PREVIEW_DIR),
		`${templateId}.png`,
	);
}

export function userTemplatePreviewUrl(templateId: string) {
	return `/api/templates/${templateId}/preview`;
}

/**
 * Builds a template preview from the project's latest successful compile.
 * Returns the preview URL, or null when the project has no usable output.
 * Never throws: a missing preview must not fail saving the template.
 */
export async function createPreviewFromLatestCompile(
	templateId: string,
	projectId: string,
): Promise<string | null> {
	try {
		const job = await prisma.compileJob.findFirst({
			where: {
				projectId,
				status: CompileStatus.SUCCESS,
				pngOutputUrl: { not: null },
			},
			orderBy: { finishedAt: "desc" },
			select: { id: true },
		});
		if (!job) return null;

		const thumbnail = await makeThumbnail(await readCompilePngOutput(job.id));
		const target = previewPath(templateId);
		await mkdir(path.dirname(target), { recursive: true });
		await writeFile(target, thumbnail);
		return userTemplatePreviewUrl(templateId);
	} catch (error) {
		console.error("[template-preview] could not create preview:", error);
		return null;
	}
}

export async function readUserTemplatePreview(templateId: string) {
	return readFile(previewPath(templateId));
}

export async function removeUserTemplatePreview(templateId: string) {
	await rm(previewPath(templateId), { force: true });
}
