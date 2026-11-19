/**
 * High-school mathematics templates (Turkish). Every template is a complete,
 * compilable document; they are verified against both Tectonic and pdfLaTeX.
 *
 * Notes for authors:
 * - Turkish babel makes `=` an active character, which breaks key=value
 *   options (TikZ, enumitem). Load it as
 *   `\usepackage[turkish,shorthands=:!]{babel}` and also load
 *   `\usetikzlibrary{babel}`.
 * - Keep libraries in sync with docker/compiler/warmup-math.tex, otherwise
 *   Tectonic (`--only-cached`) cannot find them.
 */

export type SeedTemplateFile = {
	path: string;
	content: string;
	isMain?: boolean;
};

export type SeedTemplate = {
	title: string;
	category: string;
	description: string;
	content?: string;
	files?: SeedTemplateFile[];
};

export type SeedSnippet = {
	title: string;
	category: string;
	trigger: string;
	description?: string;
	content: string;
};

const standalone = (libraries: string, body: string, extraPreamble = "") =>
	String.raw`\documentclass[tikz,border=8pt]{standalone}
\usepackage{amsmath,amssymb}
\usepackage{tikz}
${libraries ? `\\usetikzlibrary{${libraries}}\n` : ""}${extraPreamble}
\begin{document}
${body}
\end{document}
`;

const pgfplotsPreamble = String.raw`\usepackage{pgfplots}
\pgfplotsset{compat=1.18}`;

