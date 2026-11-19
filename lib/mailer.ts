import nodemailer, { type Transporter } from "nodemailer";

import { resolveRequireEmailVerification } from "@/lib/email-policy";
import { env } from "@/lib/env";

export type MailMessage = {
	to: string;
	subject: string;
	text: string;
	html: string;
};

export function isSmtpConfigured() {
	return Boolean(env.SMTP_HOST);
}

export function requiresEmailVerification() {
	return resolveRequireEmailVerification(
		env.REQUIRE_EMAIL_VERIFICATION,
		isSmtpConfigured(),
	);
}

let transporter: Transporter | null = null;

function getTransporter() {
	transporter ??= nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: env.SMTP_PORT,
		secure: env.SMTP_SECURE,
		auth:
			env.SMTP_USER || env.SMTP_PASS
				? { user: env.SMTP_USER, pass: env.SMTP_PASS }
				: undefined,
	});
	return transporter;
}

/**
 * Sends an email through SMTP. Without SMTP configuration the message is
 * written to the server log instead (development), including its links.
 */
export async function sendMail(message: MailMessage) {
	if (!isSmtpConfigured()) {
		console.warn(
			`[mailer] SMTP is not configured; email not sent. To: ${message.to}\n` +
				`Subject: ${message.subject}\n${message.text}`,
		);
		return;
	}

	await getTransporter().sendMail({ from: env.MAIL_FROM, ...message });
}
