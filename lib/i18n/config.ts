/**
 * Locale configuration shared by server and client code.
 *
 * The UI language is not part of the URL: it is resolved from the `locale`
 * cookie, then the browser's `Accept-Language` header, then defaults to
 * Turkish.
 */
export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "tr";
export const LOCALE_COOKIE = "locale";
/** One year; the cookie only stores a UI preference. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** BCP 47 tags passed to `Intl` formatters. */
export const INTL_LOCALES: Record<Locale, string> = {
	tr: "tr-TR",
	en: "en-US",
};

export const LOCALE_LABELS: Record<Locale, string> = {
	tr: "Türkçe",
	en: "English",
};

export function isLocale(value: unknown): value is Locale {
	return typeof value === "string" && LOCALES.includes(value as Locale);
}

/**
 * Picks the best supported locale from an `Accept-Language` header, honouring
 * q-values ("en-GB,en;q=0.9,tr;q=0.8" -> "en"). Returns null when nothing
 * matches.
 */
export function matchAcceptLanguage(
	header: string | null | undefined,
): Locale | null {
	if (!header) return null;

	const ranked = header
		.split(",")
		.map((part, index) => {
			const [tag, ...params] = part.trim().split(";");
			const qParam = params.find((param) => param.trim().startsWith("q="));
			const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
			return {
				language: tag.trim().toLowerCase().split("-")[0],
				q: Number.isFinite(q) ? q : 0,
				index,
			};
		})
		.filter((entry) => entry.language && entry.q > 0)
		.sort((a, b) => b.q - a.q || a.index - b.index);

	for (const entry of ranked) {
		if (isLocale(entry.language)) return entry.language;
	}
	return null;
}

/** Cookie first, then `Accept-Language`, then the default (Turkish). */
export function resolveLocale(input: {
	cookie?: string | null;
	acceptLanguage?: string | null;
}): Locale {
	if (isLocale(input.cookie)) return input.cookie;
	return matchAcceptLanguage(input.acceptLanguage) ?? DEFAULT_LOCALE;
}

/** Reads a single cookie value from a raw `Cookie` header. */
export function readCookie(
	cookieHeader: string | null | undefined,
	name: string,
): string | null {
	if (!cookieHeader) return null;
	for (const part of cookieHeader.split(";")) {
		const [key, ...rest] = part.trim().split("=");
		if (key === name) {
			try {
				return decodeURIComponent(rest.join("="));
			} catch {
				return rest.join("=");
			}
		}
	}
	return null;
}

/** Resolves the locale of an incoming request from its headers. */
export function localeFromHeaders(headers: Headers | null | undefined): Locale {
	if (!headers) return DEFAULT_LOCALE;
	return resolveLocale({
		cookie: readCookie(headers.get("cookie"), LOCALE_COOKIE),
		acceptLanguage: headers.get("accept-language"),
	});
}
