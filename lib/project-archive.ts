/**
 * ZIP import/export of projects (Overleaf-compatible). Pure functions: no
 * database access, so the rules can be unit-tested.
 */
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

import {
	isSafeProjectPath,
	MAX_PROJECT_PATH_LENGTH,
	normalizeProjectPath,
} from "@/lib/file-path";
import { getTranslator } from "@/lib/i18n/messages";
import type { KeysOf, MessageParams, Translator } from "@/lib/i18n/translate";
import { isTextFile } from "@/lib/project-files";

export const ARCHIVE_LIMITS = {
	/** Size of the uploaded .zip itself. */
	maxArchiveBytes: 20 * 1024 * 1024,
	maxFiles: 300,
	maxFileBytes: 5 * 1024 * 1024,
	maxTotalBytes: 25 * 1024 * 1024,
} as const;

/**
 * An invalid archive. `message` is in the default language; `key`/`params`
 * let API routes answer in the user's language.
 */
export class ArchiveError extends Error {
	key: KeysOf<"errors">;
	params?: MessageParams;

	constructor(key: KeysOf<"errors">, params?: MessageParams) {
		super(getTranslator()(`errors.${key}`, params));
		this.name = "ArchiveError";
		this.key = key;
		this.params = params;
	}
}

export type ArchiveFile = {
	path: string;
	content: string;
	isBinary: boolean;
	binaryContent: Uint8Array<ArrayBuffer> | null;
	isMain: boolean;
};

export type ArchiveImportPlan = {
	files: ArchiveFile[];
	mainPath: string;
	warnings: string[];
};

/** Build outputs and editor/OS clutter that never belong in a project. */
const SKIPPED_EXTENSIONS = new Set([
	".aux",
	".fls",
	".fdb_latexmk",
	".out",
	".toc",
	".lof",
	".lot",
	".synctex",
	".xdv",
	".bcf",
	".blg",
	".run.xml",
	".nav",
	".snm",
]);

function isSkipped(path: string): boolean {
	const segments = path.split("/");
	if (segments[0] === "__MACOSX") return true;
	if (segments.some((segment) => segment.startsWith("."))) return true;
	const name = segments.at(-1)?.toLowerCase() ?? "";
	if (name === "thumbs.db" || name.endsWith(".synctex.gz")) return true;
	if (name.endsWith(".run.xml")) return true;
	const dot = name.lastIndexOf(".");
	return dot >= 0 && SKIPPED_EXTENSIONS.has(name.slice(dot));
}

/** Spaces become "-", other unsupported characters are dropped. */
function cleanSegment(segment: string): string {
	return segment
		.replace(/\s+/gu, "-")
		.replace(/[^\p{L}\p{N}_\-.]/gu, "")
		.replace(/-{2,}/g, "-");
}

/**
 * Reads a .zip into its file entries, enforcing the size limits both on the
 * sizes declared in the archive and on the bytes actually decompressed (so a
 * "zip bomb" with lying headers is still rejected).
 */
export function readZip(
	archive: Uint8Array,
): { path: string; data: Uint8Array }[] {
	if (archive.length > ARCHIVE_LIMITS.maxArchiveBytes) {
		throw new ArchiveError("zipTooLarge");
	}

	let fileCount = 0;
	let declaredTotal = 0;
	let unzipped: Record<string, Uint8Array>;
	try {
		unzipped = unzipSync(archive, {
			filter: (file) => {
				if (file.name.endsWith("/")) return false;
				fileCount += 1;
				declaredTotal += file.originalSize;
				if (fileCount > ARCHIVE_LIMITS.maxFiles) {
					throw new ArchiveError("archiveTooManyFiles", {
						max: ARCHIVE_LIMITS.maxFiles,
					});
				}
				if (file.originalSize > ARCHIVE_LIMITS.maxFileBytes) {
					throw new ArchiveError("archiveFileTooLarge", {
						name: file.name,
					});
				}
				if (declaredTotal > ARCHIVE_LIMITS.maxTotalBytes) {
					throw new ArchiveError("archiveTotalTooLarge");
				}
				return true;
			},
		});
	} catch (error) {
		if (error instanceof ArchiveError) throw error;
		throw new ArchiveError("archiveInvalid");
	}

	let actualTotal = 0;
	const entries = Object.entries(unzipped).map(([path, data]) => {
		actualTotal += data.length;
		if (
			data.length > ARCHIVE_LIMITS.maxFileBytes ||
			actualTotal > ARCHIVE_LIMITS.maxTotalBytes
		) {
			throw new ArchiveError("archiveContentTooLarge");
		}
		return { path, data };
	});
	return entries;
}

