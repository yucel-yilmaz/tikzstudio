# TikZ Studio

A modern, browser-based LaTeX editor focused on **TikZ** diagrams. Built on Next.js 16 with React 19, it pairs a CodeMirror editor with sandboxed Docker compilation and live PDF preview — so you can edit, compile, and download high-quality figures from any browser.

> Status: under active development. APIs and UI may change.

---

## ✨ Features

- 📝 **CodeMirror 6 editor** with LaTeX syntax highlighting, bracket matching, line numbers, and inline error diagnostics
- 🛡️ **Sandboxed compilation** in a hardened Docker container (`--network none`, `--read-only`, capability drops, memory/CPU/timeout caps, process-level timeout)
- 🚀 **Tectonic engine** with pre-warmed cache for the most common TikZ libraries (`calc`, `arrows.meta`, `positioning`, `decorations.*`, `pgfplots`, …)
- 📄 **Live PDF preview** rendered with PDF.js, DPR-aware for high-DPI displays
- 🎨 **SVG export** alongside PDF for vector workflows (DOMPurify-sanitised before serving)
- 🗂️ **Multi-file projects** — create, rename, delete, upload binaries (images, fonts, `.cls`, `.sty`), mark as main
- 📚 **Compile history** — browse past jobs, download archived PDF/SVG outputs
- 🔁 **Project forking** — copy any public project into your own workspace
- 🧩 **Templates & snippets** library for quick TikZ scaffolds
- 🔐 **Authentication** via [better-auth](https://www.better-auth.com/) (email + password)
- 🚦 **Rate limiting** — 5 compiles per minute per user (database-backed, no extra dependencies)
- 💾 **Auto-save** with debounce and visible save state
- 🌗 **Light/dark theme** support (Tailwind v4)
- 🇹🇷 **Turkish UI** out of the box

---

## 🧱 Tech Stack

| Layer          | Choice                                          |
| -------------- | ----------------------------------------------- |
| Framework      | Next.js 16 (App Router) + React 19              |
| Language       | TypeScript                                      |
| Styling        | Tailwind CSS v4 + shadcn/ui (radix-ui)          |
| State          | TanStack Query, Zustand                         |
| Editor         | CodeMirror 6 (`@uiw/react-codemirror`)          |
| Database       | PostgreSQL via Prisma 7                         |
| Auth           | better-auth                                     |
| Job queue      | pg-boss (PostgreSQL-backed, no Redis required)  |
| LaTeX engine   | Tectonic (Docker sandbox)                       |
| PDF render     | PDF.js (legacy build)                           |
| PDF → SVG      | `pdf2svg` (output sanitised with DOMPurify)     |
| SVG sanitiser  | DOMPurify + jsdom (server-side)                 |
| Tests          | Vitest                                          |
| Lint/Format    | Biome                                           |

---

## 📐 Architecture

```text
                   ┌────────────────────────┐
   browser ─────▶  │  Next.js (App Router)  │  ─── better-auth ──▶  PostgreSQL
                   │  ─ /api/projects/...   │
                   │  ─ /api/compile-jobs/. │  ─── Prisma ──────▶
                   └──────────┬─────────────┘
                              │ POST /api/projects/:id/compile
                              ▼
                   ┌────────────────────────┐
                   │   pg-boss job queue    │  (stored in PostgreSQL)
                   └──────────┬─────────────┘
                              │ worker picks up job
                              ▼
                   ┌────────────────────────┐
                   │ DockerCompilerAdapter  │
                   │  spawn `docker run`    │
                   │  --network none        │
                   │  --read-only           │
                   │  --cap-drop ALL        │
                   └──────────┬─────────────┘
                              ▼
                   ┌────────────────────────┐
                   │  tikzlab-compiler:*    │
                   │   tectonic + pdf2svg   │
                   │   warmed cache         │
                   └────────────────────────┘
                              ▼
                  PDF + SVG ──▶ COMPILE_STORAGE_DIR
                  SVG ─────▶  DOMPurify sanitiser ──▶ browser
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **Docker** (for the compile sandbox and the development database)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — in particular generate a fresh BETTER_AUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 3. Start the database

The project requires PostgreSQL. The easiest way is a Docker container:

```bash
docker run -d \
  --name tikzlab-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tikzlab \
  -p 5432:5432 \
  -v tikzlab-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

To start it again after a reboot:

```bash
docker start tikzlab-postgres
```

### 4. Apply migrations and seed

```bash
npm run db:generate    # generate Prisma client
npm run db:migrate     # apply all migrations
npm run db:seed        # seed templates/snippets (optional)
```

### 5. Build the compiler image

Builds a hardened Tectonic image and warms its package cache with common TikZ libraries. First build takes 5–10 minutes (cargo compile + bundle download).

```bash
npm run compiler:build
```

> **If the build fails with "couldn't get bundle from internet"** — see the Troubleshooting section below.

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up.

---

## 📜 Available Scripts

| Script                    | What it does                                       |
| ------------------------- | -------------------------------------------------- |
| `npm run dev`             | Start Next.js dev server (Turbopack)               |
| `npm run build`           | Production build + type-check                      |
| `npm run start`           | Run the production build                           |
| `npm run lint`            | Biome check (lint + organize imports + format)     |
| `npm run format`          | Biome format with auto-fix                         |
| `npm run test`            | Run Vitest test suite (single run)                 |
| `npm run test:watch`      | Run Vitest in watch mode                           |
| `npm run db:generate`     | Generate Prisma client                             |
| `npm run db:migrate`      | Apply Prisma migrations (`prisma migrate dev`)     |
| `npm run db:seed`         | Seed the database with templates and snippets      |
| `npm run compiler:build`  | Build the Tectonic Docker compiler image           |

---

## 📁 Repository Layout

```text
app/                  Next.js App Router routes (UI + API handlers)
  api/                REST endpoints (projects, files, compile jobs, auth)
  (app)/              Authenticated routes (dashboard, editor)
  (marketing)/        Public marketing pages
features/             Feature modules (auth, dashboard, editor, share)
  editor/components/  Editor UI: code-editor, pdf-preview, layouts
  editor/store/       Zustand stores
components/           Shared UI primitives (shadcn/ui, ErrorBoundary)
lib/                  Helpers (client API, types, env, compile-log, utils)
server/               Server-side logic
  compiler/           Docker adapter, log parser, SVG sanitiser, storage
  jobs/               pg-boss workers (compile, cleanup)
  services/           Business logic (projects, files, compile jobs)
  schemas/            Zod request schemas
prisma/               Schema, migrations, seed
docker/compiler/      Dockerfile + warmup docs + compile.sh for the sandbox
tests/                Vitest unit tests
```

---

## 🔒 Security Model

### Compile sandbox

Each compile request runs in an isolated container:

```shell
docker run --rm
  --network none                 # no outbound traffic
  --read-only                    # filesystem is read-only
  --tmpfs /tmp:rw,noexec,nosuid,size=64m
  --memory 256m --cpus 0.5       # resource caps (configurable via env)
  --pids-limit 64
  --security-opt no-new-privileges
  --cap-drop ALL
  tikzlab-compiler:latest
```

Inside the container, the LaTeX process itself is wrapped with `timeout 12` (3 s below the outer Docker timeout of 15 s). Both limits are configurable via environment variables.

### SVG output

`pdf2svg` output is piped through a server-side DOMPurify sanitiser before it reaches the browser, blocking `<script>` tags, event handlers, and other XSS vectors that could appear in maliciously crafted LaTeX.

### Rate limiting

The compile endpoint enforces a 5-per-minute limit per user, checked against the database — no extra infrastructure required.

### Additional limits

- Source bundle is size-capped (`MAX_SOURCE_SIZE_KB`, default 512 KB)
- Output is size-capped (`MAX_OUTPUT_SIZE_MB`, default 10 MB)
- Stale RUNNING/PENDING jobs are recovered to FAILED on server restart
- Compile artifacts are pruned hourly; only the latest successful output per project is kept on disk

---

## 🛠️ Troubleshooting

### PostgreSQL connection refused (P1001 / ECONNREFUSED)

The database container is not running. Start it with:

```bash
docker start tikzlab-postgres
```

If you haven't created the container yet, follow step 3 in Getting Started.

### Docker build fails with "couldn't get bundle from internet"

Tectonic downloads its bundle on first run. The default Docker `bridge` network sometimes can't reach external mirrors. The build script already passes `--network=host`, but if it still fails:

```bash
# Try explicit DNS
docker build --dns=8.8.8.8 --dns=1.1.1.1 \
  -t tikzlab-compiler:latest -f docker/compiler/Dockerfile .

# Or fix Docker Desktop DNS:
# Settings → Resources → Network → DNS Server → 8.8.8.8
```

### Compile fails with "I did not find the tikz library 'X'"

The library isn't in the warmed Tectonic cache (and `--only-cached` is on for security). Add it to the `\usetikzlibrary{...}` block in [`docker/compiler/warmup.tex`](docker/compiler/warmup.tex), then rebuild:

```bash
npm run compiler:build
```

### PDF preview shows a grey box

Most likely a stale browser cache for `pdf.worker.min.mjs`. Hard refresh (Ctrl+Shift+R). If still broken, open DevTools → Console and check for PDF.js errors. The render path is in [`features/editor/components/pdf-preview.tsx`](features/editor/components/pdf-preview.tsx).

### Prisma error: "column ... does not exist"

Migrations not applied. Run:

```bash
npm run db:migrate
```

---

## 🗺️ Roadmap

- [ ] Multi-engine UI (XeLaTeX, LuaLaTeX selectable per project)
- [ ] PNG export
- [ ] Real-time collaboration (Y.js)
- [ ] Mobile-first editor improvements
- [ ] Localisation (English UI alongside Turkish)
- [ ] OAuth providers (GitHub, Google)
- [ ] docker-compose.yml for one-command local setup

---

## 🤝 Contributing

This is currently a personal project. If you spot a bug or want to suggest a feature, open an issue. Pull requests are welcome but please discuss large changes first.

Before submitting:

```bash
npm run lint
npm run test
```

---

## 📝 License

All rights reserved. No license is granted. The source is published for transparency / portfolio purposes only — please do not redistribute, fork commercially, or deploy without permission.

If you want to use this code, get in touch.

---

## 🙏 Acknowledgements

- [Tectonic](https://tectonic-typesetting.github.io/) — modern LaTeX engine
- [PDF.js](https://mozilla.github.io/pdf.js/) — Mozilla's PDF renderer
- [shadcn/ui](https://ui.shadcn.com/) — UI primitives
- [better-auth](https://www.better-auth.com/) — authentication
- [pdf2svg](https://github.com/dawbarton/pdf2svg) — PDF → SVG conversion
- [pg-boss](https://github.com/timgit/pg-boss) — PostgreSQL-backed job queue
- [DOMPurify](https://github.com/cure53/DOMPurify) — SVG/HTML sanitisation
