import { describe, expect, it } from "vitest";

import {
	categoryFromEnglish,
	OFFICIAL_CATEGORIES_EN,
	OFFICIAL_SNIPPETS_EN,
	OFFICIAL_TEMPLATES_EN,
	snippetToEnglish,
	templateToEnglish,
} from "@/lib/official-content-en";
import {
	officialSnippets,
	officialTemplates,
} from "@/prisma/official-templates";

describe("English names of official content", () => {
	it("covers every official template", () => {
		for (const template of officialTemplates) {
			const en = OFFICIAL_TEMPLATES_EN[template.title];
			expect(en, template.title).toBeDefined();
			expect(en.title.trim()).not.toBe("");
			expect(en.description.trim()).not.toBe("");
		}
		expect(Object.keys(OFFICIAL_TEMPLATES_EN).sort()).toEqual(
			officialTemplates.map((t) => t.title).sort(),
		);
	});

	it("covers every official snippet, including its description", () => {
		for (const snippet of officialSnippets) {
			const en = OFFICIAL_SNIPPETS_EN[snippet.trigger];
			expect(en, snippet.trigger).toBeDefined();
			expect(Boolean(en.description)).toBe(Boolean(snippet.description));
		}
		expect(Object.keys(OFFICIAL_SNIPPETS_EN).sort()).toEqual(
			officialSnippets.map((s) => s.trigger).sort(),
		);
	});

	it("covers every official category", () => {
		const categories = new Set([
			...officialTemplates.map((t) => t.category),
			...officialSnippets.map((s) => s.category),
		]);
		for (const category of categories) {
			expect(OFFICIAL_CATEGORIES_EN[category], category).toBeDefined();
		}
		const english = Object.values(OFFICIAL_CATEGORIES_EN);
		expect(new Set(english).size).toBe(english.length);
	});

	it("translates official templates but keeps user titles", () => {
		const official = templateToEnglish({
			title: "Basit üçgen",
			description: "Köşeleri etiketli üçgen.",
			category: "Geometri",
			ownerId: null,
		});
		expect(official).toMatchObject({
			title: "Simple triangle",
			category: "Geometry",
		});

		const own = templateToEnglish({
			title: "Basit üçgen",
			description: "Benim şablonum",
			category: "Geometri",
			ownerId: "user-1",
		});
		expect(own).toMatchObject({
			title: "Basit üçgen",
			description: "Benim şablonum",
			category: "Geometry",
		});
	});

	it("keeps a snippet's description when it has no translation", () => {
		const snippet = snippetToEnglish({
			title: "Üçgen",
			description: null,
			category: "Geometri",
			trigger: "triangle",
			ownerId: null,
		});
		expect(snippet).toMatchObject({ title: "Triangle", description: null });
	});

	it("maps English categories back for the category filter", () => {
		expect(categoryFromEnglish("Geometry")).toBe("Geometri");
		expect(categoryFromEnglish("Unknown")).toBe("Unknown");
	});
});
