# TikZ Studio

**TikZ** diyagramlarına odaklanmış, modern, tarayıcı tabanlı bir LaTeX editörü. React 19 ile Next.js 16 üzerine inşa edilmiş olup CodeMirror editörü ile izole Docker derleme ortamını ve canlı PDF önizlemesini bir araya getirir — herhangi bir tarayıcıdan düzenleyebilir, derleyebilir ve yüksek kaliteli görseller indirebilirsiniz.

> Durum: aktif geliştirme aşamasında. API'ler ve arayüz değişebilir.

---

## ✨ Özellikler

- 📝 **CodeMirror 6 editörü** — LaTeX sözdizimi vurgulama, parantez eşleştirme, satır numaraları ve satır içi hata gösterimi
- 🛡️ **İzole derleme** — güçlendirilmiş Docker konteyneri (`--network none`, `--read-only`, kapasite kısıtlamaları, bellek/CPU/zaman aşımı sınırları, süreç düzeyinde zaman aşımı)
- 🚀 **Tectonic motoru** — en yaygın TikZ kütüphaneleri için önceden ısıtılmış önbellek (`calc`, `arrows.meta`, `positioning`, `decorations.*`, `pgfplots`, …)
- 📄 **Canlı PDF önizleme** — PDF.js ile render edilir, yüksek DPI ekranlar için DPR farkındalıklı
- 🎨 **SVG dışa aktarma** — vektör iş akışları için PDF'in yanında (sunulmadan önce DOMPurify ile temizlenir)
- 🗂️ **Çok dosyalı projeler** — oluştur, yeniden adlandır, sil, ikili dosya yükle (resimler, fontlar, `.cls`, `.sty`), ana dosyayı işaretle
- 📚 **Derleme geçmişi** — geçmiş işlere göz at, arşivlenmiş PDF/SVG çıktılarını indir
- 🔁 **Proje çatallama** — herhangi bir genel projeyi kendi çalışma alanına kopyala
- 🧩 **Şablon ve kod parçacıkları** kütüphanesi — hızlı TikZ iskeletleri için
- 🔐 **Kimlik doğrulama** — [better-auth](https://www.better-auth.com/) ile (e-posta + parola)
- 🚦 **Hız sınırlaması** — kullanıcı başına dakikada 5 derleme (veritabanı destekli, ek bağımlılık yok)
- 💾 **Otomatik kaydetme** — geri çekilme ve görünür kayıt durumu ile
- 🌗 **Açık/koyu tema** desteği (Tailwind v4)
- 🇹🇷 **Türkçe arayüz** — varsayılan olarak

---

## 🧱 Teknoloji Yığını

| Katman          | Seçim                                           |
| --------------- | ----------------------------------------------- |
| Framework       | Next.js 16 (App Router) + React 19              |
| Dil             | TypeScript                                      |
| Stil            | Tailwind CSS v4 + shadcn/ui (radix-ui)          |
| Durum           | TanStack Query, Zustand                         |
| Editör          | CodeMirror 6 (`@uiw/react-codemirror`)          |
| Veritabanı      | Prisma 7 üzerinden PostgreSQL                   |
| Kimlik Doğrulama| better-auth                                     |
| İş kuyruğu      | pg-boss (PostgreSQL destekli, Redis gerekmez)   |
| LaTeX motoru    | Tectonic (Docker sandbox)                       |
| PDF render      | PDF.js (legacy build)                           |
| PDF → SVG       | `pdf2svg` (çıktı DOMPurify ile temizlenir)      |
| SVG temizleyici | DOMPurify + jsdom (sunucu taraflı)              |
| Testler         | Vitest                                          |
| Lint/Format     | Biome                                           |

---

## 📐 Mimari

```text
                   ┌────────────────────────┐
   tarayıcı ────▶  │  Next.js (App Router)  │  ─── better-auth ──▶  PostgreSQL
                   │  ─ /api/projects/...   │
                   │  ─ /api/compile-jobs/. │  ─── Prisma ──────▶
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
                   │   tectonic + pdf2svg   │
                   │   ısıtılmış önbellek   │
                   └────────────────────────┘
                              ▼
                  PDF + SVG ──▶ COMPILE_STORAGE_DIR
                  SVG ─────▶  DOMPurify temizleyici ──▶ tarayıcı
```

---

## 🚀 Başlangıç

### Gereksinimler

- **Node.js** 20+
- **Docker** (derleme sandbox'ı ve geliştirme veritabanı için)

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. Ortamı yapılandır

```bash
cp .env.example .env
# .env dosyasını düzenle — özellikle yeni bir BETTER_AUTH_SECRET oluştur:
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 3. Veritabanını başlat

Proje PostgreSQL gerektirir. En kolay yol Docker konteyneridir:

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

Yeniden başlatmadan sonra tekrar başlatmak için:

```bash
docker start tikzlab-postgres
```

### 4. Migration'ları uygula ve seed yap

```bash
npm run db:generate    # Prisma istemcisini oluştur
npm run db:migrate     # tüm migration'ları uygula
npm run db:seed        # şablon/kod parçacıklarını ekle (isteğe bağlı)
```

### 5. Derleyici imajını oluştur

Güçlendirilmiş bir Tectonic imajı oluşturur ve yaygın TikZ kütüphaneleriyle paket önbelleğini ısıtır. İlk derleme 5–10 dakika sürer (cargo derleme + bundle indirme).

```bash
npm run compiler:build
```

> **Derleme "couldn't get bundle from internet" hatasıyla başarısız olursa** — aşağıdaki Sorun Giderme bölümüne bakın.

### 6. Geliştirme sunucusunu çalıştır

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini açın ve kayıt olun.

---

## 📜 Mevcut Komutlar

| Komut                     | Ne yapar                                           |
| ------------------------- | -------------------------------------------------- |
| `npm run dev`             | Next.js geliştirme sunucusunu başlat (Turbopack)   |
| `npm run build`           | Üretim derlemesi + tip kontrolü                    |
| `npm run start`           | Üretim derlemesini çalıştır                        |
| `npm run lint`            | Biome kontrolü (lint + import düzenleme + format)  |
| `npm run format`          | Biome format ile otomatik düzeltme                 |
| `npm run test`            | Vitest test paketini çalıştır (tek sefer)          |
| `npm run test:watch`      | Vitest'i izleme modunda çalıştır                   |
| `npm run db:generate`     | Prisma istemcisini oluştur                         |
| `npm run db:migrate`      | Prisma migration'larını uygula (`prisma migrate dev`) |
| `npm run db:seed`         | Veritabanını şablon ve kod parçacıklarıyla doldur  |
| `npm run compiler:build`  | Tectonic Docker derleyici imajını oluştur          |

---

## 📁 Depo Yapısı

```text
app/                  Next.js App Router rotaları (UI + API handler'lar)
  api/                REST endpoint'leri (projeler, dosyalar, derleme işleri, auth)
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
  services/           İş mantığı (projeler, dosyalar, derleme işleri)
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
  --network none                 # dışa trafik yok
  --read-only                    # dosya sistemi salt okunur
  --tmpfs /tmp:rw,noexec,nosuid,size=64m
  --memory 256m --cpus 0.5       # kaynak sınırları (env ile yapılandırılabilir)
  --pids-limit 64
  --security-opt no-new-privileges
  --cap-drop ALL
  tikzlab-compiler:latest
```

Konteyner içinde LaTeX süreci `timeout 12` ile sarılmıştır (dış Docker zaman aşımı olan 15 saniyenin 3 saniye altında). Her iki sınır da ortam değişkenleriyle yapılandırılabilir.

### SVG çıktısı

`pdf2svg` çıktısı tarayıcıya ulaşmadan önce sunucu taraflı DOMPurify temizleyicisinden geçirilir; kötü niyetli LaTeX'te bulunabilecek `<script>` etiketlerini, olay işleyicilerini ve diğer XSS vektörlerini engeller.

### Hız sınırlaması

Derleme endpoint'i, veritabanına karşı kontrol edilen kullanıcı başına dakikada 5 sınırı uygular — ek altyapı gerekmez.

### Ek sınırlar

- Kaynak paketi boyutu sınırlıdır (`MAX_SOURCE_SIZE_KB`, varsayılan 512 KB)
- Çıktı boyutu sınırlıdır (`MAX_OUTPUT_SIZE_MB`, varsayılan 10 MB)
- Sunucu yeniden başlatıldığında eski RUNNING/PENDING işler FAILED olarak kurtarılır
- Derleme dosyaları saatlik temizlenir; disk üzerinde proje başına yalnızca son başarılı çıktı tutulur

---

## 🛠️ Sorun Giderme

### PostgreSQL bağlantı hatası (P1001 / ECONNREFUSED)

Veritabanı konteyneri çalışmıyor. Başlatmak için:

```bash
docker start tikzlab-postgres
```

Konteyneri henüz oluşturmadıysanız, Başlangıç bölümündeki 3. adımı takip edin.

### Docker derlemesi "couldn't get bundle from internet" hatasıyla başarısız oluyor

Tectonic ilk çalıştırmada bundle'ını indirir. Varsayılan Docker `bridge` ağı bazen dış yansımalara ulaşamaz. Derleme betiği zaten `--network=host` geçirir, ancak hâlâ başarısız olursa:

```bash
# Açık DNS dene
docker build --dns=8.8.8.8 --dns=1.1.1.1 \
  -t tikzlab-compiler:latest -f docker/compiler/Dockerfile .

# Veya Docker Desktop DNS'ini düzelt:
# Settings → Resources → Network → DNS Server → 8.8.8.8
```

### Derleme "I did not find the tikz library 'X'" hatasıyla başarısız oluyor

Kütüphane ısıtılmış Tectonic önbelleğinde yok (`--only-cached` güvenlik için açık). [`docker/compiler/warmup.tex`](docker/compiler/warmup.tex) dosyasındaki `\usetikzlibrary{...}` bloğuna ekleyin, ardından yeniden derleyin:

```bash
npm run compiler:build
```

### PDF önizleme gri kutu gösteriyor

Büyük ihtimalle `pdf.worker.min.mjs` için eski tarayıcı önbelleği. Sert yenileme yapın (Ctrl+Shift+R). Hâlâ bozuksa DevTools → Console açın ve PDF.js hatalarını kontrol edin. Render yolu [`features/editor/components/pdf-preview.tsx`](features/editor/components/pdf-preview.tsx) içindedir.

### Prisma hatası: "column ... does not exist"

Migration'lar uygulanmamış. Çalıştırın:

```bash
npm run db:migrate
```

---

## 🗺️ Yol Haritası

- [ ] Çoklu motor arayüzü (proje başına seçilebilir XeLaTeX, LuaLaTeX)
- [ ] PNG dışa aktarma
- [ ] Gerçek zamanlı işbirliği (Y.js)
- [ ] Mobil öncelikli editör iyileştirmeleri
- [ ] Yerelleştirme (Türkçe yanı sıra İngilizce arayüz)
- [ ] OAuth sağlayıcıları (GitHub, Google)
- [ ] Tek komutla yerel kurulum için docker-compose.yml

---

## 🤝 Katkıda Bulunma

Bu şu an kişisel bir proje. Bir hata bulursanız veya özellik önermek istiyorsanız bir issue açın. Pull request'ler memnuniyetle karşılanır, ancak büyük değişiklikleri önce tartışın.

Göndermeden önce:

```bash
npm run lint
npm run test
```

---

## 📝 Lisans

Tüm hakları saklıdır. Lisans verilmemektedir. Kaynak kod yalnızca şeffaflık / portfolyo amaçlı yayınlanmıştır — lütfen yeniden dağıtmayın, ticari olarak çatallamayın veya izinsiz dağıtmayın.

Bu kodu kullanmak istiyorsanız iletişime geçin.

---

## 🙏 Teşekkürler

- [Tectonic](https://tectonic-typesetting.github.io/) — modern LaTeX motoru
- [PDF.js](https://mozilla.github.io/pdf.js/) — Mozilla'nın PDF render motoru
- [shadcn/ui](https://ui.shadcn.com/) — UI bileşenleri
- [better-auth](https://www.better-auth.com/) — kimlik doğrulama
- [pdf2svg](https://github.com/dawbarton/pdf2svg) — PDF → SVG dönüşümü
- [pg-boss](https://github.com/timgit/pg-boss) — PostgreSQL destekli iş kuyruğu
- [DOMPurify](https://github.com/cure53/DOMPurify) — SVG/HTML temizleme
