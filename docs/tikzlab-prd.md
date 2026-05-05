# PRD: TikZ Odaklı LaTeX Editörü

## 1. Ürün Adı

**TikZLab**

Alternatif isimler:

- TikZ Studio
- LaTeX Diagram Editor
- TikZ Playground
- DiagramTeX

---

## 2. Ürün Özeti

TikZLab, kullanıcıların tarayıcı üzerinden **LaTeX/TikZ kodu yazabildiği, derleyebildiği, önizleyebildiği ve çıktı alabileceği** modern bir web tabanlı editördür.

Ürünün ilk odağı genel LaTeX doküman yazımından çok, **TikZ diyagram üretimi** olacaktır. Kullanıcılar akış şeması, matematiksel şekil, grafik, koordinat sistemi, ok/node yapıları, devre şemaları ve eğitim diyagramları oluşturabilecektir.

---

## 3. Problem Tanımı

TikZ güçlü bir çizim paketidir fakat öğrenmesi ve kullanması zordur. Kullanıcılar çoğu zaman:

- TikZ sözdizimini hatırlamakta zorlanır.
- Küçük hatalarda karmaşık LaTeX hata mesajları alır.
- Kodun görsel çıktısını hızlıca göremez.
- Hazır şablonlara ihtiyaç duyar.
- Sadece bir diyagram üretmek için tam LaTeX editörü kullanmak zorunda kalır.
- TikZ çıktısını PDF, SVG veya PNG olarak almak ister.

Bu ürün, TikZ yazmayı daha hızlı, daha anlaşılır ve daha öğretici hale getirmeyi amaçlar.

---

## 4. Hedef Kullanıcılar

### 4.1 Birincil Kullanıcılar

- Matematik öğretmenleri
- Fizik öğretmenleri
- Akademisyenler
- Üniversite öğrencileri
- Tez / makale hazırlayan araştırmacılar
- Teknik dokümantasyon hazırlayan yazılımcılar

### 4.2 İkincil Kullanıcılar

- Lise öğrencileri
- STEM içerik üreticileri
- Online ders materyali hazırlayan eğitimciler
- Mühendislik öğrencileri
- LaTeX öğrenen kullanıcılar

---

## 5. Ürün Hedefleri

### 5.1 MVP Hedefleri

İlk sürümde kullanıcı şunları yapabilmelidir:

1. TikZ/LaTeX kodu yazabilmeli.
2. Kodu güvenli şekilde derleyebilmeli.
3. PDF önizleme alabilmeli.
4. Hata mesajlarını görebilmeli.
5. Hazır TikZ şablonları ekleyebilmeli.
6. Projesini kaydedebilmeli.
7. Çıktıyı PDF olarak indirebilmeli.

### 5.2 Orta Vadeli Hedefler

1. SVG/PNG çıktısı alma.
2. TikZ autocomplete.
3. TikZ snippet sistemi.
4. Hata mesajlarını sadeleştiren açıklayıcı sistem.
5. Kullanıcı hesabı ve proje yönetimi.
6. Paylaşılabilir proje linki.
7. Şablon galerisi.

### 5.3 Uzun Vadeli Hedefler

1. Doğal dilden TikZ üretimi.
2. Görselden TikZ kodu üretimi.
3. İş birlikli gerçek zamanlı düzenleme.
4. Versiyon geçmişi.
5. Ders materyali üretim modu.
6. AI destekli hata düzeltme.
7. TikZ öğrenme modülü.

---

## 6. Ürün Kapsamı

### 6.1 MVP Kapsamında Olacaklar

- Next.js tabanlı web uygulaması
- Code editor
- TikZ/LaTeX syntax highlighting
- Derleme butonu
- PDF preview paneli
- Compile log paneli
- Temel hata gösterimi
- Hazır TikZ şablonları
- Proje oluşturma
- Proje kaydetme
- Proje dosyası düzenleme
- PDF indirme
- Kullanıcı girişi

### 6.2 MVP Kapsamında Olmayacaklar

- Gerçek zamanlı ortak çalışma
- Tam Overleaf benzeri çok dosyalı büyük proje sistemi
- Git entegrasyonu
- AI destekli çizim üretimi
- Görsel sürükle-bırak diyagram editörü
- WebAssembly tabanlı client-side LaTeX derleme
- Marketplace / template store

