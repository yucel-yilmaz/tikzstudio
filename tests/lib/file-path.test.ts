import { describe, expect, it } from "vitest";

import { isSafeProjectPath } from "@/lib/file-path";
import { slugifyFilename } from "@/lib/utils";
import { createFileSchema, updateFileSchema } from "@/server/schemas/project";

describe("isSafeProjectPath", () => {
	it.each([
		"main.tex",
		"sekiller/ucgen.tex",
		"images/logo-2.png",
		"a/b/c/d.sty",
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
		"şekil.tex",
		"x".repeat(201),
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
