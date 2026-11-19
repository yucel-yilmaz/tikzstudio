import { describe, expect, it } from "vitest";

import { getHelpSections } from "@/features/help/content";
import type { HelpArticle } from "@/features/help/content/types";
import { passwordChangedEmail, verificationEmail } from "@/lib/emails";
import { AppError } from "@/lib/errors";
import {
	LOCALES,
	localeFromHeaders,
	matchAcceptLanguage,
	readCookie,
	resolveLocale,
} from "@/lib/i18n/config";
import { dictionaries, getTranslator } from "@/lib/i18n/messages";
import { en } from "@/lib/i18n/messages/en";
import { tr } from "@/lib/i18n/messages/tr";
import { interpolate } from "@/lib/i18n/translate";

/** Flattens a nested dictionary into `{ "a.b.c": "value" }`. */
function flatten(node: unknown, prefix = ""): Record<string, unknown> {
	if (node === null || typeof node !== "object") return { [prefix]: node };
	return Object.entries(node as Record<string, unknown>).reduce(
		(acc, [key, value]) =>
			Object.assign(acc, flatten(value, prefix ? `${prefix}.${key}` : key)),
		{} as Record<string, unknown>,
	);
}

/** `{name}` / `{name, plural, …}` placeholders and `<tag>` names. */
function placeholders(value: string) {
	const names = [...value.matchAll(/\{(\w+)\s*[,}]/g)].map((m) => m[1]);
	const tags = [...value.matchAll(/<(\w+)>/g)].map((m) => `<${m[1]}>`);
	return [...new Set([...names, ...tags])].sort();
}

describe("dictionaries", () => {
	const flatTr = flatten(tr);
	const flatEn = flatten(en);

	it("tr and en have exactly the same keys", () => {
		expect(Object.keys(flatEn).sort()).toEqual(Object.keys(flatTr).sort());
	});

	it("every value is a non-empty string", () => {
		for (const [locale, flat] of [
			["tr", flatTr],
			["en", flatEn],
		] as const) {
			for (const [key, value] of Object.entries(flat)) {
				expect(typeof value, `${locale}:${key}`).toBe("string");
				expect((value as string).trim(), `${locale}:${key}`).not.toBe("");
			}
		}
	});

	it("tr and en use the same placeholders and tags", () => {
		for (const [key, value] of Object.entries(flatTr)) {
			expect(placeholders(flatEn[key] as string), key).toEqual(
				placeholders(value as string),
			);
		}
	});

	it("registers a dictionary for every locale", () => {
		expect(Object.keys(dictionaries).sort()).toEqual([...LOCALES].sort());
	});
});

describe("translator", () => {
	it("interpolates parameters and keeps unknown placeholders", () => {
		expect(interpolate("en", "Hi {name}, {missing}", { name: "Ada" })).toBe(
			"Hi Ada, {missing}",
		);
	});

	it("formats plurals per locale", () => {
		const t = getTranslator("en");
		expect(t("dashboard.projectCount", { count: 1 })).toBe("1 project");
		expect(t("dashboard.projectCount", { count: 3 })).toBe("3 projects");
		expect(getTranslator("tr")("dashboard.projectCount", { count: 3 })).toBe(
			"3 proje",
		);
	});

	it("formats numbers with the locale", () => {
		expect(interpolate("tr", "{n}", { n: 1234.5 })).toBe("1.234,5");
		expect(interpolate("en", "{n}", { n: 1234.5 })).toBe("1,234.5");
	});
});

