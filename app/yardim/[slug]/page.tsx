import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HelpArticleView } from "@/features/help/components/help-article";
import { getHelpArticle, helpArticles } from "@/features/help/content";

// Articles are static data: prerender them all and 404 anything else.
export const dynamicParams = false;

export function generateStaticParams() {
	return helpArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const article = getHelpArticle(slug);
	if (!article) return {};
	return { title: article.title, description: article.summary };
}

export default async function HelpArticlePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const article = getHelpArticle(slug);
	if (!article) notFound();

	return <HelpArticleView article={article} />;
}
