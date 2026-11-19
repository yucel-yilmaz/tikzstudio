import type { HelpArticle } from "@/features/help/content/types";

export const gettingStarted: HelpArticle = {
	slug: "baslarken",
	title: "Başlarken",
	summary:
		"Hesap oluşturun, ilk projenizi bir şablondan açın ve birkaç dakikada ilk PDF'inizi derleyin.",
	icon: "rocket",
	keywords: [
		"kayıt",
		"giriş",
		"hesap",
		"ilk proje",
		"öğretici",
		"github",
		"google",
	],
	blocks: [
		{
			type: "p",
			text: "TikZ Studio, bilgisayarınıza hiçbir şey kurmadan tarayıcıda TikZ ve LaTeX yazmanızı sağlar. Kodu solda yazarsınız, **Derle** düğmesine basarsınız, sonuç sağda PDF olarak görünür. Bu sayfa sizi ilk çiziminize kadar götürür.",
		},
		{ type: "h2", id: "hesap", text: "1. Hesap oluşturun" },
		{
			type: "list",
			items: [
				"Ana sayfada **Hemen başla** ya da **Hesap oluştur** bağlantısına tıklayın.",
				"Ad soyad, e-posta ve en az 8 karakterlik bir şifre girin.",
				"Zaten hesabınız varsa **Giriş yap** sayfasını kullanın.",
			],
		},
		{
			type: "callout",
			tone: "info",
			text: "GitHub veya Google ile giriş düğmeleri yalnızca sunucu yöneticisi bu sağlayıcıları yapılandırdıysa görünür. Görmüyorsanız e-posta ve şifreyle devam edin.",
		},
		{ type: "h2", id: "ilk-proje", text: "2. İlk projenizi oluşturun" },
		{
			type: "list",
			ordered: true,
			items: [
				"Giriş yaptıktan sonra **Panel** açılır. Sağ üstteki **Yeni proje** düğmesine tıklayın.",
				'Bir **Başlık** yazın (ör. "İlk çizimim"). **Açıklama** isteğe bağlıdır.',
				"**Başlangıç şablonu** listesinden bir şablon seçin. Yeni başlıyorsanız **Öğretici: İlk TikZ çiziminiz** şablonu her satırı Türkçe açıklanmış bir örnektir. Listede yoksa **Varsayılan TikZ** ile başlayın.",
				"**Proje oluştur** düğmesine basın. Editör otomatik olarak açılır.",
			],
		},
		{ type: "h2", id: "ilk-derleme", text: "3. Derleyin ve sonucu görün" },
		{
			type: "list",
			ordered: true,
			items: [
				"Üst çubuktaki **Derle** düğmesine basın.",
				"Durum rozeti önce **Sırada**, sonra **Derleniyor…** olur. Birkaç saniye içinde **Başarılı** görünür.",
				"PDF sağdaki **Çıktı paneli**nde açılır. **PDF indir**, **SVG indir** ve **PNG indir** düğmeleriyle dosyayı bilgisayarınıza alabilirsiniz.",
			],
		},
		{
			type: "p",
			text: "Şimdi koddaki bir sayıyı ya da rengi değiştirip yeniden derleyin. TikZ'yi öğrenmenin en hızlı yolu bu küçük denemelerdir. Aşağıdaki en küçük TikZ belgesiyle de başlayabilirsiniz:",
		},
		{
			type: "code",
			title: "main.tex",
			code: String.raw`\documentclass[tikz,border=8pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}
  \draw[->] (0,0) -- (3,0) node[right] {$x$};
  \draw[->] (0,0) -- (0,2) node[above] {$y$};
  \draw[blue, thick] (0,0) -- (2.5,1.5);
  \node[draw, circle, fill=orange!30] at (2.5,1.5) {P};
\end{tikzpicture}
\end{document}`,
		},
		{ type: "h2", id: "ogretici", text: "Öğreticiyi yeniden başlatın" },
		{
			type: "p",
			text: "İlk girişinizde ekranın önemli bölümlerini tanıtan kısa bir öğretici açılır. Kapattıysanız istediğiniz zaman yeniden başlatabilirsiniz: Panel ve editördeki **Yardım** menüsünden **Öğreticiyi başlat**'ı seçin ya da aşağıdaki düğmeyi kullanın.",
		},
		{ type: "tourButton" },
		{ type: "h2", id: "sonraki", text: "Sırada ne var?" },
		{
			type: "list",
			items: [
				"Ekranın bölümlerini tanımak için [Editör](/yardim/editor) sayfasına bakın.",
				"Hangi motoru seçeceğinizi [Derleme ve motorlar](/yardim/derleme-ve-motorlar) sayfası anlatır.",
				"Türkçe metin yazacaksanız mutlaka [Türkçe belgeler](/yardim/turkce-belgeler) sayfasını okuyun.",
			],
		},
	],
};

