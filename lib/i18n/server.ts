import { cookies, headers } from "next/headers";
import { cache, type ReactNode } from "react";

import {
	DEFAULT_LOCALE,
	LOCALE_COOKIE,
	type Locale,
	resolveLocale,
} from "@/lib/i18n/config";
import { getMessages, getTranslator } from "@/lib/i18n/messages";
import { type RichParams, renderRich } from "@/lib/i18n/rich";
import { lookup, type MessageKey, type Translator } from "@/lib/i18n/translate";

/**
 * Locale of the current request (server components, route handlers and
 * server actions). Outside a request scope (background jobs, tests) it falls
 * back to the default locale.
 */
export const getLocale = cache(async (): Promise<Locale> => {
	try {
		const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
		return resolveLocale({
			cookie: cookieStore.get(LOCALE_COOKIE)?.value,
			acceptLanguage: headerList.get("accept-language"),
		});
	} catch {
		return DEFAULT_LOCALE;
	}
});

/** Locale and translator for the current request. */
export const getI18n = cache(
	async (): Promise<{
		locale: Locale;
		t: Translator;
		rich: (key: MessageKey, params?: RichParams) => ReactNode;
	}> => {
		const locale = await getLocale();
		const messages = getMessages(locale);
		return {
			locale,
			t: getTranslator(locale),
			rich: (key, params) =>
				renderRich(locale, lookup(messages, key) ?? key, params),
		};
	},
);
