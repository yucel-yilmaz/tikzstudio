import { describe, expect, it } from "vitest";

import {
	compileProjectSchema,
	createProjectSchema,
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
