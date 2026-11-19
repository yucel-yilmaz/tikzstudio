/** General-purpose TikZ starter templates and snippets (official). */
import type { SeedSnippet, SeedTemplate } from "./math-templates";

const defaultDocument = String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}

\begin{document}

\begin{tikzpicture}
  \draw[->] (0,0) -- (3,0);
  \node at (1.5,0.3) {Merhaba TikZ};
\end{tikzpicture}

\end{document}
`;

export const basicTemplates: SeedTemplate[] = [
	{
		title: "Ok ve doğru parçası",
		previousTitles: ["Basic Line and Arrow"],
		category: "Temel Şekiller",
		description: "Yönlü basit bir doğru parçası.",
		content: defaultDocument,
	},
	{
		title: "Dikdörtgen düğüm",
		previousTitles: ["Rectangle Node"],
		category: "Düğümler",
		description: "Köşeleri yuvarlatılmış tek dikdörtgen düğüm.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}
  \node[draw, rounded corners, minimum width=4cm, minimum height=1cm] {Dikdörtgen düğüm};
\end{tikzpicture}
\end{document}
`,
	},
	{
		title: "Çember düğüm",
		previousTitles: ["Circle Node"],
		category: "Düğümler",
		description: "Tek çember biçimli düğüm.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}
  \node[draw, circle, minimum size=1.2cm] {A};
\end{tikzpicture}
\end{document}
`,
	},
	{
		title: "Akış şeması",
		previousTitles: ["Flowchart"],
		category: "Akış Şemaları",
		description: "Üç adımlı akış şeması.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}
  \node[draw, rounded corners] (start) at (0,0) {Başla};
  \node[draw, rounded corners] (process) at (0,-1.7) {İşlem};
  \node[draw, rounded corners] (end) at (0,-3.4) {Bitir};
  \draw[->] (start) -- (process);
  \draw[->] (process) -- (end);
\end{tikzpicture}
\end{document}
`,
	},
	{
		title: "Koordinat düzlemi",
		previousTitles: ["Coordinate Plane"],
		category: "Koordinat Sistemi",
		description: "Etiketli x–y eksenleri.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}[scale=0.8]
  \draw[->] (-3,0) -- (3,0) node[right] {$x$};
  \draw[->] (0,-3) -- (0,3) node[above] {$y$};
  \draw[step=1, gray!30] (-3,-3) grid (3,3);
\end{tikzpicture}
\end{document}
`,
	},
	{
		title: "Fonksiyon grafiği",
		previousTitles: ["Function Plot"],
		category: "Grafikler",
		description: "İkinci dereceden fonksiyon örneği.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}[scale=0.8]
  \draw[->] (-3,0) -- (3,0);
  \draw[->] (0,-1) -- (0,5);
  \draw[domain=-2:2, smooth, variable=\x, blue, thick] plot ({\x}, {\x*\x});
\end{tikzpicture}
\end{document}
`,
	},
	{
		title: "Basit üçgen",
		previousTitles: ["Triangle Geometry"],
		category: "Geometri",
		description: "Köşeleri etiketli üçgen.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}
  \coordinate (A) at (0,0);
  \coordinate (B) at (4,0);
  \coordinate (C) at (1.5,2.8);
  \draw (A) -- (B) -- (C) -- cycle;
  \node[below left] at (A) {$A$};
  \node[below right] at (B) {$B$};
  \node[above] at (C) {$C$};
\end{tikzpicture}
\end{document}
`,
	},
	{
		title: "Yönlü çizge",
		previousTitles: ["Directed Graph"],
		category: "Grafikler",
		description: "Üç düğümlü yönlü çizge.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}
  \node[draw, circle] (a) at (0,0) {A};
  \node[draw, circle] (b) at (2,1.5) {B};
  \node[draw, circle] (c) at (4,0) {C};
  \draw[->] (a) -- (b);
  \draw[->] (b) -- (c);
  \draw[->, bend right=25] (c) to (a);
\end{tikzpicture}
\end{document}
`,
	},
	{
		title: "Ağaç diyagramı",
		previousTitles: ["Tree Diagram"],
		category: "Ağaçlar",
		description: "Basit köklü ağaç.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}[
  level distance=1.3cm,
  sibling distance=2.4cm,
  every node/.style={draw, rounded corners, inner sep=4pt}
]
  \node {Kök}
    child { node {Sol} }
    child { node {Sağ} };
\end{tikzpicture}
\end{document}
`,
	},
	{
		title: "Basit yapay sinir ağı",
		previousTitles: ["Simple Neural Network Diagram"],
		category: "Akış Şemaları",
		description: "Küçük ileri beslemeli ağ.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}[x=1.5cm, y=1cm]
  \foreach \y in {0,1,2} \node[draw, circle] (i\y) at (0,\y) {};
  % Node names must not contain dots (TikZ reads "h0.5" as anchor "5" of "h0").
  \foreach \y/\n in {0.5/1, 1.5/2} \node[draw, circle] (h\n) at (2,\y) {};
  \node[draw, circle] (o) at (4,1) {};
  \foreach \i in {0,1,2} \foreach \h in {1,2} \draw[->] (i\i) -- (h\h);
  \foreach \h in {1,2} \draw[->] (h\h) -- (o);
\end{tikzpicture}
\end{document}
`,
	},
];

export const basicSnippets: SeedSnippet[] = [
	{
		title: "Basit ok",
		category: "Oklar",
		trigger: "arrow-basic",
		content: String.raw`\draw[->] (0,0) -- (3,0);`,
	},
	{
		title: "Dikdörtgen",
		category: "Temel Şekiller",
		trigger: "shape-rect",
		content: String.raw`\draw (0,0) rectangle (3,2);`,
	},
	{
		title: "Çember",
		category: "Temel Şekiller",
		trigger: "shape-circle",
		content: String.raw`\draw (0,0) circle (1cm);`,
	},
	{
		title: "Düğüm",
		category: "Düğümler",
		trigger: "node-basic",
		content: String.raw`\node[draw] (A) at (0,0) {A};`,
	},
	{
		title: "Koordinat ızgarası",
		category: "Koordinat Sistemi",
		trigger: "grid-basic",
		content: String.raw`\draw[step=1, gray!30] (-3,-3) grid (3,3);`,
	},
	{
		title: "Akış adımı",
		category: "Akış Şemaları",
		trigger: "flow-step",
		content: String.raw`\node[draw, rounded corners] (step) at (0,0) {Adım};`,
	},
	{
		title: "Üçgen",
		category: "Geometri",
		trigger: "triangle",
		content: String.raw`\draw (0,0) -- (2,0) -- (1,1.7) -- cycle;`,
	},
	{
		title: "Ağaç dalı",
		category: "Ağaçlar",
		trigger: "tree-child",
		content: "child { node {Etiket} }",
	},
	{
		title: "Yönlü kenar",
		category: "Grafikler",
		trigger: "graph-edge",
		content: String.raw`\draw[->] (A) -- (B);`,
	},
	{
		title: "Devre teli",
		category: "Devre Şemaları",
		trigger: "wire-basic",
		content: String.raw`\draw (0,0) -- (2,0);`,
	},
];
