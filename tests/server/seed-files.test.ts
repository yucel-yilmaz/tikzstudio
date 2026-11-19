import { describe, expect, it } from "vitest";

import { DEFAULT_MAIN_FILE_PATH, DEFAULT_PROJECT_SOURCE } from "@/lib/defaults";
import {
	buildProjectSeedFiles,
	type ProjectSeedFile,
} from "@/server/services/project-seed";

const file = (
	path: string,
	overrides: Partial<ProjectSeedFile> = {},
): ProjectSeedFile => ({
	path,
	content: `% ${path}`,
	isBinary: false,
	binaryContent: null,
	isMain: false,
	...overrides,
});

describe("buildProjectSeedFiles", () => {
	it("falls back to the default document without a template", () => {
		const files = buildProjectSeedFiles();
		expect(files).toHaveLength(1);
		expect(files[0]).toMatchObject({
			path: DEFAULT_MAIN_FILE_PATH,
			content: DEFAULT_PROJECT_SOURCE,
			isMain: true,
		});
	});

	it("uses legacy single-content templates as main.tex", () => {
		const files = buildProjectSeedFiles({ content: "X", files: [] });
		expect(files).toEqual([
			expect.objectContaining({ path: "main.tex", content: "X", isMain: true }),
		]);
	});

	it("copies every file of a multi-file template, keeping the main flag", () => {
		const files = buildProjectSeedFiles({
			content: null,
			files: [
				file("sekiller/ucgen.tex"),
				file("exam.tex", { isMain: true }),
				file("logo.png", { isBinary: true, binaryContent: new Uint8Array(3) }),
			],
		});
		expect(files.map((f) => f.path)).toEqual([
			"sekiller/ucgen.tex",
			"exam.tex",
			"logo.png",
		]);
		expect(files.filter((f) => f.isMain).map((f) => f.path)).toEqual([
			"exam.tex",
		]);
		expect(files[2].binaryContent).toHaveLength(3);
	});

	it("marks exactly one main file when the template marks none", () => {
		const files = buildProjectSeedFiles({
			content: null,
			files: [file("logo.png", { isBinary: true }), file("doc.tex")],
		});
		expect(files.filter((f) => f.isMain).map((f) => f.path)).toEqual([
			"doc.tex",
		]);
	});

	it("marks exactly one main file when the template marks several", () => {
		const files = buildProjectSeedFiles({
			content: null,
			files: [file("a.tex", { isMain: true }), file("b.tex", { isMain: true })],
		});
		expect(files.filter((f) => f.isMain)).toHaveLength(1);
	});
});