describe("locale resolution", () => {
	it("prefers the cookie, then Accept-Language, then Turkish", () => {
		expect(resolveLocale({ cookie: "en", acceptLanguage: "tr-TR" })).toBe("en");
		expect(resolveLocale({ cookie: "xx", acceptLanguage: "en-GB,en" })).toBe(
			"en",
		);
		expect(resolveLocale({ acceptLanguage: "de-DE,fr;q=0.8" })).toBe("tr");
		expect(resolveLocale({})).toBe("tr");
	});

	it("honours Accept-Language q-values", () => {
		expect(matchAcceptLanguage("tr;q=0.5,en;q=0.9")).toBe("en");
		expect(matchAcceptLanguage("de,tr;q=0.7,en;q=0.6")).toBe("tr");
		expect(matchAcceptLanguage("en;q=0")).toBeNull();
	});

	it("reads the locale cookie from request headers", () => {
		expect(readCookie("a=1; locale=en; b=2", "locale")).toBe("en");
		const headers = new Headers({
			cookie: "session=x; locale=en",
			"accept-language": "tr-TR",
		});
		expect(localeFromHeaders(headers)).toBe("en");
		expect(localeFromHeaders(null)).toBe("tr");
	});
});

describe("server messages", () => {
	it("keeps the Turkish message on AppError and translates on demand", () => {
		const error = new AppError("RATE_LIMITED", [
			"compileRateLimited",
			{ max: 5 },
		]);
		expect(error.message).toContain("Dakikada en fazla 5");
		expect(error.localizedMessage("en")).toBe(
			"Too many compile requests. You can compile at most 5 times per minute.",
		);
	});

	it("sends emails in the requested language", () => {
		const url = "https://tikz.example/verify?token=abc";
		const english = verificationEmail(
			{ email: "ada@example.com", name: "Ada" },
			url,
			"en",
		);
		expect(english.subject).toBe("TikZ Studio: verify your email address");
		expect(english.text).toMatch(/^Hi Ada,/);
		expect(english.html).toContain('<html lang="en">');
		expect(passwordChangedEmail({ email: "x@example.com" }).text).toMatch(
			/^Merhaba,/,
		);
	});
});

describe("help center content", () => {
	const trSections = getHelpSections("tr");
	const enSections = getHelpSections("en");
	const trArticles = trSections.flatMap((section) => section.articles);
	const enArticles = enSections.flatMap((section) => section.articles);
	const anchors = (article: HelpArticle) =>
		article.blocks.flatMap((block) => (block.type === "h2" ? [block.id] : []));

	it("has the same sections in both languages", () => {
		expect(enSections.map((section) => section.id)).toEqual(
			trSections.map((section) => section.id),
		);
		for (const section of enSections) {
			expect(section.title.trim()).not.toBe("");
			expect(section.description.trim()).not.toBe("");
		}
	});

	it("has an English counterpart for every Turkish article", () => {
		expect(enArticles.map((article) => article.slug)).toEqual(
			trArticles.map((article) => article.slug),
		);
		for (const trArticle of trArticles) {
			const enArticle = enArticles.find((a) => a.slug === trArticle.slug);
			expect(enArticle, trArticle.slug).toBeDefined();
			if (!enArticle) continue;
			expect(enArticle.icon).toBe(trArticle.icon);
			expect(enArticle.title.trim()).not.toBe("");
			expect(enArticle.summary.trim()).not.toBe("");
			// Translated, not copied.
			expect(enArticle.title).not.toBe(trArticle.title);
			expect(enArticle.summary).not.toBe(trArticle.summary);
			// Same headings (deep links like #sablon-olarak-kaydet keep working).
			expect(anchors(enArticle)).toEqual(anchors(trArticle));
			expect(enArticle.blocks.length).toBeGreaterThan(0);
		}
	});

	it("only links to help articles and anchors that exist", () => {
		for (const articles of [trArticles, enArticles]) {
			const text = JSON.stringify(articles);
			for (const match of text.matchAll(
				/\]\(\/yardim\/([\w-]+)(?:#([\w-]+))?\)/g,
			)) {
				const target = articles.find((a) => a.slug === match[1]);
				expect(target, match[0]).toBeDefined();
				if (target && match[2]) {
					expect(anchors(target), match[0]).toContain(match[2]);
				}
			}
		}
	});
});
