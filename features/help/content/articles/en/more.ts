import type { HelpArticle } from "@/features/help/content/types";

export const templatesAndSnippets: HelpArticle = {
	slug: "sablonlar-ve-kod-parcaciklari",
	title: "Templates and snippets",
	summary:
		"Use ready-made templates, insert snippets with triggers, turn images of formulas into LaTeX and save your own templates.",
	icon: "layout",
	keywords: [
		"template",
		"snippet",
		"trigger",
		"img2latex",
		"image to latex",
		"mathpix",
		"pix2tex",
		"save as template",
	],
	blocks: [
		{ type: "h2", id: "sablonlar-paneli", text: "Templates panel" },
		{
			type: "p",
			text: "Click the **Templates** icon on the left edge of the editor. You can search templates and filter them by category. Clicking a template **inserts the content of its main file at the cursor**.",
		},
		{
			type: "callout",
			tone: "tip",
			text: "Templates are usually complete documents that start with `\\documentclass`. If you insert one in the middle of an existing document, you end up with two `\\documentclass` lines and the compile fails. Either insert it into an empty file or copy only the `tikzpicture` part you need. If you want the template's images and extra files too, create a new project from the template in the **New project** dialog.",
		},
		{
			type: "p",
			text: "With the **New** button at the top of the panel you can write your own single-file template (title, category, content). Your own templates have a delete button; official templates can't be deleted.",
		},
		{ type: "h2", id: "kod-parcaciklari", text: "Snippets" },
		{
			type: "p",
			text: "Snippets are short, frequently used TikZ blocks (axes, a node, an arrow…). There are two ways to insert them:",
		},
		{
			type: "list",
			items: [
				"Click a snippet in the **Snippets** panel; it's inserted at the cursor.",
				"In the editor, type a backslash and the first letters of the trigger (e.g. `\\eks`). Pick the snippet from the suggestion list and press **Enter**. Each snippet's trigger is shown as a badge in the panel.",
			],
		},
		{
			type: "p",
			text: "Add your own snippet with the **New** button: enter a title, a trigger without the backslash (e.g. `circle`), a category and the content. For example, this content is inserted when you type `\\circle`:",
		},
		{
			type: "code",
			title: "Trigger: circle",
			code: String.raw`\draw[thick, fill=blue!15] (0,0) circle (1);
\fill (0,0) circle (1.5pt) node[below] {$M$};`,
		},
		{ type: "h2", id: "gorselden-latexe", text: "Image to LaTeX" },
		{
			type: "p",
			text: "You can turn a photo or screenshot of a formula into LaTeX code:",
		},
		{
			type: "list",
			ordered: true,
			items: [
				"Click the scan icon next to the **Code editor** heading.",
				"If the server offers more than one provider, pick one (**Docker Model Runner**, **pix2tex** or **Mathpix**).",
				"Drop or choose a PNG, JPEG or WebP image and press **Convert to LaTeX**.",
				"Check and correct the result, then add it at the cursor with **Insert into editor**.",
			],
		},
		{
			type: "callout",
			tone: "info",
			text: "This feature needs a provider set up on the server; if none is, the scan icon doesn't appear. Which providers work depends on the server administrator's settings; if one fails, try another. Always check the result: handwriting and complex tables can be misread.",
		},
		{ type: "h2", id: "sablon-olarak-kaydet", text: "Save as template" },
		{
			type: "p",
			text: "You can turn a layout you use often (e.g. your school's exam header) into a template:",
		},
		{
			type: "list",
			ordered: true,
			items: [
				"In the editor, click the **Settings** icon on the left edge.",
				"In the **Save as template** section, enter the template name, category and description.",
				"Click **Save as template**.",
			],
		},
		{
			type: "list",
			items: [
				"**All files** in the project (images, `.sty` files, subfolders) and the **selected engine** are copied into the template.",
				"Your unsaved changes are saved first, so the template always contains your latest version.",
				"The template is visible only to you and appears in the list in the **New project** dialog.",
			],
		},
	],
};