export const editor: HelpArticle = {
	slug: "editor",
	title: "Editör",
	summary:
		"Kod editörü, proje paneli, çıktı paneli ve üst çubuktaki düğmeler: ekranın her bölümü ne işe yarar?",
	icon: "code",
	keywords: [
		"codemirror",
		"kaydet",
		"otomatik kaydetme",
		"kısayol",
		"panel",
		"önizleme",
		"mobil",
	],
	blocks: [
		{
			type: "p",
			text: "Editör ekranı dört bölümden oluşur: üstte **araç çubuğu**, solda **proje paneli**, ortada **Kod editörü**, sağda **Çıktı paneli**. Geniş ekranlarda bölümler yan yana durur; telefonda ve küçük tablette alt alta sıralanır.",
		},
		{ type: "h2", id: "arac-cubugu", text: "Araç çubuğu" },
		{
			type: "table",
			head: ["Öğe", "Ne işe yarar?"],
			rows: [
				["**Panel** / **Panele dön**", "Proje listesine geri döner."],
				[
					"Kayıt rozeti",
					"**Kaydedildi**, **Kaydedilmemiş değişiklik** veya **Kaydediliyor…** durumunu gösterir.",
				],
				[
					"**Paylaş**",
					"Proje herkese açıksa paylaşım bağlantısını panoya kopyalar.",
				],
				["**Kaydet**", "Açık dosyayı hemen kaydeder."],
				[
					"Motor seçimi",
					"Tectonic, pdfLaTeX, XeLaTeX, LuaLaTeX veya pdfLaTeX + Biber. Bkz. [Derleme ve motorlar](/yardim/derleme-ve-motorlar).",
				],
				["**Derle**", "Belgeyi seçili motorla derler."],
				[
					"**Yardım**",
					"Bu yardım merkezini açar veya öğreticiyi yeniden başlatır.",
				],
			],
		},
		{ type: "h2", id: "kod-editoru", text: "Kod editörü" },
		{
			type: "list",
			items: [
				"LaTeX sözdizimi renklendirme, satır numaraları ve parantez eşleştirme vardır.",
				"Ters bölü (`\\`) yazıp birkaç harf eklediğinizde kod parçacıkları önerilir. Bkz. [Şablonlar ve kod parçacıkları](/yardim/sablonlar-ve-kod-parcaciklari).",
				"Derleme hata verirse hatalı satırın yanında kırmızı bir işaret çıkar. İmleci işaretin üzerine getirince hata mesajını görürsünüz.",
				"Başlığın yanındaki tarama simgesi **Görselden LaTeX'e** penceresini açar.",
			],
		},
		{ type: "h2", id: "kaydetme", text: "Otomatik kaydetme" },
		{
			type: "p",
			text: "Yazmayı bıraktıktan yaklaşık bir saniye sonra açık dosya kendiliğinden kaydedilir. Rozet **Kaydedildi** gösteriyorsa çalışmanız sunucudadır. Beklemek istemiyorsanız **Kaydet** düğmesine basın. **Derle** düğmesi kayıt sürerken kısa bir süre devre dışı kalır; bu sayede her zaman son halinizi derlersiniz.",
		},
		{
			type: "callout",
			tone: "warning",
			text: "Otomatik kaydetme açık olan dosya için çalışır. Birden fazla dosyada değişiklik yaptıysanız dosya değiştirmeden önce rozetin **Kaydedildi** olduğundan emin olun.",
		},
		{ type: "h2", id: "proje-paneli", text: "Proje paneli" },
		{
			type: "p",
			text: "Sol kenardaki simgeler paneli açar: **Dosyalar**, **Şablonlar**, **Kod parçacıkları** ve **Ayarlar**. En üstteki simge paneli gizleyip kod editörüne daha fazla yer açar.",
		},
		{ type: "h2", id: "cikti-paneli", text: "Çıktı paneli" },
		{
			type: "list",
			items: [
				"**Önizleme** sekmesi son derlemenin PDF'ini, motor bilgisini ve indirme düğmelerini gösterir.",
				"Önizlemenin üstündeki **–** ve **+** düğmeleriyle yakınlaştırmayı %60 ile %240 arasında değiştirebilirsiniz.",
				"Altındaki **Derleme günlüğü** hata ve uyarı satırlarını özetler.",
				"**Geçmiş** sekmesi önceki derlemeleri ve dosyalarını listeler. Bkz. [Çıktılar ve dışa aktarma](/yardim/ciktilar-ve-disa-aktarma).",
				"Panelin sol kenarını sürükleyerek genişliğini değiştirebilirsiniz.",
			],
		},
		{
			type: "callout",
			tone: "info",
			title: "Telefonda",
			text: "Küçük ekranlarda editör, proje paneli ve çıktı paneli alt alta gelir. Uzun belgeler için bilgisayar ya da tablet daha rahattır.",
		},
	],
};

