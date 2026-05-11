import { prisma } from "@/lib/prisma";

export async function listSnippets(category?: string, search?: string) {
	return prisma.snippet.findMany({
		where: {
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
		orderBy: [{ category: "asc" }, { title: "asc" }],
	});
}
