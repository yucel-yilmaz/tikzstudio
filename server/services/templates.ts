import { prisma } from "@/lib/prisma";

export async function listTemplates(category?: string, search?: string) {
	return prisma.template.findMany({
		where: {
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
		orderBy: [{ category: "asc" }, { title: "asc" }],
	});
}
