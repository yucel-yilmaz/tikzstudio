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

type Recipient = { email: string; name?: string | null };

function greeting(user: Recipient) {
	return user.name?.trim() ? `Merhaba ${user.name.trim()},` : "Merhaba,";
}

/** Plain, client-safe HTML layout with a single call-to-action button. */
function layout(options: {
	user: Recipient;
	intro: string;
	action?: { label: string; url: string };
	outro: string;
}) {
	const { user, intro, action, outro } = options;
	const button = action
		? `<p style="margin:24px 0"><a href="${escapeHtml(action.url)}" style="background:#1c1917;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${escapeHtml(action.label)}</a></p>
<p style="font-size:13px;color:#57534e">Düğme çalışmazsa bu bağlantıyı tarayıcınıza yapıştırın:<br><a href="${escapeHtml(action.url)}" style="color:#9b341f;word-break:break-all">${escapeHtml(action.url)}</a></p>`
		: "";
	return `<!doctype html>
<html lang="tr"><body style="margin:0;background:#f5f0e8;font-family:Arial,Helvetica,sans-serif;color:#1c1917">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
<p style="font-weight:bold;font-size:18px;margin:0 0 24px">TikZ Studio</p>
<div style="background:#ffffff;border-radius:12px;padding:24px">
<p>${escapeHtml(greeting(user))}</p>
<p>${escapeHtml(intro)}</p>
${button}
<p style="font-size:13px;color:#57534e">${escapeHtml(outro)}</p>
</div></div></body></html>`;
}

export function verificationEmail(user: Recipient, url: string): MailMessage {
	const intro =
		"TikZ Studio hesabınızı etkinleştirmek için e-posta adresinizi doğrulayın.";
	const outro =
		"Bu bağlantı 24 saat geçerlidir. Bu hesabı siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz.";
	return {
		to: user.email,
		subject: "TikZ Studio: e-posta adresinizi doğrulayın",
		text: `${greeting(user)}\n\n${intro}\n\n${url}\n\n${outro}`,
		html: layout({
			user,
			intro,
			action: { label: "E-postamı doğrula", url },
			outro,
		}),
	};
}

export function resetPasswordEmail(user: Recipient, url: string): MailMessage {
	const intro =
		"Hesabınız için bir şifre sıfırlama isteği aldık. Yeni şifrenizi belirlemek için aşağıdaki bağlantıyı kullanın.";
	const outro =
		"Bu bağlantı 1 saat geçerlidir ve yalnızca bir kez kullanılabilir. İsteği siz yapmadıysanız bu e-postayı yok sayın; şifreniz değişmez.";
	return {
		to: user.email,
		subject: "TikZ Studio: şifre sıfırlama",
		text: `${greeting(user)}\n\n${intro}\n\n${url}\n\n${outro}`,
		html: layout({
			user,
			intro,
			action: { label: "Yeni şifre belirle", url },
			outro,
		}),
	};
}

export function passwordChangedEmail(
	user: Recipient,
	options: { otherSessionsRevoked?: boolean } = { otherSessionsRevoked: true },
): MailMessage {
	const intro = options.otherSessionsRevoked
		? "Hesabınızın şifresi değiştirildi ve diğer cihazlardaki oturumlarınız kapatıldı."
		: "Hesabınızın şifresi değiştirildi.";
	const outro =
		'Bu değişikliği siz yapmadıysanız hemen "Şifremi unuttum" ile şifrenizi sıfırlayın.';
	return {
		to: user.email,
		subject: "TikZ Studio: şifreniz değiştirildi",
		text: `${greeting(user)}\n\n${intro}\n\n${outro}`,
		html: layout({ user, intro, outro }),
	};
}
