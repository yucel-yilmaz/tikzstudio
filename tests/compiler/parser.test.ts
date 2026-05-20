import { describe, expect, it } from "vitest";

import { inferCompileErrorCode } from "@/server/compiler/parser";

describe("inferCompileErrorCode", () => {
	it("maps timeout messages", () => {
		expect(inferCompileErrorCode("Compilation timed out.")).toBe("TIMEOUT");
		expect(inferCompileErrorCode("process timed out after 15s")).toBe("TIMEOUT");
	});

	it("maps security-blocked messages", () => {
		expect(inferCompileErrorCode("shell escape not allowed")).toBe(
			"SECURITY_BLOCKED",
		);
	});

	it("maps missing file messages", () => {
		expect(inferCompileErrorCode("No file missing.tex.")).toBe("MISSING_FILE");
		expect(inferCompileErrorCode("file.sty not found")).toBe("MISSING_FILE");
	});

	it("maps LaTeX syntax errors", () => {
		expect(
			inferCompileErrorCode("! LaTeX Error: Missing \\begin{document}."),
		).toBe("LATEX_SYNTAX_ERROR");
		expect(inferCompileErrorCode("Package geometry Error: blah")).toBe(
			"LATEX_SYNTAX_ERROR",
		);
	});

	it("maps missing package messages", () => {
		expect(inferCompileErrorCode("missing package tikz")).toBe(
			"MISSING_PACKAGE",
		);
	});

	it("defaults to UNKNOWN_ERROR for unrecognised logs", () => {
		expect(inferCompileErrorCode("some random output")).toBe("UNKNOWN_ERROR");
		expect(inferCompileErrorCode("")).toBe("UNKNOWN_ERROR");
	});
});
