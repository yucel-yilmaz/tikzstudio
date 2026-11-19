import { INTL_LOCALES, type Locale } from "@/lib/i18n/config";

function toDate(value: string | number | Date) {
	return value instanceof Date ? value : new Date(value);
}

/** "19 Kas 2026 14:05" / "Nov 19, 2026, 2:05 PM" */
export function formatDateTime(locale: Locale, value: string | number | Date) {
	return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(toDate(value));
}

/** "14:05:09" / "2:05:09 PM" */
export function formatTime(locale: Locale, value: string | number | Date) {
	return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
		timeStyle: "medium",
	}).format(toDate(value));
}

export function formatNumber(
	locale: Locale,
	value: number,
	options?: Intl.NumberFormatOptions,
) {
	return new Intl.NumberFormat(INTL_LOCALES[locale], options).format(value);
}

/** Locale-aware string comparison for sorting. */
export function compareStrings(locale: Locale, a: string, b: string) {
	return a.localeCompare(b, INTL_LOCALES[locale]);
}

/** Case-folds text for search, using the locale's rules (Turkish İ/ı). */
export function foldCase(locale: Locale, value: string) {
	return value.toLocaleLowerCase(INTL_LOCALES[locale]);
}