---

## 7. Teknik Stack

### 7.1 Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- CodeMirror 6
- Zustand
- TanStack Query
- PDF.js

### 7.2 Backend

MVP’de backend iki parçaya ayrılmalıdır:

1. Next.js API / Route Handlers
2. Ayrı compiler worker servisi

Başlangıçta tüm API Next.js içinde olabilir; ancak LaTeX derleme CPU ve güvenlik açısından ayrı worker’a taşınmalıdır.

### 7.3 Veritabanı

- PostgreSQL
- Prisma ORM

### 7.4 Auth

Önerilen:

- better-auth

Alternatifler:

- Auth.js
- Clerk
- Supabase Auth

### 7.5 Derleme Motoru

Başlangıç için önerilen:

- Tectonic

Alternatif motorlar:

- pdflatex
- xelatex
- lualatex
- texlive-full

Compile engine soyutlanmalıdır. Böylece ileride Tectonic yerine TeX Live backend eklemek kolay olur.

### 7.6 Queue / Worker

MVP’de zorunlu değil ama önerilir:

- Redis
- BullMQ
- Compiler Worker

İlk sürümde doğrudan API üzerinden compile yapılabilir. Ancak üretim ortamında her compile işi queue’ya atılmalıdır.

---

## 8. Yüksek Seviye Mimari

```txt
User Browser
    ↓
Next.js App
    ↓
API Layer
    ↓
Compile Job Queue
    ↓
Compiler Worker
    ↓
Docker Sandbox
    ↓
PDF / SVG Output
    ↓
Storage
    ↓
Preview Panel
```

---

## 9. Temel Kullanıcı Akışları

### 9.1 Yeni TikZ Projesi Oluşturma

1. Kullanıcı giriş yapar.
2. Dashboard ekranına gelir.
3. “Yeni Proje” butonuna tıklar.
4. Proje adı girer.
5. Sistem varsayılan TikZ template’iyle proje oluşturur.
6. Kullanıcı editör ekranına yönlendirilir.

Varsayılan dosya içeriği:

```latex
\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}

\begin{document}

\begin{tikzpicture}
  \draw[->] (0,0) -- (3,0);
  \node at (1.5,0.3) {Hello TikZ};
\end{tikzpicture}

\end{document}
```

### 9.2 Kod Yazma ve Önizleme

1. Kullanıcı editörde TikZ kodunu düzenler.
2. “Compile” butonuna basar.
3. Sistem compile job oluşturur.
4. Worker kodu sandbox içinde derler.
5. Çıktı başarılıysa PDF preview güncellenir.
6. Hata varsa log panelinde gösterilir.

### 9.3 Şablon Ekleme

1. Kullanıcı sol panelden “Templates” sekmesine girer.
2. Kategori seçer.
3. Şablon önizlemesini görür.
4. “Insert” butonuna basar.
5. Şablon kodu editöre eklenir.

### 9.4 Hata Görüntüleme

1. Compile başarısız olur.
2. Sistem raw LaTeX logunu kaydeder.
3. Frontend hata panelini açar.
4. Kullanıcı satır numarası, hata tipi ve açıklamayı görür.

İleri sürümde hata açıklaması:

```txt
Raw:
! Package pgf Error: No shape named A is known.

Açıklama:
Kodda A isimli bir node kullanılmış fakat daha önce tanımlanmamış.

Örnek çözüm:
\node (A) at (0,0) {A};
```

---

## 10. Ana Sayfalar

### 10.1 Landing Page

Amaç: Ürünü tanıtmak.

İçerik:

- Hero alanı
- “TikZ diyagramlarını tarayıcıda yaz, derle, paylaş”
- Canlı örnek görsel
- Özellik kartları
- Şablon galerisi önizlemesi
- CTA: “Hemen Başla”

### 10.2 Dashboard

Amaç: Kullanıcının projelerini yönetmesi.

Bileşenler:

- Proje listesi
- Yeni proje butonu
- Arama
- Son düzenlenen projeler
- Template’den proje başlatma

### 10.3 Editor Page

Ana ürün ekranı.

Layout:

