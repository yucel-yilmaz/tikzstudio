import { AppError } from "@/lib/errors";
import { getI18n } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import type { CreateSnippetInput } from "@/lib/types";

export async function listSnippets(
	category?: string,
	search?: string,
	ownerId?: string,
) {
	return prisma.snippet.findMany({
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
									{
										trigger: { contains: search, mode: "insensitive" as const },
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

export async function createUserSnippet(
	ownerId: string,
	data: CreateSnippetInput,
) {
	const trigger = data.trigger.replace(/^\\/u, "").trim();
	if (!trigger)
		throw new AppError("BAD_REQUEST", "snippetTriggerRequired", 400);

	const existing = await prisma.snippet.findFirst({
		where: { ownerId, trigger },
	});
	if (existing)
		throw new AppError("CONFLICT", ["snippetTriggerTaken", { trigger }], 409);

	return prisma.snippet.create({
		data: {
			title: data.title.trim(),
			description: data.description?.trim() || null,
			trigger,
			category:
				data.category.trim() || (await getI18n()).t("common.personalCategory"),
			content: data.content,
			ownerId,
		},
	});
}

export async function deleteUserSnippet(ownerId: string, snippetId: string) {
	const snippet = await prisma.snippet.findUnique({ where: { id: snippetId } });
	if (!snippet || snippet.ownerId !== ownerId)
		throw new AppError("NOT_FOUND", "snippetNotFound", 404);
	await prisma.snippet.delete({ where: { id: snippetId } });
}
