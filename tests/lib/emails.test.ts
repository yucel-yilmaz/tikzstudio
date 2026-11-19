import { describe, expect, it } from "vitest";

import { resolveRequireEmailVerification } from "@/lib/email-policy";
import {
	escapeHtml,
	passwordChangedEmail,
	resetPasswordEmail,
	verificationEmail,
} from "@/lib/emails";

describe("resolveRequireEmailVerification", () => {
	it("follows SMTP availability in auto mode", () => {
		expect(resolveRequireEmailVerification("auto", true)).toBe(true);
		expect(resolveRequireEmailVerification("auto", false)).toBe(false);
	});

	it("respects an explicit setting", () => {
		expect(resolveRequireEmailVerification("true", false)).toBe(true);
		expect(resolveRequireEmailVerification("false", true)).toBe(false);
	});
});

describe("emails", () => {
	const user = { email: "ayse@ornek.com", name: "Ayşe" };
	const url = "https://tikz.example/api/auth/verify-email?token=abc&x=1";

	it("include the action link in text and HTML", () => {
		for (const message of [
			verificationEmail(user, url),
			resetPasswordEmail(user, url),
		]) {
			expect(message.to).toBe(user.email);
			expect(message.text).toContain(url);
			expect(message.html).toContain(escapeHtml(url));
			expect(message.text).toContain("Merhaba Ayşe,");
		}
	});

	it("escape user-controlled values in HTML", () => {
		const message = verificationEmail(
			{ email: "x@ornek.com", name: '<img src=x onerror="alert(1)">' },
			url,
		);
		expect(message.html).not.toContain("<img");
		expect(message.html).toContain(
			"&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
		);
	});

	it("greet generically without a name", () => {
		expect(passwordChangedEmail({ email: "x@ornek.com" }).text).toMatch(
			/^Merhaba,/,
		);
	});
});

describe("passwordChangedEmail", () => {
	it("mentions revoked sessions only when they were revoked", () => {
		const user = { email: "x@ornek.com" };
		expect(passwordChangedEmail(user).text).toContain(
			"oturumlarınız kapatıldı",
		);
		expect(
			passwordChangedEmail(user, { otherSessionsRevoked: false }).text,
		).not.toContain("oturumlarınız kapatıldı");
	});
});
