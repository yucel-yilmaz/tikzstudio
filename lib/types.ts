import type { CompileStatus, LatexEngine } from "@/generated/prisma";

export type ProjectSummary = {
  id: string;
  title: string;
  description: string | null;
  updatedAt: string;
  createdAt: string;
};

export type ProjectFileDto = {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  isMain: boolean;
  updatedAt: string;
};

export type ProjectDetail = ProjectSummary & {
  ownerId: string;
  isPublic: boolean;
  files: ProjectFileDto[];
};

export type CompileJobDto = {
  id: string;
  projectId: string;
  status: CompileStatus;
  engine: LatexEngine;
  log: string | null;
  outputUrl: string | null;
  errorCode: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
};

export type TemplateDto = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  content: string;
  previewUrl: string | null;
};

export type SnippetDto = {
  id: string;
  title: string;
  description: string | null;
  trigger: string;
  category: string;
  content: string;
};

export type CreateProjectInput = {
  title: string;
  description?: string;
  templateId?: string;
};

export type UpdateProjectInput = {
  title?: string;
  description?: string;
  isPublic?: boolean;
};

export type UpdateFileInput = {
  content: string;
};

export type CompileProjectInput = {
  engine?: LatexEngine;
  mainFileId?: string;
};