export const sharing: HelpArticle = {
	slug: "paylasma",
	title: "Sharing",
	summary:
		"Make your project public and send the share link; fork other people's projects into your own workspace.",
	icon: "share",
	keywords: [
		"share",
		"link",
		"url",
		"public",
		"private",
		"copy",
		"fork",
		"student",
		"homework",
	],
	blocks: [
		{ type: "h2", id: "ayarlar", text: "Project settings" },
		{
			type: "p",
			text: "In the editor, click the **Settings** icon on the left edge. There you can change the **Project name** and **Description** and turn the **Public** switch on or off. Save your changes with **Save settings**.",
		},
		{ type: "h2", id: "baglanti", text: "Share link" },
		{
			type: "list",
			ordered: true,
			items: [
				"Turn on the **Public** switch and click **Save settings**.",
				"A **Share** button appears in the toolbar. Clicking it copies the share link to the clipboard.",
				"Send the link to your students, colleagues or class group.",
			],
		},
		{
			type: "p",
			text: "Anyone who opens the link sees the project's files **read-only**, without signing in; they can see a preview of the latest successful compile and download the PDF and SVG. Nobody can change your project.",
		},
		{
			type: "callout",
			tone: "warning",
			text: "Anyone with the link can see every file in the project. Don't put confidential material such as exam answer keys in public projects. To stop sharing, turn off the **Public** switch.",
		},
		{ type: "h2", id: "kopyala", text: "Fork to my projects" },
		{
			type: "p",
			text: "The page of a public project has a **Fork to my projects** button. Clicking it creates a copy of all files as a new project in your account and opens it in the editor. You can work on the copy however you like; the original project doesn't change. If you don't have an account, you're asked to create one first.",
		},
		{
			type: "callout",
			tone: "tip",
			title: "In the classroom",
			text: "Teachers can make a starter project public and share its link. Each student gets their own copy with **Fork to my projects** and does the assignment on it.",
		},
	],
};

export const turkishDocuments: HelpArticle = {
	slug: "turkce-belgeler",
	title: "Turkish documents",
	summary:
		'Turkish characters, the babel setup, and the "=" problem to watch out for when combining it with TikZ.',
	icon: "languages",
	keywords: [
		"babel",
		"turkish",
		"turkish characters",
		"shorthands",
		"enumitem",
		"fontenc",
		"date",
		"section names",
	],
	blocks: [
		{
			type: "p",
			text: "You can type the letters ç, ğ, ı, İ, ö, ş, ü directly in your documents; all engines read UTF-8 text. Short labels in TikZ nodes (e.g. `{Başla}`) need no extra setup.",
		},
		{
			type: "p",
			text: 'To get automatic headings such as "Şekil", "İçindekiler" and "Kaynakça" and dates in Turkish, as well as correct hyphenation, load the `babel` package with the Turkish option.',
		},
		{
			type: "h2",
			id: "esittir-sorunu",
			text: 'Watch out: babel and the "=" sign',
		},
		{
			type: "p",
			text: 'Turkish `babel` turns the `=` character into a special ("active") character. Because TikZ and `enumitem` options are written as `key=value`, this breaks options such as `draw=red` or `label=(\\alph*)` and produces errors that are hard to understand.',
		},
		{
			type: "p",
			text: "The fix is two lines: turn off the Turkish shorthands and load TikZ's `babel` library.",
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
				"`shorthands=:!` keeps only the `:` and `!` shorthands active; `=` stays a normal character.",
				"`\\usetikzlibrary{babel}` makes TikZ work well with babel.",
				"The `\\usepackage[T1]{fontenc}` inside the `\\ifPDFTeX` block is loaded only with pdfLaTeX and ensures Turkish letters are hyphenated correctly. Tectonic, XeLaTeX and LuaLaTeX don't need it; loading it unconditionally with Tectonic causes a font error.",
			],
		},
		{
			type: "callout",
			tone: "tip",
			text: "The Turkish documents among the official templates use this setup and work with all engines. If you get stuck, create a new project from a Turkish template and copy its preamble.",
		},
		{ type: "h2", id: "dosya-adlari", text: "File names" },
		{
			type: "p",
			text: "You can use Turkish letters in file and folder names too: `\\input{şekiller/üçgen}` and `\\includegraphics{görseller/ağaç.png}` work with all engines. Just don't use spaces; separate words with hyphens or underscores (`deney-sonuçları.tex`).",
		},
	],
};
