"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { formatDateTime, formatNumber, formatTime } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages/tr";
import { type RichParams, renderRich } from "@/lib/i18n/rich";
import {
	createTranslator,
	lookup,
	type MessageKey,
	type Translator,
} from "@/lib/i18n/translate";

export type I18nValue = {
	locale: Locale;
	t: Translator;
	/** Like `t`, but placeholders/tags may render React nodes. */
	rich: (key: MessageKey, params?: RichParams) => ReactNode;
	formatDateTime: (value: string | number | Date) => string;
	formatTime: (value: string | number | Date) => string;
	formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Latest translator, for plain modules that cannot use hooks (the fetch
 * wrappers in `lib/client-api.ts`). Updated whenever the provider renders.
 */
let currentTranslator: Translator | null = null;

export function getClientTranslator(): Translator | null {
	return currentTranslator;
}

export function I18nProvider({
	locale,
	messages,
	children,
}: {
	locale: Locale;
	messages: Messages;
	children: ReactNode;
}) {
	const value = useMemo<I18nValue>(() => {
		const t = createTranslator(locale, messages);
		return {
			locale,
			t,
			rich: (key, params) =>
				renderRich(locale, lookup(messages, key) ?? key, params),
			formatDateTime: (date) => formatDateTime(locale, date),
			formatTime: (date) => formatTime(locale, date),
			formatNumber: (number, options) => formatNumber(locale, number, options),
		};
	}, [locale, messages]);

	currentTranslator = value.t;

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
	const value = useContext(I18nContext);
	if (!value) {
		throw new Error(
			`useI18n must be used inside <I18nProvider> (default locale: ${DEFAULT_LOCALE}).`,
		);
	}
	return value;
}

/** Shorthand for components that only need `t`. */
export function useT(): Translator {
	return useI18n().t;
}
