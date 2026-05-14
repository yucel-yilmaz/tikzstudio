"use client";

import {
	autocompletion,
	type CompletionContext,
	type CompletionResult,
} from "@codemirror/autocomplete";
import { bracketMatching, StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { type Diagnostic, lintGutter, setDiagnostics } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useRef } from "react";

import type { CompileDiagnostic } from "@/lib/compile-log";
import type { SnippetDto } from "@/lib/types";

function makeSnippetSource(snippets: SnippetDto[]) {
	return (context: CompletionContext): CompletionResult | null => {
		// Match a backslash followed by word characters or hyphens
		const word = context.matchBefore(/\\[\w-]*/);
		if (!word || (word.from === word.to && !context.explicit)) return null;

		const query = word.text.slice(1).toLowerCase();

		const options = snippets
			.filter(
				(s) =>
					s.trigger.toLowerCase().startsWith(query) ||
					s.title.toLowerCase().includes(query),
			)
			.map((s) => ({
				label: `\\${s.trigger}`,
				displayLabel: s.title,
				detail: s.category,
				info: () => {
					const preview = document.createElement("pre");
					preview.style.cssText =
						"margin:0;padding:6px 8px;font-size:11px;max-width:300px;white-space:pre-wrap";
					preview.textContent = s.content.split("\n").slice(0, 6).join("\n");
					return preview;
				},
				apply: s.content,
				type: "keyword",
			}));

		if (options.length === 0) return null;

		return {
			from: word.from,
			options,
			validFor: /^\\[\w-]*$/,
		};
	};
}

export function TikzCodeEditor({
	value,
	onChange,
	readOnly = false,
	height = "100%",
	diagnostics = [],
	snippets = [],
}: {
	value: string;
	onChange(value: string): void;
	readOnly?: boolean;
	height?: string;
	diagnostics?: CompileDiagnostic[];
	snippets?: SnippetDto[];
}) {
	const viewRef = useRef<EditorView | null>(null);

	const extensions = useMemo(
		() => [
			StreamLanguage.define(stex),
			bracketMatching(),
			EditorView.lineWrapping,
			lintGutter(),
			autocompletion({
				override: snippets.length > 0 ? [makeSnippetSource(snippets)] : [],
				activateOnTyping: true,
			}),
		],
		[snippets],
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