export const projectsAndFiles: HelpArticle = {
	slug: "projeler-ve-dosyalar",
	title: "Projeler ve dosyalar",
	summary:
		"Projeleri arayın ve silin; klasörlerle çok dosyalı projeler kurun, görsel ve .sty yükleyin, ana dosyayı belirleyin.",
	icon: "folder",
	keywords: [
		"klasör",
		"yükle",
		"görsel",
		"resim",
		"sty",
		"cls",
		"input",
		"includegraphics",
		"ana dosya",
		"sil",
		"yeniden adlandır",
	],
	blocks: [
		{ type: "h2", id: "panel", text: "Panel: projelerinizin listesi" },
		{
			type: "list",
			items: [
				"**Ara** kutusu projeleri adına veya açıklamasına göre süzer.",
				"**Editörde aç** projeyi açar.",
				"Kartın sağ üstündeki çöp kutusu simgesi projeyi siler.",
			],
		},
		{
			type: "callout",
			tone: "warning",
			text: "Proje silme işlemi onay istemez ve geri alınamaz. Emin değilseniz önce PDF'i indirin veya projeyi şablon olarak kaydedin.",
		},
		{ type: "h2", id: "dosyalar", text: "Dosyalar paneli" },
		{
			type: "p",
			text: "Bir proje birden fazla dosyadan oluşabilir. Sol kenardaki **Dosyalar** simgesine tıklayın:",
		},
		{
			type: "list",
			items: [
				"**Yeni dosya** ile bir dosya oluşturun. Klasör için yolu eğik çizgiyle yazın: `sekiller/ucgen.tex`. Klasör kendiliğinden oluşur.",
				"Yükle simgesiyle bilgisayarınızdan dosya ekleyin: görseller (`.png`, `.jpg`, `.pdf`), stil ve sınıf dosyaları (`.sty`, `.cls`), yazı tipleri. Dosya başına en fazla 5 MB.",
				"Dosyanın yanındaki **⋮** menüsünde **Yeniden adlandır**, **Ana dosya yap** ve **Sil** seçenekleri vardır.",
				"Ana dosya **Ana** rozetiyle işaretlidir ve silinemez.",
			],
		},
		{ type: "h2", id: "cok-dosyali", text: "Çok dosyalı bir proje örneği" },
		{
			type: "p",
			text: "Ana dosya diğer dosyaları `\\input` ile çağırır. Yollar her zaman proje köküne göredir:",
		},
		{
			type: "code",
			title: "main.tex",
			code: String.raw`\documentclass{article}
\usepackage{tikz}
\usepackage{graphicx}
\begin{document}

\section*{Üçgen}
\input{sekiller/ucgen.tex}

\section*{Fotoğraf}
\includegraphics[width=0.5\linewidth]{gorseller/deney.png}

\end{document}`,
		},
		{
			type: "code",
			title: "sekiller/ucgen.tex",
			code: String.raw`\begin{tikzpicture}
  \draw (0,0) -- (4,0) -- (1.5,2.5) -- cycle;
\end{tikzpicture}`,
		},
		{
			type: "callout",
			tone: "warning",
			title: "Derle, açık dosyayı derler",
			text: "**Derle** düğmesi editörde o an açık olan dosyayı derler. `sekiller/ucgen.tex` gibi `\\documentclass` içermeyen bir parça dosyası açıkken derlerseniz hata alırsınız. Derlemeden önce `main.tex` dosyasına geçin.",
		},
		{ type: "h2", id: "yeni-proje", text: "Yeni proje ve şablonlar" },
		{
			type: "p",
			text: "**Yeni proje** penceresinde bir şablon seçtiğinizde şablonun bütün dosyaları (görseller ve `.sty` dosyaları dahil) yeni projeye kopyalanır. Şablon kütüphanesinde 33 resmi şablon bulunur: **temel** şekiller ve şemalar, **lise matematiği** (üçgen, çember, fonksiyon grafikleri, Venn şeması, sınav kâğıdı…) ve **üniversite/akademik** grafikler (veri grafikleri, 3B yüzey, değişmeli diyagramlar, otomatlar, Beamer sunumu, makale iskeleti…).",
		},
		{
			type: "p",
			text: "Kendi projelerinizi de şablona dönüştürebilirsiniz. Bkz. [Şablonlar ve kod parçacıkları](/yardim/sablonlar-ve-kod-parcaciklari#sablon-olarak-kaydet).",
		},
		{ type: "h2", id: "sinirlar", text: "Sınırlar" },
		{
			type: "list",
			items: [
				"Yüklenen dosya başına en fazla 5 MB.",
				"Derlemeye gönderilen projenin toplam boyutu ve oluşan çıktının boyutu sunucu tarafından sınırlandırılır. Varsayılan sınırlar kaynaklar için 512 KB, çıktı için 10 MB'tır.",
				"Dosya ve klasör adlarında yalnızca İngilizce harfler, rakamlar, nokta (`.`), tire (`-`) ve alt çizgi (`_`) kullanılabilir. Türkçe karakterler (ç, ğ, ı, ö, ş, ü) ve boşluk kabul edilmez; `..` ve `/` ile başlayan yollar da reddedilir.",
			],
		},
		{
			type: "callout",
			tone: "tip",
			text: "Yükleyeceğiniz görselin adı `Deney Fotoğrafı.png` ise önce bilgisayarınızda `deney-fotografi.png` gibi bir adla yeniden adlandırın.",
		},
	],
};
