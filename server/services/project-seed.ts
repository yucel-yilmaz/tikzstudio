import { DEFAULT_MAIN_FILE_PATH, DEFAULT_PROJECT_SOURCE } from "@/lib/defaults";

export type ProjectSeedFile = {
	path: string;
	content: string;
	isBinary: boolean;
	binaryContent: Uint8Array<ArrayBuffer> | null;
	isMain: boolean;
};

/**
 * Builds the initial file set for a new project from a template. Multi-file
 * templates are copied as-is (including binary assets); legacy single-content
 * templates become `main.tex`. Exactly one file is marked as main.
 */
export function buildProjectSeedFiles(template?: {
	content: string | null;
	files: ProjectSeedFile[];
}): ProjectSeedFile[] {
	const files: ProjectSeedFile[] = template?.files.length
		? template.files.map((file) => ({ ...file }))
		: [
				{
					path: DEFAULT_MAIN_FILE_PATH,
					content: template?.content ?? DEFAULT_PROJECT_SOURCE,
					isBinary: false,
					binaryContent: null,
					isMain: true,
				},
			];

	const candidates = [
		files.findIndex((file) => file.isMain),
		files.findIndex((file) => file.path === DEFAULT_MAIN_FILE_PATH),
		files.findIndex((file) => !file.isBinary && file.path.endsWith(".tex")),
	];
	const mainIndex = candidates.find((index) => index >= 0) ?? 0;
	return files.map((file, index) => ({ ...file, isMain: index === mainIndex }));
}
