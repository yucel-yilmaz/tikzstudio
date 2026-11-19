import { AlertTriangle, Info, Lightbulb } from "lucide-react";

import { CodeBlock } from "@/features/help/components/code-block";
import { renderInline } from "@/features/help/components/inline-text";
import { StartTourButton } from "@/features/help/components/start-tour-button";
import type { HelpBlock } from "@/features/help/content/types";
import { getI18n } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

const CALLOUTS = {
	tip: {
		icon: Lightbulb,
		label: "help.calloutTip",
		className: "border-emerald-200 bg-emerald-50/80 text-emerald-950",
		iconClassName: "text-emerald-700",
	},
	warning: {
		icon: AlertTriangle,
		label: "help.calloutWarning",
		className: "border-amber-200 bg-amber-50/80 text-amber-950",
		iconClassName: "text-amber-700",
	},
	info: {
		icon: Info,
		label: "help.calloutInfo",
		className: "border-(--line) bg-white/70 text-(--ink-0)",
		iconClassName: "text-(--accent-strong)",
	},
} as const;

function TableView({ head, rows }: { head: string[]; rows: string[][] }) {
	return (
		<div className="hidden overflow-x-auto rounded-2xl border border-(--line) bg-white/70 sm:block">
			<table className="w-full min-w-[32rem] border-collapse text-left text-sm">
				<thead>
					<tr className="border-b border-(--line) bg-(--surface-2)/60">
						{head.map((cell) => (
							<th
								key={cell}
								scope="col"
								className="px-4 py-2.5 font-semibold text-(--ink-0)"
							>
								{cell}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, rowIndex) => (
						<tr
							key={rowIndex}
							className="border-b border-(--line) last:border-b-0 align-top"
						>
							{row.map((cell, cellIndex) => (
								<td
									key={cellIndex}
									className={cn(
										"px-4 py-3 leading-6 text-(--ink-1)",
										cellIndex === 0 && "min-w-36 text-(--ink-0)",
									)}
								>
									{renderInline(cell)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

type CalloutLabels = Record<keyof typeof CALLOUTS, string>;

function Block({
	block,
	calloutLabels,
}: {
	block: HelpBlock;
	calloutLabels: CalloutLabels;
}) {
	switch (block.type) {
		case "p":
			return (
				<p className="text-[15px] leading-7 text-(--ink-1)">
					{renderInline(block.text)}
				</p>
			);
		case "h2":
			return (
				<h2
					id={block.id}
					className="scroll-mt-24 pt-4 text-2xl font-semibold tracking-tight text-(--ink-0)"
				>
					<a href={`#${block.id}`} className="hover:underline">
						{block.text}
					</a>
				</h2>
			);
		case "h3":
			return (
				<h3 className="pt-2 text-lg font-semibold text-(--ink-0)">
					{renderInline(block.text)}
				</h3>
			);
		case "list": {
			const ListTag = block.ordered ? "ol" : "ul";
			return (
				<ListTag
					className={cn(
						"space-y-2 pl-5 text-[15px] leading-7 text-(--ink-1) marker:text-(--accent-strong)",
						block.ordered ? "list-decimal" : "list-disc",
					)}
				>
					{block.items.map((item, index) => (
						<li key={index} className="pl-1">
							{renderInline(item)}
						</li>
					))}
				</ListTag>
			);
		}
		case "code":
			return <CodeBlock code={block.code} title={block.title} />;
		case "callout": {
			const meta = CALLOUTS[block.tone];
			const Icon = meta.icon;
			return (
				<aside
					className={cn(
						"flex gap-3 rounded-2xl border px-4 py-3.5",
						meta.className,
					)}
				>
					<Icon className={cn("mt-1 size-4 shrink-0", meta.iconClassName)} />
					<div className="min-w-0 space-y-1 text-sm leading-6">
						<p className="font-semibold">
							{block.title ?? calloutLabels[block.tone]}
						</p>
						<p>{renderInline(block.text)}</p>
					</div>
				</aside>
			);
		}
		case "table":
			return (
				<>
					{/* Phones: one card per row instead of a sideways-scrolling table. */}
					<div className="space-y-3 sm:hidden">
						{block.rows.map((row, rowIndex) => (
							<dl
								key={rowIndex}
								className="space-y-2 rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm leading-6"
							>
								{row.map((cell, cellIndex) => (
									<div key={cellIndex}>
										<dt className="text-xs font-medium uppercase tracking-[0.12em] text-(--ink-1)">
											{block.head[cellIndex]}
										</dt>
										<dd
											className={cn(
												"text-(--ink-1)",
												cellIndex === 0 && "text-base text-(--ink-0)",
											)}
										>
											{renderInline(cell)}
										</dd>
									</div>
								))}
							</dl>
						))}
					</div>
					<TableView head={block.head} rows={block.rows} />
				</>
			);
		case "faq":
			return (
				<div className="divide-y divide-(--line) overflow-hidden rounded-2xl border border-(--line) bg-white/70">
					{block.items.map((item) => (
						<details key={item.question} className="group px-4 py-1">
							<summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-[15px] font-medium text-(--ink-0) [&::-webkit-details-marker]:hidden">
								{item.question}
								<span
									aria-hidden
									className="text-lg leading-none text-(--accent-strong) transition-transform group-open:rotate-45"
								>
									+
								</span>
							</summary>
							<div className="space-y-2 pb-4 text-[15px] leading-7 text-(--ink-1)">
								{item.answer.map((paragraph) => (
									<p key={paragraph}>{renderInline(paragraph)}</p>
								))}
							</div>
						</details>
					))}
				</div>
			);
		case "tourButton":
			return (
				<div>
					<StartTourButton label={block.text} />
				</div>
			);
	}
}

export async function ArticleBody({ blocks }: { blocks: HelpBlock[] }) {
	const { t } = await getI18n();
	const calloutLabels: CalloutLabels = {
		tip: t(CALLOUTS.tip.label),
		warning: t(CALLOUTS.warning.label),
		info: t(CALLOUTS.info.label),
	};

	return (
		<div className="space-y-5">
			{blocks.map((block, index) => (
				<Block key={index} block={block} calloutLabels={calloutLabels} />
			))}
		</div>
	);
}
