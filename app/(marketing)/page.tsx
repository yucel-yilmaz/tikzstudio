import {
	ArrowRight,
	BookOpen,
	ImageDown,
	Layers3,
	ShieldCheck,
	Sparkles,
	Workflow,
} from "lucide-react";
import Link from "next/link";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getI18n } from "@/lib/i18n/server";

export default async function LandingPage() {
	const { t } = await getI18n();

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-375 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
			<Card className="relative overflow-hidden border-white/60 bg-[linear-gradient(145deg,rgba(255,250,242,0.97),rgba(242,236,223,0.95))]">
				<div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-[rgba(200,85,61,0.16)] blur-3xl" />
				<div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[rgba(155,52,31,0.10)] blur-3xl" />
				<CardContent className="relative grid gap-8 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
					<div className="space-y-6">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline" className="normal-case tracking-normal">
								TikZ Studio
							</Badge>
							<Badge variant="default" className="normal-case tracking-normal">
								{t("landing.tagline")}
							</Badge>
							<LocaleSwitcher className="ml-auto" />
						</div>

						<div className="space-y-4">
							<h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
								{t("landing.heroTitle")}
							</h1>
							<p className="max-w-2xl text-base leading-7 text-(--ink-1) md:text-lg">
								{t("landing.heroBody")}
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Button asChild size="lg">
								<Link href="/signup">
									{t("landing.getStarted")}
									<ArrowRight size={16} />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/login">{t("common.signIn")}</Link>
							</Button>
							<Button asChild variant="ghost" size="lg">
								<Link href="/yardim">
									<BookOpen size={16} />
									{t("common.help")}
								</Link>
							</Button>
						</div>

						<div className="grid gap-3 pt-2 sm:grid-cols-3">
							{[
								[
									t("landing.highlightTemplatesTitle"),
									t("landing.highlightTemplatesBody"),
								],
								[
									t("landing.highlightCompileTitle"),
									t("landing.highlightCompileBody"),
								],
								[
									t("landing.highlightFormatsTitle"),
									t("landing.highlightFormatsBody"),
								],
							].map(([title, description]) => (
								<div
									key={title}
									className="rounded-3xl border border-(--line) bg-white/65 p-4"
								>
									<p className="font-medium">{title}</p>
									<p className="mt-2 text-sm leading-6 text-(--ink-1)">
										{description}
									</p>
								</div>
							))}
						</div>
					</div>

					<Card className="border-[rgba(255,255,255,0.08)] bg-[#15120f] text-[#f7f2e8] shadow-[0_30px_70px_rgba(20,16,12,0.28)]">
						<CardContent className="space-y-5 p-5">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-sm font-medium">main.tex</p>
									<p className="text-xs uppercase tracking-[0.16em] text-[#c9bca7]">
										{t("landing.demoEditing")}
									</p>
								</div>
								<Badge
									variant="outline"
									className="border-[#40352d] bg-[#231d18] text-[#f2e9db]"
								>
									pdfLaTeX + Biber
								</Badge>
							</div>

							<pre className="overflow-auto rounded-[24px] bg-[#0e0c0a] p-4 font-mono text-sm leading-7 text-[#f8edd6]">
								{String.raw`\begin{tikzpicture}
  \node[draw, circle] (a) at (0,0) {A};
  \node[draw, circle] (b) at (2,1) {B};
  \node[draw, circle] (c) at (4,0) {C};
  \draw[->] (a) -- node[above] {$\alpha$} (b);
  \draw[->] (b) -- node[above] {$\beta$} (c);
\end{tikzpicture}`}
							</pre>

							<div className="grid gap-3">
								{[
									[
										t("landing.demoStepEditTitle"),
										t("landing.demoStepEditBody"),
									],
									[
										t("landing.demoStepCompileTitle"),
										t("landing.demoStepCompileBody"),
									],
									[
										t("landing.demoStepCheckTitle"),
										t("landing.demoStepCheckBody"),
									],
								].map(([title, description]) => (
									<div
										key={title}
										className="rounded-2xl bg-[#211b16] px-4 py-3"
									>
										<p className="font-medium">{title}</p>
										<p className="mt-1 text-sm leading-6 text-[#d7c9b5]">
											{description}
										</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</CardContent>
			</Card>

			<section className="grid gap-4 lg:grid-cols-4">
				{[
					{
						icon: Workflow,
						title: t("landing.featureWorkspaceTitle"),
						description: t("landing.featureWorkspaceBody"),
					},
					{
						icon: ShieldCheck,
						title: t("landing.featureSandboxTitle"),
						description: t("landing.featureSandboxBody"),
					},
					{
						icon: ImageDown,
						title: t("landing.featureImg2LatexTitle"),
						description: t("landing.featureImg2LatexBody"),
					},
					{
						icon: Layers3,
						title: t("landing.featureTemplatesTitle"),
						description: t("landing.featureTemplatesBody"),
					},
				].map(({ icon: Icon, title, description }) => (
					<Card key={title}>
						<CardContent className="space-y-4 p-6">
							<div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(200,85,61,0.12)] text-(--accent-strong)">
								<Icon size={20} />
							</div>
							<div className="space-y-2">
								<h2 className="text-2xl font-semibold">{title}</h2>
								<p className="text-sm leading-7 text-(--ink-1)">
									{description}
								</p>
							</div>
						</CardContent>
					</Card>
				))}
			</section>

			<section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
				<Card>
					<CardContent className="space-y-5 p-6">
						<Badge variant="outline" className="normal-case tracking-normal">
							{t("landing.audienceBadge")}
						</Badge>
						<div className="space-y-3">
							<h2 className="text-3xl font-semibold">
								{t("landing.audienceTitle")}
							</h2>
							<p className="text-sm leading-7 text-(--ink-1)">
								{t("landing.audienceBody")}
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-[color-mix(in_srgb,var(--surface-2)_72%,white_28%)]">
					<CardContent className="space-y-5 p-6">
						<div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-(--accent-strong)">
							<Sparkles size={20} />
						</div>
						<div className="space-y-3">
							<h2 className="text-2xl font-semibold">
								{t("landing.quickStartTitle")}
							</h2>
							<p className="text-sm leading-7 text-(--ink-1)">
								{t("landing.quickStartBody")}
							</p>
						</div>
						<Button asChild variant="secondary">
							<Link href="/signup">
								{t("common.signUp")}
								<ArrowRight size={16} />
							</Link>
						</Button>
					</CardContent>
				</Card>
			</section>

			<footer className="flex flex-col gap-2 border-t border-(--line) px-1 pt-4 pb-2 text-sm text-(--ink-1) sm:flex-row sm:items-center sm:justify-between">
				<p>TikZ Studio</p>
				<nav
					aria-label={t("common.footerLinks")}
					className="flex flex-wrap gap-x-4 gap-y-1"
				>
					<Link href="/yardim" className="hover:text-(--ink-0)">
						{t("common.helpCenter")}
					</Link>
					<Link href="/yardim/baslarken" className="hover:text-(--ink-0)">
						{t("common.gettingStarted")}
					</Link>
					<Link href="/yardim/sss" className="hover:text-(--ink-0)">
						{t("common.faq")}
					</Link>
					<Link href="/login" className="hover:text-(--ink-0)">
						{t("common.signIn")}
					</Link>
				</nav>
			</footer>
		</main>
	);
}
