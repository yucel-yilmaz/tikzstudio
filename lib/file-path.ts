/**
 * Project file paths are written verbatim into the compile workspace on the
 * host, so they must never be able to escape it. A safe path is relative,
 * uses forward slashes, has no empty, "." or ".." segments and only contains
 * a conservative character set.
 */
const SAFE_SEGMENT = /^[\w\-.]+$/;
export const MAX_PROJECT_PATH_LENGTH = 200;

export function isSafeProjectPath(value: string): boolean {
	if (!value || value.length > MAX_PROJECT_PATH_LENGTH) return false;
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

export const UNSAFE_PATH_MESSAGE =
	"Dosya yolu yalnızca harf, rakam, nokta, tire, alt çizgi ve klasör ayırıcı (/) içerebilir; '..' kullanılamaz.";
