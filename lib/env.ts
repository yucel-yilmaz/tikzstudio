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
});
