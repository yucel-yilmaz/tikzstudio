import type { LatexEngine, Prisma } from "@/generated/prisma";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
	buildProjectSeedFiles,
	type ProjectSeedFile,
} from "@/server/services/project-seed";

const projectBaseInclude = {
	files: {
		orderBy: {
			path: "asc" as const,
		},
	},
} satisfies Prisma.ProjectInclude;

export async function listUserProjects(ownerId: string, search?: string) {
	return prisma.project.findMany({
		where: {
			ownerId,
			deletedAt: null,
			...(search
				? {
						OR: [
							{ title: { contains: search, mode: "insensitive" } },
							{ description: { contains: search, mode: "insensitive" } },
						],
					}
				: {}),
		},
		orderBy: {
			updatedAt: "desc",
		},
	});
}

export async function createProjectForUser(input: {
	ownerId: string;
	title: string;
	description?: string;
	files?: ProjectSeedFile[];
	engine?: LatexEngine;
}) {
	const files = input.files ?? buildProjectSeedFiles();
	return prisma.project.create({
		data: {
			ownerId: input.ownerId,
			title: input.title,
			description: input.description || null,
			engine: input.engine,
			files: {
				create: files.map((file) => ({
					path: file.path,
					content: file.content,
					isBinary: file.isBinary,
					binaryContent: file.binaryContent,
					language: file.isBinary ? "binary" : "latex",
					isMain: file.isMain,
				})),
			},
		},
		include: projectBaseInclude,
	});
}

export async function getOwnedProject(ownerId: string, projectId: string) {
	return prisma.project.findFirst({
		where: {
			id: projectId,
			ownerId,
			deletedAt: null,
		},
		include: projectBaseInclude,
	});
}

export async function requireOwnedProject(ownerId: string, projectId: string) {
	const project = await getOwnedProject(ownerId, projectId);

	if (!project) {
		throw new AppError("NOT_FOUND", "Proje bulunamadı.", 404);
	}

	return project;
}

export async function getPublicProject(projectId: string) {
	return prisma.project.findFirst({
		where: {
			id: projectId,
			isPublic: true,
			deletedAt: null,
		},
		include: projectBaseInclude,
	});
}

export async function forkProjectForUser(
	ownerId: string,
	sourceProjectId: string,
) {
	const source = await requirePublicProject(sourceProjectId);

	return prisma.project.create({
		data: {
			ownerId,
			title: `${source.title} (kopya)`,
			description: source.description,
			isPublic: false,
			engine: source.engine,
			files: {
				create: source.files.map((file) => ({
					path: file.path,
					content: file.content,
					// Binary assets (images, fonts) must be copied too, or the
					// fork would contain empty placeholder files.
					isBinary: file.isBinary,
					binaryContent: file.binaryContent,
					language: file.language,
					isMain: file.isMain,
				})),
			},
		},
		include: projectBaseInclude,
	});
}

export async function requirePublicProject(projectId: string) {
	const project = await getPublicProject(projectId);

	if (!project) {
		throw new AppError("NOT_FOUND", "Proje bulunamadı.", 404);
	}

	return project;
}

export async function updateProjectForUser(
	ownerId: string,
	projectId: string,
	input: {
		title?: string;
		description?: string;
		isPublic?: boolean;
		engine?: LatexEngine;
	},
) {
	await requireOwnedProject(ownerId, projectId);
	return prisma.project.update({
		where: { id: projectId },
		data: {
			title: input.title,
			description: input.description,
			isPublic: input.isPublic,
			engine: input.engine,
		},
		include: projectBaseInclude,
	});
}

export async function softDeleteProjectForUser(
	ownerId: string,
	projectId: string,
) {
	await requireOwnedProject(ownerId, projectId);
	return prisma.project.update({
		where: { id: projectId },
		data: {
			deletedAt: new Date(),
		},
	});
}

