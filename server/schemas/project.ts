import { z } from "zod";

import { zodMessage } from "@/lib/errors";
import {
	isSafeProjectPath,
	MAX_PROJECT_PATH_LENGTH,
	normalizeProjectPath,
} from "@/lib/file-path";

// Messages are dictionary keys (`errors.*`), translated per request by
// `toErrorResponse`.
const TITLE_REQUIRED = zodMessage("projectTitleRequired");
const TITLE_TOO_LONG = zodMessage("projectTitleTooLong");
const DESCRIPTION_TOO_LONG = zodMessage("descriptionTooLong");

export const projectPathSchema = z
	.string()
	.transform(normalizeProjectPath)
	.pipe(
		z
			.string()
			.min(1, zodMessage("pathRequired"))
			.max(MAX_PROJECT_PATH_LENGTH, zodMessage("pathTooLong"))
			.refine(isSafeProjectPath, { message: zodMessage("pathUnsafe") }),
	);

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
	engine: z
		.enum(["TECTONIC", "PDFLATEX", "XELATEX", "LUALATEX", "PDFLATEX_BIBER"])
		.optional(),
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
		.min(1, { message: zodMessage("templateTitleRequired") })
		.max(120, { message: zodMessage("templateTitleTooLong") }),
	description: z
		.string()
		.trim()
		.max(500, { message: DESCRIPTION_TOO_LONG })
		.optional(),
	category: z
		.string()
		.trim()
		.max(60, { message: zodMessage("categoryTooLong") })
		.optional(),
	engine: compileProjectSchema.shape.engine.optional(),
});
