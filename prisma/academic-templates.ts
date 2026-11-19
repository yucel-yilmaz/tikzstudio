/**
 * University and academic templates (Turkish labels): publication figures,
 * higher mathematics, computer science / engineering diagrams, a Beamer
 * slide and a multi-file article skeleton. Verified against Tectonic and
 * pdfLaTeX by `npm run templates:verify`.
 */
import type { SeedSnippet, SeedTemplate } from "./math-templates";

const pgfplotsDoc = (body: string, extraPreamble = "") =>
	String.raw`\documentclass[tikz,border=8pt]{standalone}
\usepackage{amsmath}
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}
${extraPreamble}
\begin{document}
${body}
\end{document}
`;

const tikzDoc = (libraries: string, body: string, extraPreamble = "") =>
	String.raw`\documentclass[tikz,border=8pt]{standalone}
\usepackage{amsmath,amssymb}
\usepackage{tikz}
\usetikzlibrary{${libraries}}
${extraPreamble}
\begin{document}
${body}
\end{document}
`;

export const academicTemplates: SeedTemplate[] = [
	{
		title: "Veri grafiği: ölçümler, hata çubukları ve uyum doğrusu",
		category: "Akademik Grafikler",
		description:
			"Makale/tez için deney verisi; hata çubukları, doğrusal uyum ve lejant (pgfplots).",
		content: pgfplotsDoc(String.raw`\begin{tikzpicture}
  \begin{axis}[
    width=9cm, height=6.5cm,
    xlabel={Sıcaklık $T$ (\textdegree C)},
    ylabel={Direnç $R$ ($\Omega$)},
    grid=major, grid style={gray!20},
    legend pos=north west, legend cell align=left,
  ]
    \addplot+[only marks, mark=*, error bars/.cd, y dir=both, y explicit]
      table[x=T, y=R, y error=dR, row sep=\\] {
        T  R     dR  \\
        10 101.8 0.9 \\
        20 106.1 1.1 \\
        30 109.6 0.8 \\
        40 114.2 1.2 \\
        50 117.9 1.0 \\
        60 122.3 1.3 \\
      };
    \addlegendentry{Ölçüm}
    \addplot[thick, red, domain=5:65] {97.7 + 0.408*x};
    \addlegendentry{$R = 97{,}7 + 0{,}408\,T$}
  \end{axis}
\end{tikzpicture}`),
	},
	{
		title: "Gruplandırılmış çubuk grafik",
		category: "Akademik Grafikler",
		description:
			"Yöntem karşılaştırması için gruplandırılmış çubuklar, değer etiketleri ve lejant.",
		content: pgfplotsDoc(String.raw`\begin{tikzpicture}
  \begin{axis}[
    ybar, bar width=10pt,
    width=10cm, height=6.5cm,
    ymin=0, ymax=100,
    ylabel={Doğruluk (\%)},
    symbolic x coords={Veri A, Veri B, Veri C},
    xtick=data,
    nodes near coords, nodes near coords style={font=\scriptsize},
    enlarge x limits=0.25,
    legend style={at={(0.5,1.03)}, anchor=south, legend columns=-1},
    grid=major, grid style={gray!20}, ymajorgrids=true, xmajorgrids=false,
  ]
    \addplot coordinates {(Veri A,72) (Veri B,65) (Veri C,80)};
    \addplot coordinates {(Veri A,81) (Veri B,77) (Veri C,86)};
    \addplot coordinates {(Veri A,88) (Veri B,84) (Veri C,91)};
    \legend{Yöntem 1, Yöntem 2, Önerilen}
  \end{axis}
\end{tikzpicture}`),
	},
	{
		title: "Normal dağılım ve taralı olasılık",
		category: "Olasılık ve İstatistik",
		description:
			"Standart normal yoğunluk eğrisi; P(−1 ≤ Z ≤ 1) bölgesi taralı.",
		content: pgfplotsDoc(
			String.raw`\begin{tikzpicture}
  \begin{axis}[
    width=10cm, height=6cm,
    axis lines=left, xlabel={$z$}, ylabel={$\varphi(z)$},
    xmin=-3.5, xmax=3.5, ymin=0, ymax=0.45,
    xtick={-3,...,3}, ytick={0,0.1,...,0.4},
    samples=120, domain=-3.5:3.5,
    yticklabel style={/pgf/number format/fixed},
  ]
    \addplot[name path=f, very thick, blue] {exp(-x^2/2)/sqrt(2*pi)};
    \path[name path=axis] (axis cs:-3.5,0) -- (axis cs:3.5,0);
    \addplot[blue!25] fill between[of=f and axis, soft clip={domain=-1:1}];
    \node at (axis cs:0,0.12) {$\approx 0{,}683$};
    \draw[dashed] (axis cs:-1,0) -- (axis cs:-1,0.242);
    \draw[dashed] (axis cs:1,0) -- (axis cs:1,0.242);
  \end{axis}
\end{tikzpicture}`,
			String.raw`\usepgfplotslibrary{fillbetween}`,
		),
	},
	{
		title: "3B yüzey grafiği",
		category: "Çok Değişkenli Analiz",
		description:
			"z = sin(x)·cos(y) yüzeyi; renk haritası ve renk çubuğu (pgfplots surf).",
		content: pgfplotsDoc(String.raw`\begin{tikzpicture}
  \begin{axis}[
    width=10cm, height=8cm,
    view={50}{30},
    xlabel={$x$}, ylabel={$y$}, zlabel={$z$},
    colormap/viridis, colorbar,
    domain=-3:3, y domain=-3:3, samples=30,
  ]
    \addplot3[surf, shader=interp] {sin(deg(x))*cos(deg(y))};
  \end{axis}
\end{tikzpicture}`),
	},
	{
		title: "Vektörler ve dik izdüşüm",
		category: "Lineer Cebir",
		description: "u ve v vektörleri, v'nin u üzerine izdüşümü ve dik bileşen.",
		content: tikzDoc(
			"arrows.meta,calc,angles",
			String.raw`\begin{tikzpicture}[scale=1.3, >={Stealth[length=3mm]}]
  \draw[->, gray] (-0.3,0) -- (5,0) node[right] {$x$};
  \draw[->, gray] (0,-0.3) -- (0,3.4) node[above] {$y$};
  \coordinate (O) at (0,0);
  \coordinate (U) at (4,1);
  \coordinate (V) at (2,3);
  \coordinate (P) at ($(O)!(V)!(U)$);
  \draw[->, very thick, blue] (O) -- (U) node[below right] {$\mathbf{u}$};
  \draw[->, very thick, red]  (O) -- (V) node[above left] {$\mathbf{v}$};
  \draw[->, very thick, violet] (O) -- (P)
    node[midway, above, sloped] {$\operatorname{proj}_{\mathbf{u}}\mathbf{v}$};
  \draw[dashed] (V) -- (P);
  \pic[draw, angle radius=2.5mm] {right angle = V--P--O};
  \node[right=2pt] at ($(V)!0.5!(P)$) {$\mathbf{v}-\operatorname{proj}_{\mathbf{u}}\mathbf{v}$};
\end{tikzpicture}`,
		),
	},
	{
		title: "Değişmeli diyagram (tikz-cd)",
		category: "Cebir",
		description:
			"Homomorfizmalar için değişmeli kare ve izomorfizma teoremi diyagramı.",
		content: String.raw`\documentclass[border=8pt]{standalone}
\usepackage{amsmath,amssymb}
\usepackage{tikz-cd}
\begin{document}
\begin{tikzcd}[column sep=large, row sep=large]
  G \arrow[r, "\varphi"] \arrow[d, "\pi"', two heads]
    & H \\
  G/\ker\varphi \arrow[ur, "\bar{\varphi}"', hook, dashed]
\end{tikzcd}
\qquad
\begin{tikzcd}
  A \arrow[r, "f"] \arrow[d, "g"'] & B \arrow[d, "h"] \\
  C \arrow[r, "k"'] & D
\end{tikzcd}
\end{document}
`,
	},
	{
		title: "Sonlu durum otomatı",
		category: "Bilgisayar Bilimleri",
		description:
			"İkili sayılarda 3'e bölünebilirliği tanıyan DFA (automata kütüphanesi).",
		content: tikzDoc(
			"automata,positioning,arrows.meta",
			String.raw`\begin{tikzpicture}[
  shorten >=1pt, node distance=3cm, on grid, auto,
  >={Stealth[round]}, every state/.style={thick, fill=blue!8},
  initial text={başla},
]
  \node[state, initial, accepting] (q0) {$q_0$};
  \node[state] (q1) [right=of q0] {$q_1$};
  \node[state] (q2) [right=of q1] {$q_2$};
  \path[->]
    (q0) edge [loop above] node {0} ()
         edge [bend left]  node {1} (q1)
    (q1) edge [bend left]  node {1} (q0)
         edge [bend left]  node {0} (q2)
    (q2) edge [loop above] node {1} ()
         edge [bend left]  node {0} (q1);
\end{tikzpicture}`,
		),
	},
	{
		title: "Blok diyagram: geri beslemeli kontrol sistemi",
		category: "Mühendislik",
		description:
			"Toplama noktası, denetleyici, sistem ve geri besleme yolu içeren blok diyagram.",
		content: tikzDoc(
			"positioning,arrows.meta,calc",
			String.raw`\begin{tikzpicture}[
  node distance=1.6cm, >={Stealth},
  block/.style={draw, thick, rectangle, minimum height=1.1cm, minimum width=2.2cm, fill=blue!6},
  sum/.style={draw, thick, circle, inner sep=0pt, minimum size=6mm},
]
  \coordinate (in);
  \node[sum, right=1.4cm of in] (s) {$\Sigma$};
  \node[block, right=of s] (c) {$C(s)$};
  \node[block, right=of c] (g) {$G(s)$};
  \coordinate[right=1.6cm of g] (out);
  \node[block, below=1.2cm of $(c)!0.5!(g)$] (h) {$H(s)$};

  \draw[->, thick] (in) -- node[above] {$R(s)$} node[pos=0.9, below] {$+$} (s);
  \draw[->, thick] (s) -- node[above] {$E(s)$} (c);
  \draw[->, thick] (c) -- node[above] {$U(s)$} (g);
  \draw[->, thick] (g) -- node[above, pos=0.6] {$Y(s)$} (out);
  \draw[->, thick] ($(g.east)!0.5!(out)$) |- (h);
  \draw[->, thick] (h) -| node[pos=0.95, left] {$-$} (s);
\end{tikzpicture}`,
		),
	},
	{
		title: "Sunum slaytı (Beamer + TikZ)",
		category: "Sunum",
		description:
			"Başlık slaytı ve TikZ şekilli bir içerik slaytı olan Beamer sunumu.",
		content: String.raw`\documentclass{beamer}
\usetheme{Madrid}
\usepackage[turkish,shorthands=:!]{babel}
\usepackage{amsmath}
\usepackage{tikz}
\usetikzlibrary{babel,arrows.meta}

\title{Sunum Başlığı}
\subtitle{Alt başlık}
\author{Ad Soyad}
\institute{Kurum}
\date{\today}

\begin{document}

\begin{frame}
  \titlepage
\end{frame}

\begin{frame}{Türev: teğet doğrusunun eğimi}
  \begin{columns}
    \column{0.5\textwidth}
    \begin{itemize}
      \item $f'(a) = \lim\limits_{h\to 0}\dfrac{f(a+h)-f(a)}{h}$
      \item Teğet doğrusu: $y = f(a) + f'(a)(x-a)$
    \end{itemize}
    \column{0.5\textwidth}
    \begin{tikzpicture}[scale=0.9, >={Stealth}]
      \draw[->] (-0.3,0) -- (4,0) node[right] {$x$};
      \draw[->] (0,-0.3) -- (0,3.6) node[above] {$y$};
      \draw[thick, blue, domain=0.2:3.6, samples=50] plot (\x, {0.25*\x*\x + 0.3});
      \draw[thick, red, domain=0.6:3.8] plot (\x, {\x - 0.7});
      \fill (2,1.3) circle (1.5pt) node[above left] {$(a, f(a))$};
    \end{tikzpicture}
  \end{columns}
\end{frame}

\end{document}
`,
	},
	{
		title: "Makale iskeleti (çok dosyalı)",
		category: "Akademik Yazım",
		description:
			"Özet, bölümler, denklem, ayrı dosyada şekil, tablo ve kaynakça içeren makale iskeleti.",
		files: [
			{
				path: "main.tex",
				isMain: true,
				content: String.raw`\documentclass[11pt,a4paper]{article}
\usepackage{iftex}
\ifPDFTeX
  \usepackage[T1]{fontenc}
\fi
\usepackage[turkish,shorthands=:!]{babel}
\usepackage[margin=2.5cm]{geometry}
\usepackage{amsmath,amssymb}
\usepackage{graphicx}
\usepackage{booktabs}
\usepackage{caption}
\usepackage{tikz}
\usetikzlibrary{babel}
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}
\usepackage[hidelinks]{hyperref}

\title{Makale Başlığı}
\author{Yazar Bir\thanks{Kurum, e-posta} \and Yazar İki}
\date{\today}

\begin{document}
\maketitle

\begin{abstract}
Bu çalışmada \ldots{} incelenmiştir. Önerilen yöntem, karşılaştırılan
yöntemlere göre daha yüksek doğruluk sağlamaktadır.
\end{abstract}

\section{Giriş}
Konunun arka planı ve literatür \cite{knuth1984}. Çalışmanın katkıları
Bölüm~\ref{sec:yontem} ve Bölüm~\ref{sec:bulgular}'da sunulmaktadır.

\section{Yöntem}\label{sec:yontem}
Model aşağıdaki denklemle tanımlanır:
\begin{equation}\label{eq:model}
  y = \beta_0 + \beta_1 x + \varepsilon, \qquad \varepsilon \sim \mathcal{N}(0,\sigma^2).
\end{equation}

\section{Bulgular}\label{sec:bulgular}
Denklem~\eqref{eq:model} ile elde edilen sonuçlar Şekil~\ref{fig:sonuc}
ve Tablo~\ref{tab:sonuc}'da verilmiştir.

\begin{figure}[ht]
  \centering
  \input{sekiller/sonuc}
  \caption{Ölçülen değerler ve model.}
  \label{fig:sonuc}
\end{figure}

\begin{table}[ht]
  \centering
  \caption{Yöntemlerin karşılaştırılması.}
  \label{tab:sonuc}
  \begin{tabular}{lcc}
    \toprule
    Yöntem & Doğruluk (\%) & Süre (s) \\
    \midrule
    Yöntem 1 & 81{,}2 & 12{,}4 \\
    Yöntem 2 & 84{,}7 & 15{,}1 \\
    Önerilen & \textbf{90{,}3} & 13{,}0 \\
    \bottomrule
  \end{tabular}
\end{table}

\section{Sonuç}
Elde edilen bulgular \ldots{} göstermektedir.

\begin{thebibliography}{9}
  \bibitem{knuth1984} D.~E. Knuth, \emph{The \TeX book}, Addison-Wesley, 1984.
  \bibitem{tantau} T.~Tantau, \emph{The TikZ and PGF Packages}, 2023.
\end{thebibliography}

\end{document}
`,
			},
			{
				path: "sekiller/sonuc.tex",
				content: String.raw`\begin{tikzpicture}
  \begin{axis}[
    width=0.75\linewidth, height=5.5cm,
    xlabel={$x$}, ylabel={$y$},
    grid=major, grid style={gray!20},
    legend pos=north west, legend cell align=left,
  ]
    \addplot[only marks, mark=*, blue] coordinates {
      (1,2.3) (2,2.9) (3,3.8) (4,4.1) (5,5.2) (6,5.6) (7,6.7)
    };
    \addlegendentry{Veri}
    \addplot[thick, red, domain=0.5:7.5] {1.6 + 0.71*x};
    \addlegendentry{Model}
  \end{axis}
\end{tikzpicture}`,
			},
		],
	},
];

