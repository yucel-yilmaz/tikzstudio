import type { CompileStatus, LatexEngine } from "@/generated/prisma";
import type { Locale } from "@/lib/i18n/config";

export type CompilerFile = {
	path: string;
	content: string;
	binaryContent?: Uint8Array | null;
};

export type CompileInput = {
	jobId: string;
	projectId: string;
	engine: LatexEngine;
	mainFilePath: string;
	files: CompilerFile[];
	/** Language of the messages TikZ Studio adds to the compile log. */
	locale?: Locale;
};

export type CompileResult = {
	status: CompileStatus;
	log: string;
	errorCode: string | null;
	pdfOutput: Buffer | null;
	svgOutput: Buffer | null;
	pngOutput: Buffer | null;
	startedAt: Date;
	finishedAt: Date;
};

export interface CompilerAdapter {
	compile(input: CompileInput): Promise<CompileResult>;
}
