"use client";

import { bracketMatching, StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { type Diagnostic, linter } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useMemo } from "react";

import type { CompileDiagnostic } from "@/lib/compile-log";

export function TikzCodeEditor({
	value,
	onChange,
	readOnly = false,
	height = "100%",
	diagnostics = [],
}: {
	value: string;
	onChange(value: string): void;
	readOnly?: boolean;
	height?: string;
	diagnostics?: CompileDiagnostic[];
}) {
	const lintExtension = useMemo(
		() =>
			linter((view) => {
				if (diagnostics.length === 0) return [];
				const totalLines = view.state.doc.lines;
				const items: Diagnostic[] = [];

				for (const d of diagnostics) {
					if (d.line < 1 || d.line > totalLines) continue;
					const line = view.state.doc.line(d.line);
					items.push({
						from: line.from,
						to: line.to,
						severity: d.severity,
						message: d.message,
					});
				}

				return items;
			}),
		[diagnostics],
	);

	const extensions = useMemo(
		() => [
			StreamLanguage.define(stex),
			bracketMatching(),
			EditorView.lineWrapping,
			lintExtension,
		],
		[lintExtension],
	);

	return (
		<CodeMirror
			value={value}
			height={height}
			theme="light"
			readOnly={readOnly}
			basicSetup={{
				lineNumbers: true,
				foldGutter: true,
				autocompletion: false,
			}}
			extensions={extensions}
			onChange={onChange}
		/>
	);
}
