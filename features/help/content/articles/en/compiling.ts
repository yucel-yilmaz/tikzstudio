import type { HelpArticle } from "@/features/help/content/types";

export const compilingAndEngines: HelpArticle = {
	slug: "derleme-ve-motorlar",
	title: "Compiling and engines",
	summary:
		"How the Compile button works, how the five engines differ and when to choose which one.",
	icon: "play",
	keywords: [
		"tectonic",
		"pdflatex",
		"xelatex",
		"lualatex",
		"biber",
		"biblatex",
		"bibliography",
		"fontspec",
		"font",
		"limit",
		"timeout",
	],
	blocks: [
		{ type: "h2", id: "derle", text: "The Compile button" },
		{
			type: "p",
			text: "When you press **Compile**, your project is sent to a secure compile sandbox with no internet access. The status badge shows **Queued**, then **Compiling…**, and finally **Succeeded**, **Failed** or **Timed out**. After a successful compile, the PDF opens in the preview.",
		},
		{
			type: "list",
			items: [
				"The compiled file is always the project's **main file** (the one marked in the file tree). You can press **Compile** straight away even while editing a part such as `figures/triangle.tex`.",
				"**Compile** first saves any unsaved changes (in all open files), so what you see on screen is always what gets compiled.",
			],
		},
		{ type: "h2", id: "motorlar", text: "Which engine should I choose?" },
		{
			type: "table",
			head: ["Engine", "When?", "Note"],
			rows: [
				[
					"**Tectonic** (default)",
					"TikZ drawings, plots, most templates.",
					"Fast, but it can only use packages that were cached in advance. A missing package or TikZ library causes an error.",
				],
				[
					"**pdfLaTeX**",
					"When you need a package Tectonic doesn't have; classic LaTeX documents.",
					"Uses a broad TeX Live selection (latex-extra, pictures, science, European languages…); package support is much wider than Tectonic's.",
				],
				[
					"**XeLaTeX**",
					"When you want to use OpenType/TrueType fonts (`fontspec`), like on your own computer.",
					"Handles Unicode text natively.",
				],
				[
					"**LuaLaTeX**",
					"When you need `fontspec` font settings or calculations in Lua.",
					"Usually a little slower than the others.",
				],
				[
					"**pdfLaTeX + Biber**",
					"Papers and theses with a `biblatex` bibliography.",
					"The document is processed four times (pdfLaTeX → Biber → pdfLaTeX → pdfLaTeX), so it takes longer.",
				],
			],
		},
		{
			type: "callout",
			tone: "tip",
			title: "Rule of thumb",
			text: 'Try **Tectonic** first. If you get a package or library error such as "not found", switch to **pdfLaTeX**. If you have a bibliography, choose **pdfLaTeX + Biber**.',
		},
		{
			type: "p",
			text: "Your engine choice is saved with the project, so the next time you open it (on any device) you continue with the same engine. A project created from a template starts with the template's engine.",
		},
		{
			type: "h2",
			id: "biber",
			text: "Bibliography example (pdfLaTeX + Biber)",
		},
		{
			type: "p",
			text: "Add a `references.bib` file to the project and load the `biblatex` package with `backend=biber` in the main file:",
		},
		{
			type: "code",
			title: "main.tex",
			code: String.raw`\documentclass{article}
\usepackage[backend=biber,style=authoryear]{biblatex}
\addbibresource{references.bib}
\begin{document}
TikZ is built on top of PGF \parencite{tantau2023}.
\printbibliography
\end{document}`,
		},
		{
			type: "code",
			title: "references.bib",
			code: `@manual{tantau2023,
  author = {Till Tantau},
  title  = {The TikZ and PGF Packages},
  year   = {2023}
}`,
		},
		{
			type: "callout",
			tone: "warning",
			text: "Classic BibTeX documents that use `\\bibliography{...}` and `\\bibliographystyle{...}` aren't supported. Use `biblatex` and `\\printbibliography`.",
		},
		{
			type: "h2",
			id: "xelatex",
			text: "Font example (XeLaTeX / LuaLaTeX)",
		},
		{
			type: "code",
			title: "main.tex",
			code: String.raw`\documentclass{article}
\usepackage{fontspec}
% One of the fonts available in the compile sandbox (e.g. DejaVu Serif, DejaVu Sans)
\setmainfont{DejaVu Serif}
\begin{document}
Modern fonts with full Unicode: ğüşıöç ĞÜŞİÖÇ.
\end{document}`,
		},
		{ type: "h2", id: "sinirlar", text: "Limits" },
		{
			type: "list",
			items: [
				'You can compile **at most 5 times per minute**. If you go over the limit, you see a "Too many compile requests" warning; wait a minute and try again.',
				"Each compile is limited to about **12 seconds**. If time runs out, the status becomes **Timed out**. pdfLaTeX + Biber may run longer than this.",
				"The compile sandbox has no internet access. Your document can't download files or packages.",
				"The sandbox has limited memory and CPU; very heavy drawings (such as plots with thousands of points) may time out.",
			],
		},
		{
			type: "p",
			text: "If you get a timeout or an error, see [Troubleshooting](/yardim/sorun-giderme).",
		},
	],
};

