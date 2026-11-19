import type { HelpArticle } from "@/features/help/content/types";

export const compilingAndEngines: HelpArticle = {
	slug: "derleme-ve-motorlar",
	title: "Derleme ve motorlar",
	summary:
		"Derle düğmesi nasıl çalışır, beş motor arasındaki farklar nelerdir ve hangisini ne zaman seçmelisiniz?",
	icon: "play",
	keywords: [
		"tectonic",
		"pdflatex",
		"xelatex",
		"lualatex",
		"biber",
		"biblatex",
		"kaynakça",
		"fontspec",
		"yazı tipi",
		"sınır",
		"zaman aşımı",
	],
	blocks: [
		{ type: "h2", id: "derle", text: "Derle düğmesi" },
		{
			type: "p",
			text: "**Derle**'ye bastığınızda projeniz güvenli, internete kapalı bir derleme ortamına gönderilir. Durum rozeti sırasıyla **Sırada**, **Derleniyor…** ve sonunda **Başarılı**, **Başarısız** veya **Zaman aşımı** gösterir. Başarılı bir derlemeden sonra PDF önizlemede açılır.",
		},
		{
			type: "list",
			items: [
				"Derlenen dosya her zaman projenin **ana dosyasıdır** (dosya ağacında işaretli olan). `sekiller/ucgen.tex` gibi bir parça dosyasını düzenlerken de doğrudan **Derle**'ye basabilirsiniz.",
				"**Derle**, kaydedilmemiş değişiklikleri (tüm açık dosyalarda) önce kaydeder; yani her zaman ekranda gördüğünüz hali derlenir.",
			],
		},
		{ type: "h2", id: "motorlar", text: "Hangi motoru seçmeliyim?" },
		{
			type: "table",
			head: ["Motor", "Ne zaman?", "Not"],
			rows: [
				[
					"**Tectonic** (varsayılan)",
					"TikZ çizimleri, grafikler, şablonların çoğu.",
					"Hızlıdır ama yalnızca önceden önbelleğe alınmış paketleri kullanabilir. Eksik bir paket veya TikZ kütüphanesi hata verir.",
				],
				[
					"**pdfLaTeX**",
					"Tectonic'te bulunmayan bir paket gerektiğinde; klasik LaTeX belgeleri.",
					"Geniş bir TeX Live paket seçimini (latex-extra, pictures, science, Avrupa dilleri…) kullanır; paket desteği Tectonic'ten çok daha geniştir.",
				],
				[
					"**XeLaTeX**",
					"Bilgisayarınızdaki gibi OpenType/TrueType yazı tipleri (`fontspec`) kullanmak istediğinizde.",
					"Unicode metni doğrudan işler.",
				],
				[
					"**LuaLaTeX**",
					"`fontspec` ile yazı tipi ayarları veya Lua ile hesaplama gerektiğinde.",
					"Genellikle diğerlerinden biraz yavaştır.",
				],
				[
					"**pdfLaTeX + Biber**",
					"`biblatex` ile kaynakça (bibliyografya) içeren makale ve tezler.",
					"Belge dört kez işlenir (pdfLaTeX → Biber → pdfLaTeX → pdfLaTeX), bu yüzden daha uzun sürer.",
				],
			],
		},
		{
			type: "callout",
			tone: "tip",
			title: "Kısa kural",
			text: 'Önce **Tectonic** ile deneyin. "bulunamadı" (not found) türünde bir paket veya kütüphane hatası alırsanız **pdfLaTeX**\'e geçin. Kaynakçanız varsa **pdfLaTeX + Biber** seçin.',
		},
		{
			type: "p",
			text: "Seçtiğiniz motor projeyle birlikte kaydedilir; projeyi bir sonraki açışınızda (başka bir cihazda da) aynı motorla devam edersiniz. Bir şablondan oluşturulan proje, şablonun motoruyla başlar.",
		},
		{ type: "h2", id: "biber", text: "Kaynakça örneği (pdfLaTeX + Biber)" },
		{
			type: "p",
			text: "Projeye bir `kaynaklar.bib` dosyası ekleyin ve ana dosyada `biblatex` paketini `backend=biber` ile yükleyin:",
		},
		{
			type: "code",
			title: "main.tex",
			code: String.raw`\documentclass{article}
\usepackage[backend=biber,style=authoryear]{biblatex}
\addbibresource{kaynaklar.bib}
\begin{document}
TikZ, PGF üzerine kurulmuştur \parencite{tantau2023}.
\printbibliography
\end{document}`,
		},
		{
			type: "code",
			title: "kaynaklar.bib",
			code: `@manual{tantau2023,
  author = {Till Tantau},
  title  = {The TikZ and PGF Packages},
  year   = {2023}
}`,
		},
		{
			type: "callout",
			tone: "warning",
			text: "`\\bibliography{...}` ve `\\bibliographystyle{...}` kullanan klasik BibTeX belgeleri desteklenmez. `biblatex` ve `\\printbibliography` kullanın.",
		},
		{
			type: "h2",
			id: "xelatex",
			text: "Yazı tipi örneği (XeLaTeX / LuaLaTeX)",
		},
		{
			type: "code",
			title: "main.tex",
			code: String.raw`\documentclass{article}
\usepackage{fontspec}
% Derleme ortamındaki yazı tiplerinden biri (ör. DejaVu Serif, DejaVu Sans)
\setmainfont{DejaVu Serif}
\begin{document}
Çağdaş yazı tipleriyle Türkçe: ğüşıöç ĞÜŞİÖÇ.
\end{document}`,
		},
		{ type: "h2", id: "sinirlar", text: "Sınırlar" },
		{
			type: "list",
			items: [
				'**Dakikada en fazla 5 derleme** yapabilirsiniz. Sınırı aşarsanız "Çok fazla derleme isteği" uyarısı çıkar; bir dakika bekleyip tekrar deneyin.',
				"Her derleme yaklaşık **12 saniye** ile sınırlıdır. Süre dolarsa durum **Zaman aşımı** olur. pdfLaTeX + Biber bu süreden daha uzun çalışabilir.",
				"Derleme ortamının internet erişimi yoktur. Belgeniz dışarıdan dosya veya paket indiremez.",
				"Derleme ortamının bellek ve işlemci gücü sınırlıdır; çok ağır çizimler (binlerce noktalı grafikler gibi) zaman aşımına uğrayabilir.",
			],
		},
		{
			type: "p",
			text: "Zaman aşımı veya hata alıyorsanız [Sorun giderme](/yardim/sorun-giderme) sayfasına bakın.",
		},
	],
};

