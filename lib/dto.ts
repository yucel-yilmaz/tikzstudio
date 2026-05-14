import type {
	CompileJob,
	Project,
	ProjectFile,
	Snippet,
	Template,
} from "@/generated/prisma";

import type {
	CompileJobDto,
	ProjectDetail,
	ProjectFileDto,
	ProjectSummary,
	SnippetDto,
	TemplateDto,
} from "@/lib/types";

export function toProjectSummary(project: Project): ProjectSummary {
	return {
		id: project.id,
		title: project.title,
		description: project.description,
		createdAt: project.createdAt.toISOString(),
		updatedAt: project.updatedAt.toISOString(),
	};
}

export function toProjectFileDto(file: ProjectFile): ProjectFileDto {
	return {
		id: file.id,
		projectId: file.projectId,
		path: file.path,
		content: file.isBinary ? "" : file.content,
		isBinary: file.isBinary,
		language: file.language,
		isMain: file.isMain,
		updatedAt: file.updatedAt.toISOString(),
	};
}

export function toProjectDetail(
	project: Project & { files: ProjectFile[] },
): ProjectDetail {
	return {
		...toProjectSummary(project),
		ownerId: project.ownerId,
		isPublic: project.isPublic,
		files: project.files.map(toProjectFileDto),
	};
}

export function toCompileJobDto(job: CompileJob): CompileJobDto {
	return {
		id: job.id,
		projectId: job.projectId,
		status: job.status,
		engine: job.engine,
		log: job.log,
		outputUrl: job.outputUrl,
		svgOutputUrl: job.svgOutputUrl,
		errorCode: job.errorCode,
		startedAt: job.startedAt?.toISOString() ?? null,
		finishedAt: job.finishedAt?.toISOString() ?? null,
		createdAt: job.createdAt.toISOString(),
	};
}

export function toTemplateDto(template: Template): TemplateDto {
	return {
		id: template.id,
		title: template.title,
		description: template.description,
		category: template.category,
		content: template.content,
		previewUrl: template.previewUrl,
		ownerId: template.ownerId,
	};
}

export function toSnippetDto(snippet: Snippet): SnippetDto {
	return {
		id: snippet.id,
		title: snippet.title,
		description: snippet.description,
		trigger: snippet.trigger,
		category: snippet.category,
		content: snippet.content,
		ownerId: snippet.ownerId,
	};
}
