import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { CreateSnippetInput } from "@/lib/types";

export async function listSnippets(
	category?: string,
	search?: string,
	ownerId?: string,
) {
	return prisma.snippet.findMany({
		where: {
			OR: [{ ownerId: null }, ...(ownerId ? [{ ownerId }] : [])],
			...(category ? { category } : {}),
			...(search
				? {
						OR: [
							{ title: { contains: search, mode: "insensitive" } },
							{ description: { contains: search, mode: "insensitive" } },
							{ trigger: { contains: search, mode: "insensitive" } },
						],
					}
				: {}),
		},
		orderBy: [{ ownerId: "asc" }, { category: "asc" }, { title: "asc" }],
	});
}

export async function createUserSnippet(
	ownerId: string,
	data: CreateSnippetInput,
) {
	const trigger = data.trigger.replace(/^\\/u, "").trim();
	if (!trigger) throw new AppError("BAD_REQUEST", "Trigger boş olamaz", 400);

	const existing = await prisma.snippet.findFirst({
		where: { ownerId, trigger },
	});
	if (existing)
		throw new AppError(
			"CONFLICT",
			`"\\${trigger}" trigger'ı zaten kullanımda`,
			409,
		);

	return prisma.snippet.create({
		data: {
			title: data.title.trim(),
			description: data.description?.trim() || null,
			trigger,
			category: data.category.trim() || "Kişisel",
			content: data.content,
			ownerId,
		},
	});
}

export async function deleteUserSnippet(ownerId: string, snippetId: string) {
	const snippet = await prisma.snippet.findUnique({ where: { id: snippetId } });
	if (!snippet || snippet.ownerId !== ownerId)
		throw new AppError("NOT_FOUND", "Snippet bulunamadı", 404);
	await prisma.snippet.delete({ where: { id: snippetId } });
}
