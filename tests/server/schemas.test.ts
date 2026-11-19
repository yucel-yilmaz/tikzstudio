import { describe, expect, it } from "vitest";

import {
	compileProjectSchema,
	createProjectSchema,
	saveAsTemplateSchema,
} from "@/server/schemas/project";

describe("createProjectSchema", () => {
	it("accepts a valid payload", () => {
		const result = createProjectSchema.parse({
			title: "Geometry Diagram",
			description: "Triangle notes",
		});
		expect(result.title).toBe("Geometry Diagram");
		expect(result.description).toBe("Triangle notes");
	});

	it("rejects an empty title", () => {
		expect(() => createProjectSchema.parse({ title: "" })).toThrow();
	});
});

describe("compileProjectSchema", () => {
	it("defaults engine to TECTONIC", () => {
		const result = compileProjectSchema.parse({});
		expect(result.engine).toBe("TECTONIC");
	});
});

describe("saveAsTemplateSchema", () => {
	it("trims fields and accepts an optional engine", () => {
		const parsed = saveAsTemplateSchema.parse({
			title: "  Yazılı şablonum ",
			category: " Sınav ",
			engine: "PDFLATEX",
		});
		expect(parsed).toMatchObject({
			title: "Yazılı şablonum",
			category: "Sınav",
			engine: "PDFLATEX",
		});
	});

	it("rejects an empty title and an unknown engine", () => {
		expect(() => saveAsTemplateSchema.parse({ title: "  " })).toThrow();
		expect(() =>
			saveAsTemplateSchema.parse({ title: "x", engine: "WORD" }),
		).toThrow();
	});
});
