import { describe, expect, it } from "vitest";

import {
	diagnosticsForFile,
	parseCompileLog,
} from "@/lib/compile-log";

describe("parseCompileLog", () => {
	it("returns empty array for null/empty input", () => {
		expect(parseCompileLog(null)).toEqual([]);
		expect(parseCompileLog(undefined)).toEqual([]);
		expect(parseCompileLog("")).toEqual([]);
	});

	it("parses structured Tectonic errors with file and line", () => {
		const log = "error: main.tex:15: Undefined control sequence.";
		const result = parseCompileLog(log);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			path: "main.tex",
			line: 15,
			severity: "error",
			message: "Undefined control sequence.",
		});
	});

	it("parses structured Tectonic warnings", () => {
		const log = "warning: main.tex:3: Overfull \\hbox detected.";
		const result = parseCompileLog(log);
		expect(result[0]).toMatchObject({
			severity: "warning",
			line: 3,
		});
	});

	it("parses plain LaTeX bang errors with lookahead line indicator", () => {
		const log = [
			"! Undefined control sequence.",
			"<argument> \\foo",
			"l.22 \\foo{}",
		].join("\n");
		const result = parseCompileLog(log);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			path: "*",
			line: 22,
			severity: "error",
			message: "Undefined control sequence.",
		});
	});

	it("falls back to line 1 when no l.<N> indicator found", () => {
		const log = "! Some obscure error with no line indicator.";
		const result = parseCompileLog(log);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({ path: "*", line: 1 });
	});

	it("deduplicates identical diagnostics", () => {
		const log = [
			"error: main.tex:5: Duplicate error.",
			"error: main.tex:5: Duplicate error.",
		].join("\n");
		expect(parseCompileLog(log)).toHaveLength(1);
	});
});

describe("diagnosticsForFile", () => {
	const diags = [
		{ path: "main.tex", line: 1, severity: "error" as const, message: "e1" },
		{ path: "other.tex", line: 2, severity: "error" as const, message: "e2" },
		{ path: "*", line: 3, severity: "error" as const, message: "e3" },
	];

	it("returns diagnostics matching the file path and wildcard entries", () => {
		const result = diagnosticsForFile(diags, "main.tex");
		expect(result.map((d) => d.message)).toEqual(["e1", "e3"]);
	});

	it("wildcard matches every file", () => {
		const result = diagnosticsForFile(diags, "other.tex");
		expect(result.map((d) => d.message)).toEqual(["e2", "e3"]);
	});

	it("strips leading ./ from paths before comparing", () => {
		const result = diagnosticsForFile(diags, "./main.tex");
		expect(result.some((d) => d.path === "main.tex")).toBe(true);
	});
});
