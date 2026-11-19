import { describe, expect, it } from "vitest";

import { isSafeProjectPath, sanitizeUploadFileName } from "@/lib/file-path";
import { slugifyFilename } from "@/lib/utils";
import { createFileSchema, updateFileSchema } from "@/server/schemas/project";

describe("isSafeProjectPath", () => {
	it.each([
		"main.tex",
		"sekiller/ucgen.tex",
		"images/logo-2.png",
		"a/b/c/d.sty",
		"şekil.tex",
		"şekiller/üçgen-ÇİZİM_2.tex",
		"görseller/ağaç.png",
	])("accepts %s", (value) => {
		expect(isSafeProjectPath(value)).toBe(true);
	});

	it.each([
		"",
		"../evil.tex",
		"a/../../evil.tex",
		"/etc/passwd",
		"a//b.tex",
		"./main.tex",
		"a\\b.tex",
		"dir/",
		"x".repeat(201),
		"iki kelime.tex",
		"ters\u202Egnp.tex",
		"s\u0327ekil.tex", // NFD "ş" must be normalised before saving
		"emoji😀.tex",
	])("rejects %j", (value) => {
		expect(isSafeProjectPath(value)).toBe(false);
	});
});

describe("file schemas", () => {
	it("reject path traversal on create and rename", () => {
		expect(() =>
			createFileSchema.parse({ path: "../../tmp/x.tex", content: "" }),
		).toThrow();
		expect(() => updateFileSchema.parse({ path: "../x.tex" })).toThrow();
	});

	it("accept nested paths", () => {
		expect(createFileSchema.parse({ path: "sekiller/a.tex" }).path).toBe(
			"sekiller/a.tex",
		);
	});
});

describe("slugifyFilename", () => {
	it("transliterates Turkish characters instead of dropping them", () => {
		expect(slugifyFilename("Üçgen Sorusu – İkinci Şık")).toBe(
			"ucgen-sorusu-ikinci-sik",
		);
		expect(slugifyFilename("Çember ve Teğet")).toBe("cember-ve-teget");
	});
});

describe("Turkish file names", () => {
	it("normalises NFD input to NFC in the schemas", () => {
		const parsed = createFileSchema.parse({ path: " s\u0327ekil.tex " });
		expect(parsed.path).toBe("şekil.tex");
		expect(isSafeProjectPath(parsed.path)).toBe(true);
	});

	it.each([
		["Ekran görüntüsü 2026.png", "Ekran-görüntüsü-2026.png"],
		["  ağaç (1).jpg ", "ağaç-1.jpg"],
		["C:\\Users\\x\\logo.png", "logo.png"],
		["../../etc/passwd", "passwd"],
		[".gizli.sty", "gizli.sty"],
		["😀", ""],
	])("sanitizes upload name %j", (input, expected) => {
		const result = sanitizeUploadFileName(input);
		expect(result).toBe(expected);
		if (result) expect(isSafeProjectPath(result)).toBe(true);
	});
});
