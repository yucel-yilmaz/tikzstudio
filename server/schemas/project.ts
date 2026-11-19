import { z } from "zod";

import {
	isSafeProjectPath,
	MAX_PROJECT_PATH_LENGTH,
	UNSAFE_PATH_MESSAGE,
} from "@/lib/file-path";

export const projectPathSchema = z
	.string()
	.trim()
	.min(1)
	.max(MAX_PROJECT_PATH_LENGTH)
	.refine(isSafeProjectPath, { message: UNSAFE_PATH_MESSAGE });

export const createProjectSchema = z.object({
	title: z.string().trim().min(1).max(120),
	description: z.string().trim().max(500).optional().or(z.literal("")),
	templateId: z.string().min(1).optional(),
});

export const updateProjectSchema = z.object({
	title: z.string().trim().min(1).max(120).optional(),
	description: z.string().trim().max(500).optional(),
	isPublic: z.boolean().optional(),
});

export const updateFileSchema = z.object({
	content: z.string().optional(),
	path: projectPathSchema.optional(),
	isMain: z.boolean().optional(),
});

export const createFileSchema = z.object({
	path: projectPathSchema,
	content: z.string().default(""),
});

export const compileProjectSchema = z.object({
	engine: z
		.enum(["TECTONIC", "PDFLATEX", "XELATEX", "LUALATEX", "PDFLATEX_BIBER"])
		.default("TECTONIC"),
	mainFileId: z.string().min(1).optional(),
});
