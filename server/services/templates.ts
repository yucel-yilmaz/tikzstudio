import type { LatexEngine } from "@/generated/prisma";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { CreateTemplateInput, TemplateFileDto } from "@/lib/types";
import {
	createPreviewFromLatestCompile,
	removeUserTemplatePreview,
} from "@/server/services/template-previews";

const TEMPLATE_INCLUDE = { files: true } as const;

export async function listTemplates(
	category?: string,
	search?: string,
	ownerId?: string,
) {
	return prisma.template.findMany({
		include: TEMPLATE_INCLUDE,
		where: {
			// Visibility (official or own) and search must be combined with AND:
			// spreading a second `OR` key would overwrite the ownership filter
			// and expose other users' private items.
			AND: [
				{ OR: [{ ownerId: null }, ...(ownerId ? [{ ownerId }] : [])] },
				...(search
					? [
							{
								OR: [
									{ title: { contains: search, mode: "insensitive" as const } },
									{
										description: {
											contains: search,
											mode: "insensitive" as const,
										},
									},
								],
							},
						]
					: []),
			],
			...(category ? { category } : {}),
		},
		orderBy: [{ ownerId: "asc" }, { category: "asc" }, { title: "asc" }],
	});
}

export async function getTemplate(id: string) {
	const template = await prisma.template.findUnique({
		where: { id },
		include: TEMPLATE_INCLUDE,
	});
	if (!template) throw new AppError("NOT_FOUND", "Şablon bulunamadı.", 404);
	return template;
}

/**
 * Returns a template the given user may use: an official one (no owner) or
 * one they own. Other users' private templates are reported as not found.
 */
export async function getAccessibleTemplate(ownerId: string, id: string) {
	const template = await prisma.template.findFirst({
		where: { id, OR: [{ ownerId: null }, { ownerId }] },
		include: TEMPLATE_INCLUDE,
	});
	if (!template) throw new AppError("NOT_FOUND", "Şablon bulunamadı.", 404);
	return template;
}

export async function createUserTemplate(
	ownerId: string,
	data: CreateTemplateInput,
) {
	const files: TemplateFileDto[] = data.files?.length
		? data.files
		: data.content
			? [
					{
						path: "main.tex",
						content: data.content,
						isBinary: false,
						isMain: true,
					},
				]
			: [];

	if (!files.length) {
		throw new AppError("VALIDATION_ERROR", "En az bir dosya gerekli.", 400);
	}

	return prisma.template.create({
		include: TEMPLATE_INCLUDE,
		data: {
			title: data.title.trim(),
			description: data.description?.trim() || null,
			category: data.category.trim() || "Kişisel",
			engine: (data.engine as LatexEngine) ?? "TECTONIC",
			isOfficial: false,
			ownerId,
			files: {
				create: files.map((f, i) => ({
					path: f.path,
					content: f.content,
					isBinary: f.isBinary ?? false,
					isMain: f.isMain ?? i === 0,
				})),
			},
		},
	});
}

export async function createTemplateFromProject(
	ownerId: string,
	projectId: string,
	meta: {
		title: string;
		description?: string;
		category?: string;
		engine?: LatexEngine;
	},
) {
	const project = await prisma.project.findFirst({
		where: { id: projectId, ownerId, deletedAt: null },
		include: { files: true },
	});
	if (!project) throw new AppError("NOT_FOUND", "Proje bulunamadı.", 404);

	const template = await prisma.template.create({
		include: TEMPLATE_INCLUDE,
		data: {
			title: meta.title.trim(),
			description: meta.description?.trim() || null,
			category: meta.category?.trim() || "Kişisel",
			engine: meta.engine ?? "TECTONIC",
			isOfficial: false,
			ownerId,
			files: {
				create: project.files.map((f) => ({
					path: f.path,
					content: f.content,
					isBinary: f.isBinary,
					binaryContent: f.binaryContent,
					isMain: f.isMain,
				})),
			},
		},
	});

	const previewUrl = await createPreviewFromLatestCompile(
		template.id,
		projectId,
	);
	if (!previewUrl) return template;
	return prisma.template.update({
		where: { id: template.id },
		data: { previewUrl },
		include: TEMPLATE_INCLUDE,
	});
}

export async function deleteUserTemplate(ownerId: string, templateId: string) {
	const template = await prisma.template.findUnique({
		where: { id: templateId },
	});
	if (!template || template.ownerId !== ownerId)
		throw new AppError("NOT_FOUND", "Şablon bulunamadı.", 404);
	await prisma.template.delete({ where: { id: templateId } });
	await removeUserTemplatePreview(templateId);
}

export async function updateTemplatePreview(
	templateId: string,
	previewUrl: string,
) {
	await prisma.template.update({
		where: { id: templateId },
		data: { previewUrl },
	});
}
