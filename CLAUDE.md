# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev              # start dev server (Turbopack)
npm run build            # production build + type-check
npm run lint             # Biome check (lint + format + import sort)
npm run format           # Biome format with auto-fix
npm run test             # Vitest single run  (tests/ only, Node env)
npm run test:watch       # Vitest watch mode
npm run db:migrate       # apply Prisma migrations
npm run db:seed          # seed templates + snippets
npm run compiler:build   # rebuild Docker compiler image (takes 10–20 min first time)
```

Run a single test file:

```bash
npx vitest run tests/compiler/parser.test.ts
```

CI runs three independent jobs: **lint** (`npm run lint`), **test** (`npm run test`), **build** (`npm run build` against a real Postgres). All three must pass before merge.

## Architecture

### Request → compile flow

```text
Browser → POST /api/projects/:id/compile
       → enqueueCompileForProject() (rate-limit check, creates CompileJob row)
       → pg-boss sends job to COMPILE_QUEUE
       → compile-worker (started in instrumentation.ts on server boot) picks it up
       → runCompileJob() → DockerCompilerAdapter.compile()
       → docker run --network none --read-only --cap-drop ALL tikzstudio-compiler
       → PDF/SVG/PNG written to COMPILE_STORAGE_DIR (default: .data/compile-artifacts/)
       → CompileJob row updated (status, log, outputUrl)
Browser → GET /api/compile-jobs/:id  (polling)
        → GET /api/compile-jobs/:id/output  (streams file)
```

The pg-boss worker runs **inside** the Next.js server process via `instrumentation.ts`. There is no separate worker process. `localConcurrency: 2` means up to 2 Docker containers run simultaneously.

### Key layers

| Layer | Location | Notes |
| --- | --- | --- |
| API routes | `app/api/` | Thin handlers — auth check, call service, return DTO |
| Business logic | `server/services/` | All DB queries live here |
| Compiler | `server/compiler/` | `docker-adapter.ts` (spawn), `parser.ts` (log→diagnostics), `sanitizer.ts` (SVG DOMPurify), `storage.ts` (file I/O) |
| Background jobs | `server/jobs/` | `compile-worker.ts`, `cleanup-worker.ts` |
| Validation schemas | `server/schemas/` | Zod, used at API boundary |
| Client API | `lib/client-api.ts` | Typed `fetch` wrappers for all endpoints |
| Auth | `lib/auth.ts` + `lib/session.ts` | better-auth; `getSessionFromHeaders` for API routes, `requireServerSession` for server components |
| Env | `lib/env.ts` | Zod-validated; all env access goes through `env.*` |
| Types/DTOs | `lib/types.ts`, `lib/dto.ts` | Shared between client and server |
| Feature UI | `features/` | Self-contained feature modules (auth, dashboard, editor, share) |

### Editor feature (`features/editor/`)

The main editor screen is `features/editor/components/desktop-editor-layout.tsx` — it owns the multi-panel layout, file tree, compile toolbar, img2latex dialog, and compile history drawer. The CodeMirror instance lives in `features/editor/components/code-editor.tsx`. PDF preview is in `features/editor/components/pdf-preview.tsx` (PDF.js, DPR-aware canvas).

Editor state (open files, active tab, unsaved changes) is managed via Zustand stores in `features/editor/store/`.

### Compiler Docker image

`docker/compiler/Dockerfile` builds in two stages: Rust/Tectonic compilation, then a Debian runtime with TeX Live packages. The entrypoint is `docker/compiler/compile.sh` which dispatches on the engine argument (`tectonic`, `pdflatex`, `xelatex`, `lualatex`, `pdflatex_biber`). Output files (`output.pdf`, `output.svg`, `output.png`) are written to `/output/` inside the container.

Tectonic uses `--only-cached` — any tikz library not in `docker/compiler/warmup.tex` will cause a compile failure. Add the library there and rebuild.

### Database

Prisma client is generated to `generated/prisma/` (not `node_modules`). Schema is at `prisma/schema.prisma`. After any schema change: `npm run db:migrate` (dev) or `prisma migrate deploy` (prod/CI).

pg-boss uses its own `pgboss` schema in the same Postgres database — no separate queue infrastructure needed.

### Auth

better-auth is configured in `lib/auth.ts`. It uses the Prisma adapter pointing at the same Postgres DB. Session validation in API routes uses `getSessionFromHeaders(request.headers)`. The `app/api/auth/[...all]/route.ts` handler is the only entry point for all auth requests.

### SVG security

All SVG output from the compiler passes through `server/compiler/sanitizer.ts` (DOMPurify + jsdom, server-side) before being stored or served to the browser.

## Conventions

- **Indentation:** tabs (enforced by Biome)
- **Quotes:** double (enforced by Biome)
- **Imports:** auto-organised by Biome assist
- **Path alias:** `@/` maps to the repo root (see `tsconfig.json`)
- **Generated files** (`generated/`) are gitignored but regenerated on `npm install` via `postinstall`
- **Biome overrides:** `a11y` rules are relaxed inside `components/ui/` (shadcn-generated) and `features/`; `noExplicitAny` is off in test files
