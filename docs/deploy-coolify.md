# TikZ Studio'yu Coolify'a kurma (Hostinger VPS)

Bu rehber, TikZ Studio'yu Hostinger VPS üzerinde çalışan **Coolify v4**'e kurmayı anlatır. Sunucu hiçbir şey derlemez: GitHub Actions uygulama ve LaTeX derleyici imajlarını **ghcr.io**'ya yayınlar, Coolify bunları çeker.

> Coolify ekranlarındaki menü adları sürüme göre biraz farklı olabilir; adımların mantığı aynıdır.

## Mimari

```text
GitHub (master'a merge)
  └─ Actions "Release images"
       ├─ ghcr.io/yucel-yilmaz/tikzstudio            (uygulama, her merge'de)
       ├─ ghcr.io/yucel-yilmaz/tikzstudio-compiler   (LaTeX sandbox, yalnızca docker/compiler değişince)
       └─ (isteğe bağlı) Coolify deploy webhook'u
Coolify (Hostinger VPS) — docker-compose.coolify.yml
  ├─ app             Next.js + derleme kuyruğu, port 3000, /api/health
  ├─ db              PostgreSQL 16 (kalıcı volume)
  └─ compiler-image  derleyici imajını sunucuda hazır tutar (ağsız, boşta bekler)
```

Uygulama her derleme için sunucunun Docker'ı üzerinden kısa ömürlü, **ağsız ve salt okunur** bir derleme konteyneri başlatır. Bu yüzden `/var/run/docker.sock` uygulama konteynerine bağlanır (güvenlik notlarına bakın).

## 1. Önkoşullar

- **Sunucu:** Coolify kurulu bir Hostinger **KVM VPS**. Önerilen kaynaklar: en az 2 vCPU, 4 GB RAM ve 25 GB boş disk (derleyici imajı yaklaşık 1,5 GB).
- **Alan adı:** Bir alan adı ya da alt alan adı (ör. `tikz.okulunuz.com`). Bunun için VPS IP'sine yönlenen bir **A kaydı** gerekir.
- **E-posta (önerilir):** Bir SMTP hesabı; Brevo, Resend, Mailgun ya da kurumunuzun SMTP sunucusu olabilir. SMTP olmadan şifre sıfırlama ve e-posta doğrulama çalışmaz; e-postalar yalnızca sunucu günlüğüne yazılır.

## 2. İmajların yayınlanması (GitHub)

1. `master`'a yapılan her merge'de **Actions → Release images** iş akışı çalışır. İlk çalıştırmada derleyici imajı da inşa edilir; bu 15–30 dakika sürebilir.
2. İlk yayından sonra GitHub'da profilinizden **Packages** sayfasına gidin. `tikzstudio` ve `tikzstudio-compiler` paketlerinin her birinde **Package settings → Change visibility → Public** yapın.
   - Paketleri özel tutmak isterseniz: VPS'e SSH ile bağlanıp `read:packages` yetkili bir GitHub token'ı ile `docker login ghcr.io` çalıştırın.
   - Derleyici imajını hem Coolify hem de uygulamanın kendisi çeker; bu yüzden giriş **sunucuda** yapılmalıdır.
3. Derleyici imajını elle yeniden inşa etmek için: **Actions → Release images → Run workflow → "Also rebuild the LaTeX compiler image"**.

## 3. Coolify'da kaynağı oluşturma

1. **Projects → (projeniz) → + New → Public Repository**.
2. Depo adresi olarak `https://github.com/yucel-yilmaz/tikzstudio` girin, dal olarak `master` seçin.
3. **Build Pack:** `Docker Compose`.
4. **Docker Compose Location:** `/docker-compose.coolify.yml`. Normal `docker-compose.yml` dosyası yerel geliştirme içindir; onu seçmeyin.
5. Kaydedin. Coolify compose dosyasını okuyup `app`, `db` ve `compiler-image` servislerini listeler.

## 4. Alan adı

- `app` servisinin **Domains** alanına alan adınızı port ile birlikte yazın: `https://tikz.okulunuz.com:3000`. Port, konteynerin iç portudur; Coolify dışarıya 443 üzerinden HTTPS sunar ve sertifikayı kendisi alır.
- Alan adı girmezseniz Coolify kendi joker alan adından bir adres üretir (`SERVICE_URL_APP_3000`).
- Giriş sistemi bu adresi `BETTER_AUTH_URL` olarak kullanır. **Alan adını değiştirdiğinizde yeniden dağıtın**, aksi halde giriş "geçersiz origin" hatası verir.

## 5. Ortam değişkenleri

**Environment Variables** sekmesinde şu değişkenler görünür:

