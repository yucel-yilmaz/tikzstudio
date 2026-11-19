# TikZ Studio

**TikZ** diyagramlarına ve çok dosyalı LaTeX belgelerine odaklanmış, modern, tarayıcı tabanlı bir LaTeX editörü. React 19 ile Next.js 16 üzerine inşa edilmiş olup CodeMirror editörü ile izole Docker derleme ortamını ve canlı PDF önizlemesini bir araya getirir.

> Durum: aktif geliştirme aşamasında. API'ler ve arayüz değişebilir.

---

## ✨ Özellikler

- 📝 **CodeMirror 6 editörü** — LaTeX sözdizimi vurgulama, parantez eşleştirme, satır numaraları ve satır içi hata gösterimi
- 🛡️ **İzole derleme** — güçlendirilmiş Docker konteyneri (`--network none`, `--read-only`, kapasite kısıtlamaları, bellek/CPU/zaman aşımı sınırları)
- ⚙️ **Beş LaTeX motoru** — Tectonic, pdfLaTeX, XeLaTeX, LuaLaTeX, pdfLaTeX + Biber; her derlemede seçilebilir
- 📄 **Canlı PDF önizleme** — PDF.js ile render edilir, yüksek DPI ekranlar için DPR farkındalıklı
- 🎨 **SVG + PNG dışa aktarma** — SVG, DOMPurify ile temizlenir; PNG, `pdftoppm` ile 300 DPI'da üretilir (çalışma kâğıtları için baskı kalitesi)
- 🖼️ **Görüntüden LaTeX** (img2latex) — Docker Model Runner (`ai/qwen3-vl`), pix2tex (yerel Docker API) veya Mathpix ile formülleri LaTeX'e dönüştürür
- 🗂️ **Çok dosyalı projeler** — oluştur, yeniden adlandır, sil, ikili dosya yükle (resimler, fontlar, `.cls`, `.sty`), ana dosyayı işaretle
- 📚 **Derleme geçmişi** — geçmiş işlere göz at, arşivlenmiş PDF/SVG/PNG çıktılarını indir
- 🔁 **Proje çatallama** — herhangi bir genel projeyi kendi çalışma alanına kopyala
- 🧩 **Çok dosyalı şablonlar** — yeni proje, şablonun tüm dosyalarını (görseller ve `.sty` dahil) kopyalar; editörden kendi şablonlarınızı oluşturabilirsiniz
- 📐 **Lise matematik paketi** — 13 hazır Türkçe şablon (üçgen, çember, tkz-euclide, doğru/parabol/parçalı fonksiyon grafikleri, birim çember, sayı doğrusu, Venn, olasılık ağacı, katı cisimler, iki eğri arası alan, çok dosyalı A–E şıklı sınav kâğıdı) ve matematik snippet'leri; hepsi Tectonic ve pdfLaTeX ile doğrulanmıştır
- 🔐 **Kimlik doğrulama** — [better-auth](https://www.better-auth.com/) ile e-posta + şifre; GitHub ve Google OAuth, istemci kimliği/sırrı tanımlandığında otomatik etkinleşir
- 🚦 **Hız sınırlaması** — kullanıcı başına dakikada 5 derleme (veritabanı destekli, ek bağımlılık yok)
- 💾 **Otomatik kaydetme** — geri çekilme ve görünür kayıt durumu ile
- 🌗 **Açık/koyu tema** desteği (Tailwind v4)
- 🇹🇷 **Türkçe içerik** — Türkçe babel ve fontlar tüm motorlarda çalışır; matematik şablonları ve sunucu mesajları Türkçedir (editör arayüzü henüz İngilizce)

---

## 🧱 Teknoloji Yığını

| Katman | Seçim |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Dil | TypeScript |
| Stil | Tailwind CSS v4 + shadcn/ui (radix-ui) |
| Durum | TanStack Query, Zustand |
| Editör | CodeMirror 6 (`@uiw/react-codemirror`) |
| Veritabanı | Prisma 7 üzerinden PostgreSQL |
| Kimlik Doğrulama | better-auth (e-posta + GitHub + Google OAuth) |
| İş kuyruğu | pg-boss (PostgreSQL destekli, Redis gerekmez) |
| LaTeX motorları | Tectonic, pdfLaTeX, XeLaTeX, LuaLaTeX, pdfLaTeX+Biber |
| PDF render | PDF.js (legacy build) |
| PDF → SVG | `pdf2svg` (DOMPurify ile temizlenir) |
| PDF → PNG | `pdftoppm` (poppler-utils, 300 DPI) |
| SVG temizleyici | DOMPurify + jsdom (sunucu taraflı) |
| Şablon bundle | JSZip |
| Testler | Vitest |
| Lint/Format | Biome |

---

## 📐 Mimari

```text
                   ┌────────────────────────┐
   tarayıcı ────▶  │  Next.js (App Router)  │  ─── better-auth ──▶  PostgreSQL
                   │  ─ /api/projects/...   │
                   │  ─ /api/compile-jobs/. │  ─── Prisma ──────▶
                   │  ─ /api/templates/...  │
                   │  ─ /api/img2latex      │
                   └──────────┬─────────────┘
                              │ POST /api/projects/:id/compile
                              ▼
                   ┌────────────────────────┐
                   │   pg-boss iş kuyruğu   │  (PostgreSQL'de saklanır)
                   └──────────┬─────────────┘
                              │ worker işi alır
                              ▼
                   ┌────────────────────────┐
                   │ DockerCompilerAdapter  │
                   │  `docker run` başlat   │
                   │  --network none        │
                   │  --read-only           │
                   │  --cap-drop ALL        │
                   └──────────┬─────────────┘
                              ▼
                   ┌────────────────────────┐
                   │  tikzlab-compiler:*    │
                   │  tectonic / pdflatex   │
                   │  xelatex / lualatex    │
                   │  pdflatex + biber      │
                   │  pdf2svg / pdftoppm    │
                   └────────────────────────┘
                              ▼
           PDF + SVG + PNG ──▶ COMPILE_STORAGE_DIR
           SVG ────────────▶  DOMPurify temizleyici ──▶ tarayıcı
```

---

## 🚀 Başlangıç

### Gereksinimler

- **Node.js** 20+
- **Docker** (derleme sandbox'ı ve geliştirme veritabanı için)

### Seçenek A — Tek komut (Docker Compose)

```bash
cp .env.example .env
# .env dosyasını düzenle: BETTER_AUTH_SECRET (isteğe bağlı OAuth anahtarları)
docker compose build compiler   # LaTeX sandbox imajı, ilk seferde 10–20 dk
docker compose up --build -d
```

PostgreSQL'i başlatır, migration'ları uygular, resmi şablonları yükler (tekrar çalıştırmak güvenlidir) ve uygulamayı [http://localhost:3000](http://localhost:3000) adresinde sunar.

Uygulama konteyneri derleme konteynerlerini host'un Docker daemon'u üzerinden başlatır (`/var/run/docker.sock` bağlanır). Bağlama yolları host'ta çözüldüğü için derleme çalışma dizini `COMPILE_WORK_DIR` (varsayılan `/tmp/tikzstudio-work`) konteyner içinde aynı yola bağlanır — değiştirirseniz ikisini birlikte değiştirin.

### Seçenek B — Manuel kurulum

#### 1. Bağımlılıkları yükle

```bash
npm install
```

#### 2. Ortamı yapılandır

```bash
cp .env.example .env
# Yeni bir BETTER_AUTH_SECRET oluştur:
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

#### 3. Veritabanını başlat

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

Yeniden başlatmadan sonra:

```bash
docker start tikzlab-postgres
```

#### 4. Migration'ları uygula ve seed yap

```bash
npm run db:generate    # Prisma istemcisini oluştur
npm run db:migrate     # tüm migration'ları uygula
npm run db:seed        # şablon/kod parçacıklarını ekle (isteğe bağlı)
```

#### 5. Derleyici imajını oluştur

Tectonic, pdfLaTeX, XeLaTeX, LuaLaTeX, Biber, pdf2svg ve pdftoppm içeren güçlendirilmiş bir imaj oluşturur. İlk build 10–20 dakika sürer (Rust derleme + TeX Live indirme).

```bash
npm run compiler:build
```

#### 6. Geliştirme sunucusunu çalıştır

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini açın ve kayıt olun.

---

## 📜 Mevcut Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Next.js geliştirme sunucusunu başlat (Turbopack) |
| `npm run build` | Üretim derlemesi + tip kontrolü |
| `npm run start` | Üretim derlemesini çalıştır |
| `npm run lint` | Biome kontrolü (lint + import düzenleme + format) |
| `npm run format` | Biome format ile otomatik düzeltme |
| `npm run test` | Vitest test paketini çalıştır (tek sefer) |
| `npm run test:watch` | Vitest'i izleme modunda çalıştır |
| `npm run db:generate` | Prisma istemcisini oluştur |
| `npm run db:migrate` | Prisma migration'larını uygula |
| `npm run db:seed` | Veritabanını şablon ve snippet'lerle doldur |
| `npm run compiler:build` | Docker derleyici imajını oluştur |
| `npm run templates:verify` | Tüm matematik şablonlarını sandbox'ta derle (Tectonic + pdfLaTeX) |

---

## 📁 Depo Yapısı

```text
app/                  Next.js App Router rotaları (UI + API handler'lar)
  api/                REST endpoint'leri (projeler, dosyalar, derleme, şablonlar, img2latex, auth)
  (app)/              Kimlik doğrulamalı rotalar (dashboard, editör)
  (marketing)/        Genel tanıtım sayfaları
features/             Özellik modülleri (auth, dashboard, editör, paylaşım)
  editor/components/  Editör UI: kod editörü, PDF önizleme, düzenler
  editor/store/       Zustand store'ları
components/           Paylaşılan UI bileşenleri (shadcn/ui, ErrorBoundary)
lib/                  Yardımcılar (istemci API, tipler, env, derleme logu, utils)
server/               Sunucu taraflı mantık
  compiler/           Docker adaptörü, log ayrıştırıcı, SVG temizleyici, depolama
  jobs/               pg-boss worker'ları (derleme, temizlik)
  services/           İş mantığı (projeler, dosyalar, derleme işleri, şablonlar)
  schemas/            Zod istek şemaları
prisma/               Şema, migration'lar, seed
docker/compiler/      Sandbox için Dockerfile + ısıtma belgeleri + compile.sh
tests/                Vitest birim testleri
```

---

## 🔒 Güvenlik Modeli

### Derleme sandbox'ı

Her derleme isteği izole bir konteynerde çalışır:

```shell
docker run --rm
  --network none
  --read-only
  --tmpfs /tmp:rw,noexec,nosuid,size=64m
  --memory 256m --cpus 0.5
  --pids-limit 64
  --security-opt no-new-privileges
  --cap-drop ALL
  tikzlab-compiler:latest
```

Tek-geçişli motorlar (Tectonic, pdfLaTeX, XeLaTeX, LuaLaTeX) işlem başına 12 s ile sınırlıdır. pdfLaTeX + Biber pipeline'ı dört ardışık geçiş çalıştırır ve 10× daha uzun timeout alır.

### SVG çıktısı

`pdf2svg` çıktısı tarayıcıya ulaşmadan önce sunucu taraflı DOMPurify temizleyicisinden geçirilir.

### Hız sınırlaması

Derleme endpoint'i, veritabanına karşı kontrol edilen kullanıcı başına dakikada 5 sınırı uygular.

### Ek sınırlar

- Kaynak paketi boyutu sınırlıdır (`MAX_SOURCE_SIZE_KB`, varsayılan 512 KB)
- Çıktı boyutu sınırlıdır (`MAX_OUTPUT_SIZE_MB`, varsayılan 10 MB)
- Sunucu yeniden başlatıldığında eski işler FAILED olarak kurtarılır
- Derleme dosyaları saatlik temizlenir

---

## 🛠️ Sorun Giderme

### PostgreSQL bağlantı hatası

```bash
docker start tikzlab-postgres
```

### Docker derlemesi internet erişim hatasıyla başarısız oluyor

```bash
docker build --dns=8.8.8.8 --dns=1.1.1.1 \
  -t tikzlab-compiler:latest -f docker/compiler/Dockerfile .
```

### Tectonic: "I did not find the tikz library 'X'"

[`docker/compiler/warmup.tex`](docker/compiler/warmup.tex) dosyasındaki `\usetikzlibrary{...}` bloğuna ekleyin ve yeniden build edin.

### pdfLaTeX: "File 'package.sty' not found"

[`docker/compiler/Dockerfile`](docker/compiler/Dockerfile) içindeki `apt-get install` bloğuna ilgili `texlive-*` paketini ekleyin ve yeniden build edin.

### pdfLaTeX + Biber: kaynakça çözülmüyor

Belgenizde `\usepackage[backend=biber]{biblatex}` kullandığınızdan emin olun — `bibtex` değil.

### PDF önizleme gri kutu gösteriyor

Sert yenileme yapın (Ctrl+Shift+R). Hâlâ bozuksa DevTools → Console'u kontrol edin.

### Prisma: "column ... does not exist"

```bash
npm run db:migrate
```

---

## 🗺️ Yol Haritası

- [x] Çoklu motor arayüzü (pdfLaTeX, XeLaTeX, LuaLaTeX, pdfLaTeX+Biber derlemede seçilebilir)
- [x] PNG dışa aktarma
- [x] OAuth sağlayıcıları (GitHub, Google) — ortam değişkeniyle isteğe bağlı
- [x] Tek komutla yerel kurulum için docker-compose.yml
- [x] Çok dosyalı şablon sistemi
- [x] Lise matematik şablon paketi (Türkçe)
- [ ] Şablon ZIP içe/dışa aktarma ve otomatik şablon önizlemesi
- [ ] "Projeyi şablon olarak kaydet" düğmesi (servis hazır, arayüze bağlanmadı)
- [ ] Tam Türkçe arayüz (i18n)
- [x] Çoklu provider destekli görüntüden LaTeX (img2latex)
- [ ] Gerçek zamanlı işbirliği (Y.js)
- [ ] Mobil öncelikli editör iyileştirmeleri

---

## 🤝 Katkıda Bulunma

Bu şu an kişisel bir proje. Bir hata bulursanız veya özellik önermek istiyorsanız bir issue açın.

```bash
npm run lint
npm run test
```

---

## 📝 Lisans

Tüm hakları saklıdır. Lisans verilmemektedir. Kaynak kod yalnızca şeffaflık / portfolyo amaçlı yayınlanmıştır.

---

## 🙏 Teşekkürler

- [Tectonic](https://tectonic-typesetting.github.io/) — modern LaTeX motoru
- [PDF.js](https://mozilla.github.io/pdf.js/) — Mozilla'nın PDF render motoru
- [shadcn/ui](https://ui.shadcn.com/) — UI bileşenleri
- [better-auth](https://www.better-auth.com/) — kimlik doğrulama
- [pdf2svg](https://github.com/dawbarton/pdf2svg) — PDF → SVG dönüşümü
- [pg-boss](https://github.com/timgit/pg-boss) — PostgreSQL destekli iş kuyruğu
- [DOMPurify](https://github.com/cure53/DOMPurify) — SVG/HTML temizleme
- [pix2tex](https://github.com/lukas-blecher/LaTeX-OCR) — görüntüden LaTeX OCR
- [poppler-utils](https://poppler.freedesktop.org/) — PDF → PNG dönüşümü
