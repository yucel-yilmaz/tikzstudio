import { describe, expect, it } from "vitest";

import { defaultActiveFile } from "@/features/editor/store/use-editor-store";

const file = (path: string, isMain = false, isBinary = false) => ({
	id: path,
	path,
	isMain,
	isBinary,
});

describe("defaultActiveFile", () => {
	it("prefers the main file even when an image sorts first", () => {
		expect(
			defaultActiveFile([
				file("Ekran-görüntüsü.png", false, true),
				file("bolum.tex"),
				file("main.tex", true),
			])?.path,
		).toBe("main.tex");
	});

	it("falls back to the first text file, never a binary one", () => {
		expect(
			defaultActiveFile([file("a.png", false, true), file("b.tex")])?.path,
		).toBe("b.tex");
	});

	it("handles empty projects", () => {
		expect(defaultActiveFile([])).toBeUndefined();
	});
});