```txt
Sol Panel:
- Dosyalar
- Şablonlar
- Snippet’lar
- Ayarlar

Orta Panel:
- CodeMirror editör

Sağ Panel:
- PDF preview
- Compile log
- Hata açıklamaları
```

### 10.4 Project Settings

Ayarlar:

- Proje adı
- Açıklama
- Varsayılan compiler
- Ana dosya
- Public/private durumu
- Silme

---

## 11. Fonksiyonel Gereksinimler

### 11.1 Proje Yönetimi

#### FR-001: Proje oluşturma

Kullanıcı yeni bir proje oluşturabilmelidir.

Kabul kriterleri:

- Proje adı zorunludur.
- Açıklama opsiyoneldir.
- Sistem varsayılan `main.tex` dosyası oluşturur.
- Kullanıcı editör ekranına yönlendirilir.

#### FR-002: Proje listeleme

Kullanıcı kendi projelerini dashboard’da görebilmelidir.

Kabul kriterleri:

- Sadece kullanıcıya ait projeler görünür.
- Projeler son güncellenme tarihine göre sıralanır.
- Arama yapılabilir.

#### FR-003: Proje silme

Kullanıcı kendi projesini silebilmelidir.

Kabul kriterleri:

- Silme öncesi onay modalı gösterilir.
- Soft delete tercih edilir.
- Silinen proje varsayılan listede görünmez.

### 11.2 Dosya Yönetimi

#### FR-004: Ana LaTeX dosyası

Her projenin en az bir `main.tex` dosyası olmalıdır.

Kabul kriterleri:

- Yeni proje `main.tex` ile açılır.
- `main.tex` silinemez veya silinirse yeni ana dosya seçilmelidir.

#### FR-005: Dosya düzenleme

Kullanıcı dosya içeriğini düzenleyebilmelidir.

Kabul kriterleri:

- İçerik autosave ile kaydedilir.
- Manuel save butonu bulunur.
- Kaydetme durumu kullanıcıya gösterilir.

### 11.3 Editör

#### FR-006: Syntax highlighting

Editör LaTeX/TikZ syntax highlighting desteklemelidir.

Kabul kriterleri:

- LaTeX komutları renklendirilir.
- Ortamlar ayırt edilir.
- Parantez eşleşmeleri gösterilir.

#### FR-007: Snippet desteği

Kullanıcı hazır TikZ snippet’ları ekleyebilmelidir.

Kabul kriterleri:

- Sol panelde snippet listesi olur.
- Kullanıcı snippet’e tıklayınca editöre eklenir.
- Snippet kategorileri desteklenir.

Başlangıç snippet kategorileri:

- Basic Shapes
- Nodes
- Arrows
- Graphs
- Coordinate System
- Flowcharts
- Geometry
- Trees
- Circuit Diagrams

### 11.4 Derleme

#### FR-008: Compile işlemi

Kullanıcı LaTeX/TikZ kodunu derleyebilmelidir.

Kabul kriterleri:

- Compile butonu bulunur.
- Compile sırasında loading state gösterilir.
- Başarılı derleme PDF üretir.
- Başarısız derleme log üretir.
- Compile timeout uygulanır.

#### FR-009: Compile geçmişi

Her compile işlemi kaydedilmelidir.

Kabul kriterleri:

- Status kaydedilir.
- Engine kaydedilir.
- Log kaydedilir.
- Çıktı dosyası referansı kaydedilir.
- Başlangıç ve bitiş zamanları kaydedilir.

#### FR-010: PDF preview

Derleme başarılı olduğunda PDF önizleme güncellenmelidir.

Kabul kriterleri:

- Sağ panelde PDF gösterilir.
- Zoom in/out desteklenir.
- Reload gerekmeden preview güncellenir.

### 11.5 Export

#### FR-011: PDF indirme

Kullanıcı çıktıyı PDF olarak indirebilmelidir.

Kabul kriterleri:

- Son başarılı compile çıktısı indirilebilir.
- Dosya adı proje adına göre oluşturulur.

#### FR-012: SVG/PNG export

Bu özellik MVP sonrası yapılacaktır.

Kabul kriterleri:

- PDF veya DVI çıktısından SVG üretilebilir.
- PNG export desteklenir.
- Kullanıcı çözünürlük seçebilir.

---

## 12. Non-Functional Requirements

### 12.1 Performans

