import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Renders the tiny inline syntax used in help content:
 * `code`, **bold** and [label](href). Anything else is plain text.
 */
const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

export function renderInline(text: string): ReactNode[] {
	const parts = text.split(TOKEN);
	return parts.map((part, index) => {
		if (!part) return null;
		const key = `${index}-${part.slice(0, 12)}`;

		if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
			return (
				<code
					key={key}
					className="rounded-md border border-(--line) bg-white/70 px-1.5 py-0.5 font-mono text-[0.85em] text-(--ink-0)"
				>
					{part.slice(1, -1)}
				</code>
			);
		}

		if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
			return (
				<strong key={key} className="font-semibold text-(--ink-0)">
					{part.slice(2, -2)}
				</strong>
			);
		}

		const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
		if (link) {
			const [, label, href] = link;
			const className =
				"font-medium text-(--accent-strong) underline decoration-[rgba(155,52,31,0.35)] underline-offset-4 hover:decoration-(--accent-strong)";
			return href.startsWith("/") ? (
				<Link key={key} href={href} className={className}>
					{label}
				</Link>
			) : (
				<a
					key={key}
					href={href}
					className={className}
					target="_blank"
					rel="noreferrer"
				>
					{label}
				</a>
			);
		}

		return part;
	});
}

export function InlineText({ text }: { text: string }) {
	return <>{renderInline(text)}</>;
}