export const outputsAndExport: HelpArticle = {
	slug: "ciktilar-ve-disa-aktarma",
	title: "Output and export",
	summary:
		"PDF preview and zoom, the compile log, the History tab and downloading PDF/SVG/PNG.",
	icon: "download",
	keywords: [
		"pdf",
		"svg",
		"png",
		"300 dpi",
		"download",
		"preview",
		"zoom",
		"log",
		"history",
		"word",
		"powerpoint",
	],
	blocks: [
		{ type: "h2", id: "onizleme", text: "PDF preview" },
		{
			type: "list",
			items: [
				"After a successful compile, the PDF appears in the **Preview** tab of the **Output panel**.",
				"The **–** and **+** buttons change the zoom between 60% and 240%.",
				"Multi-page documents show all pages one below the other (the first 30 pages); the page count is shown next to the zoom level. Download the PDF to see longer documents in full.",
			],
		},
		{ type: "h2", id: "gunluk", text: "Compile log" },
		{
			type: "p",
			text: "The **Compile log** below the preview summarizes the important lines of the long log LaTeX produces: error lines starting with `!`, line numbers such as `l.12`, and warnings. If an error includes a line number, a red marker appears next to that line in the editor.",
		},
		{
			type: "code",
			language: "text",
			title: "Example log",
			code: String.raw`! Undefined control sequence.
l.12   \drw
           (0,0) -- (1,1);`,
		},
		{
			type: "p",
			text: "In this example, line 12 says `\\drw` instead of `\\draw`. For the meaning of common errors, see [Troubleshooting](/yardim/sorun-giderme).",
		},
		{ type: "h2", id: "indirme", text: "Downloading PDF, SVG and PNG" },
		{
			type: "table",
			head: ["Format", "Good for"],
			rows: [
				[
					"**Download PDF**",
					"Printing, including in LaTeX documents with `\\includegraphics`, all pages.",
				],
				[
					"**Download SVG**",
					"Web pages and vector editors (Inkscape etc.). Scales without losing quality.",
				],
				[
					"**Download PNG**",
					"A print-quality 300 DPI image: Word, PowerPoint, Google Slides, worksheets.",
				],
			],
		},
		{
			type: "callout",
			tone: "info",
			text: "SVG and PNG files are generated from the **first page** of the document only. That's why the `standalone` document class gives the best results for individual figures: the page is cropped to the size of the drawing.",
		},
		{
			type: "code",
			code: String.raw`\documentclass[tikz,border=8pt]{standalone}`,
		},
		{ type: "h2", id: "gecmis", text: "History tab" },
		{
			type: "p",
			text: "The **History** tab in the **Output panel** lists the project's earlier compiles, newest first. Each row shows the status (**Succeeded**, **Failed**, **Timed out**), the engine used and the time. You can download the PDF, SVG and PNG files of successful compiles from here too, which makes it easy to go back to an earlier version.",
		},
		{
			type: "callout",
			tone: "warning",
			text: "The files of compiles older than 24 hours are deleted from the server, except for the project's latest successful compile. The history entries remain, but the download buttons of old rows disappear. Download any output you want to keep.",
		},
	],
};
