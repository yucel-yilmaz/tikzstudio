/**
 * Whether new email/password accounts must verify their address before they
 * can sign in. "auto" requires it only when real email delivery (SMTP) is
 * configured, so a development setup without SMTP never locks users out.
 */
export function resolveRequireEmailVerification(
	setting: "auto" | "true" | "false",
	smtpConfigured: boolean,
) {
	if (setting === "auto") return smtpConfigured;
	return setting === "true";
}