export async function listProjectFilesForUser(
	ownerId: string,
	projectId: string,
) {
	await requireOwnedProject(ownerId, projectId);
	return prisma.projectFile.findMany({
		where: {
			projectId,
		},
		orderBy: {
			path: "asc",
		},
	});
}

export async function updateProjectFileForUser(
	ownerId: string,
	projectId: string,
	fileId: string,
	input: { content?: string; path?: string; isMain?: boolean },
) {
	const project = await requireOwnedProject(ownerId, projectId);
	const file = project.files.find((candidate) => candidate.id === fileId);

	if (!file) {
		throw new AppError("NOT_FOUND", "Proje dosyası bulunamadı.", 404);
	}

	if (input.path && input.path !== file.path) {
		const conflict = project.files.find(
			(candidate) => candidate.id !== fileId && candidate.path === input.path,
		);
		if (conflict) {
			throw new AppError("CONFLICT", "Bu yolda zaten bir dosya var.", 409);
		}
	}

	if (input.isMain === true && !file.isMain) {
		return prisma.$transaction(async (tx) => {
			await tx.projectFile.updateMany({
				where: { projectId, isMain: true },
				data: { isMain: false },
			});
			return tx.projectFile.update({
				where: { id: fileId },
				data: {
					content: input.content,
					path: input.path,
					isMain: true,
				},
			});
		});
	}

	return prisma.projectFile.update({
		where: { id: fileId },
		data: {
			content: input.content,
			path: input.path,
			...(input.isMain === false ? { isMain: false } : {}),
		},
	});
}

export async function createProjectFileForUser(
	ownerId: string,
	projectId: string,
	input: { path: string; content: string },
) {
	const project = await requireOwnedProject(ownerId, projectId);
	const conflict = project.files.find(
		(candidate) => candidate.path === input.path,
	);
	if (conflict) {
		throw new AppError("CONFLICT", "Bu yolda zaten bir dosya var.", 409);
	}

	return prisma.projectFile.create({
		data: {
			projectId,
			path: input.path,
			content: input.content,
			language: "latex",
			isMain: false,
		},
	});
}

// LaTeX text file extensions that should be treated as text, not binary
const TEXT_EXTENSIONS = new Set([
	".cls",
	".sty",
	".tex",
	".clo",
	".cfg",
	".ldf",
	".def",
	".fd",
	".txt",
	".log",
]);

function isTextFile(filePath: string): boolean {
	const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
	return TEXT_EXTENSIONS.has(ext);
}

export async function uploadBinaryFileForUser(
	ownerId: string,
	projectId: string,
	filePath: string,
	buffer: Uint8Array<ArrayBuffer>,
) {
	const project = await requireOwnedProject(ownerId, projectId);
	const conflict = project.files.find((f) => f.path === filePath);
	if (conflict) {
		throw new AppError("CONFLICT", "Bu yolda zaten bir dosya var.", 409);
	}

	const asText = isTextFile(filePath);
	const textContent = asText ? new TextDecoder("utf-8").decode(buffer) : "";

	return prisma.projectFile.create({
		data: {
			projectId,
			path: filePath,
			content: textContent,
			isBinary: !asText,
			binaryContent: asText ? null : buffer,
			language: asText ? "latex" : "binary",
			isMain: false,
		},
	});
}

export async function deleteProjectFileForUser(
	ownerId: string,
	projectId: string,
	fileId: string,
) {
	const project = await requireOwnedProject(ownerId, projectId);
	const file = project.files.find((candidate) => candidate.id === fileId);

	if (!file) {
		throw new AppError("NOT_FOUND", "Proje dosyası bulunamadı.", 404);
	}

	if (file.isMain) {
		throw new AppError(
			"VALIDATION_ERROR",
			"Ana dosya silinemez. Önce başka bir dosyayı ana dosya yapın.",
			400,
		);
	}

	await prisma.projectFile.delete({ where: { id: fileId } });
}
