import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HelpArticleView } from "@/features/help/components/help-article";
import { getHelpArticle, getHelpArticles } from "@/features/help/content";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";

// Slugs are the same in every language; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
	return getHelpArticles(DEFAULT_LOCALE).map((article) => ({
		slug: article.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const article = getHelpArticle(await getLocale(), slug);
	if (!article) return {};
	return { title: article.title, description: article.summary };
}

export default async function HelpArticlePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const article = getHelpArticle(await getLocale(), slug);
	if (!article) notFound();

	return <HelpArticleView article={article} />;
}
