import type { Prisma } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { DEFAULT_MAIN_FILE_PATH, DEFAULT_PROJECT_SOURCE } from "@/lib/defaults";

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
  templateContent?: string;
}) {
  return prisma.project.create({
    data: {
      ownerId: input.ownerId,
      title: input.title,
      description: input.description || null,
      files: {
        create: {
          path: DEFAULT_MAIN_FILE_PATH,
          content: input.templateContent ?? DEFAULT_PROJECT_SOURCE,
          language: "latex",
          isMain: true,
        },
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
    throw new AppError("NOT_FOUND", "Project not found.", 404);
  }

  return project;
}

export async function updateProjectForUser(
  ownerId: string,
  projectId: string,
  input: { title?: string; description?: string; isPublic?: boolean },
) {
  await requireOwnedProject(ownerId, projectId);
  return prisma.project.update({
    where: { id: projectId },
    data: {
      title: input.title,
      description: input.description,
      isPublic: input.isPublic,
    },
    include: projectBaseInclude,
  });
}

export async function softDeleteProjectForUser(ownerId: string, projectId: string) {
  await requireOwnedProject(ownerId, projectId);
  return prisma.project.update({
    where: { id: projectId },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function listProjectFilesForUser(ownerId: string, projectId: string) {
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
  content: string,
) {
  const project = await requireOwnedProject(ownerId, projectId);
  const file = project.files.find((candidate) => candidate.id === fileId);

  if (!file) {
    throw new AppError("NOT_FOUND", "Project file not found.", 404);
  }

  return prisma.projectFile.update({
    where: { id: fileId },
    data: { content },
  });
}
