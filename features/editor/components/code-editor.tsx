"use client";

import { bracketMatching, StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { type Diagnostic, lintGutter, setDiagnostics } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useRef } from "react";

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
	const viewRef = useRef<EditorView | null>(null);

	const extensions = useMemo(
		() => [
			StreamLanguage.define(stex),
			bracketMatching(),
			EditorView.lineWrapping,
			lintGutter(),
		],
		[],
	);

	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;

		const totalLines = view.state.doc.lines;
		const items: Diagnostic[] = [];

		for (const d of diagnostics) {
			if (d.line < 1) continue;
			const targetLine = Math.min(d.line, totalLines);
			const line = view.state.doc.line(targetLine);
			items.push({
				from: line.from,
				to: line.to,
				severity: d.severity,
				message: d.message,
			});
		}

		view.dispatch(setDiagnostics(view.state, items));
	}, [diagnostics]);

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
			onCreateEditor={(view) => {
				viewRef.current = view;
			}}
			onChange={onChange}
		/>
	);
}
