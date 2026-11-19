import {
	DEFAULT_LOCALE,
	isLocale,
	LOCALE_COOKIE,
	type Locale,
	matchAcceptLanguage,
	readCookie,
} from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/messages";
import type { Translator } from "@/lib/i18n/translate";
import type { MailMessage } from "@/lib/mailer";

const HTML_ESCAPES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

export function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

type Recipient = { email: string; name?: string | null; locale?: unknown };

/**
 * Language of an email: the language the user explicitly picked in this
 * browser (cookie), else the one stored on their account, else the browser's
 * `Accept-Language`, else Turkish.
 */
export function emailLocale(
	user: object | null | undefined,
	headers?: Headers | null,
): Locale {
	const cookie = readCookie(headers?.get("cookie"), LOCALE_COOKIE);
	if (isLocale(cookie)) return cookie;
	// better-auth passes the user row, which includes the `locale` field.
	const stored = (user as { locale?: unknown } | null | undefined)?.locale;
	if (isLocale(stored)) return stored;
	return matchAcceptLanguage(headers?.get("accept-language")) ?? DEFAULT_LOCALE;
}

function greeting(t: Translator, user: Recipient) {
	const name = user.name?.trim();
	return name ? t("emails.greetingNamed", { name }) : t("emails.greeting");
}

/** Plain, client-safe HTML layout with a single call-to-action button. */
function layout(options: {
	t: Translator;
	locale: Locale;
	user: Recipient;
	intro: string;
	action?: { label: string; url: string };
	outro: string;
}) {
	const { t, locale, user, intro, action, outro } = options;
	const button = action
		? `<p style="margin:24px 0"><a href="${escapeHtml(action.url)}" style="background:#1c1917;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${escapeHtml(action.label)}</a></p>
<p style="font-size:13px;color:#57534e">${escapeHtml(t("emails.buttonFallback"))}<br><a href="${escapeHtml(action.url)}" style="color:#9b341f;word-break:break-all">${escapeHtml(action.url)}</a></p>`
		: "";
	return `<!doctype html>
<html lang="${locale}"><body style="margin:0;background:#f5f0e8;font-family:Arial,Helvetica,sans-serif;color:#1c1917">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
<p style="font-weight:bold;font-size:18px;margin:0 0 24px">TikZ Studio</p>
<div style="background:#ffffff;border-radius:12px;padding:24px">
<p>${escapeHtml(greeting(t, user))}</p>
<p>${escapeHtml(intro)}</p>
${button}
<p style="font-size:13px;color:#57534e">${escapeHtml(outro)}</p>
</div></div></body></html>`;
}

export function verificationEmail(
	user: Recipient,
	url: string,
	locale: Locale = DEFAULT_LOCALE,
): MailMessage {
	const t = getTranslator(locale);
	const intro = t("emails.verifyIntro");
	const outro = t("emails.verifyOutro");
	return {
		to: user.email,
		subject: t("emails.verifySubject"),
		text: `${greeting(t, user)}\n\n${intro}\n\n${url}\n\n${outro}`,
		html: layout({
			t,
			locale,
			user,
			intro,
			action: { label: t("emails.verifyAction"), url },
			outro,
		}),
	};
}

export function resetPasswordEmail(
	user: Recipient,
	url: string,
	locale: Locale = DEFAULT_LOCALE,
): MailMessage {
	const t = getTranslator(locale);
	const intro = t("emails.resetIntro");
	const outro = t("emails.resetOutro");
	return {
		to: user.email,
		subject: t("emails.resetSubject"),
		text: `${greeting(t, user)}\n\n${intro}\n\n${url}\n\n${outro}`,
		html: layout({
			t,
			locale,
			user,
			intro,
			action: { label: t("emails.resetAction"), url },
			outro,
		}),
	};
}

export function passwordChangedEmail(
	user: Recipient,
	options: { otherSessionsRevoked?: boolean } = { otherSessionsRevoked: true },
	locale: Locale = DEFAULT_LOCALE,
): MailMessage {
	const t = getTranslator(locale);
	const intro = options.otherSessionsRevoked
		? t("emails.changedIntroRevoked")
		: t("emails.changedIntro");
	const outro = t("emails.changedOutro");
	return {
		to: user.email,
		subject: t("emails.changedSubject"),
		text: `${greeting(t, user)}\n\n${intro}\n\n${outro}`,
		html: layout({ t, locale, user, intro, outro }),
	};
}
