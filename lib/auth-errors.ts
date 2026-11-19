/**
 * Client helpers for better-auth endpoints: Turkish messages for its error
 * codes (it returns English text) and a small typed POST wrapper.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
	INVALID_EMAIL_OR_PASSWORD: "E-posta veya şifre hatalı.",
	USER_ALREADY_EXISTS: "Bu e-posta adresiyle zaten bir hesap var.",
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
		"Bu e-posta adresiyle zaten bir hesap var. Başka bir e-posta deneyin.",
	PASSWORD_TOO_SHORT: "Şifre en az 8 karakter olmalı.",
	PASSWORD_TOO_LONG: "Şifre çok uzun.",
	INVALID_EMAIL: "Geçerli bir e-posta adresi girin.",
	INVALID_PASSWORD: "Mevcut şifre hatalı.",
	EMAIL_NOT_VERIFIED:
		"E-posta adresiniz henüz doğrulanmadı. Gelen kutunuzdaki bağlantıya tıklayın.",
	INVALID_TOKEN:
		"Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin.",
	TOKEN_EXPIRED: "Bağlantının süresi dolmuş. Lütfen yeni bir bağlantı isteyin.",
	EMAIL_ALREADY_VERIFIED: "E-posta adresiniz zaten doğrulanmış.",
	TOO_MANY_REQUESTS:
		"Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.",
};

export function authErrorMessage(
	code: string | undefined | null,
	fallback = "İşlem başarısız oldu.",
) {
	return (code && AUTH_ERROR_MESSAGES[code]) || fallback;
}

export type AuthResult<T> =
	| { ok: true; data: T }
	| { ok: false; code: string; message: string };

export async function postAuth<T = unknown>(
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
			return { ok: false, code, message: authErrorMessage(code, fallback) };
		}
		return { ok: true, data: payload as T };
	} catch {
		return {
			ok: false,
			code: "NETWORK",
			message: "Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.",
		};
	}
}
