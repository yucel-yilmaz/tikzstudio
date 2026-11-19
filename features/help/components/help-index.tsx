"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HelpIconBadge } from "@/features/help/components/help-icon";
import { StartTourButton } from "@/features/help/components/start-tour-button";
import type { HelpIndexSection } from "@/features/help/content";
import { useI18n } from "@/lib/i18n/client";
import { foldCase } from "@/lib/i18n/format";

/**
 * Help-center index with client-side search. The server passes the sections
 * (titles and summaries only) and a lowercased search text per article, in
 * the current language.
 */
export function HelpIndex({
	sections: allSections,
	searchText,
}: {
	sections: HelpIndexSection[];
	searchText: Record<string, string>;
}) {
	const { t, rich, locale } = useI18n();
	const [query, setQuery] = useState("");
	const deferredQuery = useDeferredValue(query);

	const searchIndex = useMemo(
		() => new Map(Object.entries(searchText)),
		[searchText],
	);

	const terms = foldCase(locale, deferredQuery).split(/\s+/).filter(Boolean);
	const matches = (slug: string) =>
		terms.every((term) => searchIndex.get(slug)?.includes(term));

	const sections = allSections
		.map((section) => ({
			...section,
			articles: section.articles.filter((article) => matches(article.slug)),
		}))
		.filter((section) => section.articles.length > 0);

	return (
		<div className="flex flex-col gap-5">
			<Card className="relative overflow-hidden border-white/60 bg-[linear-gradient(145deg,rgba(255,250,242,0.97),rgba(242,236,223,0.95))]">
				<div className="absolute left-0 top-0 h-48 w-48 rounded-full bg-[rgba(200,85,61,0.14)] blur-3xl" />
				<CardContent className="relative grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:p-10">
					<div className="space-y-4">
						<Badge variant="outline" className="normal-case tracking-normal">
							{t("help.indexBadge")}
						</Badge>
						<h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
							{t("help.indexTitle")}
						</h1>
						<p className="max-w-2xl text-base leading-7 text-(--ink-1)">
							{t("help.indexIntro")}
						</p>
						<label className="relative block max-w-xl">
							<span className="sr-only">{t("help.searchLabel")}</span>
							<Search
								className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-(--ink-1)"
								aria-hidden
							/>
							<Input
								type="search"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder={t("help.searchPlaceholder")}
								className="h-11 rounded-2xl bg-white/80 pl-11 text-base"
							/>
						</label>
					</div>

					<div className="space-y-3 rounded-3xl border border-(--line) bg-white/65 p-5">
						<p className="font-medium">{t("help.newHereTitle")}</p>
						<p className="text-sm leading-6 text-(--ink-1)">
							{t("help.newHereBody")}
						</p>
						<div className="flex flex-wrap gap-2">
							<StartTourButton />
						</div>
					</div>
				</CardContent>
			</Card>

			{sections.length === 0 ? (
				<Card>
					<CardContent className="space-y-2 p-8 text-center">
						<p className="text-lg font-semibold">{t("help.noResultsTitle")}</p>
						<p className="text-sm text-(--ink-1)">
							{rich("help.noResultsBody", {
								link: (chunks) => (
									<Link
										href="/yardim/sss"
										className="font-medium text-(--accent-strong) underline underline-offset-4"
									>
										{chunks}
									</Link>
								),
							})}
						</p>
					</CardContent>
				</Card>
			) : null}

			{sections.map((section) => (
				<section
					key={section.id}
					aria-labelledby={`bolum-${section.id}`}
					className="space-y-3"
				>
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
						<h2
							id={`bolum-${section.id}`}
							className="text-xl font-semibold tracking-tight"
						>
							{section.title}
						</h2>
						<p className="text-sm text-(--ink-1)">{section.description}</p>
					</div>
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{section.articles.map((article) => (
							<Link
								key={article.slug}
								href={`/yardim/${article.slug}`}
								className="group block rounded-[28px] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-(--accent-strong)/30"
							>
								<Card className="h-full border-(--line) bg-white/78 transition group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_40px_rgba(44,31,20,0.12)]">
									<CardContent className="flex h-full flex-col gap-4 p-5">
										<HelpIconBadge name={article.icon} />
										<div className="space-y-2">
											<h3 className="text-lg font-semibold">{article.title}</h3>
											<p className="text-sm leading-6 text-(--ink-1)">
												{article.summary}
											</p>
										</div>
										<span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-(--accent-strong)">
											{t("help.read")}
											<ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
										</span>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
