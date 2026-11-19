import type { HelpArticle } from "@/features/help/content/types";

export const troubleshooting: HelpArticle = {
	slug: "sorun-giderme",
	title: "Sorun giderme",
	summary:
		"Sık görülen LaTeX hataları ne anlama gelir; eksik paket, zaman aşımı, derleme sınırı ve boş önizleme nasıl çözülür?",
	icon: "wrench",
	keywords: [
		"hata",
		"error",
		"undefined control sequence",
		"not found",
		"bulunamadı",
		"missing",
		"zaman aşımı",
		"timeout",
		"çok fazla derleme",
		"boş önizleme",
		"pgfkeys",
	],
	blocks: [
		{
			type: "p",
			text: "Derleme **Başarısız** olduğunda önce **Derleme günlüğü**ne bakın. `!` ile başlayan ilk satır asıl hatadır; sonraki hatalar çoğu zaman ilkinin sonucudur. `l.15` gibi bir ifade hatanın bulunduğu satırı gösterir ve editörde o satırın yanında kırmızı bir işaret çıkar.",
		},
		{
			type: "callout",
			tone: "tip",
			text: "Her zaman **en üstteki** hatayı düzeltip yeniden derleyin. Tek bir eksik `}` onlarca hata satırına yol açabilir.",
		},
		{ type: "h2", id: "sik-hatalar", text: "Sık görülen hatalar" },
		{
			type: "table",
			head: ["Günlükteki mesaj", "Anlamı ve çözümü"],
			rows: [
				[
					"`Undefined control sequence`",
					"Komut adı yanlış yazılmış (`\\drw`, `\\nod`) ya da komutu sağlayan paket yüklenmemiş. Satırdaki komutun yazımını ve gerekli `\\usepackage` satırını kontrol edin.",
				],
				[
					"`File 'xyz.sty' not found`",
					"Paket bulunamadı. Tectonic'te bu paket önbellekte yoktur: motoru **pdfLaTeX** yapıp yeniden deneyin. Kendi `.sty` dosyanızsa projeye yüklediğinizden emin olun.",
				],
				[
					"`I did not find the tikz library 'xyz'`",
					"TikZ kütüphanesinin adı yanlış ya da Tectonic'te önbellekte yok. Adını kontrol edin, sonra **pdfLaTeX** ile deneyin.",
				],
				[
					"`Environment tikzpicture undefined`",
					"Önsözde `\\usepackage{tikz}` eksik.",
				],
				[
					"`I do not know the key '/tikz/...'`",
					"Seçenek adı yanlış yazılmış (ör. `colour=red`) ya da gerekli kütüphane yüklenmemiş (ör. `-Stealth` okları için `\\usetikzlibrary{arrows.meta}`). Türkçe `babel` kullanıyorsanız [Türkçe belgeler](/yardim/turkce-belgeler) sayfasındaki ayarı yapın.",
				],
				[
					"`Missing $ inserted`",
					"`x^2`, `\\alpha` gibi matematik ifadeleri `$...$` dışında yazılmış. Düğüm metninde de `{$x^2$}` biçimini kullanın.",
				],
				[
					"`Missing } inserted`, `Extra }`, `File ended while scanning`",
					"Süslü parantezler dengeli değil. Açılan her `{` için bir `}` olmalı.",
				],
				[
					"`Emergency stop` / `no legal \\end found`",
					"`\\end{document}` satırı eksik ya da bir ortam (`\\begin{...}`) kapatılmamış.",
				],
				[
					"`Can be used only in preamble`",
					"`\\usepackage` veya `\\usetikzlibrary` satırı `\\begin{document}` sonrasına yazılmış; önsöze taşıyın.",
				],
				[
					"`No shape named 'A' is known`",
					"`(A)` adıyla başvurduğunuz düğüm tanımlanmamış ya da adı farklı yazılmış (büyük-küçük harf önemlidir).",
				],
				[
					"`Dimension too large`",
					"Çizilen değerler çok büyük (ör. `1/x` sıfır yakınında). Grafiğin `domain` aralığını daraltın veya `y` değerlerini sınırlayın.",
				],
				[
					"`Ana dosya bulunamadı.`",
					"Projede derlenecek dosya yok. **Dosyalar** panelinden bir `.tex` dosyası oluşturup **Ana dosya yap** seçin.",
				],
			],
		},
		{
			type: "h2",
			id: "eksik-paket",
			text: "Tectonic'te eksik paket veya kütüphane",
		},
		{
			type: "p",
			text: 'Tectonic hızlıdır ama yalnızca derleme ortamında önceden hazırlanmış paketleri kullanabilir ve internete çıkamaz. Yerel bilgisayarınızda çalışan bir belge burada "not found" hatası verebilir. Çözüm:',
		},
		{
			type: "list",
			ordered: true,
			items: [
				"Üst çubuktaki motor seçiminden **pdfLaTeX**'i seçin.",
				"Yeniden **Derle**'ye basın.",
				"Belgeniz `fontspec` kullanıyorsa **XeLaTeX**, `biblatex` kullanıyorsa **pdfLaTeX + Biber** seçin.",
			],
		},
		{
			type: "p",
			text: "pdfLaTeX'te de bulunamayan paketler derleme ortamına kurulu değildir. Bu durumda paketin `.sty` dosyasını projeye yükleyebilir veya sunucu yöneticisinden eklemesini isteyebilirsiniz.",
		},
		{ type: "h2", id: "zaman-asimi", text: "Zaman aşımı" },
		{
			type: "p",
			text: "Bir derleme yaklaşık 12 saniyeden uzun sürerse durdurulur ve durum **Zaman aşımı** olur. Sık nedenleri:",
		},
		{
			type: "list",
			items: [
				"Grafiklerde çok yüksek `samples` değeri. Çoğu eğri için `samples=50` ile `100` arası yeterlidir.",
				"Çok büyük `\\foreach` döngüleri veya iç içe döngüler.",
				"Uzun, çok sayfalı belgeler. Tek tek şekilleri ayrı `standalone` dosyalarda hazırlamak daha hızlıdır.",
				"Sonsuz döngüye giren bir makro.",
			],
		},
		{
			type: "code",
			title: "Daha hızlı bir grafik",
			code: String.raw`% Yavaş:  samples=2000
\draw[domain=-3:3, samples=80, smooth, variable=\x] plot ({\x}, {sin(\x r)});`,
		},
		{
			type: "h2",
			id: "derleme-siniri",
			text: '"Çok fazla derleme isteği" uyarısı',
		},
		{
			type: "p",
			text: "Dakikada en fazla 5 derleme yapabilirsiniz. Bu uyarıyı görürseniz bir dakika bekleyin. Her küçük değişiklikten sonra derlemek yerine birkaç değişikliği birlikte yapıp sonra derleyin.",
		},
		{ type: "h2", id: "bos-onizleme", text: "Önizleme boş veya hatalı" },
		{
			type: "list",
			items: [
				'**"Henüz önizleme yok"** yazıyorsa proje henüz başarıyla derlenmemiştir. Durum rozetine bakın: **Başarısız** ise günlükteki hatayı düzeltin.',
				"Derleme **Başarılı** ama sayfa boşsa belgenizde görünür bir içerik olmayabilir (ör. boş bir `tikzpicture`) ya da çizim sayfanın dışına taşmış olabilir. `standalone` belge sınıfı sayfayı çizime göre kırpar.",
				'**"PDF yüklenemedi"** yazıyorsa veya gri bir kutu görüyorsanız sayfayı yenileyin (Ctrl+Shift+R, Mac\'te Cmd+Shift+R). Eski derleme dosyaları 24 saat sonra silinir; yeniden derleyin.',
			],
		},
		{ type: "h2", id: "diger", text: "Diğer sorunlar" },
		{
			type: "list",
			items: [
				"**Kaydedilemedi** rozeti: bağlantınız kopmuş olabilir. Kodunuzu bir yere kopyalayın, sayfayı yenileyin ve tekrar yapıştırın.",
				"**Dosya yüklenmiyor**: dosya 5 MB'tan büyük olabilir. Dosya adındaki boşluklar otomatik olarak tireye çevrilir; Türkçe harfler korunur. Bkz. [Projeler ve dosyalar](/yardim/projeler-ve-dosyalar#sinirlar).",
				"**`\\input` ile çağırdığım dosya bulunamıyor**: yol proje köküne göre yazılmalıdır (`sekiller/ucgen.tex`); dosya adının harfi harfine (büyük/küçük harf dahil) aynı olduğundan emin olun.",
			],
		},
	],
};

