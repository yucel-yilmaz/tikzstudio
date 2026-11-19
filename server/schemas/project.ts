import { z } from "zod";

import {
	isSafeProjectPath,
	MAX_PROJECT_PATH_LENGTH,
	UNSAFE_PATH_MESSAGE,
} from "@/lib/file-path";

const TITLE_REQUIRED = "Proje adı boş olamaz.";
const TITLE_TOO_LONG = "Proje adı en fazla 120 karakter olabilir.";
const DESCRIPTION_TOO_LONG = "Açıklama en fazla 500 karakter olabilir.";

export const projectPathSchema = z
	.string()
	.trim()
	.min(1, "Dosya yolu boş olamaz.")
	.max(
		MAX_PROJECT_PATH_LENGTH,
		`Dosya yolu en fazla ${MAX_PROJECT_PATH_LENGTH} karakter olabilir.`,
	)
	.refine(isSafeProjectPath, { message: UNSAFE_PATH_MESSAGE });

export const createProjectSchema = z.object({
	title: z.string().trim().min(1, TITLE_REQUIRED).max(120, TITLE_TOO_LONG),
	description: z
		.string()
		.trim()
		.max(500, DESCRIPTION_TOO_LONG)
		.optional()
		.or(z.literal("")),
	templateId: z.string().min(1).optional(),
});

export const updateProjectSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, TITLE_REQUIRED)
		.max(120, TITLE_TOO_LONG)
		.optional(),
	description: z.string().trim().max(500, DESCRIPTION_TOO_LONG).optional(),
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

export const saveAsTemplateSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, { message: "Şablon adı boş olamaz." })
		.max(120, { message: "Şablon adı en fazla 120 karakter olabilir." }),
	description: z
		.string()
		.trim()
		.max(500, { message: "Açıklama en fazla 500 karakter olabilir." })
		.optional(),
	category: z
		.string()
		.trim()
		.max(60, { message: "Kategori en fazla 60 karakter olabilir." })
		.optional(),
	engine: compileProjectSchema.shape.engine.optional(),
});