function stripCommonRoot(paths: string[]): string | null {
	const firstSegments = new Set(paths.map((path) => path.split("/")[0]));
	if (firstSegments.size !== 1) return null;
	const [root] = firstSegments;
	return paths.every((path) => path.includes("/")) ? `${root}/` : null;
}

const DOCUMENTCLASS = /^[^%\n]*\\documentclass/m;

/**
 * Chooses the main file: main.tex if it is a full document, otherwise a
 * top-level .tex with \documentclass, otherwise any such file, otherwise the
 * first .tex file.
 */
export function detectMainFile(
	files: { path: string; content: string; isBinary: boolean }[],
) {
	const tex = files.filter(
		(file) => !file.isBinary && file.path.endsWith(".tex"),
	);
	const isDocument = (file: (typeof tex)[number]) =>
		DOCUMENTCLASS.test(file.content);
	return (
		tex.find((file) => file.path === "main.tex" && isDocument(file)) ??
		tex.find((file) => !file.path.includes("/") && isDocument(file)) ??
		tex.find(isDocument) ??
		tex.find((file) => file.path === "main.tex") ??
		tex[0]
	)?.path;
}

/**
 * Turns raw ZIP entries into the files of a new project. Warnings are
 * written with `t` (the user's language; Turkish by default).
 */
export function planArchiveImport(
	entries: { path: string; data: Uint8Array }[],
	t: Translator = getTranslator(),
): ArchiveImportPlan {
	const warnings: string[] = [];
	const kept = entries
		.map((entry) => ({
			...entry,
			path: normalizeProjectPath(entry.path.replace(/\\/g, "/")),
		}))
		.filter((entry) => !isSkipped(entry.path));

	const root = stripCommonRoot(kept.map((entry) => entry.path));
	const files: ArchiveFile[] = [];
	const seen = new Set<string>();

	for (const entry of kept) {
		const original = root ? entry.path.slice(root.length) : entry.path;
		const cleaned = original
			.split("/")
			.map(cleanSegment)
			.join("/")
			.slice(0, MAX_PROJECT_PATH_LENGTH);

		if (!isSafeProjectPath(cleaned) || seen.has(cleaned)) {
			warnings.push(t("archive.skipped", { name: original }));
			continue;
		}
		if (cleaned !== original) {
			warnings.push(t("archive.renamed", { name: original, cleaned }));
		}
		seen.add(cleaned);

		const text = isTextFile(cleaned);
		files.push({
			path: cleaned,
			content: text ? strFromU8(entry.data) : "",
			isBinary: !text,
			binaryContent: text ? null : new Uint8Array(entry.data),
			isMain: false,
		});
	}

	const mainPath = detectMainFile(files);
	if (!mainPath) {
		throw new ArchiveError("archiveNoTex");
	}
	for (const file of files) file.isMain = file.path === mainPath;

	return { files, mainPath, warnings };
}

/** Packs project files into a .zip (text as UTF-8, binaries as-is). */
export function buildProjectZip(
	files: {
		path: string;
		content: string;
		isBinary: boolean;
		binaryContent: Uint8Array | null;
	}[],
): Uint8Array<ArrayBuffer> {
	const zippable: Record<string, Uint8Array> = {};
	for (const file of files) {
		zippable[file.path] =
			file.isBinary && file.binaryContent
				? new Uint8Array(file.binaryContent)
				: strToU8(file.content);
	}
	return zipSync(zippable, { level: 6 });
}
