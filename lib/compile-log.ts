export type CompileDiagnostic = {
	path: string;
	line: number;
	severity: "error" | "warning" | "info";
	message: string;
};

const ERROR_LINE_REGEX =
	/^(error|warning|info):\s*([^:\s]+\.[a-z]+):(\d+):\s*(.+)$/i;

/**
 * Parse Tectonic-style compile log into diagnostics with file path and line number.
 *
 * Example matched line:
 *   error: main.tex:15: Undefined control sequence.
 *   warning: foo.sty:3: Some warning
 */
export function parseCompileLog(
	log: string | null | undefined,
): CompileDiagnostic[] {
	if (!log) {
		return [];
	}

	const seen = new Set<string>();
	const diagnostics: CompileDiagnostic[] = [];

	for (const rawLine of log.split(/\r?\n/)) {
		const match = rawLine.match(ERROR_LINE_REGEX);
		if (!match) continue;

		const severity = match[1].toLowerCase() as CompileDiagnostic["severity"];
		const path = match[2].trim();
		const line = Number.parseInt(match[3], 10);
		const message = match[4].trim();

		if (!Number.isFinite(line) || line < 1) continue;

		const key = `${path}:${line}:${severity}:${message}`;
		if (seen.has(key)) continue;
		seen.add(key);

		diagnostics.push({ path, line, severity, message });
	}

	return diagnostics;
}

/** Filter diagnostics to those belonging to a specific file. */
export function diagnosticsForFile(
	diagnostics: CompileDiagnostic[],
	filePath: string,
): CompileDiagnostic[] {
	const target = filePath.replace(/^\.?\/+/, "");
	return diagnostics.filter((d) => {
		const candidate = d.path.replace(/^\.?\/+/, "");
		return candidate === target || candidate.endsWith(`/${target}`);
	});
}
