import type { CompileStatus, LatexEngine } from "@/generated/prisma";

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
};

export type CompileResult = {
	status: CompileStatus;
	log: string;
	errorCode: string | null;
	pdfOutput: Buffer | null;
	svgOutput: Buffer | null;
	startedAt: Date;
	finishedAt: Date;
};

export interface CompilerAdapter {
	compile(input: CompileInput): Promise<CompileResult>;
}
