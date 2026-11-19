import type { HelpArticle } from "@/features/help/content/types";

export const templatesAndSnippets: HelpArticle = {
	slug: "sablonlar-ve-kod-parcaciklari",
	title: "Şablonlar ve kod parçacıkları",
	summary:
		"Hazır şablonları kullanın, kod parçacıklarını tetikleyicilerle ekleyin, formül görsellerini LaTeX'e çevirin ve kendi şablonlarınızı kaydedin.",
	icon: "layout",
	keywords: [
		"şablon",
		"snippet",
		"tetikleyici",
		"img2latex",
		"görselden latex",
		"mathpix",
		"pix2tex",
		"şablon olarak kaydet",
	],
	blocks: [
		{ type: "h2", id: "sablonlar-paneli", text: "Şablonlar paneli" },
		{
			type: "p",
			text: "Editörün sol kenarındaki **Şablonlar** simgesine tıklayın. Şablonları arayabilir ve kategoriye göre süzebilirsiniz. Bir şablona tıkladığınızda ana dosyasının içeriği **imlecin bulunduğu yere eklenir**.",
		},
		{
			type: "callout",
			tone: "tip",
			text: "Şablonlar genellikle `\\documentclass` ile başlayan eksiksiz belgelerdir. Var olan bir belgenin ortasına eklerseniz iki `\\documentclass` olur ve derleme hata verir. Ya boş bir dosyaya ekleyin ya da yalnızca ihtiyacınız olan `tikzpicture` bölümünü kopyalayın. Şablonun görselleri ve ek dosyalarıyla birlikte gelmesini istiyorsanız **Yeni proje** penceresinden şablonla yeni bir proje oluşturun.",
		},
		{
			type: "p",
			text: "Panelin üstündeki **Yeni** düğmesiyle kendi tek dosyalı şablonunuzu (başlık, kategori, içerik) yazabilirsiniz. Kendi şablonlarınızın yanında silme düğmesi görünür; resmi şablonlar silinemez.",
		},
		{ type: "h2", id: "kod-parcaciklari", text: "Kod parçacıkları" },
		{
			type: "p",
			text: "Kod parçacıkları sık kullanılan kısa TikZ bloklarıdır (eksenler, düğüm, ok…). İki yolla ekleyebilirsiniz:",
		},
		{
			type: "list",
			items: [
				"**Kod parçacıkları** panelinde bir parçacığa tıklayın; imlecin olduğu yere eklenir.",
				"Editörde ters bölü ve tetikleyicinin ilk harflerini yazın (ör. `\\eks`). Açılan öneri listesinden parçacığı seçip **Enter**'a basın. Her parçacığın tetikleyicisi panelde rozet olarak görünür.",
			],
		},
		{
			type: "p",
			text: "**Yeni** düğmesiyle kendi parçacığınızı ekleyin: bir başlık, ters bölü olmadan bir tetikleyici (ör. `daire`), bir kategori ve içerik yazın. Örneğin şu içerik `\\daire` yazınca eklenir:",
		},
		{
			type: "code",
			title: "Tetikleyici: daire",
			code: String.raw`\draw[thick, fill=blue!15] (0,0) circle (1);
\fill (0,0) circle (1.5pt) node[below] {$M$};`,
		},
		{ type: "h2", id: "gorselden-latexe", text: "Görselden LaTeX'e" },
		{
			type: "p",
			text: "Bir formülün fotoğrafını veya ekran görüntüsünü LaTeX koduna çevirebilirsiniz:",
		},
		{
			type: "list",
			ordered: true,
			items: [
				"**Kod editörü** başlığının yanındaki tarama simgesine tıklayın.",
				"Bir sağlayıcı seçin: **Docker Model Runner**, **pix2tex** veya **Mathpix**.",
				"PNG, JPEG veya WebP görseli bırakın ya da seçin, **LaTeX'e dönüştür**'e basın.",
				"Sonucu kontrol edip düzeltin, ardından **Editöre ekle** ile imlecin olduğu yere ekleyin.",
			],
		},
		{
			type: "callout",
			tone: "info",
			text: "Bu özellik sunucuda bir sağlayıcının kurulmuş olmasını gerektirir. Hangi sağlayıcıların çalıştığı sunucu yöneticisinin ayarlarına bağlıdır; bir sağlayıcı hata verirse diğerini deneyin. Sonuç her zaman kontrol edilmelidir: el yazısı ve karmaşık tablolar yanlış okunabilir.",
		},
		{ type: "h2", id: "sablon-olarak-kaydet", text: "Şablon olarak kaydet" },
		{
			type: "p",
			text: "Sık kullandığınız bir düzeni (ör. okulunuzun sınav kâğıdı başlığı) şablona dönüştürebilirsiniz:",
		},
		{
			type: "list",
			ordered: true,
			items: [
				"Editörde sol kenardaki **Ayarlar** simgesine tıklayın.",
				"**Şablon olarak kaydet** bölümünde şablon adını, kategoriyi ve açıklamayı yazın.",
				"**Şablon olarak kaydet** düğmesine basın.",
			],
		},
		{
			type: "list",
			items: [
				"Projedeki **tüm dosyalar** (görseller, `.sty` dosyaları, alt klasörler) ve **seçili motor** şablona kopyalanır.",
				"Kaydedilmemiş değişiklikleriniz önce kaydedilir; şablon her zaman son halinizi içerir.",
				"Şablon yalnızca size görünür ve **Yeni proje** penceresindeki listede yer alır.",
			],
		},
	],
};

