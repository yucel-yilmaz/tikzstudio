/**
 * Single registry of official templates and snippets. Used by the seed, the
 * sandbox verification script, the Tectonic warm-up sync and the tests.
 */
import { slugifyFilename } from "../lib/utils";
import { academicSnippets, academicTemplates } from "./academic-templates";
import { basicSnippets, basicTemplates } from "./basic-templates";
import {
	mathSnippets,
	mathTemplates,
	type SeedSnippet,
	type SeedTemplate,
} from "./math-templates";

export const officialTemplates: SeedTemplate[] = [
	...basicTemplates,
	...mathTemplates,
	...academicTemplates,
];

export const officialSnippets: SeedSnippet[] = [
	...basicSnippets,
	...mathSnippets,
	...academicSnippets,
];

/** Files of a template as written to disk (single-content → main.tex). */
export function templateFiles(template: SeedTemplate) {
	return template.files?.length
		? template.files.map((file, index) => ({
				path: file.path,
				content: file.content,
				isMain: file.isMain ?? index === 0,
			}))
		: [{ path: "main.tex", content: template.content ?? "", isMain: true }];
}

/** Public URL of an official template's preview image (see templates:previews). */
export function officialPreviewUrl(template: SeedTemplate) {
	return `/template-previews/${slugifyFilename(template.title)}.png`;
}
