import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { ArticleBody } from "@/features/help/components/article-body";
import { HelpIcon, HelpIconBadge } from "@/features/help/components/help-icon";
import {
	getAdjacentArticles,
	getArticleSection,
	getHelpSections,
	type HelpArticle,
	type HelpSection,
} from "@/features/help/content";
import { getI18n } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

function ArticleNav({
	currentSlug,
	sections,
	label,
}: {
	currentSlug: string;
	sections: HelpSection[];
	label: string;
}) {
	return (
		<nav aria-label={label} className="space-y-5">
			{sections.map((section) => (
				<div key={section.id} className="space-y-1.5">
					<p className="px-3 text-xs font-medium uppercase tracking-[0.14em] text-(--ink-1)">
						{section.title}
					</p>
					<ul className="space-y-0.5">
						{section.articles.map((article) => {
							const active = article.slug === currentSlug;
							return (
								<li key={article.slug}>
									<Link
										href={`/yardim/${article.slug}`}
										aria-current={active ? "page" : undefined}
										className={cn(
											"flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
											active
												? "bg-[rgba(200,85,61,0.12)] font-medium text-(--accent-strong)"
												: "text-(--ink-1) hover:bg-white/70 hover:text-(--ink-0)",
										)}
									>
										<HelpIcon name={article.icon} className="size-4 shrink-0" />
										{article.title}
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</nav>
	);
}

export async function HelpArticleView({ article }: { article: HelpArticle }) {
	const { t, locale } = await getI18n();
	const sections = getHelpSections(locale);
	const section = getArticleSection(locale, article.slug);
	const { previous, next } = getAdjacentArticles(locale, article.slug);
	const headings = article.blocks.flatMap((block) =>
		block.type === "h2" ? [{ id: block.id, text: block.text }] : [],
	);

	return (
		<div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_14rem]">
			<aside className="hidden lg:block">
				<div className="sticky top-5 rounded-3xl border border-(--line) bg-white/55 p-3">
					<ArticleNav
						currentSlug={article.slug}
						sections={sections}
						label={t("help.topics")}
					/>
				</div>
			</aside>

			<article className="min-w-0">
				<Card className="border-white/60 bg-[linear-gradient(160deg,rgba(255,250,242,0.97),rgba(244,239,231,0.95))]">
					<CardContent className="space-y-6 p-5 sm:p-8 lg:p-10">
						<div className="space-y-4">
							<nav
								aria-label={t("help.breadcrumb")}
								className="flex flex-wrap items-center gap-1.5 text-xs text-(--ink-1)"
							>
								<Link href="/yardim" className="hover:text-(--ink-0)">
									{t("common.helpCenter")}
								</Link>
								{section ? (
									<>
										<ChevronRight className="size-3" aria-hidden />
										<span>{section.title}</span>
									</>
								) : null}
							</nav>
							<div className="flex items-start gap-4">
								<HelpIconBadge name={article.icon} />
								<div className="min-w-0 space-y-2">
									<h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
										{article.title}
									</h1>
									<p className="text-base leading-7 text-(--ink-1)">
										{article.summary}
									</p>
								</div>
							</div>
						</div>

						<div className="h-px bg-(--line)" />

						<ArticleBody blocks={article.blocks} />
					</CardContent>
				</Card>

				<div className="mt-5 grid gap-3 sm:grid-cols-2">
					{previous ? (
						<Link
							href={`/yardim/${previous.slug}`}
							className="group rounded-3xl border border-(--line) bg-white/70 p-4 transition hover:bg-white"
						>
							<span className="inline-flex items-center gap-1.5 text-xs text-(--ink-1)">
								<ArrowLeft className="size-3.5" aria-hidden />
								{t("help.previous")}
							</span>
							<p className="mt-1 font-medium">{previous.title}</p>
						</Link>
					) : (
						<span className="hidden sm:block" />
					)}
					{next ? (
						<Link
							href={`/yardim/${next.slug}`}
							className="group rounded-3xl border border-(--line) bg-white/70 p-4 text-right transition hover:bg-white"
						>
							<span className="inline-flex items-center gap-1.5 text-xs text-(--ink-1)">
								{t("help.next")}
								<ArrowRight className="size-3.5" aria-hidden />
							</span>
							<p className="mt-1 font-medium">{next.title}</p>
						</Link>
					) : null}
				</div>

				<details className="mt-5 rounded-3xl border border-(--line) bg-white/55 p-3 lg:hidden">
					<summary className="cursor-pointer px-3 py-2 text-sm font-medium">
						{t("help.allTopics")}
					</summary>
					<div className="pt-3">
						<ArticleNav
							currentSlug={article.slug}
							sections={sections}
							label={t("help.topics")}
						/>
					</div>
				</details>
			</article>

			{headings.length > 1 ? (
				<aside className="hidden xl:block">
					<nav
						aria-label={t("help.onThisPage")}
						className="sticky top-5 space-y-2 rounded-3xl border border-(--line) bg-white/55 p-4"
					>
						<p className="text-xs font-medium uppercase tracking-[0.14em] text-(--ink-1)">
							{t("help.onThisPage")}
						</p>
						<ul className="space-y-1.5 text-sm">
							{headings.map((heading) => (
								<li key={heading.id}>
									<a
										href={`#${heading.id}`}
										className="text-(--ink-1) hover:text-(--accent-strong)"
									>
										{heading.text}
									</a>
								</li>
							))}
						</ul>
					</nav>
				</aside>
			) : null}
		</div>
	);
}