export const sharing: HelpArticle = {
	slug: "paylasma",
	title: "Paylaşma",
	summary:
		"Projenizi herkese açık yapın, paylaşım bağlantısını gönderin; başkalarının projelerini kendi çalışma alanınıza kopyalayın.",
	icon: "share",
	keywords: [
		"paylaş",
		"bağlantı",
		"link",
		"herkese açık",
		"özel",
		"kopyala",
		"fork",
		"öğrenci",
		"ödev",
	],
	blocks: [
		{ type: "h2", id: "ayarlar", text: "Proje ayarları" },
		{
			type: "p",
			text: "Editörde sol kenardaki **Ayarlar** simgesine tıklayın. Buradan projenin **Proje adı**nı ve **Açıklama**sını değiştirebilir, **Herkese açık** anahtarını açıp kapatabilirsiniz. Değişiklikleri **Ayarları kaydet** ile kaydedin.",
		},
		{ type: "h2", id: "baglanti", text: "Paylaşım bağlantısı" },
		{
			type: "list",
			ordered: true,
			items: [
				"**Herkese açık** anahtarını açıp **Ayarları kaydet**'e basın.",
				"Üst çubukta **Paylaş** düğmesi belirir. Tıkladığınızda paylaşım bağlantısı panoya kopyalanır.",
				"Bağlantıyı öğrencilerinize, meslektaşlarınıza veya sınıf grubunuza gönderin.",
			],
		},
		{
			type: "p",
			text: "Bağlantıyı açan kişi giriş yapmadan projenin dosyalarını **salt okunur** olarak görür; son başarılı derlemenin önizlemesini görüp PDF ve SVG dosyasını indirebilir. Kimse projenizi değiştiremez.",
		},
		{
			type: "callout",
			tone: "warning",
			text: "Bağlantıya sahip herkes projedeki bütün dosyaları görebilir. Sınav cevap anahtarı gibi gizli içerikleri herkese açık projelere koymayın. Paylaşımı durdurmak için **Herkese açık** anahtarını kapatın.",
		},
		{ type: "h2", id: "kopyala", text: "Kendi projelerime kopyala" },
		{
			type: "p",
			text: "Herkese açık bir projenin sayfasında **Kendi projelerime kopyala** düğmesi vardır. Tıkladığınızda bütün dosyaların bir kopyası sizin hesabınızda yeni bir proje olarak oluşturulur ve editörde açılır. Kopya üzerinde istediğiniz gibi çalışabilirsiniz; asıl proje değişmez. Hesabınız yoksa önce hesap oluşturmanız istenir.",
		},
		{
			type: "callout",
			tone: "tip",
			title: "Sınıfta kullanım",
			text: "Öğretmenler bir başlangıç projesini herkese açık yapıp bağlantısını paylaşabilir. Her öğrenci **Kendi projelerime kopyala** ile kendi kopyasını alır ve ödevini üzerinde yapar.",
		},
	],
};

