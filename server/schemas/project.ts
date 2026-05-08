import { z } from "zod";

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
	path: z
		.string()
		.trim()
		.min(1)
		.max(200)
		.regex(/^[\w\-./]+$/, {
			message:
				"Path may contain letters, numbers, dot, dash, slash, underscore.",
		})
		.optional(),
	isMain: z.boolean().optional(),
});

export const createFileSchema = z.object({
	path: z
		.string()
		.trim()
		.min(1)
		.max(200)
		.regex(/^[\w\-./]+$/, {
			message:
				"Path may contain letters, numbers, dot, dash, slash, underscore.",
		}),
	content: z.string().default(""),
});

export const compileProjectSchema = z.object({
	engine: z
		.enum(["TECTONIC", "PDFLATEX", "XELATEX", "LUALATEX"])
		.default("TECTONIC"),
	mainFileId: z.string().min(1).optional(),
});
