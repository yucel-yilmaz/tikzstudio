"use client";

import { bracketMatching, StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";

export function TikzCodeEditor({
	value,
	onChange,
}: {
	value: string;
	onChange(value: string): void;
}) {
	return (
		<CodeMirror
			value={value}
			height="100%"
			theme="light"
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
