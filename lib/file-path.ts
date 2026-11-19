/**
 * Project file paths are written verbatim into the compile workspace on the
 * host, so they must never be able to escape it. A safe path is relative,
 * uses forward slashes, has no empty, "." or ".." segments and each segment
 * only contains letters (any script, e.g. Turkish "şekil"), digits, "_", "-"
 * and ".". Spaces, control and formatting characters (such as right-to-left
 * overrides) are rejected. Paths must be NFC-normalised, so visually equal
 * names cannot be stored as two different files.
 */
const SAFE_SEGMENT = /^[\p{L}\p{N}_\-.]+$/u;
export const MAX_PROJECT_PATH_LENGTH = 200;

export function normalizeProjectPath(value: string): string {
	return value.trim().normalize("NFC");
}

export function isSafeProjectPath(value: string): boolean {
	if (!value || value.length > MAX_PROJECT_PATH_LENGTH) return false;
	if (value !== value.normalize("NFC")) return false;
	if (value.startsWith("/") || value.includes("\\")) return false;

	return value
		.split("/")
		.every(
			(segment) =>
				segment !== "" &&
				segment !== "." &&
				segment !== ".." &&
				SAFE_SEGMENT.test(segment),
		);
}

/**
 * Turns a browser-provided upload name (e.g. "Ekran görüntüsü 2026.png")
 * into a safe file name: whitespace becomes "-", any other disallowed
 * character is dropped. Returns "" when nothing usable is left.
 */
export function sanitizeUploadFileName(name: string): string {
	const base = normalizeProjectPath(name.split(/[\\/]/).pop() ?? "");
	const cleaned = base
		.replace(/\s+/gu, "-")
		.replace(/[^\p{L}\p{N}_\-.]/gu, "")
		.replace(/-{2,}/g, "-")
		.replace(/^[.-]+/, "");
	return cleaned.slice(0, MAX_PROJECT_PATH_LENGTH);
}