export const academicSnippets: SeedSnippet[] = [
	{
		title: "Şekil ortamı (figure)",
		category: "Akademik Yazım",
		trigger: "sekil",
		content: String.raw`\begin{figure}[ht]
  \centering
  \input{sekiller/sekil}
  \caption{Açıklama.}
  \label{fig:etiket}
\end{figure}`,
	},
	{
		title: "Tablo (booktabs)",
		category: "Akademik Yazım",
		trigger: "tablo",
		description: "\\usepackage{booktabs} gerekir.",
		content: String.raw`\begin{table}[ht]
  \centering
  \caption{Açıklama.}
  \label{tab:etiket}
  \begin{tabular}{lcc}
    \toprule
    Sütun 1 & Sütun 2 & Sütun 3 \\
    \midrule
    a & b & c \\
    \bottomrule
  \end{tabular}
\end{table}`,
	},
	{
		title: "Hata çubuklu veri serisi",
		category: "Akademik Grafikler",
		trigger: "hata-cubugu",
		description: "pgfplots axis ortamı içinde kullanın.",
		content: String.raw`\addplot+[only marks, error bars/.cd, y dir=both, y explicit]
  coordinates { (1,2) +- (0,0.2) (2,3) +- (0,0.3) };`,
	},
	{
		title: "Değişmeli kare (tikz-cd)",
		category: "Cebir",
		trigger: "degismeli-kare",
		description: "\\usepackage{tikz-cd} gerekir.",
		content: String.raw`\begin{tikzcd}
  A \arrow[r, "f"] \arrow[d, "g"'] & B \arrow[d, "h"] \\
  C \arrow[r, "k"'] & D
\end{tikzcd}`,
	},
	{
		title: "Otomat durumu",
		category: "Bilgisayar Bilimleri",
		trigger: "durum",
		description: "automata kütüphanesi gerekir.",
		content: String.raw`\node[state, accepting] (q1) [right=of q0] {$q_1$};`,
	},
];
