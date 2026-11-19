import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().min(1),
	BETTER_AUTH_SECRET: z.string().min(1),
	BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
	COMPILE_TIMEOUT_SECONDS: z.coerce.number().default(15),
	COMPILE_MEMORY_LIMIT_MB: z.coerce.number().default(256),
	COMPILE_CPU_LIMIT: z.coerce.number().default(0.5),
	MAX_SOURCE_SIZE_KB: z.coerce.number().default(512),
	MAX_OUTPUT_SIZE_MB: z.coerce.number().default(10),
	DOCKER_COMPILER_IMAGE: z.string().default("tikzlab-compiler:latest"),
	COMPILE_STORAGE_DIR: z.string().default(".data/compile-artifacts"),
	// Scratch directory for per-compile workspaces. When the app itself runs in
	// a container and talks to the host Docker daemon, this must be a path that
	// exists at the same location on the host (see docker-compose.yml).
	COMPILE_WORK_DIR: z.string().optional(),
	MATHPIX_APP_ID: z.string().optional(),
	MATHPIX_APP_KEY: z.string().optional(),
	DOCKER_MODEL_RUNNER_URL: z.string().default("http://localhost:12434"),
	IMG2LATEX_MODEL: z.string().default("ai/qwen3-vl:latest"),
	PIX2TEX_URL: z.string().default("http://localhost:8502"),
	GITHUB_CLIENT_ID: z.string().optional(),
	GITHUB_CLIENT_SECRET: z.string().optional(),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	SMTP_HOST: z.string().optional(),
	SMTP_PORT: z.coerce.number().default(587),
	SMTP_SECURE: z
		.enum(["true", "false"])
		.default("false")
		.transform((value) => value === "true"),
	SMTP_USER: z.string().optional(),
	SMTP_PASS: z.string().optional(),
	MAIL_FROM: z.string().default("TikZ Studio <no-reply@localhost>"),
	REQUIRE_EMAIL_VERIFICATION: z.enum(["auto", "true", "false"]).default("auto"),
});

export const env = envSchema.parse({
	DATABASE_URL: process.env.DATABASE_URL,
	BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
	BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
	COMPILE_TIMEOUT_SECONDS: process.env.COMPILE_TIMEOUT_SECONDS,
	COMPILE_MEMORY_LIMIT_MB: process.env.COMPILE_MEMORY_LIMIT_MB,
	COMPILE_CPU_LIMIT: process.env.COMPILE_CPU_LIMIT,
	MAX_SOURCE_SIZE_KB: process.env.MAX_SOURCE_SIZE_KB,
	MAX_OUTPUT_SIZE_MB: process.env.MAX_OUTPUT_SIZE_MB,
	DOCKER_COMPILER_IMAGE: process.env.DOCKER_COMPILER_IMAGE,
	COMPILE_STORAGE_DIR: process.env.COMPILE_STORAGE_DIR,
	COMPILE_WORK_DIR: process.env.COMPILE_WORK_DIR || undefined,
	MATHPIX_APP_ID: process.env.MATHPIX_APP_ID,
	MATHPIX_APP_KEY: process.env.MATHPIX_APP_KEY,
	DOCKER_MODEL_RUNNER_URL: process.env.DOCKER_MODEL_RUNNER_URL,
	IMG2LATEX_MODEL: process.env.IMG2LATEX_MODEL,
	PIX2TEX_URL: process.env.PIX2TEX_URL,
	GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || undefined,
	GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || undefined,
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || undefined,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || undefined,
	SMTP_HOST: process.env.SMTP_HOST || undefined,
	SMTP_PORT: process.env.SMTP_PORT || undefined,
	SMTP_SECURE: process.env.SMTP_SECURE || undefined,
	SMTP_USER: process.env.SMTP_USER || undefined,
	SMTP_PASS: process.env.SMTP_PASS || undefined,
	MAIL_FROM: process.env.MAIL_FROM || undefined,
	REQUIRE_EMAIL_VERIFICATION:
		process.env.REQUIRE_EMAIL_VERIFICATION || undefined,
});
