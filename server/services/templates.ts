import type { LatexEngine } from "@/generated/prisma";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { CreateTemplateInput, TemplateFileDto } from "@/lib/types";

const TEMPLATE_INCLUDE = { files: true } as const;

export async function listTemplates(
	category?: string,
	search?: string,
	ownerId?: string,
) {
	return prisma.template.findMany({
		include: TEMPLATE_INCLUDE,
		where: {
			OR: [{ ownerId: null }, ...(ownerId ? [{ ownerId }] : [])],
			...(category ? { category } : {}),
			...(search
				? {
						OR: [
							{ title: { contains: search, mode: "insensitive" } },
							{ description: { contains: search, mode: "insensitive" } },
						],
					}
				: {}),
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
	meta: { title: string; description?: string; category: string },
) {
	const project = await prisma.project.findFirst({
		where: { id: projectId, ownerId, deletedAt: null },
		include: { files: true },
	});
	if (!project) throw new AppError("NOT_FOUND", "Proje bulunamadı.", 404);

	return prisma.template.create({
		include: TEMPLATE_INCLUDE,
		data: {
			title: meta.title.trim(),
			description: meta.description?.trim() || null,
			category: meta.category.trim() || "Kişisel",
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
}

export async function deleteUserTemplate(ownerId: string, templateId: string) {
	const template = await prisma.template.findUnique({
		where: { id: templateId },
	});
	if (!template || template.ownerId !== ownerId)
		throw new AppError("NOT_FOUND", "Şablon bulunamadı.", 404);
	await prisma.template.delete({ where: { id: templateId } });
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
