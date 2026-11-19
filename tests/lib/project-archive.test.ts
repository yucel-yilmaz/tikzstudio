import { strToU8, unzipSync, zipSync } from "fflate";
import { describe, expect, it } from "vitest";

import {
	ARCHIVE_LIMITS,
	ArchiveError,
	buildProjectZip,
	detectMainFile,
	planArchiveImport,
	readZip,
} from "@/lib/project-archive";
import { isTextFile } from "@/lib/project-files";

const DOC = "\\documentclass{article}\n\\begin{document}x\\end{document}\n";
const zip = (files: Record<string, string | Uint8Array>) =>
	zipSync(
		Object.fromEntries(
			Object.entries(files).map(([path, value]) => [
				path,
				typeof value === "string" ? strToU8(value) : value,
			]),
		),
	);
const importZip = (files: Record<string, string | Uint8Array>) =>
	planArchiveImport(readZip(zip(files)));

describe("planArchiveImport", () => {
	it("imports an Overleaf-style archive with a single top folder", () => {
		const plan = importZip({
			"Tezim/main.tex": DOC,
			"Tezim/bolumler/giris.tex": "Giriş",
			"Tezim/kaynaklar.bib": "@book{a,}",
			"Tezim/sekiller/grafik.png": new Uint8Array([137, 80, 78, 71]),
			"__MACOSX/Tezim/._main.tex": "junk",
			"Tezim/main.aux": "aux",
			"Tezim/main.synctex.gz": "x",
			"Tezim/.DS_Store": "x",
		});
		expect(plan.files.map((f) => f.path).sort()).toEqual([
			"bolumler/giris.tex",
			"kaynaklar.bib",
			"main.tex",
			"sekiller/grafik.png",
		]);
		expect(plan.mainPath).toBe("main.tex");
		expect(plan.files.find((f) => f.path === "kaynaklar.bib")?.isBinary).toBe(
			false,
		);
		const png = plan.files.find((f) => f.path === "sekiller/grafik.png");
		expect(png?.isBinary).toBe(true);
		expect(Array.from(png?.binaryContent ?? [])).toEqual([137, 80, 78, 71]);
		expect(plan.files.filter((f) => f.isMain)).toHaveLength(1);
		expect(plan.warnings).toEqual([]);
	});

	it("keeps Turkish names and renames segments with spaces, with a warning", () => {
		const plan = importZip({
			"ödev.tex": DOC,
			"şekiller/ilk çizim.tex": "x",
		});
		expect(plan.mainPath).toBe("ödev.tex");
		expect(plan.files.map((f) => f.path)).toContain("şekiller/ilk-çizim.tex");
		expect(plan.warnings.join(" ")).toContain("ilk-çizim.tex");
	});

	it("never lets entries escape the project (zip slip)", () => {
		const plan = importZip({
			"main.tex": DOC,
			"../../etc/cron.d/evil": "x",
			"/abs/path.tex": "x",
		});
		for (const file of plan.files) {
			expect(file.path.startsWith("/")).toBe(false);
			expect(file.path.split("/")).not.toContain("..");
		}
		expect(plan.warnings.length).toBeGreaterThan(0);
	});

	it("rejects archives without a .tex file", () => {
		expect(() => importZip({ "foto.png": new Uint8Array([1]) })).toThrow(
			ArchiveError,
		);
	});
});

describe("readZip limits", () => {
	it("rejects non-zip data", () => {
		expect(() => readZip(strToU8("not a zip"))).toThrow(ArchiveError);
	});

	it("rejects too many files", () => {
		const files: Record<string, string> = {};
		for (let i = 0; i <= ARCHIVE_LIMITS.maxFiles; i++) files[`f${i}.tex`] = "x";
		expect(() => readZip(zip(files))).toThrow(/en fazla/);
	});

	it("rejects a highly compressible zip bomb by uncompressed size", () => {
		const big = new Uint8Array(ARCHIVE_LIMITS.maxFileBytes + 1); // zeros
		const archive = zip({ "main.tex": DOC, "bomb.dat": big });
		expect(archive.length).toBeLessThan(100_000);
		expect(() => readZip(archive)).toThrow(/5 MB/);
	});
});

describe("detectMainFile", () => {
	it("prefers a top-level document over main.tex fragments", () => {
		expect(
			detectMainFile([
				{ path: "main.tex", content: "\\section{x}", isBinary: false },
				{ path: "tez.tex", content: DOC, isBinary: false },
			]),
		).toBe("tez.tex");
	});

	it("ignores commented-out documentclass lines", () => {
		expect(
			detectMainFile([
				{ path: "a.tex", content: "% \\documentclass{x}", isBinary: false },
				{ path: "b/c.tex", content: DOC, isBinary: false },
			]),
		).toBe("b/c.tex");
	});
});

describe("buildProjectZip", () => {
	it("round-trips text and binary files", () => {
		const data = buildProjectZip([
			{
				path: "main.tex",
				content: "Merhaba ğüş",
				isBinary: false,
				binaryContent: null,
			},
			{
				path: "img/a.png",
				content: "",
				isBinary: true,
				binaryContent: new Uint8Array([1, 2, 3]),
			},
		]);
		const out = unzipSync(data);
		expect(new TextDecoder().decode(out["main.tex"])).toBe("Merhaba ğüş");
		expect(Array.from(out["img/a.png"])).toEqual([1, 2, 3]);
	});
});

describe("isTextFile", () => {
	it.each([
		"a.tex",
		"kaynak.bib",
		"stil.sty",
		"veri.csv",
		"x/y.tikz",
	])("%s is text", (path) => expect(isTextFile(path)).toBe(true));
	it.each([
		"a.png",
		"font.otf",
		"doc.pdf",
		"noext",
		"dir.v2/file",
	])("%s is binary", (path) => expect(isTextFile(path)).toBe(false));
});
