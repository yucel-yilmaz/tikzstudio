# TikZLab

TikZLab, Next.js App Router tabanli TikZ odakli bir LaTeX editorudur. Uygulama; proje yonetimi, `main.tex` duzenleme, snippet/template ekleme, compile job takibi ve PDF onizleme akisini tek urunde birlestirir.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma + PostgreSQL
- better-auth
- TanStack Query
- Zustand
- CodeMirror 6
- PDF.js
- Docker tabanli compiler sandbox

## Kurulum

1. Bagimliliklari yukle:

```bash
npm install
```

2. Ortam degiskenlerini hazirla:

```bash
cp .env.example .env
```

3. Prisma client ve veritabani:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Docker compiler image'ini olustur:

```bash
npm run compiler:build
```

5. Uygulamayi calistir:

```bash
npm run dev
```

## Auth

Uygulama better-auth kullanir. MVP icin e-posta + sifre girisi etkindir. Auth route'lari `app/api/auth/[...all]/route.ts` altindadir.

## Compiler

Compile akisi `POST /api/projects/:projectId/compile` ile baslar. Job arkaplanda calisir, durum `GET /api/compile-jobs/:jobId` ile izlenir. Basarili PDF ciktisi `GET /api/compile-jobs/:jobId/output` ile yetkili kullaniciya servis edilir.

Docker sandbox varsayimlari:

- network disabled
- read-only root filesystem
- no-new-privileges
- cap-drop all
- memory / CPU / timeout limitleri
- Tectonic cache image build sirasinda isinir; runtime'da `--only-cached` kullanilir

## Onemli Dizinler

- `app/`: route gruplari, sayfalar ve route handler'lar
- `features/`: dashboard, auth ve editor UI
- `server/`: proje servisleri, compile adapter'i, parser ve storage
- `prisma/`: schema ve seed
- `docker/compiler/`: sandbox image asset'leri

## Notlar

- Compile icin yerel makinede Docker gerekir.
- Varsayilan engine `TECTONIC` olarak kaydedilir; compile adapter'i ileride baska engine'lere genisletilecek sekilde soyutlanmistir.
- Public proje paylasimi, SVG/PNG export ve queue-backed worker sonraki faza birakilmistir.
