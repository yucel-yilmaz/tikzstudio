"use client";

import { bracketMatching, StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";

export function TikzCodeEditor({
	value,
	onChange,
	readOnly = false,
	height = "100%",
}: {
	value: string;
	onChange(value: string): void;
	readOnly?: boolean;
	height?: string;
}) {
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
			extensions={[
				StreamLanguage.define(stex),
				bracketMatching(),
				EditorView.lineWrapping,
			]}
			onChange={onChange}
		/>
	);
}
