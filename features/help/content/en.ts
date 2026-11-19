import {
	compilingAndEngines,
	outputsAndExport,
} from "@/features/help/content/articles/en/compiling";
import {
	editor,
	gettingStarted,
	projectsAndFiles,
} from "@/features/help/content/articles/en/getting-started";
import {
	sharing,
	templatesAndSnippets,
	turkishDocuments,
} from "@/features/help/content/articles/en/more";
import {
	faq,
	troubleshooting,
} from "@/features/help/content/articles/en/support";
import type { HelpSection } from "@/features/help/content/types";

/**
 * English help center. Section ids and article slugs match the Turkish
 * content, so every /yardim URL works in both languages.
 */
export const helpSections: HelpSection[] = [
	{
		id: "ilk-adimlar",
		title: "First steps",
		description:
			"Your account, your first project and the parts of the screen.",
		articles: [gettingStarted, editor, projectsAndFiles],
	},
	{
		id: "derleme",
		title: "Compiling and output",
		description: "Engines, limits, preview and downloads.",
		articles: [compilingAndEngines, outputsAndExport],
	},
	{
		id: "daha-fazlasi",
		title: "More",
		description: "Templates, sharing and Turkish documents.",
		articles: [templatesAndSnippets, sharing, turkishDocuments],
	},
	{
		id: "destek",
		title: "Having trouble?",
		description: "Error messages and frequently asked questions.",
		articles: [troubleshooting, faq],
	},
];