| Değişken | Ne yapmalı |
| --- | --- |
| `SERVICE_PASSWORD_POSTGRES`, `SERVICE_BASE64_64_AUTHSECRET` | Coolify otomatik üretir ve saklar. **Değiştirmeyin.** Gizli anahtar değişirse tüm oturumlar kapanır. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | E-posta sağlayıcınızın bilgileri. Port 465 ise `SMTP_SECURE=true` yapın. `MAIL_FROM` örneği: `TikZ Studio <no-reply@okulunuz.com>`. |
| `REQUIRE_EMAIL_VERIFICATION` | `auto` (varsayılan): SMTP varsa doğrulama zorunludur. Zorlamak veya kapatmak için `true` ya da `false`. |
| `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET` | İsteğe bağlı OAuth girişi. Geri dönüş adresi: `https://<alan-adınız>/api/auth/callback/github` (veya `/google`). |
| `COMPILE_TIMEOUT_SECONDS`, `COMPILE_MEMORY_LIMIT_MB`, `COMPILE_CPU_LIMIT` | Derleme sınırları; varsayılanlar 15 s, 256 MB ve 0,5 CPU. Uzun belgeler için süreyi artırabilirsiniz. |
| `APP_IMAGE`, `COMPILER_IMAGE` | Belirli bir sürüme sabitlemek için, ör. `ghcr.io/yucel-yilmaz/tikzstudio:sha-abc1234`. Boş bırakılırsa `latest` kullanılır. |

## 6. İlk dağıtım ve kontrol

1. **Deploy**'a basın. İlk açılışta veritabanı tabloları oluşturulur ve 34 resmi şablon yüklenir.
2. `https://<alan-adınız>/api/health` adresi `{"status":"ok"}` dönmelidir.
3. Bir hesap oluşturun, **Öğretici** şablonundan proje açıp **Derle**'ye basın. PDF birkaç saniyede gelmelidir.

## 7. Otomatik dağıtım (isteğe bağlı)

Hedef: `master`'a merge → imajlar yayınlanır → Coolify yeni imajları çekip yeniden başlatır.

1. Coolify'da kaynağın **Webhooks** bölümünden **Deploy Webhook** adresini kopyalayın.
2. **Keys & Tokens → API tokens** altında *deploy* yetkili bir token oluşturun.
3. GitHub deposunda **Settings → Secrets and variables → Actions** sayfasına şu iki secret'ı ekleyin:
   - `COOLIFY_WEBHOOK_URL`: webhook adresi
   - `COOLIFY_API_TOKEN`: token
4. Coolify'ın depoya yapılan her push'ta kendisi dağıtım yapma ayarı varsa kapatın. Aksi halde imajlar hazır olmadan eski imajla dağıtım yapabilir; tetiklemeyi Actions yapar.

Secret'lar tanımlı değilse iş akışı dağıtım adımını atlar; o zaman Coolify'da **Redeploy**'a elle basarsınız.

## 8. Güvenlik notları

- **Docker soketi:** `/var/run/docker.sock` bağlantısı, uygulama ele geçirilirse sunucunun da ele geçirilebileceği anlamına gelir. Derleme konteynerleri ağsız, salt okunur, yetkisiz ve kaynak sınırlıdır, LaTeX `-no-shell-escape` ile çalışır; yine de:
  - TikZ Studio'yu kritik başka servislerle **aynı VPS'te** çalıştırmamanızı öneririz.
  - Coolify'ı ve imajları güncel tutun; merge'ler otomatik yeni imaj üretir.
  - İleride derlemeyi ayrı bir worker'a ya da gVisor (`runsc`) gibi bir sandbox çalışma ortamına taşımak bu riski büyük ölçüde azaltır.
- **Güvenlik duvarı:** Hostinger panelinden yalnızca 22 (SSH), 80, 443 ve Coolify paneli için 8000 portlarını açık tutun. Postgres dışarıya açılmaz.
- **İstek sınırları:** Giriş ve e-posta uç noktalarında IP başına sınır vardır. Coolify'ın proxy'si (Traefik) gerçek istemci IP'sini `X-Forwarded-For` ile iletir.

## 9. Yedekleme

- **Kalıcı veriler:** `pgdata` (bütün kullanıcılar ve projeler), `template-previews` ve `compile-artifacts` volume'larında durur. Derleme çıktıları yeniden üretilebilir.
- **Düzenli yedek:** Hostinger panelinden **otomatik VPS anlık görüntüsü (snapshot)** açın. Ek olarak Coolify'ın zamanlanmış görevleriyle `pg_dump` yedeği alıp sunucu dışına kopyalayın.

## 10. Sorun giderme

| Belirti | Olası neden ve çözüm |
| --- | --- |
| Derleme hemen "Unable to find image" ile başarısız | Derleyici imajı çekilemiyor. Paketin public olduğunu ya da sunucuda `docker login ghcr.io` yapıldığını kontrol edin, sonra **Redeploy**. |
| Girişte "Invalid origin" / giriş olmuyor | Alan adı değişti ama dağıtım yenilenmedi. Yeniden dağıtın ve tarayıcıda aynı alan adını kullandığınızdan emin olun. |
| Şifre sıfırlama e-postası gelmiyor | `SMTP_*` değerlerini ve sağlayıcınızın gönderici alan adı doğrulamasını (SPF/DKIM) kontrol edin. Hata ayrıntısı `app` günlüğündedir. |
| `app` sağlıksız (unhealthy) | `app` günlüğüne bakın. Çoğunlukla veritabanı henüz hazır değildir ya da `SERVICE_PASSWORD_POSTGRES` değiştirilmiştir. |
| Uzun belgeler zaman aşımına uğruyor | `COMPILE_TIMEOUT_SECONDS` değerini artırın. Sunucu zayıfsa `COMPILE_CPU_LIMIT`'i 1 yapın. |
