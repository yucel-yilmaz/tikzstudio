/**
 * Help-center content per language. Server-only: pages pass the client just
 * what it needs (see `HelpIndex`), so neither language's articles end up in
 * the client bundle.
 */
import { helpSections as enSections } from "@/features/help/content/en";
import { helpSections as trSections } from "@/features/help/content/tr";
import type { HelpArticle, HelpSection } from "@/features/help/content/types";
import type { Locale } from "@/lib/i18n/config";
import { foldCase } from "@/lib/i18n/format";

export type {
	HelpArticle,
	HelpBlock,
	HelpIconName,
	HelpSection,
} from "@/features/help/content/types";

const SECTIONS: Record<Locale, HelpSection[]> = {
	tr: trSections,
	en: enSections,
};

/** Sections in the order they appear on the help-center index. */
export function getHelpSections(locale: Locale): HelpSection[] {
	return SECTIONS[locale];
}

/** All articles in reading order (used for prev/next links). */
export function getHelpArticles(locale: Locale): HelpArticle[] {
	return SECTIONS[locale].flatMap((section) => section.articles);
}

export function getHelpArticle(
	locale: Locale,
	slug: string,
): HelpArticle | undefined {
	return getHelpArticles(locale).find((article) => article.slug === slug);
}

export function getAdjacentArticles(locale: Locale, slug: string) {
	const articles = getHelpArticles(locale);
	const index = articles.findIndex((article) => article.slug === slug);
	return {
		previous: index > 0 ? articles[index - 1] : undefined,
		next:
			index >= 0 && index < articles.length - 1
				? articles[index + 1]
				: undefined,
	};
}

export function getArticleSection(
	locale: Locale,
	slug: string,
): HelpSection | undefined {
	return SECTIONS[locale].find((section) =>
		section.articles.some((article) => article.slug === slug),
	);
}

/** Lowercased text used by the help-center search box. */
export function articleSearchText(
	locale: Locale,
	article: HelpArticle,
): string {
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
	return foldCase(
		locale,
		[
			article.title,
			article.summary,
			...(article.keywords ?? []),
			blockText,
		].join(" "),
	);
}

/** What the (client-side) help index needs: no article bodies. */
export type HelpIndexSection = Omit<HelpSection, "articles"> & {
	articles: Pick<HelpArticle, "slug" | "title" | "summary" | "icon">[];
};

export function getHelpIndexData(locale: Locale): {
	sections: HelpIndexSection[];
	searchText: Record<string, string>;
} {
	const sections = SECTIONS[locale].map((section) => ({
		id: section.id,
		title: section.title,
		description: section.description,
		articles: section.articles.map(({ slug, title, summary, icon }) => ({
			slug,
			title,
			summary,
			icon,
		})),
	}));
	const searchText = Object.fromEntries(
		getHelpArticles(locale).map((article) => [
			article.slug,
			articleSearchText(locale, article),
		]),
	);
	return { sections, searchText };
}