- Editor page ilk yükleme süresi 2.5 saniyenin altında hedeflenmelidir.
- Compile işlemi basit TikZ dosyalarında 10 saniyenin altında tamamlanmalıdır.
- Compile timeout varsayılan 15 saniye olmalıdır.
- Büyük dosyalarda timeout ve dosya boyutu limiti uygulanmalıdır.

### 12.2 Güvenlik

LaTeX derleme güvenli bir işlem olarak kabul edilmemelidir.

Güvenlik gereksinimleri:

- Derleme Docker sandbox içinde yapılmalıdır.
- Network erişimi kapatılmalıdır.
- Shell escape kapalı olmalıdır.
- CPU limiti uygulanmalıdır.
- Memory limiti uygulanmalıdır.
- Timeout uygulanmalıdır.
- Dosya boyutu limiti uygulanmalıdır.
- Kullanıcının başka projelerine erişim engellenmelidir.
- Her compile temporary dizinde çalışmalıdır.
- Compile sonrası temporary dosyalar temizlenmelidir.

Docker güvenlik parametreleri:

```bash
docker run \
  --network none \
  --memory 256m \
  --cpus 0.5 \
  --pids-limit 64 \
  --read-only \
  --security-opt no-new-privileges \
  --cap-drop ALL
```

### 12.3 Ölçeklenebilirlik

- Compile işleri queue ile yönetilebilir olmalıdır.
- Worker sayısı yatay ölçeklenebilir olmalıdır.
- Çıktılar object storage üzerinde tutulabilir olmalıdır.
- API ve compiler worker birbirinden ayrılabilir olmalıdır.

### 12.4 Kullanılabilirlik

- Editör ekranı üç panelli olmalıdır.
- Compile hatası kullanıcı dostu gösterilmelidir.
- Şablonlar kolay erişilebilir olmalıdır.
- Kullanıcı compile durumunu net şekilde görmelidir.

---

## 13. Veri Modeli

