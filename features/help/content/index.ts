import {
	compilingAndEngines,
	outputsAndExport,
} from "@/features/help/content/articles/compiling";
import {
	editor,
	gettingStarted,
	projectsAndFiles,
} from "@/features/help/content/articles/getting-started";
import {
	sharing,
	templatesAndSnippets,
	turkishDocuments,
} from "@/features/help/content/articles/more";
import { faq, troubleshooting } from "@/features/help/content/articles/support";
import type { HelpArticle, HelpSection } from "@/features/help/content/types";

export type {
	HelpArticle,
	HelpBlock,
	HelpIconName,
	HelpSection,
} from "@/features/help/content/types";

/** Sections in the order they appear on the help-center index. */
export const helpSections: HelpSection[] = [
	{
		id: "ilk-adimlar",
		title: "İlk adımlar",
		description: "Hesap, ilk proje ve ekranın bölümleri.",
		articles: [gettingStarted, editor, projectsAndFiles],
	},
	{
		id: "derleme",
		title: "Derleme ve çıktı",
		description: "Motorlar, sınırlar, önizleme ve indirme.",
		articles: [compilingAndEngines, outputsAndExport],
	},
	{
		id: "daha-fazlasi",
		title: "Daha fazlası",
		description: "Şablonlar, paylaşma ve Türkçe belgeler.",
		articles: [templatesAndSnippets, sharing, turkishDocuments],
	},
	{
		id: "destek",
		title: "Sorun mu var?",
		description: "Hata mesajları ve sık sorulan sorular.",
		articles: [troubleshooting, faq],
	},
];

/** All articles in reading order (used for prev/next links). */
export const helpArticles: HelpArticle[] = helpSections.flatMap(
	(section) => section.articles,
);

export function getHelpArticle(slug: string): HelpArticle | undefined {
	return helpArticles.find((article) => article.slug === slug);
}

export function getAdjacentArticles(slug: string) {
	const index = helpArticles.findIndex((article) => article.slug === slug);
	return {
		previous: index > 0 ? helpArticles[index - 1] : undefined,
		next:
			index >= 0 && index < helpArticles.length - 1
				? helpArticles[index + 1]
				: undefined,
	};
}

export function getArticleSection(slug: string): HelpSection | undefined {
	return helpSections.find((section) =>
		section.articles.some((article) => article.slug === slug),
	);
}

/** Lowercased text used by the help-center search box. */
export function articleSearchText(article: HelpArticle): string {
	const blockText = article.blocks
		.map((block) => {
			switch (block.type) {
				case "p":
				case "h2":
				case "h3":
				case "callout":
					return block.text;
				case "list":
					return block.items.join(" ");
				case "table":
					return [...block.head, ...block.rows.flat()].join(" ");
				case "faq":
					return block.items
						.map((item) => `${item.question} ${item.answer.join(" ")}`)
						.join(" ");
				default:
					return "";
			}
		})
		.join(" ");
	return [
		article.title,
		article.summary,
		...(article.keywords ?? []),
		blockText,
	]
		.join(" ")
		.toLocaleLowerCase("tr-TR");
}
