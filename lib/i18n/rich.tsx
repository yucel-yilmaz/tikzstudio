import { Fragment, type ReactNode } from "react";

import type { Locale } from "@/lib/i18n/config";
import { interpolate, type MessageParams } from "@/lib/i18n/translate";

export type RichParams = Record<
	string,
	string | number | ReactNode | ((chunks: ReactNode) => ReactNode)
>;

/**
 * Renders a message that contains React elements: `{name}` placeholders
 * take nodes and `<tag>text</tag>` pairs take render functions, e.g.
 * `rich("Delete <b>{title}</b>?", { title, b: (c) => <strong>{c}</strong> })`.
 */
export function renderRich(
	locale: Locale,
	template: string,
	params: RichParams = {},
): ReactNode {
	const plain: MessageParams = {};
	for (const [name, value] of Object.entries(params)) {
		if (typeof value === "string" || typeof value === "number") {
			plain[name] = value;
		}
	}
	// Plain values (and plurals) first; node placeholders stay as `{name}`.
	const text = interpolate(locale, template, plain);

	const parts: ReactNode[] = [];
	const pattern = /<(\w+)>([\s\S]*?)<\/\1>|\{(\w+)\}/g;
	let last = 0;
	let index = 0;
	for (const match of text.matchAll(pattern)) {
		const start = match.index ?? 0;
		if (start > last) parts.push(text.slice(last, start));
		const [, tag, inner, name] = match;
		let node: ReactNode;
		if (tag) {
			const render = params[tag];
			node = typeof render === "function" ? render(inner) : inner;
		} else {
			const value = params[name];
			node = typeof value === "function" ? null : (value as ReactNode);
		}
		parts.push(<Fragment key={index++}>{node}</Fragment>);
		last = start + match[0].length;
	}
	if (last < text.length) parts.push(text.slice(last));
	return parts;
}