export const faq: HelpArticle = {
	slug: "sss",
	title: "Sıkça sorulan sorular",
	summary:
		"Kurulum, dosyaların saklanması, Overleaf'ten taşıma, birlikte çalışma ve daha fazlası hakkında kısa cevaplar.",
	icon: "help",
	keywords: [
		"sss",
		"soru",
		"overleaf",
		"zip",
		"birlikte",
		"beamer",
		"pgfplots",
		"word",
	],
	blocks: [
		{
			type: "faq",
			items: [
				{
					question: "Bilgisayarıma LaTeX kurmam gerekiyor mu?",
					answer: [
						"Hayır. Bütün derleme sunucuda yapılır; yalnızca güncel bir tarayıcı yeterlidir.",
					],
				},
				{
					question: "Çalışmalarım nerede saklanır?",
					answer: [
						"Projeleriniz ve dosyalarınız bu TikZ Studio sunucusunun veritabanında saklanır ve otomatik olarak kaydedilir. Önemli çıktılarınızın PDF'ini düzenli olarak indirmenizi öneririz.",
					],
				},
				{
					question:
						"Overleaf veya bilgisayarımdaki bir projeyi taşıyabilir miyim?",
					answer: [
						"Evet. Overleaf'te **Menü → Kaynak dosyalarını indir** ile projeyi `.zip` olarak indirin (bilgisayarınızdaki bir klasörü de `.zip` yapabilirsiniz), sonra panelde **İçe aktar (.zip)** düğmesine tıklayın. Bütün dosyalar (görseller, `.bib` ve `.sty` dahil) yeni bir projeye aktarılır ve `\\documentclass` içeren dosya ana dosya olarak seçilir.",
						"Sınırlar: ZIP en fazla 20 MB, en fazla 300 dosya, dosya başına 5 MB. `.aux`, `.log` gibi derleme artıkları ve gizli dosyalar atlanır. Adında boşluk olan dosyalar tireyle yeniden adlandırılır; bu durumda içe aktarma sonrası uyarıda belirtilir ve belgedeki yolları güncellemeniz gerekir.",
						"Ters yönde: proje ayarları panelindeki **.zip olarak indir** ile bütün dosyaları indirip Overleaf'e veya kendi LaTeX kurulumunuza aktarabilirsiniz.",
					],
				},
				{
					question: "Başkalarıyla aynı projede birlikte çalışabilir miyim?",
					answer: [
						"Gerçek zamanlı birlikte düzenleme henüz yok. Projenizi **Herkese açık** yapıp bağlantısını paylaşabilirsiniz; karşı taraf **Kendi projelerime kopyala** ile kendi kopyasını alır. Bkz. [Paylaşma](/yardim/paylasma).",
					],
				},
				{
					question: "Şekillerimi Word veya PowerPoint'e nasıl eklerim?",
					answer: [
						"**PNG indir** ile 300 DPI bir görsel alın ve belgenize ekleyin. Kalite kaybı olmadan büyütmek istiyorsanız **SVG indir**'i kullanın.",
					],
				},
				{
					question:
						"pgfplots, tkz-euclide, tikz-cd veya Beamer kullanabilir miyim?",
					answer: [
						"Evet. Resmi şablonlarda bu paketlerin hepsiyle hazırlanmış örnekler var ve Tectonic ile çalışırlar. Resmi şablonlarda olmayan bir paket Tectonic'te hata verirse **pdfLaTeX**'e geçin.",
					],
				},
				{
					question: "Çok sayfalı belge (ders notu, tez) hazırlayabilir miyim?",
					answer: [
						"Evet. Önizleme bütün sayfaları alt alta gösterir (ilk 30 sayfa); belgenin tamamı için **PDF indir**'i kullanın. PNG ve SVG yalnızca ilk sayfadan üretilir. Uzun belgelerde bölümleri ayrı dosyalara bölüp `\\input` ile çağırmak düzeni kolaylaştırır.",
					],
				},
				{
					question: "Motor seçimim kaydediliyor mu?",
					answer: [
						"Evet. Üst çubukta seçtiğiniz motor projeyle birlikte saklanır ve projeyi bir sonraki açışınızda aynı motorla devam edersiniz.",
					],
				},
				{
					question: "Şifremi unuttum, ne yapmalıyım?",
					answer: [
						"Giriş sayfasındaki **Şifremi unuttum** bağlantısına tıklayın ve e-posta adresinizi girin. Gelen bağlantı 1 saat geçerlidir ve bir kez kullanılabilir. Şifreniz değişince diğer cihazlardaki oturumlarınız kapatılır.",
						"E-posta gelmiyorsa istenmeyen (spam) klasörüne bakın. Sunucu yöneticisi e-posta gönderimini yapılandırmamışsa sıfırlama bağlantısı gönderilemez; bu durumda yöneticiye başvurun.",
					],
				},
				{
					question: "Telefondan kullanabilir miyim?",
					answer: [
						"Evet, ekran telefonda alt alta düzenlenir. Kısa düzeltmeler ve önizleme için uygundur; uzun yazım için bilgisayar daha rahattır.",
					],
				},
				{
					question: "Öğreticiyi yeniden nasıl görürüm?",
					answer: [
						"Panelde veya editörde **Yardım** menüsünden **Öğreticiyi başlat**'ı seçin ya da [Başlarken](/yardim/baslarken#ogretici) sayfasındaki düğmeyi kullanın.",
					],
				},
			],
		},
	],
};
