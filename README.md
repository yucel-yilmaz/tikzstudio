# TikZ Studio

A modern, browser-based LaTeX editor focused on **TikZ** diagrams. Built on Next.js 16 with React 19, it pairs a CodeMirror editor with sandboxed Docker compilation and live PDF preview — so you can edit, compile, and download high-quality figures from any browser.

> Status: under active development. APIs and UI may change.

---

## ✨ Features

- 📝 **CodeMirror 6 editor** with LaTeX syntax highlighting, bracket matching, line numbers
- 🛡️ **Sandboxed compilation** in a hardened Docker container (`--network none`, `--read-only`, capability drops, memory/CPU/timeout caps)
- 🚀 **Tectonic engine** with pre-warmed cache for the most common TikZ libraries (`calc`, `arrows.meta`, `positioning`, `decorations.*`, `pgfplots`, …)
- 📄 **Live PDF preview** rendered with PDF.js, DPR-aware for high-DPI displays
- 🎨 **SVG export** alongside PDF for vector workflows
- 🗂️ **Multi-file projects** — create, rename, delete, mark as main
- 🧩 **Templates & snippets** library for quick TikZ scaffolds
- 🔐 **Authentication** via [better-auth](https://www.better-auth.com/) (email + password)
- 💾 **Auto-save** with debounce and visible save state
- 🌗 **Light/dark theme** support (Tailwind v4)
- 🇹🇷 **Turkish UI** out of the box

---

## 🧱 Tech Stack

| Layer        | Choice                                       |
| ------------ | -------------------------------------------- |
| Framework    | Next.js 16 (App Router) + React 19           |
| Language     | TypeScript                                   |
| Styling      | Tailwind CSS v4 + shadcn/ui (radix-ui)       |
| State        | TanStack Query, Zustand                      |
| Editor       | CodeMirror 6 (`@uiw/react-codemirror`)       |
| Database     | PostgreSQL via Prisma 7                      |
| Auth         | better-auth                                  |
| LaTeX engine | Tectonic (Docker sandbox)                    |
| PDF render   | PDF.js (legacy build)                        |
| PDF → SVG    | `pdf2svg`                                    |
| Lint/Format  | Biome                                        |

---

## 📐 Architecture

```
                   ┌────────────────────────┐
   browser ─────▶  │  Next.js (App Router)  │  ─── better-auth ──▶  PostgreSQL
                   │  ─ /api/projects/...   │
                   │  ─ /api/compile-jobs/. │  ─── Prisma ──────▶
                   └──────────┬─────────────┘
                              │ POST /api/projects/:id/compile
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
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 14+ (local or container)
- **Docker** (for the compile sandbox)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env, in particular generate a fresh BETTER_AUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 3. Database setup

```bash
npm run db:generate    # generate Prisma client
npm run db:migrate     # apply migrations
npm run db:seed        # seed templates/snippets (optional)
```

### 4. Build the compiler image

This builds a hardened Tectonic image and warms its cache with common TikZ libraries.
First build takes 5–10 minutes (cargo install + first Tectonic bundle download).

```bash
npm run compiler:build
```

> **If the build fails with "couldn't get bundle from internet"** — see [Troubleshooting](#-troubleshooting).

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up.

---

## 📜 Available Scripts

| Script                 | What it does                                      |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start Next.js dev server (Turbopack)              |
| `npm run build`        | Production build                                  |
| `npm run start`        | Run the production build                          |
| `npm run lint`         | Biome check (lint + organize imports + format)    |
| `npm run format`       | Biome format with auto-fix                        |
| `npm run test`         | Run vitest test suite                             |
| `npm run db:generate`  | Generate Prisma client                            |
| `npm run db:migrate`   | Run Prisma migrations (`prisma migrate dev`)      |
| `npm run db:seed`      | Seed the database                                 |
| `npm run compiler:build` | Build the Tectonic Docker image                 |

---

## 📁 Repository Layout

```
app/                  Next.js App Router routes (UI + API handlers)
  api/                REST endpoints (projects, files, compile jobs, auth)
  (app)/              Authenticated routes (dashboard, editor)
  (marketing)/        Public marketing pages
features/             Feature modules (auth, dashboard, editor)
  editor/components/  Editor UI: code-editor, pdf-preview, layouts
  editor/store/       Zustand stores
components/           Shared UI primitives (shadcn/ui)
lib/                  Helpers (client API, types, env, utils)
server/               Server-side logic (services, schemas, compiler)
  compiler/           Docker compile adapter, log parser, storage
  services/           Business logic (projects, files, compile jobs)
prisma/               Schema, migrations, seed
docker/compiler/      Dockerfile + warmup.tex + compile.sh for the sandbox
docs/                 Internal notes
tests/                Vitest tests
```

---

## 🔒 Security Model

The compile sandbox is the most security-sensitive surface. Each compile request runs:

```
docker run --rm
  --network none                 # no outbound traffic
  --read-only                    # filesystem is read-only
  --tmpfs /tmp:rw,noexec         # writable /tmp without exec
  --memory 256m --cpus 0.5       # resource caps
  --pids-limit 64
  --security-opt no-new-privileges
  --cap-drop ALL
  tikzlab-compiler:latest
```

Plus:

- Tectonic runs `--untrusted` (shell-escape disabled) and `--only-cached` (no network reads at runtime — required by `--network none`)
- Source code & output are size-capped (`MAX_SOURCE_SIZE_KB`, `MAX_OUTPUT_SIZE_MB`)
- Compile timeout caps (`COMPILE_TIMEOUT_SECONDS`)

If a TikZ library is missing, add it to [`docker/compiler/warmup.tex`](docker/compiler/warmup.tex) and rebuild the image.

---

## 🛠️ Troubleshooting

<details>
<summary><b>Docker build fails with "couldn't get bundle from internet"</b></summary>

Tectonic downloads its bundle on first run. The default Docker `bridge` network sometimes can't reach external mirrors. The build script already passes `--network=host`, but if it still fails:

```bash
# Try explicit DNS
docker build --dns=8.8.8.8 --dns=1.1.1.1 \
  -t tikzlab-compiler:latest -f docker/compiler/Dockerfile .

# Or fix Docker Desktop DNS
# Settings → Resources → Network → DNS Server → 8.8.8.8
```
</details>

<details>
<summary><b>Compile fails with "Package tikz Error: I did not find the tikz library 'X'"</b></summary>

The library isn't in the warmed Tectonic cache (and `--only-cached` is on for security). Add it to the `\usetikzlibrary{...}` block in [`docker/compiler/warmup.tex`](docker/compiler/warmup.tex), then rebuild:

```bash
npm run compiler:build
```
</details>

<details>
<summary><b>PDF preview shows a grey box</b></summary>

Most likely a stale browser cache for `pdf.worker.min.mjs`. Hard refresh (Ctrl+Shift+R). If still broken, open DevTools → Console and check for PDF.js errors. The render path is in [`features/editor/components/pdf-preview.tsx`](features/editor/components/pdf-preview.tsx).
</details>

<details>
<summary><b>Prisma error: "column ... does not exist"</b></summary>

Migrations not applied. Run:

```bash
npm run db:migrate
```
</details>

---

## 🗺️ Roadmap

- [ ] Public project sharing via shareable link
- [ ] PNG export
- [ ] Queue-backed compile worker (BullMQ / pg-boss)
- [ ] Multi-engine support (XeLaTeX, LuaLaTeX exposed in UI)
- [ ] Real-time collaboration (Y.js)
- [ ] Mobile-first editor improvements
- [ ] Localization (English UI alongside Turkish)
- [ ] OAuth providers (GitHub, Google)

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