Aşağıdaki Prisma modeli MVP için temel alınmalıdır.

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  projects  Project[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Project {
  id          String        @id @default(cuid())
  title       String
  description String?
  ownerId     String
  owner       User          @relation(fields: [ownerId], references: [id])
  files       ProjectFile[]
  compiles    CompileJob[]
  isPublic    Boolean       @default(false)
  deletedAt   DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model ProjectFile {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  path      String
  content   String   @db.Text
  language  String   @default("latex")
  isMain    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([projectId, path])
}

model CompileJob {
  id          String        @id @default(cuid())
  projectId   String
  project     Project       @relation(fields: [projectId], references: [id])
  status      CompileStatus @default(PENDING)
  engine      LatexEngine   @default(TECTONIC)
  log         String?       @db.Text
  outputUrl   String?
  errorCode   String?
  startedAt   DateTime?
  finishedAt  DateTime?
  createdAt   DateTime      @default(now())
}

model Template {
  id          String   @id @default(cuid())
  title       String
  description String?
  category    String
  content     String   @db.Text
  previewUrl  String?
  isOfficial  Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Snippet {
  id          String   @id @default(cuid())
  title       String
  description String?
  trigger     String
  category    String
  content     String   @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum CompileStatus {
  PENDING
  RUNNING
  SUCCESS
  FAILED
  TIMEOUT
}

enum LatexEngine {
  TECTONIC
  PDFLATEX
  XELATEX
  LUALATEX
}
```

---

## 14. API Tasarımı

### 14.1 Project APIs

#### `GET /api/projects`

Kullanıcının projelerini listeler.

Response:

```json
{
  "projects": [
    {
      "id": "project_id",
      "title": "My TikZ Project",
      "description": "Sample project",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    }
  ]
}
```

#### `POST /api/projects`

Yeni proje oluşturur.

Request:

```json
{
  "title": "Geometry Diagram",
  "description": "Triangle drawing"
}
```

Response:

```json
{
  "id": "project_id",
  "title": "Geometry Diagram"
}
```

#### `GET /api/projects/:projectId`

Proje detayını getirir.

#### `PATCH /api/projects/:projectId`

Proje bilgilerini günceller.

#### `DELETE /api/projects/:projectId`

Projeyi soft delete yapar.

### 14.2 File APIs

#### `GET /api/projects/:projectId/files`

Projedeki dosyaları listeler.

#### `PATCH /api/projects/:projectId/files/:fileId`

Dosya içeriğini günceller.

Request:

```json
{
  "content": "\\documentclass{standalone}\n..."
}
```

### 14.3 Compile APIs

#### `POST /api/projects/:projectId/compile`

Compile job başlatır.

Request:

```json
{
  "engine": "TECTONIC",
  "mainFileId": "file_id"
}
```

Response:

```json
{
  "jobId": "compile_job_id",
  "status": "PENDING"
}
```

#### `GET /api/compile-jobs/:jobId`

Compile durumunu getirir.

Response:

```json
{
  "id": "compile_job_id",
  "status": "SUCCESS",
  "outputUrl": "/outputs/project-id/output.pdf",
  "log": "Compile log..."
}
```

### 14.4 Template APIs

#### `GET /api/templates`

Şablonları listeler.

Query params:

- category
- search

#### `GET /api/snippets`

Snippet listesini getirir.

---

## 15. UI Bileşenleri

### 15.1 EditorLayout

Sorumluluklar:

- Üç panelli layout
- Panel resize desteği
- Mobile responsive fallback

### 15.2 CodeEditor

Sorumluluklar:

- CodeMirror entegrasyonu
- LaTeX syntax highlighting
- Snippet insert
- Autosave trigger

### 15.3 PreviewPanel

Sorumluluklar:

- PDF gösterimi
- Zoom
- Reload
- Download

### 15.4 CompileButton

Sorumluluklar:

- Compile başlatma
- Loading state
- Son compile durumu

### 15.5 CompileLogPanel

Sorumluluklar:

- Raw log gösterimi
- Hata satırlarını vurgulama
- İleri sürümde sadeleştirilmiş açıklama gösterimi

### 15.6 TemplateSidebar

Sorumluluklar:

- Template kategorileri
- Template arama
- Insert template

---

## 16. Başlangıç Şablonları

MVP’de en az şu şablonlar olmalıdır:

1. Basic Line and Arrow
2. Rectangle Node
3. Circle Node
4. Flowchart
5. Coordinate Plane
6. Function Plot
7. Triangle Geometry
8. Directed Graph
9. Tree Diagram
10. Simple Neural Network Diagram

Örnek şablon:

```latex
\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}

\begin{document}

\begin{tikzpicture}
  \node[draw, rounded corners] (start) at (0,0) {Start};
  \node[draw, rounded corners] (process) at (0,-1.5) {Process};
  \node[draw, rounded corners] (end) at (0,-3) {End};

  \draw[->] (start) -- (process);
  \draw[->] (process) -- (end);
\end{tikzpicture}

\end{document}
```

---

## 17. Codex İçin Uygulama Görevleri

### Task 1 — Proje kurulumu

```txt
Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma ve PostgreSQL destekli başlangıç projesini kur.

Beklenenler:
- App Router yapısı
- src/ dizin yapısı
- Tailwind config
- shadcn/ui kurulumu
- Prisma kurulumu
- .env.example dosyası
- temel README
```

### Task 2 — Prisma schema oluştur

```txt
PRD’deki User, Project, ProjectFile, CompileJob, Template ve Snippet modellerini Prisma schema içine ekle.

Beklenenler:
- schema.prisma güncellensin
- migration oluşturulsun
- seed script hazırlansın
- başlangıç snippet ve template kayıtları eklensin
```

### Task 3 — Dashboard ekranı

```txt
Kullanıcının projelerini listeleyen dashboard ekranını oluştur.

Beklenenler:
- /dashboard route
- proje kartları
- yeni proje modalı
- arama alanı
- loading ve empty state
```

### Task 4 — Editor layout

```txt
TikZ editörü için üç panelli layout oluştur.

Beklenenler:
- /projects/[projectId]/editor route
- sol sidebar
- orta code editor alanı
- sağ preview/log paneli
- responsive tasarım
```

### Task 5 — CodeMirror entegrasyonu

```txt
CodeMirror 6 ile LaTeX editör bileşeni oluştur.

Beklenenler:
- syntax highlighting
- controlled value
- onChange
- autosave debounce
- snippet insert fonksiyonu
```

### Task 6 — Compile API

```txt
/api/projects/[projectId]/compile endpoint’ini oluştur.

Beklenenler:
- kullanıcının proje yetkisi kontrol edilsin
- main.tex içeriği alınsın
- CompileJob oluşturulsun
- compiler worker’a job gönderilsin veya MVP için doğrudan compile çalışsın
```

### Task 7 — Compiler worker

```txt
LaTeX/TikZ kodunu Docker sandbox içinde derleyen compiler worker oluştur.

Beklenenler:
- temporary working directory
- input.tex oluşturma
- tectonic veya pdflatex çalıştırma
- timeout
- log capture
- output.pdf üretimi
- hata durumunda log dönme
```

### Task 8 — PDF preview

```txt
Derleme sonucu oluşan PDF’i editor ekranında göster.

Beklenenler:
- sağ panelde PDF preview
- loading state
- error state
- download button
```

### Task 9 — Snippet paneli

```txt
TikZ snippet paneli oluştur.

Beklenenler:
- kategori listesi
- snippet listesi
- tıklayınca editöre kod ekleme
```

### Task 10 — Template galerisi

```txt
Template galerisi oluştur.

Beklenenler:
- template kategorileri
- template preview
- template’den yeni proje oluşturma
- mevcut editöre template insert etme
```

---

## 18. Önerilen Repo Yapısı

Monorepo önerisi:

```txt
tikzlab/
  apps/
    web/
      src/
        app/
        components/
        features/
        lib/
        server/
  packages/
    editor/
    compiler-types/
    templates/
    shared/
  services/
    compiler-worker/
  prisma/
    schema.prisma
    seed.ts
  docker/
    compiler/
      Dockerfile
  README.md
  package.json
  pnpm-workspace.yaml
```

Basitleştirilmiş tek uygulama yapısı:

```txt
src/
  app/
    dashboard/
    projects/
      [projectId]/
        editor/
    api/
  components/
    ui/
  features/
    editor/
    projects/
    compile/
    templates/
    snippets/
  lib/
    prisma.ts
    auth.ts
  server/
    project-service.ts
    compile-service.ts
prisma/
  schema.prisma
```

---

## 19. Yetkilendirme Kuralları

- Kullanıcı sadece kendi projelerini görebilir.
- Kullanıcı sadece kendi projelerini düzenleyebilir.
- Public projeler sadece okunabilir paylaşılabilir.
- Compile işlemi sadece proje sahibi tarafından başlatılabilir.
- Admin kullanıcılar official template/snippet yönetebilir.

---

## 20. Compile Güvenlik Politikası

Her compile job için:

- Yeni temporary directory oluştur.
- Sadece ilgili proje dosyalarını bu dizine kopyala.
- Derleme komutunu shell escape kapalı çalıştır.
- Maksimum çalışma süresi uygula.
- Maksimum çıktı dosyası boyutu uygula.
- Network erişimini kapat.
- Compile sonrası dizini temizle.

Varsayılan limitler:

```env
COMPILE_TIMEOUT_SECONDS=15
COMPILE_MEMORY_LIMIT_MB=256
COMPILE_CPU_LIMIT=0.5
MAX_SOURCE_SIZE_KB=512
MAX_OUTPUT_SIZE_MB=10
```

---

## 21. Hata Yönetimi

Compile hata tipleri:

- TIMEOUT
- LATEX_SYNTAX_ERROR
- MISSING_PACKAGE
- MISSING_FILE
- SECURITY_BLOCKED
- UNKNOWN_ERROR

API hata formatı:

```json
{
  "error": {
    "code": "LATEX_SYNTAX_ERROR",
    "message": "LaTeX compile failed.",
    "details": {
      "line": 12,
      "rawLog": "..."
    }
  }
}
```

---

## 22. Başarı Metrikleri

MVP sonrası izlenecek metrikler:

- Günlük aktif kullanıcı
- Kullanıcı başına proje sayısı
- Compile başarı oranı
- Ortalama compile süresi
- En çok kullanılan snippet kategorileri
- En çok kullanılan template’ler
- İlk projeyi oluşturma oranı
- İlk başarılı compile oranı
- PDF export sayısı

---

## 23. Riskler

### 23.1 Teknik Riskler

- LaTeX derleme güvenlik riski oluşturabilir.
- TikZ compile süresi uzun olabilir.
- Tectonic bazı paketlerde beklenen davranışı vermeyebilir.
- PDF preview büyük dosyalarda yavaş olabilir.
- Docker sandbox üretim ortamında karmaşıklaşabilir.

### 23.2 Ürün Riskleri

- Genel LaTeX editörleriyle rekabet zor olabilir.
- TikZ nişi dar kalabilir.
- Kullanıcılar sürükle-bırak editör bekleyebilir.
- İlk sürümde AI olmaması cazibeyi azaltabilir.

### 23.3 Azaltma Stratejileri

- Genel LaTeX yerine TikZ odaklı konumlan.
- Şablon ve snippet deneyimini güçlü yap.
- Hata açıklayıcıyı erken ekle.
- Öğretmen/akademisyen kullanım senaryolarına odaklan.
- Compile güvenliğini MVP’den itibaren ciddiye al.

---

## 24. MVP Çıkış Kriterleri

MVP tamamlanmış sayılması için:

1. Kullanıcı hesap oluşturup giriş yapabiliyor.
2. Yeni TikZ projesi oluşturabiliyor.
3. `main.tex` dosyasını düzenleyebiliyor.
4. TikZ kodunu derleyebiliyor.
5. Başarılı derlemede PDF preview görebiliyor.
6. Hatalı derlemede log görebiliyor.
7. Hazır snippet ekleyebiliyor.
8. Hazır template’den proje başlatabiliyor.
9. PDF indirebiliyor.
10. Kullanıcı sadece kendi projelerine erişebiliyor.

---

## 25. Codex’e Verilecek İlk Ana Prompt

```txt
We are building TikZLab, a Next.js App Router based TikZ-focused LaTeX editor.

Read the PRD in /docs/PRD.md and implement the MVP foundation.

Use:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- CodeMirror 6
- Zustand
- TanStack Query

Your first task:
1. Create the initial project structure.
2. Add Prisma schema for User, Project, ProjectFile, CompileJob, Template and Snippet.
3. Create seed data for basic TikZ snippets and templates.
4. Create dashboard route.
5. Create editor route with three-pane layout.
6. Add placeholder CodeMirror editor component.
7. Add placeholder PDF preview panel.
8. Add README with setup instructions.

Do not implement the Docker compiler yet.
Keep code modular and feature-based.
Avoid using any type.
Add proper TypeScript types.
```

---

## 26. Codex İçin İkinci Prompt: Compiler

```txt
Implement the compiler MVP for TikZLab.

Requirements:
1. Add /api/projects/[projectId]/compile route.
2. Validate project ownership.
3. Read the main ProjectFile.
4. Create a CompileJob record.
5. Compile the LaTeX source using a local compiler adapter.
6. Store compile log and output path.
7. Return job status and output URL.
8. Add compiler abstraction so we can support TECTONIC, PDFLATEX, XELATEX and LUALATEX later.
9. Add timeout handling.
10. Add useful error codes.

For now, implement the compiler adapter in a way that can later be moved to a separate worker service.
```

---

## 27. Codex İçin Üçüncü Prompt: Docker Sandbox

```txt
Implement Docker-based sandbox compilation for TikZLab.

Requirements:
1. Create docker/compiler/Dockerfile.
2. Add a compiler worker script.
3. The worker should receive source content and compile it in a temporary directory.
4. Disable network access.
5. Enforce timeout.
6. Capture stdout/stderr.
7. Return output.pdf and compile.log.
8. Clean temporary files after completion.
9. Add documentation for local development.
10. Make sure shell escape is disabled.

Security is important. Do not run untrusted LaTeX directly on the host.
```

---

## 28. Geliştirme Sırası

Önerilen sıra:

1. Repo iskeleti
2. Prisma schema
3. Dashboard
4. Editor layout
5. CodeMirror
6. Template/snippet sistemi
7. Compile API
8. PDF preview
9. Docker sandbox
10. Hata açıklayıcı

---

## 29. Notlar

Bu PRD, `/docs/PRD.md` olarak repoya eklenmelidir. Codex görevleri bu belgeye referans vererek küçük, test edilebilir ve adım adım uygulanabilir şekilde verilmelidir.
