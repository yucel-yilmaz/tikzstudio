import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { DEFAULT_TEMPLATE_PREVIEW_URL } from "@/lib/defaults";
import {
	officialPreviewUrl,
	officialTemplates,
} from "@/prisma/official-templates";

const PUBLIC_DIR = path.join(process.cwd(), "public");

describe("official template previews", () => {
	it.each(
		officialTemplates.map((t) => [t.title, t] as const),
	)("%s has a preview image (run `npm run templates:previews`)", (_title, template) => {
		expect(
			existsSync(path.join(PUBLIC_DIR, officialPreviewUrl(template))),
		).toBe(true);
	});

	it("include the default project preview", () => {
		expect(
			existsSync(path.join(PUBLIC_DIR, DEFAULT_TEMPLATE_PREVIEW_URL)),
		).toBe(true);
	});

	it("contain no stale images", () => {
		const expected = [
			...officialTemplates.map((t) => path.basename(officialPreviewUrl(t))),
			path.basename(DEFAULT_TEMPLATE_PREVIEW_URL),
		].sort();
		expect(
			readdirSync(path.join(PUBLIC_DIR, "template-previews")).sort(),
		).toEqual(expected);
	});
});
