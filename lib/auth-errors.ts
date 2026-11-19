/**
 * Helpers for better-auth endpoints: messages in the user's language for
 * its error codes (it returns English text) and a small typed POST wrapper.
 */
import type { KeysOf, Translator } from "@/lib/i18n/translate";

type AuthErrorKey = KeysOf<"authErrors">;

const AUTH_ERROR_CODES = new Set<string>([
	"INVALID_EMAIL_OR_PASSWORD",
	"USER_ALREADY_EXISTS",
	"USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
	"PASSWORD_TOO_SHORT",
	"PASSWORD_TOO_LONG",
	"INVALID_EMAIL",
	"INVALID_PASSWORD",
	"EMAIL_NOT_VERIFIED",
	"INVALID_TOKEN",
	"TOKEN_EXPIRED",
	"EMAIL_ALREADY_VERIFIED",
	"SESSION_EXPIRED",
	"CREDENTIAL_ACCOUNT_NOT_FOUND",
	"TOO_MANY_REQUESTS",
] satisfies AuthErrorKey[]);

export function authErrorMessage(
	t: Translator,
	code: string | undefined | null,
	fallback?: string,
) {
	if (code && AUTH_ERROR_CODES.has(code)) {
		return t(`authErrors.${code as AuthErrorKey}`);
	}
	return fallback ?? t("authErrors.fallback");
}

export type AuthResult<T> =
	| { ok: true; data: T }
	| { ok: false; code: string; message: string };

export async function postAuth<T = unknown>(
	t: Translator,
	path: string,
	body: Record<string, unknown>,
	fallback?: string,
): Promise<AuthResult<T>> {
	try {
		const response = await fetch(`/api/auth${path}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const payload = (await response.json().catch(() => null)) as
			| (T & { code?: string })
			| null;

		if (!response.ok) {
			const code =
				response.status === 429
					? "TOO_MANY_REQUESTS"
					: (payload?.code ?? "UNKNOWN");
			return {
				ok: false,
				code,
				message: authErrorMessage(t, code, fallback),
			};
		}
		return { ok: true, data: payload as T };
	} catch {
		return {
			ok: false,
			code: "NETWORK",
			message: t("common.networkError"),
		};
	}
}
