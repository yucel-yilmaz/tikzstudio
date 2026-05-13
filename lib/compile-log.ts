export type CompileDiagnostic = {
	/** Source file path; "*" means "any file" (used when LaTeX log lacks a path). */
	path: string;
	line: number;
	severity: "error" | "warning" | "info";
	message: string;
};

/** Structured Tectonic line: `error: main.tex:15: Undefined control sequence.` */
const STRUCTURED_REGEX =
	/^(error|warning|info):\s*([^:\s]+\.[a-z]+):(\d+):\s*(.+)$/i;

/** Tectonic generic: `error: !File ended while scanning ...` (no path/line) */
const TECTONIC_BANG_REGEX = /^(error|warning|info):\s*!\s*(.+)$/i;

/** Plain LaTeX bang line: `! Undefined control sequence.` */
const BANG_REGEX = /^!\s*(.+)$/;

/** LaTeX line indicator: `l.15 \end{document}` */
const LATEX_LINE_REGEX = /^l\.(\d+)\b/;

/**
 * Parse a Tectonic / LaTeX compile log into diagnostics with line numbers.
 *
 * Recognises:
 *   1. Structured Tectonic: `error: file.tex:15: message`
 *   2. Tectonic bang errors: `error: !File ended while scanning ...`
 *      → looks ahead in the log for the matching `l.<N>` line indicator
 *   3. LaTeX bang errors: `! Undefined control sequence.` followed by `l.<N> ...`
 *
 * For (2) and (3) the diagnostic path is `"*"` because LaTeX's detailed log
 * rarely names the source file on the bang line; `diagnosticsForFile` treats
 * `"*"` as a match for every file in the project.
 */
export function parseCompileLog(
	log: string | null | undefined,
): CompileDiagnostic[] {
	if (!log) return [];

	const lines = log.split(/\r?\n/);
	const diagnostics: CompileDiagnostic[] = [];
	const seen = new Set<string>();
	const LOOKAHEAD = 30;

	function add(d: CompileDiagnostic) {
		const key = `${d.path}:${d.line}:${d.severity}:${d.message}`;
		if (seen.has(key)) return;
		seen.add(key);
		diagnostics.push(d);
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		// (1) Structured Tectonic with explicit file:line
		const m1 = line.match(STRUCTURED_REGEX);
		if (m1) {
			const lineNum = Number.parseInt(m1[3], 10);
			if (Number.isFinite(lineNum) && lineNum >= 1) {
				add({
					path: m1[2].trim(),
					line: lineNum,
					severity: m1[1].toLowerCase() as CompileDiagnostic["severity"],
					message: m1[4].trim(),
				});
			}
			continue;
		}

		// (2) Tectonic bang error or (3) plain LaTeX bang — look ahead for l.<N>
		const tectonicBang = line.match(TECTONIC_BANG_REGEX);
		const plainBang = !tectonicBang ? line.match(BANG_REGEX) : null;
		const bangMessage = tectonicBang?.[2] ?? plainBang?.[1];
		const bangSeverity = (tectonicBang?.[1]?.toLowerCase() ??
			"error") as CompileDiagnostic["severity"];

		if (!bangMessage) continue;

		let attached = false;
		for (let j = i + 1; j < Math.min(i + LOOKAHEAD, lines.length); j++) {
			const lookahead = lines[j].trim();
			const lm = lookahead.match(LATEX_LINE_REGEX);
			if (lm) {
				const lineNum = Number.parseInt(lm[1], 10);
				if (Number.isFinite(lineNum) && lineNum >= 1) {
					add({
						path: "*",
						line: lineNum,
						severity: bangSeverity,
						message: bangMessage,
					});
					attached = true;
				}
				break;
			}
		}

		// Fallback: surface the error at the top of the active file so the user
		// still gets a visible marker + message even when LaTeX's detailed
		// `l.<N>` indicator is missing from the log.
		if (!attached) {
			add({
				path: "*",
				line: 1,
				severity: bangSeverity,
				message: bangMessage,
			});
		}
	}

	return diagnostics;
}

/** Filter diagnostics relevant to a specific file path. */
export function diagnosticsForFile(
	diagnostics: CompileDiagnostic[],
	filePath: string,
): CompileDiagnostic[] {
	const target = filePath.replace(/^\.?\/+/, "");
	return diagnostics.filter((d) => {
		if (d.path === "*") return true;
		const candidate = d.path.replace(/^\.?\/+/, "");
		return candidate === target || candidate.endsWith(`/${target}`);
	});
}