export const outputsAndExport: HelpArticle = {
	slug: "ciktilar-ve-disa-aktarma",
	title: "Çıktılar ve dışa aktarma",
	summary:
		"PDF önizleme ve yakınlaştırma, Derleme günlüğü, Geçmiş sekmesi ve PDF/SVG/PNG indirme.",
	icon: "download",
	keywords: [
		"pdf",
		"svg",
		"png",
		"300 dpi",
		"indir",
		"önizleme",
		"yakınlaştırma",
		"günlük",
		"geçmiş",
		"word",
		"powerpoint",
	],
	blocks: [
		{ type: "h2", id: "onizleme", text: "PDF önizleme" },
		{
			type: "list",
			items: [
				"Başarılı bir derlemeden sonra PDF, **Çıktı paneli**ndeki **Önizleme** sekmesinde görünür.",
				"**–** ve **+** düğmeleri yakınlaştırmayı %60 ile %240 arasında değiştirir.",
				"Çok sayfalı belgelerde bütün sayfalar alt alta gösterilir (ilk 30 sayfa); sayfa sayısı yakınlaştırma bilgisinin yanında yazar. Daha uzun belgelerin tamamı için PDF'i indirin.",
			],
		},
		{ type: "h2", id: "gunluk", text: "Derleme günlüğü" },
		{
			type: "p",
			text: "Önizlemenin altındaki **Derleme günlüğü** LaTeX'in ürettiği uzun kaydın önemli satırlarını özetler: `!` ile başlayan hata satırları, `l.12` gibi satır numaraları ve uyarılar. Hata satır numarası içeriyorsa editörde o satırın yanında kırmızı bir işaret çıkar.",
		},
		{
			type: "code",
			language: "text",
			title: "Örnek günlük",
			code: String.raw`! Undefined control sequence.
l.12   \drw
           (0,0) -- (1,1);`,
		},
		{
			type: "p",
			text: "Bu örnekte 12. satırda `\\draw` yerine yanlışlıkla `\\drw` yazılmış. Sık görülen hataların anlamları için [Sorun giderme](/yardim/sorun-giderme) sayfasına bakın.",
		},
		{ type: "h2", id: "indirme", text: "PDF, SVG ve PNG indirme" },
		{
			type: "table",
			head: ["Biçim", "Ne için uygun?"],
			rows: [
				[
					"**PDF indir**",
					"Baskı, LaTeX belgelerine `\\includegraphics` ile ekleme, tüm sayfalar.",
				],
				[
					"**SVG indir**",
					"Web sayfaları ve vektör düzenleyiciler (Inkscape vb.). Kalite kaybı olmadan büyür.",
				],
				[
					"**PNG indir**",
					"300 DPI baskı kalitesinde görsel: Word, PowerPoint, Google Slaytlar, çalışma kâğıtları.",
				],
			],
		},
		{
			type: "callout",
			tone: "info",
			text: "SVG ve PNG dosyaları belgenin yalnızca **ilk sayfasından** üretilir. Bu yüzden tek tek şekiller için `standalone` belge sınıfı en iyi sonucu verir: sayfa, çizimin boyutuna göre kırpılır.",
		},
		{
			type: "code",
			code: String.raw`\documentclass[tikz,border=8pt]{standalone}`,
		},
		{ type: "h2", id: "gecmis", text: "Geçmiş sekmesi" },
		{
			type: "p",
			text: "**Çıktı paneli**ndeki **Geçmiş** sekmesi projenin önceki derlemelerini en yeniden eskiye listeler. Her satırda durum (**Başarılı**, **Başarısız**, **Zaman aşımı**), kullanılan motor ve zaman yazar. Başarılı derlemelerin PDF, SVG ve PNG dosyalarını buradan da indirebilirsiniz; böylece önceki bir sürüme kolayca dönebilirsiniz.",
		},
		{
			type: "callout",
			tone: "warning",
			text: "24 saatten eski derlemelerin dosyaları sunucudan silinir; projenin en son başarılı derlemesi ise saklanır. Geçmiş listesi kalır ama eski satırların indirme düğmeleri kaybolur. Saklamak istediğiniz çıktıları bilgisayarınıza indirin.",
		},
	],
};
