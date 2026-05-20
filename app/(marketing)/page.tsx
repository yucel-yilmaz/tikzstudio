import {
	ArrowRight,
	Layers3,
	ShieldCheck,
	Sparkles,
	Workflow,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-375 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
			<Card className="relative overflow-hidden border-white/60 bg-[linear-gradient(145deg,rgba(255,250,242,0.97),rgba(242,236,223,0.95))]">
				<div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-[rgba(200,85,61,0.16)] blur-3xl" />
				<div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[rgba(155,52,31,0.10)] blur-3xl" />
				<CardContent className="relative grid gap-8 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
					<div className="space-y-6">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline" className="normal-case tracking-normal">
								TikZLab
							</Badge>
							<Badge variant="default" className="normal-case tracking-normal">
								Next.js-based TikZ workspace
							</Badge>
						</div>

						<div className="space-y-4">
							<h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
								Create TikZ diagrams with a modern editor, secure compilation
								and live PDF output.
							</h1>
							<p className="max-w-2xl text-base leading-7 text-(--ink-1) md:text-lg">
								A professional browser editor for research, education and
								technical documentation teams. Write, compile, inspect logs and
								manage PDF output on a single surface.
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Button asChild size="lg">
								<Link href="/signup">
									Get started
									<ArrowRight size={16} />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/login">Sign in</Link>
							</Button>
						</div>

						<div className="grid gap-3 pt-2 sm:grid-cols-3">
							{[
								["Template support", "Faster output with ready-made starters."],
								["Sandboxed compilation", "Isolated Docker execution."],
								["PDF + log", "Monitor output and errors at a glance."],
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
										Active editing
									</p>
								</div>
								<Badge
									variant="outline"
									className="border-[#40352d] bg-[#231d18] text-[#f2e9db]"
								>
									TECTONIC
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
									["Edit code", "Update the TikZ source in the editor panel."],
									["Compile", "Generate PDF inside an isolated process."],
									["Review", "Verify the result from the preview and log view."],
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

			<section className="grid gap-4 lg:grid-cols-3">
				{[
					{
						icon: Workflow,
						title: "Single-surface workflow",
						description:
							"Manage code, compilation and PDF output in one workspace without splitting across separate tools.",
					},
					{
						icon: ShieldCheck,
						title: "Secure compile sandbox",
						description:
							"Run LaTeX execution in a network-isolated Docker environment to minimise the attack surface.",
					},
					{
						icon: Layers3,
						title: "Template & snippet library",
						description:
							"Insert frequently used blocks and starter documents in a few clicks.",
					},
				].map(({ icon: Icon, title, description }) => (
					<Card key={title}>
						<CardContent className="space-y-4 p-6">
							<div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(200,85,61,0.12)] text-(--accent-strong)">
								<Icon size={20} />
							</div>
							<div className="space-y-2">
								<h2 className="text-2xl font-semibold">{title}</h2>
								<p className="text-sm leading-7 text-(--ink-1)">{description}</p>
							</div>
						</CardContent>
					</Card>
				))}
			</section>

			<section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
				<Card>
					<CardContent className="space-y-5 p-6">
						<Badge variant="outline" className="normal-case tracking-normal">
							Who is it for?
						</Badge>
						<div className="space-y-3">
							<h2 className="text-3xl font-semibold">
								For teams who don&apos;t want to trade diagram quality for tool
								complexity.
							</h2>
							<p className="text-sm leading-7 text-(--ink-1)">
								A clean, focused TikZ surface for teams producing academic
								figures, technical schematics, algorithm flows and educational
								content.
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
								Quick start, professional output
							</h2>
							<p className="text-sm leading-7 text-(--ink-1)">
								Cut the time from first line to downloaded PDF while keeping the
								workspace professional.
							</p>
						</div>
						<Button asChild variant="secondary">
							<Link href="/signup">
								Create account
								<ArrowRight size={16} />
							</Link>
						</Button>
					</CardContent>
				</Card>
			</section>
		</main>
	);
}
