import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/messages/en";
import { type Messages, tr } from "@/lib/i18n/messages/tr";
import { createTranslator, type Translator } from "@/lib/i18n/translate";

export type { Messages } from "@/lib/i18n/messages/tr";

/**
 * Server-side access to the dictionaries. Client components never import
 * this module: the root layout passes only the active dictionary down to
 * the `I18nProvider`.
 */
export const dictionaries: Record<Locale, Messages> = { tr, en };

export function getMessages(locale: Locale): Messages {
	return dictionaries[locale];
}

const translators = new Map<Locale, Translator>();

/** Translator for a fixed locale (no request needed: jobs, emails, libs). */
export function getTranslator(locale: Locale = DEFAULT_LOCALE): Translator {
	let translator = translators.get(locale);
	if (!translator) {
		translator = createTranslator(locale, getMessages(locale));
		translators.set(locale, translator);
	}
	return translator;
}