export const turkishDocuments: HelpArticle = {
	slug: "turkce-belgeler",
	title: "Türkçe belgeler",
	summary:
		'Türkçe karakterler, babel ayarı ve TikZ ile birlikte kullanırken dikkat edilmesi gereken "=" sorunu.',
	icon: "languages",
	keywords: [
		"babel",
		"turkish",
		"türkçe karakter",
		"shorthands",
		"enumitem",
		"fontenc",
		"tarih",
		"bölüm adları",
	],
	blocks: [
		{
			type: "p",
			text: "Belgelerinizde ç, ğ, ı, İ, ö, ş, ü harflerini doğrudan yazabilirsiniz; bütün motorlar UTF-8 metni okur. TikZ düğümlerindeki kısa etiketler için (ör. `{Başla}`) ek bir ayar gerekmez.",
		},
		{
			type: "p",
			text: '"Şekil", "İçindekiler", "Kaynakça" gibi otomatik başlıkların ve tarihlerin Türkçe olması, ayrıca doğru heceleme için `babel` paketini Türkçe seçeneğiyle yükleyin.',
		},
		{ type: "h2", id: "esittir-sorunu", text: 'Dikkat: babel ve "=" işareti' },
		{
			type: "p",
			text: 'Türkçe `babel`, `=` karakterini özel ("aktif") bir karaktere dönüştürür. TikZ ve `enumitem` seçenekleri `anahtar=değer` biçiminde yazıldığından bu, `draw=red` veya `label=(\\alph*)` gibi seçenekleri bozar ve anlaşılması zor hatalar verir.',
		},
		{
			type: "p",
			text: "Çözüm iki satırdır: Türkçe kısaltmaları kapatın ve TikZ'nin `babel` kütüphanesini yükleyin.",
		},
		{
			type: "code",
			title: "main.tex",
			code: String.raw`\documentclass{article}
\usepackage{iftex}
\ifPDFTeX
  \usepackage[T1]{fontenc}
\fi
\usepackage[turkish,shorthands=:!]{babel}
\usepackage{tikz}
\usetikzlibrary{babel}
\usepackage{enumitem}

\begin{document}

\section{Şekiller}

\begin{tikzpicture}
  \draw[draw=red, fill=red!10] (0,0) rectangle (3,2);
  \node at (1.5,1) {Dikdörtgen};
\end{tikzpicture}

\begin{enumerate}[label=(\alph*)]
  \item Birinci şık
  \item İkinci şık
\end{enumerate}

\end{document}`,
		},
		{
			type: "list",
			items: [
				"`shorthands=:!` yalnızca `:` ve `!` kısaltmalarını açık bırakır; `=` normal karakter olarak kalır.",
				"`\\usetikzlibrary{babel}` TikZ'nin babel ile uyumlu çalışmasını sağlar.",
				"`\\ifPDFTeX` bloğundaki `\\usepackage[T1]{fontenc}` yalnızca pdfLaTeX'te yüklenir ve Türkçe harflerin doğru hecelenmesini sağlar. Tectonic, XeLaTeX ve LuaLaTeX buna ihtiyaç duymaz; Tectonic'te koşulsuz yüklerseniz yazı tipi hatası alırsınız.",
			],
		},
		{
			type: "callout",
			tone: "tip",
			text: "Resmi şablonlardaki Türkçe belgeler bu ayarla hazırlanmıştır ve tüm motorlarda çalışır. Takıldığınızda Türkçe bir şablonla yeni proje açıp başlığını kopyalayabilirsiniz.",
		},
		{ type: "h2", id: "dosya-adlari", text: "Dosya adları" },
		{
			type: "p",
			text: "Dosya ve klasör adlarında da Türkçe harf kullanabilirsiniz: `\\input{şekiller/üçgen}` ve `\\includegraphics{görseller/ağaç.png}` bütün motorlarda çalışır. Yalnızca boşluk kullanmayın; kelimeleri tire veya alt çizgiyle ayırın (`deney-sonuçları.tex`).",
		},
	],
};
