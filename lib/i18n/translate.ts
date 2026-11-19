import { INTL_LOCALES, type Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages/tr";

/** Dotted path of every string leaf, e.g. "dashboard.newProject". */
type Leaves<T, Prefix extends string = ""> = {
	[K in keyof T & string]: T[K] extends string
		? `${Prefix}${K}`
		: Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<Messages>;

/** Keys below a namespace, e.g. `KeysOf<"errors">` -> "projectNotFound" | … */
export type KeysOf<
	Namespace extends string,
	Key extends string = MessageKey,
> = Key extends `${Namespace}.${infer Rest}` ? Rest : never;

export type MessageParams = Record<string, string | number>;

export type Translator = (key: MessageKey, params?: MessageParams) => string;

/** Returns the raw template for a key, or undefined when it does not exist. */
export function lookup(messages: Messages, key: string): string | undefined {
	let node: unknown = messages;
	for (const part of key.split(".")) {
		if (node === null || typeof node !== "object") return undefined;
		node = (node as Record<string, unknown>)[part];
	}
	return typeof node === "string" ? node : undefined;
}

/** Index of the "}" matching the "{" at `start`, or -1. */
function matchingBrace(text: string, start: number): number {
	let depth = 0;
	for (let i = start; i < text.length; i++) {
		if (text[i] === "{") depth++;
		else if (text[i] === "}") {
			depth--;
			if (depth === 0) return i;
		}
	}
	return -1;
}

const pluralRulesCache = new Map<Locale, Intl.PluralRules>();

function pluralCategory(locale: Locale, count: number) {
	let rules = pluralRulesCache.get(locale);
	if (!rules) {
		rules = new Intl.PluralRules(INTL_LOCALES[locale]);
		pluralRulesCache.set(locale, rules);
	}
	return rules.select(count);
}

/**
 * `{name, plural, =0 {none} one {# file} other {# files}}` — a small subset
 * of ICU MessageFormat. `#` becomes the formatted count.
 */
function formatPlural(
	locale: Locale,
	body: string,
	params: MessageParams | undefined,
): string {
	const comma = body.indexOf(",");
	const name = body.slice(0, comma).trim();
	const optionsText = body.slice(body.indexOf(",", comma + 1) + 1);
	const options = new Map<string, string>();
	let i = 0;
	while (i < optionsText.length) {
		const open = optionsText.indexOf("{", i);
		if (open === -1) break;
		const selector = optionsText.slice(i, open).trim();
		const close = matchingBrace(optionsText, open);
		if (close === -1) break;
		options.set(selector, optionsText.slice(open + 1, close));
		i = close + 1;
	}

	const raw = params?.[name];
	const count = typeof raw === "number" ? raw : Number(raw ?? 0);
	const chosen =
		options.get(`=${count}`) ??
		options.get(pluralCategory(locale, count)) ??
		options.get("other") ??
		"";
	const formattedCount = new Intl.NumberFormat(INTL_LOCALES[locale]).format(
		count,
	);
	return interpolate(locale, chosen, params).replace(/#/g, formattedCount);
}

/** Replaces `{name}` placeholders and plural blocks in a template. */
export function interpolate(
	locale: Locale,
	template: string,
	params?: MessageParams,
): string {
	if (!template.includes("{")) return template;

	let result = "";
	let i = 0;
	while (i < template.length) {
		const open = template.indexOf("{", i);
		if (open === -1) {
			result += template.slice(i);
			break;
		}
		result += template.slice(i, open);
		const close = matchingBrace(template, open);
		if (close === -1) {
			result += template.slice(open);
			break;
		}
		const body = template.slice(open + 1, close);
		if (/^\s*\w+\s*,\s*plural\s*,/.test(body)) {
			result += formatPlural(locale, body, params);
		} else {
			const name = body.trim();
			const value = params?.[name];
			result +=
				value === undefined
					? `{${name}}`
					: typeof value === "number"
						? new Intl.NumberFormat(INTL_LOCALES[locale]).format(value)
						: value;
		}
		i = close + 1;
	}
	return result;
}

export function createTranslator(
	locale: Locale,
	messages: Messages,
): Translator {
	return (key, params) => {
		const template = lookup(messages, key);
		if (template === undefined) {
			if (process.env.NODE_ENV !== "production") {
				console.warn(`[i18n] missing message "${key}" for ${locale}`);
			}
			return key;
		}
		return interpolate(locale, template, params);
	};
}