export const mathTemplates: SeedTemplate[] = [
	{
		title: "Üçgen: açılar, kenarlar ve yükseklik",
		category: "Geometri",
		description:
			"ABC üçgeni; açı yayları, kenar etiketleri ve dik açı işaretli yükseklik.",
		content: standalone(
			"angles,quotes,calc",
			String.raw`\begin{tikzpicture}[scale=1.2, line join=round]
  \coordinate (A) at (0,0);
  \coordinate (B) at (5,0);
  \coordinate (C) at (1.8,3.2);
  \coordinate (H) at ($(A)!(C)!(B)$);

  \draw[thick] (A) -- (B) -- (C) -- cycle;
  \draw[dashed] (C) -- (H);
  \pic[draw, angle radius=2.5mm] {right angle = C--H--B};

  \pic[draw, "$\alpha$", angle eccentricity=1.6, angle radius=6mm] {angle = B--A--C};
  \pic[draw, "$\beta$",  angle eccentricity=1.6, angle radius=6mm] {angle = C--B--A};
  \pic[draw, "$\gamma$", angle eccentricity=1.6, angle radius=5mm] {angle = A--C--B};

  \node[below left]  at (A) {$A$};
  \node[below right] at (B) {$B$};
  \node[above]       at (C) {$C$};
  \node[below]       at (H) {$H$};

  \path (A) -- (B) node[midway, below=6pt] {$c$};
  \path (B) -- (C) node[midway, above right] {$a$};
  \path (A) -- (C) node[midway, above left] {$b$};
  \path (C) -- (H) node[midway, right] {$h$};
\end{tikzpicture}`,
		),
	},
	{
		title: "Çember: merkez, teğet ve kiriş",
		category: "Geometri",
		description:
			"O merkezli çember, T noktasında teğet (dik açı işaretli) ve AB kirişi.",
		content: standalone(
			"angles,quotes,calc",
			String.raw`\begin{tikzpicture}[scale=1.1]
  \coordinate (O) at (0,0);
  \def\r{2}
  \draw[thick] (O) circle (\r);
  \fill (O) circle (1.5pt) node[below left] {$O$};

  % Teğet: T noktasında yarıçapa dik
  \coordinate (T) at (60:\r);
  \draw (O) -- node[midway, left] {$r$} (T);
  \coordinate (T1) at ($(T)!1.8cm!90:(O)$);
  \coordinate (T2) at ($(T)!-1.8cm!90:(O)$);
  \draw[thick] (T1) -- (T2);
  \pic[draw, angle radius=2.5mm] {right angle = O--T--T1};
  \fill (T) circle (1.5pt) node[above right] {$T$};

  % Kiriş
  \coordinate (A) at (200:\r);
  \coordinate (B) at (320:\r);
  \draw[thick, blue] (A) -- (B);
  \fill (A) circle (1.5pt) node[left] {$A$};
  \fill (B) circle (1.5pt) node[below right] {$B$};
\end{tikzpicture}`,
		),
	},
	{
		title: "Üçgen ve çevrel çember (tkz-euclide)",
		category: "Geometri",
		description:
			"tkz-euclide ile üçgen, çevrel çember ve açı işaretleri — öğretmenlerin sık kullandığı paket.",
		content: standalone(
			"",
			String.raw`\begin{tikzpicture}
  \tkzDefPoints{0/0/A, 6/0/B, 2/3.5/C}
  \tkzDefCircle[circum](A,B,C) \tkzGetPoint{O}
  \tkzDrawCircle[dashed](O,A)
  \tkzDrawPolygon[thick](A,B,C)
  \tkzDrawPoints(A,B,C,O)
  \tkzLabelPoints[below left](A)
  \tkzLabelPoints[below right](B)
  \tkzLabelPoints[above](C)
  \tkzLabelPoints[right](O)
  \tkzMarkAngle[size=0.7](B,A,C)
  \tkzLabelAngle[pos=1](B,A,C){$40^\circ$}
  \tkzMarkSegments[mark=|](O,A O,B O,C)
\end{tikzpicture}`,
			String.raw`\usepackage{tkz-euclide}`,
		),
	},
	{
		title: "Doğrunun grafiği ve kesişim noktası",
		category: "Analitik Geometri",
		description:
			"İki doğrunun grafiği, eksenler ve kesişim noktası (pgfplots).",
		content: standalone(
			"",
			String.raw`\begin{tikzpicture}
  \begin{axis}[
    axis lines=middle, xlabel={$x$}, ylabel={$y$},
    xmin=-3, xmax=5, ymin=-4, ymax=6,
    xtick={-2,...,4}, ytick={-3,...,5},
    grid=both, grid style={gray!20},
    width=9cm, height=8cm, samples=2,
  ]
    \addplot[thick, blue, domain=-3:5] {2*x - 1} node[pos=0.92, left] {$y=2x-1$};
    \addplot[thick, red,  domain=-3:5] {-x + 3}  node[pos=0.08, above right] {$y=-x+3$};
    \addplot[only marks, mark=*] coordinates {(4/3, 5/3)};
    \draw[<-, shorten <=3pt] (axis cs:4/3,5/3) -- (axis cs:2.6,3.4)
      node[right] {$K\left(\tfrac43,\tfrac53\right)$};
  \end{axis}
\end{tikzpicture}`,
			pgfplotsPreamble,
		),
	},
	{
		title: "Parabol: kökler, tepe noktası, simetri ekseni",
		category: "Fonksiyonlar",
		description:
			"f(x)=x²−2x−3 parabolü; kökler, tepe noktası ve simetri ekseni.",
		content: standalone(
			"",
			String.raw`\begin{tikzpicture}
  \begin{axis}[
    axis lines=middle, xlabel={$x$}, ylabel={$y$},
    xmin=-3, xmax=5, ymin=-5, ymax=6,
    xtick={-2,-1,...,4}, ytick={-4,-3,...,5},
    grid=both, grid style={gray!20},
    width=9cm, height=8cm,
    legend style={font=\small, at={(0.5,1.03)}, anchor=south, legend columns=-1},
    every tick label/.append style={font=\small, fill=white, inner sep=1pt},
  ]
    \addplot[very thick, blue, domain=-2.2:4.2, samples=100] {x^2 - 2*x - 3};
    \addlegendentry{$f(x)=x^2-2x-3$}
    \addplot[dashed, gray, forget plot] coordinates {(1,-5) (1,6)};
    \addplot[only marks, mark=*, forget plot] coordinates {(-1,0) (3,0) (1,-4) (0,-3)};
    \node[below right] at (axis cs:1,-4) {$T(1,-4)$};
  \end{axis}
\end{tikzpicture}`,
			pgfplotsPreamble,
		),
	},
	{
		title: "Parçalı fonksiyon (limit / süreklilik)",
		category: "Fonksiyonlar",
		description:
			"Açık ve dolu noktalarla parçalı fonksiyon grafiği; limit ve süreklilik soruları için.",
		content: standalone(
			"",
			String.raw`\begin{tikzpicture}
  \begin{axis}[
    axis lines=middle, xlabel={$x$}, ylabel={$y$},
    xmin=-3, xmax=5, ymin=-2, ymax=5,
    xtick={-2,...,4}, ytick={-1,...,4},
    grid=both, grid style={gray!20},
    width=9cm, height=7cm,
  ]
    \addplot[very thick, blue, domain=-3:1] {x + 2};
    \addplot[very thick, blue, domain=1:5, samples=50] {(x-3)^2/2};
    % x=1 noktasında soldan limit 3, f(1)=2 (dolu), sağdan limit 2
    \addplot[only marks, mark=o, mark size=2.5pt, fill=white] coordinates {(1,3)};
    \addplot[only marks, mark=*, mark size=2.5pt] coordinates {(1,2)};
    \node[blue] at (axis cs:3.8,3.6) {$y=f(x)$};
  \end{axis}
\end{tikzpicture}`,
			pgfplotsPreamble,
		),
	},
	{
		title: "Birim çember: sin ve cos",
		category: "Trigonometri",
		description:
			"Birim çemberde θ açısı, cos θ ve sin θ izdüşümleri ile P(cos θ, sin θ).",
		content: standalone(
			"angles,quotes",
			String.raw`\begin{tikzpicture}[scale=2.6]
  \draw[->] (-1.25,0) -- (1.35,0) node[right] {$x$};
  \draw[->] (0,-1.25) -- (0,1.35) node[above] {$y$};
  \draw[thick] (0,0) circle (1);
  \coordinate (O) at (0,0);
  \coordinate (X) at (1,0);
  \coordinate (P) at (35:1);
  \coordinate (Q) at (35:1 |- O);

  \draw[thick] (O) -- (P);
  \draw[very thick, red]  (O) -- (Q) node[midway, below] {$\cos\theta$};
  \draw[very thick, blue] (Q) -- (P) node[midway, right] {$\sin\theta$};
  \pic[draw, "$\theta$", angle radius=6mm, angle eccentricity=1.35] {angle = X--O--P};
  \fill (P) circle (0.6pt) node[above right] {$P(\cos\theta,\sin\theta)$};

  \foreach \p/\t in {(1,0)/{$1$}, (-1,0)/{$-1$}} \node[below left] at \p {\t};
  \foreach \p/\t in {(0,1)/{$1$}, (0,-1)/{$-1$}} \node[above left] at \p {\t};
\end{tikzpicture}`,
		),
	},
	{
		title: "Sayı doğrusu ve aralıklar",
		category: "Sayılar ve Eşitsizlikler",
		description:
			"Sayı doğrusunda [−2, 3) aralığı; dolu ve boş uç noktaları ile.",
		content: standalone(
			"arrows.meta",
			String.raw`\begin{tikzpicture}[x=1cm]
  \draw[{Latex}-{Latex}, thick] (-5.6,0) -- (5.6,0);
  \foreach \x in {-5,...,5} {
    \draw (\x,0.1) -- (\x,-0.1) node[below=2pt] {$\x$};
  }
  \draw[line width=3pt, blue!70] (-2,0) -- (3,0);
  \fill[blue!70] (-2,0) circle (3.5pt);
  \filldraw[fill=white, draw=blue!70, line width=1.2pt] (3,0) circle (3.5pt);
  \node[above=6pt, blue!70!black] at (0.5,0) {$-2 \le x < 3$};
\end{tikzpicture}`,
		),
	},
	{
		title: "Venn şeması (üç küme)",
		category: "Kümeler",
		description: "A, B, C kümeleri; A∩B bölgesi taralı, evrensel küme E.",
		content: standalone(
			"",
			String.raw`\begin{tikzpicture}[thick]
  \def\A{(0,0) circle (1.6)}
  \def\B{(2,0) circle (1.6)}
  \def\C{(1,-1.7) circle (1.6)}
  \begin{scope}
    \clip \A;
    \fill[orange!35] \B;
  \end{scope}
  \draw \A;
  \draw \B;
  \draw \C;
  \node at (-1.1,1.25) {$A$};
  \node at (3.1,1.25)  {$B$};
  \node at (1,-3.55)   {$C$};
  \draw (-2.2,-3.9) rectangle (4.2,2.2);
  \node[anchor=north west] at (-2.2,2.2) {$E$};
\end{tikzpicture}`,
		),
	},
	{
		title: "Olasılık ağacı (iki aşamalı)",
		category: "Olasılık",
		description:
			"Torbadan iade etmeden iki top çekme; dallarda olasılıklar, uçlarda sonuçlar.",
		content: standalone(
			"trees",
			String.raw`\begin{tikzpicture}[
  grow=right,
  level 1/.style={sibling distance=3.6cm, level distance=3.2cm},
  level 2/.style={sibling distance=1.8cm, level distance=3.2cm},
  edge from parent/.style={draw, -latex},
  prob/.style={fill=white, inner sep=1.5pt, font=\small},
]
  \node[circle, draw] {}
    child { node[circle, draw, fill=red!15] {K}
      child { node[label=right:{$P(KK)=\frac{2}{5}\cdot\frac{1}{4}$}] {K}
        edge from parent node[prob, above, near end] {$\frac{1}{4}$} }
      child { node[label=right:{$P(KM)=\frac{2}{5}\cdot\frac{3}{4}$}] {M}
        edge from parent node[prob, below, near end] {$\frac{3}{4}$} }
      edge from parent node[prob, above left] {$\frac{2}{5}$} }
    child { node[circle, draw, fill=blue!15] {M}
      child { node[label=right:{$P(MK)=\frac{3}{5}\cdot\frac{2}{4}$}] {K}
        edge from parent node[prob, above, near end] {$\frac{2}{4}$} }
      child { node[label=right:{$P(MM)=\frac{3}{5}\cdot\frac{2}{4}$}] {M}
        edge from parent node[prob, below, near end] {$\frac{2}{4}$} }
      edge from parent node[prob, below left] {$\frac{3}{5}$} };
\end{tikzpicture}`,
		),
	},
	{
		title: "Katı cisimler: prizma, silindir, koni",
		category: "Katı Cisimler",
		description:
			"Dikdörtgenler prizması, silindir ve koni; görünmeyen ayrıtlar kesikli.",
		content: standalone(
			"calc",
			String.raw`\begin{tikzpicture}[thick, line join=round]
  % Dikdörtgenler prizması
  \begin{scope}
    \def\a{2.4} \def\b{1.6} \def\c{1.2}
    \coordinate (d) at (0.8,0.6);
    \draw (0,0) rectangle (\a,\b);
    \draw (0,\b) -- ++(d) -- ++(\a,0) -- (\a,\b);
    \draw (\a,0) -- ++(d) -- ++(0,\b);
    \draw[dashed] (0,0) -- ++(d) -- ++(\a,0);
    \draw[dashed] ($(0,0)+(d)$) -- ++(0,\b);
    \node[below] at (\a/2,0) {$a$};
    \node[left]  at (0,\b/2) {$c$};
    \node[below right] at ($(\a,0)+0.5*(d)$) {$b$};
  \end{scope}

  % Silindir
  \begin{scope}[xshift=5cm]
    \draw (0,2) ellipse (1 and 0.3);
    \draw (-1,0) -- (-1,2) (1,0) -- (1,2);
    \draw (-1,0) arc (180:360:1 and 0.3);
    \draw[dashed] (1,0) arc (0:180:1 and 0.3);
    \draw[dashed] (0,0) -- node[below] {$r$} (1,0);
    \draw[dashed] (0,0) -- node[left] {$h$} (0,2);
    \fill (0,0) circle (1.2pt);
  \end{scope}

  % Koni
  \begin{scope}[xshift=9cm]
    \draw (-1,0) -- (0,2.4) -- (1,0);
    \draw (-1,0) arc (180:360:1 and 0.3);
    \draw[dashed] (1,0) arc (0:180:1 and 0.3);
    \draw[dashed] (0,0) -- node[below] {$r$} (1,0);
    \draw[dashed] (0,0) -- node[left] {$h$} (0,2.4);
    \node[right] at (0.55,1.3) {$\ell$};
    \fill (0,0) circle (1.2pt);
  \end{scope}
\end{tikzpicture}`,
		),
	},
	{
		title: "İki eğri arasındaki alan (integral)",
		category: "İntegral",
		description:
			"y = x + 2 ile y = x² arasında kalan bölge taralı (pgfplots fillbetween).",
		content: standalone(
			"",
			String.raw`\begin{tikzpicture}
  \begin{axis}[
    axis lines=middle, xlabel={$x$}, ylabel={$y$},
    xmin=-2.5, xmax=3, ymin=-0.8, ymax=5.5,
    xtick={-2,-1,...,2}, ytick={1,...,5},
    width=9cm, height=8cm,
    legend style={font=\small, at={(0.5,1.03)}, anchor=south, legend columns=-1},
  ]
    \addplot[name path=f, very thick, blue, domain=-2.2:2.6, samples=100] {x^2};
    \addlegendentry{$y=x^2$}
    \addplot[name path=g, very thick, red,  domain=-2.4:2.8] {x + 2};
    \addlegendentry{$y=x+2$}
    \addplot[orange!40, forget plot] fill between[of=f and g, soft clip={domain=-1:2}];
  \end{axis}
\end{tikzpicture}`,
			String.raw`\usepackage{pgfplots}
\usepgfplotslibrary{fillbetween}
\pgfplotsset{compat=1.18}`,
		),
	},
	{
		title: "Sınav kâğıdı (çok dosyalı, A–E şıklı)",
		category: "Soru Hazırlama",
		description:
			"A4 yazılı/test kâğıdı: başlık bilgileri, iki sütun, şekilli sorular ve A–E şıkları. Şekiller ayrı dosyalarda.",
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
\usepackage[margin=1.6cm]{geometry}
\usepackage{amsmath,amssymb}
\usepackage{multicol}
\usepackage{enumitem}
\usepackage{tikz}
\usetikzlibrary{babel,angles,quotes,calc}
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}

\setlength{\columnsep}{1cm}
\setlength{\columnseprule}{0.4pt}
\pagestyle{empty}

% \begin{soru} ... \end{soru} — numaralı soru; metin, şekil ve şıklar
% sütun/sayfa sonunda bölünmeden aynı blokta kalır.
\newcounter{soru}
\newenvironment{soru}
  {\stepcounter{soru}\par\medskip\noindent
   \begin{minipage}{\linewidth}\textbf{\thesoru.}~\ignorespaces}
  {\end{minipage}\par\medskip}
% \siklar{A}{B}{C}{D}{E}    — kısa şıklar, tek satırda
% \siklaralt{A}{B}{C}{D}{E} — uzun şıklar, alt alta
\newcommand{\siklar}[5]{%
  \par\smallskip\noindent
  \makebox[0.2\linewidth][l]{A)~#1}\makebox[0.2\linewidth][l]{B)~#2}%
  \makebox[0.2\linewidth][l]{C)~#3}\makebox[0.2\linewidth][l]{D)~#4}%
  \makebox[0.2\linewidth][l]{E)~#5}\par}
\newcommand{\siklaralt}[5]{%
  \begin{enumerate}[label=\Alph*), leftmargin=2em, itemsep=1pt, topsep=2pt]
    \item #1 \item #2 \item #3 \item #4 \item #5
  \end{enumerate}}

\begin{document}

\begin{center}
  {\large\textbf{2026--2027 EĞİTİM ÖĞRETİM YILI}}\\[2pt]
  {\large\textbf{..... LİSESİ 10. SINIF MATEMATİK DERSİ 1. DÖNEM 1. YAZILI}}\\[8pt]
  \begin{tabular}{@{}l@{\hspace{3cm}}l@{}}
    Adı Soyadı: \rule{5cm}{0.4pt} & Numarası: \rule{2.5cm}{0.4pt} \\[4pt]
    Sınıfı: \rule{2cm}{0.4pt} & Puanı: \rule{2.5cm}{0.4pt}
  \end{tabular}
\end{center}
\hrule\medskip

\begin{multicols}{2}

\begin{soru}
Şekildeki $ABC$ üçgeninde $[CH] \perp [AB]$, $|AH| = 3$ birim, $|HB| = 5$ birim ve $|CH| = 4$ birimdir. Buna göre $|BC|$ kaç birimdir?
\begin{center}
  \input{sekiller/ucgen}
\end{center}
\siklar{$\sqrt{34}$}{$6$}{$\sqrt{41}$}{$7$}{$\sqrt{57}$}
\end{soru}

\begin{soru}
Grafiği verilen $f(x) = x^2 - 2x - 3$ fonksiyonunun tepe noktasının koordinatları toplamı kaçtır?
\begin{center}
  \input{sekiller/parabol}
\end{center}
\siklar{$-5$}{$-3$}{$-1$}{$1$}{$3$}
\end{soru}

\begin{soru}
$2x - 1 \le 5$ eşitsizliğini sağlayan kaç farklı pozitif tam sayı vardır?
\siklar{$1$}{$2$}{$3$}{$4$}{$5$}
\end{soru}

\begin{soru}
Bir torbada 3 mavi ve 2 kırmızı top vardır. Torbadan iade edilmeden çekilen iki topun ikisinin de mavi olma olasılığı kaçtır?
\siklar{$\frac{1}{10}$}{$\frac{1}{5}$}{$\frac{3}{10}$}{$\frac{2}{5}$}{$\frac{3}{5}$}
\end{soru}

\end{multicols}

\vfill
\begin{center}\small Başarılar dileriz. \quad Süre: 40 dakika\end{center}

\end{document}
`,
			},
			{
				path: "sekiller/ucgen.tex",
				content: String.raw`\begin{tikzpicture}[scale=0.55, thick]
  \coordinate (A) at (0,0);
  \coordinate (H) at (3,0);
  \coordinate (B) at (8,0);
  \coordinate (C) at (3,4);
  \draw (A) -- (B) -- (C) -- cycle;
  \draw[dashed] (C) -- (H);
  \pic[draw, angle radius=2.5mm] {right angle = C--H--B};
  \node[below left] at (A) {$A$};
  \node[below] at (H) {$H$};
  \node[below right] at (B) {$B$};
  \node[above] at (C) {$C$};
  \node[below] at (1.5,0) {$3$};
  \node[below] at (5.5,0) {$5$};
  \node[left] at (3,2) {$4$};
\end{tikzpicture}`,
			},
			{
				path: "sekiller/parabol.tex",
				content: String.raw`\begin{tikzpicture}
  \begin{axis}[
    axis lines=middle, xlabel={$x$}, ylabel={$y$},
    xmin=-2.5, xmax=4.5, ymin=-5, ymax=4,
    xtick={-1,3}, ytick={-3},
    width=6.5cm, height=5.5cm,
    every tick label/.append style={font=\small, fill=white, inner sep=1pt},
  ]
    \addplot[very thick, blue, domain=-1.9:3.9, samples=80] {x^2 - 2*x - 3};
  \end{axis}
\end{tikzpicture}`,
			},
		],
	},
];

export const mathSnippets: SeedSnippet[] = [
	{
		title: "Dik açı işareti",
		category: "Matematik",
		trigger: "dik-aci",
		description: "angles kütüphanesi gerekir: \\usetikzlibrary{angles}",
		content: String.raw`\pic[draw, angle radius=2.5mm] {right angle = A--H--B};`,
	},
	{
		title: "Açı yayı ve etiketi",
		category: "Matematik",
		trigger: "aci",
		description: "angles,quotes kütüphaneleri gerekir.",
		content: String.raw`\pic[draw, "$\alpha$", angle eccentricity=1.6, angle radius=6mm] {angle = B--A--C};`,
	},
	{
		title: "Dolu nokta ve etiket",
		category: "Matematik",
		trigger: "nokta",
		content: String.raw`\fill (A) circle (1.5pt) node[above] {$A$};`,
	},
	{
		title: "Boş (açık) nokta",
		category: "Matematik",
		trigger: "acik-nokta",
		content: String.raw`\filldraw[fill=white, draw=black] (1,2) circle (2pt);`,
	},
	{
		title: "Koordinat eksenleri (pgfplots)",
		category: "Matematik",
		trigger: "eksen",
		description: "\\usepackage{pgfplots} gerekir.",
		content: String.raw`\begin{axis}[axis lines=middle, xlabel={$x$}, ylabel={$y$}, xmin=-5, xmax=5, ymin=-5, ymax=5, grid=both, grid style={gray!20}]
  \addplot[very thick, blue, domain=-4:4, samples=100] {x^2};
\end{axis}`,
	},
	{
		title: "Doğru parçası orta noktası",
		category: "Matematik",
		trigger: "orta-nokta",
		description: "calc kütüphanesi gerekir.",
		content: String.raw`\coordinate (M) at ($(A)!0.5!(B)$);`,
	},
	{
		title: "Kesikli (görünmeyen) ayrıt",
		category: "Matematik",
		trigger: "kesikli",
		content: String.raw`\draw[dashed] (0,0) -- (1,1);`,
	},
	{
		title: "Çember yayı",
		category: "Matematik",
		trigger: "yay",
		content: String.raw`\draw (2,0) arc[start angle=0, end angle=120, radius=2];`,
	},
];
