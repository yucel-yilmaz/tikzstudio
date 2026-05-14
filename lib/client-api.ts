"use client";

import type {
	CompileJobDto,
	CreateFileInput,
	CreateProjectInput,
	CreateSnippetInput,
	ProjectDetail,
	ProjectFileDto,
	ProjectSummary,
	SnippetDto,
	TemplateDto,
	UpdateFileInput,
} from "@/lib/types";

type ApiErrorShape = {
	error?: {
		code?: string;
		message?: string;
	};
};

export class ClientApiError extends Error {
	code: string;
	status: number;

	constructor(message: string, code = "UNKNOWN_ERROR", status = 500) {
		super(message);
		this.code = code;
		this.status = status;
	}
}

async function requestJson<T>(
	input: RequestInfo,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(input, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
	});

	if (!response.ok) {
		const payload = (await response
			.json()
			.catch(() => null)) as ApiErrorShape | null;
		throw new ClientApiError(
			payload?.error?.message ?? "Request failed.",
			payload?.error?.code ?? "UNKNOWN_ERROR",
			response.status,
		);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}

export function getProjects(search = "") {
	return requestJson<{ projects: ProjectSummary[] }>(
		`/api/projects${search ? `?search=${encodeURIComponent(search)}` : ""}`,
	);
}

export function createProject(input: CreateProjectInput) {
	return requestJson<ProjectDetail>("/api/projects", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export function getProject(projectId: string) {
	return requestJson<ProjectDetail>(`/api/projects/${projectId}`);
}

export function updateProject(
	projectId: string,
	input: { title?: string; description?: string; isPublic?: boolean },
) {
	return requestJson<ProjectDetail>(`/api/projects/${projectId}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
}

export function deleteProject(projectId: string) {
	return requestJson<void>(`/api/projects/${projectId}`, {
		method: "DELETE",
	});
}

export function getProjectFiles(projectId: string) {
	return requestJson<{ files: ProjectFileDto[] }>(
		`/api/projects/${projectId}/files`,
	);
}

export function updateFile(
	projectId: string,
	fileId: string,
	input: UpdateFileInput,
) {
	return requestJson<ProjectFileDto>(
		`/api/projects/${projectId}/files/${fileId}`,
		{
			method: "PATCH",
			body: JSON.stringify(input),
		},
	);
}

export function createFile(projectId: string, input: CreateFileInput) {
	return requestJson<ProjectFileDto>(`/api/projects/${projectId}/files`, {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export function deleteFile(projectId: string, fileId: string) {
	return requestJson<void>(`/api/projects/${projectId}/files/${fileId}`, {
		method: "DELETE",
	});
}

export function compileProject(
	projectId: string,
	payload?: { engine?: string; mainFileId?: string },
) {
	return requestJson<CompileJobDto>(`/api/projects/${projectId}/compile`, {
		method: "POST",
		body: JSON.stringify(payload ?? {}),
	});
}

export function getLatestCompileOutput(projectId: string) {
	return requestJson<{ compileJob: CompileJobDto | null }>(
		`/api/projects/${projectId}/compile`,
	);
}

export function getCompileHistory(projectId: string, limit = 20) {
	return requestJson<{ jobs: CompileJobDto[] }>(
		`/api/projects/${projectId}/compile?history=1&limit=${limit}`,
	);
}

export function getCompileJob(jobId: string) {
	return requestJson<CompileJobDto>(`/api/compile-jobs/${jobId}`);
}

export function forkProject(sourceProjectId: string) {
	return requestJson<ProjectDetail>(`/api/share/${sourceProjectId}/fork`, {
		method: "POST",
	});
}

export function getPublicProject(projectId: string) {
	return requestJson<ProjectDetail>(`/api/share/${projectId}`);
}

export function getTemplates(search = "") {
	return requestJson<{ templates: TemplateDto[] }>(
		`/api/templates${search ? `?search=${encodeURIComponent(search)}` : ""}`,
	);
}

export function getSnippets(search = "") {
	return requestJson<{ snippets: SnippetDto[] }>(
		`/api/snippets${search ? `?search=${encodeURIComponent(search)}` : ""}`,
	);
}

export function createSnippet(data: CreateSnippetInput) {
	return requestJson<SnippetDto>("/api/snippets", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
}

export function deleteSnippet(id: string) {
	return requestJson<void>(`/api/snippets/${id}`, { method: "DELETE" });
}
