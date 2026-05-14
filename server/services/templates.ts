import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { CreateTemplateInput } from "@/lib/types";

export async function listTemplates(
	category?: string,
	search?: string,
	ownerId?: string,
) {
	return prisma.template.findMany({
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

export async function createUserTemplate(
	ownerId: string,
	data: CreateTemplateInput,
) {
	return prisma.template.create({
		data: {
			title: data.title.trim(),
			description: data.description?.trim() || null,
			category: data.category.trim() || "Kişisel",
			content: data.content,
			isOfficial: false,
			ownerId,
		},
	});
}

export async function deleteUserTemplate(ownerId: string, templateId: string) {
	const template = await prisma.template.findUnique({
		where: { id: templateId },
	});
	if (!template || template.ownerId !== ownerId)
		throw new AppError("NOT_FOUND", "Şablon bulunamadı", 404);
	await prisma.template.delete({ where: { id: templateId } });
}
