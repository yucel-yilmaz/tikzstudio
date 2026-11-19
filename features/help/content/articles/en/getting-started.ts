import type { HelpArticle } from "@/features/help/content/types";

export const gettingStarted: HelpArticle = {
	slug: "baslarken",
	title: "Getting started",
	summary:
		"Create an account, open your first project from a template and compile your first PDF in a few minutes.",
	icon: "rocket",
	keywords: [
		"sign up",
		"sign in",
		"account",
		"first project",
		"tutorial",
		"tour",
		"github",
		"google",
	],
	blocks: [
		{
			type: "p",
			text: "TikZ Studio lets you write TikZ and LaTeX in your browser without installing anything. You write code on the left, press **Compile**, and the result appears on the right as a PDF. This page walks you through to your first drawing.",
		},
		{ type: "h2", id: "hesap", text: "1. Create an account" },
		{
			type: "list",
			items: [
				"On the home page, click **Get started** or **Sign up**.",
				"Enter your full name, email address and a password of at least 8 characters.",
				"If email verification is turned on, a link is sent to your inbox; click it to activate your account (check your spam folder too).",
				"If you already have an account, use the **Sign in** page. Forgot your password? Reset it with the **Forgot password?** link.",
				"On the **My account** page (at the top of the dashboard) you can change your password, sign out sessions left open on a shared computer, switch the interface language and, if needed, permanently delete your account together with all of its projects.",
			],
		},
		{
			type: "callout",
			tone: "info",
			text: "The GitHub and Google sign-in buttons only appear if the server administrator has configured those providers. If you don't see them, continue with your email and password.",
		},
		{ type: "h2", id: "ilk-proje", text: "2. Create your first project" },
		{
			type: "list",
			ordered: true,
			items: [
				"After you sign in, the **Dashboard** opens. Click **New project** in the top right.",
				'Enter a **Title** (e.g. "My first drawing"). The **Description** is optional.',
				"Pick a template from the **Starter template** list. If you're new, the **Öğretici: İlk TikZ çiziminiz** tutorial template is an example in which every line is explained (in Turkish). If it isn't listed, start with **Default TikZ**.",
				"Click **Create project**. The editor opens automatically.",
			],
		},
		{ type: "h2", id: "ilk-derleme", text: "3. Compile and see the result" },
		{
			type: "list",
			ordered: true,
			items: [
				"Click **Compile** in the toolbar.",
				"The status badge first shows **Queued**, then **Compiling…**. Within a few seconds it shows **Succeeded**.",
				"The PDF opens in the **Output panel** on the right. Use **Download PDF**, **Download SVG** and **Download PNG** to save the file to your computer.",
			],
		},
		{
			type: "p",
			text: "Now change a number or a color in the code and compile again. Small experiments like this are the fastest way to learn TikZ. You can also start from this minimal TikZ document:",
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
		{ type: "h2", id: "ogretici", text: "Restart the tour" },
		{
			type: "p",
			text: "The first time you sign in, a short tour introduces the main parts of the screen. If you closed it, you can restart it at any time: choose **Start the tour** from the **Help** menu on the dashboard or in the editor, or use the button below.",
		},
		{ type: "tourButton" },
		{ type: "h2", id: "sonraki", text: "What's next?" },
		{
			type: "list",
			items: [
				"To get to know the screen, see [The editor](/yardim/editor).",
				"[Compiling and engines](/yardim/derleme-ve-motorlar) explains which engine to choose.",
				"If you write in Turkish, be sure to read [Turkish documents](/yardim/turkce-belgeler).",
			],
		},
	],
};

export const editor: HelpArticle = {
	slug: "editor",
	title: "The editor",
	summary:
		"The code editor, the project panel, the output panel and the toolbar buttons: what each part of the screen does.",
	icon: "code",
	keywords: [
		"codemirror",
		"save",
		"autosave",
		"shortcut",
		"panel",
		"preview",
		"mobile",
	],
	blocks: [
		{
			type: "p",
			text: "The editor screen has four parts: the **toolbar** at the top, the **project panel** on the left, the **Code editor** in the middle and the **Output panel** on the right. On wide screens they sit side by side; on phones and small tablets they stack vertically.",
		},
		{ type: "h2", id: "arac-cubugu", text: "Toolbar" },
		{
			type: "table",
			head: ["Item", "What it does"],
			rows: [
				[
					"**Dashboard** / **Back to dashboard**",
					"Returns to your project list.",
				],
				["Save badge", "Shows **Saved**, **Unsaved changes** or **Saving…**."],
				[
					"**Share**",
					"If the project is public, copies the share link to the clipboard.",
				],
				["**Save**", "Saves the open file right away."],
				[
					"Engine selector",
					"Tectonic, pdfLaTeX, XeLaTeX, LuaLaTeX or pdfLaTeX + Biber. See [Compiling and engines](/yardim/derleme-ve-motorlar).",
				],
				["**Compile**", "Compiles the document with the selected engine."],
				["**Help**", "Opens this help center or restarts the tour."],
				["**TR / EN**", "Switches the interface language."],
			],
		},
		{ type: "h2", id: "kod-editoru", text: "Code editor" },
		{
			type: "list",
			items: [
				"It has LaTeX syntax highlighting, line numbers and bracket matching.",
				"Type a backslash (`\\`) followed by a few letters to get snippet suggestions. See [Templates and snippets](/yardim/sablonlar-ve-kod-parcaciklari).",
				"If a compile fails, a red marker appears next to the offending line. Hover over the marker to see the error message.",
				"The scan icon next to the heading opens the **Image to LaTeX** dialog.",
			],
		},
		{ type: "h2", id: "kaydetme", text: "Autosave" },
		{
			type: "p",
			text: "About a second after you stop typing, the open file is saved automatically. When the badge shows **Saved**, your work is on the server. If you don't want to wait, click **Save**. The **Compile** button is briefly disabled while a save is in progress, so you always compile your latest version.",
		},
		{
			type: "callout",
			tone: "tip",
			text: "Unsaved changes are saved automatically when you switch to another file, press **Compile** or save the project as a template. If you try to close the tab with unsaved changes, your browser warns you.",
		},
		{ type: "h2", id: "proje-paneli", text: "Project panel" },
		{
			type: "p",
			text: "The icons on the left edge open the panel: **Files**, **Templates**, **Snippets** and **Settings**. The top icon hides the panel to give the code editor more room.",
		},
		{ type: "h2", id: "cikti-paneli", text: "Output panel" },
		{
			type: "list",
			items: [
				"The **Preview** tab shows the PDF of the latest compile, the engine used and the download buttons.",
				"Use the **–** and **+** buttons above the preview to zoom between 60% and 240%.",
				"The **Compile log** below it summarizes the error and warning lines.",
				"The **History** tab lists earlier compiles and their files. See [Output and export](/yardim/ciktilar-ve-disa-aktarma).",
				"Drag the left edge of the panel to change its width.",
			],
		},
		{
			type: "callout",
			tone: "info",
			title: "On a phone",
			text: "On small screens, the editor, the project panel and the output panel are stacked. A computer or tablet is more comfortable for long documents.",
		},
	],
};

export const projectsAndFiles: HelpArticle = {
	slug: "projeler-ve-dosyalar",
	title: "Projects and files",
	summary:
		"Search and delete projects; set up multi-file projects with folders, upload images and .sty files, and choose the main file.",
	icon: "folder",
	keywords: [
		"folder",
		"upload",
		"image",
		"picture",
		"sty",
		"cls",
		"input",
		"includegraphics",
		"main file",
		"delete",
		"rename",
	],
	blocks: [
		{ type: "h2", id: "panel", text: "Dashboard: your project list" },
		{
			type: "list",
			items: [
				"The search box filters projects by name or description.",
				"**Open in editor** opens a project.",
				"The trash icon in the top right of a card deletes the project.",
			],
		},
		{
			type: "callout",
			tone: "warning",
			text: "You're asked to confirm before a project is deleted, but deleting can't be undone. If you're not sure, download the PDF or save the project as a template first.",
		},
		{ type: "h2", id: "dosyalar", text: "Files panel" },
		{
			type: "p",
			text: "A project can consist of several files. Click the **Files** icon on the left edge:",
		},
		{
			type: "list",
			items: [
				"Create a file with **New file**. For a folder, write the path with a forward slash: `figures/triangle.tex`. The folder is created automatically.",
				"Add files from your computer with the upload icon: images (`.png`, `.jpg`, `.pdf`), style and class files (`.sty`, `.cls`), fonts. Up to 5 MB per file.",
				"The **⋮** menu next to a file has **Rename**, **Set as main file** and **Delete**.",
				"The main file is marked with a **Main** badge and can't be deleted.",
			],
		},
		{ type: "h2", id: "cok-dosyali", text: "A multi-file project example" },
		{
			type: "p",
			text: "The main file pulls in the other files with `\\input`. Paths are always relative to the project root:",
		},
		{
			type: "code",
			title: "main.tex",
			code: String.raw`\documentclass{article}
\usepackage{tikz}
\usepackage{graphicx}
\begin{document}

\section*{Triangle}
\input{figures/triangle.tex}

\section*{Photo}
\includegraphics[width=0.5\linewidth]{images/experiment.png}

\end{document}`,
		},
		{
			type: "code",
			title: "figures/triangle.tex",
			code: String.raw`\begin{tikzpicture}
  \draw (0,0) -- (4,0) -- (1.5,2.5) -- cycle;
\end{tikzpicture}`,
		},
		{
			type: "callout",
			tone: "info",
			title: "Compile compiles the main file",
			text: "Whichever file is open, the **Compile** button compiles the project's main file (usually `main.tex`). So you can compile straight away while editing a part such as `figures/triangle.tex`. Change the main file with **Set as main file** in the file tree.",
		},
		{ type: "h2", id: "yeni-proje", text: "New projects and templates" },
		{
			type: "p",
			text: "When you pick a template in the **New project** dialog, all of its files (including images and `.sty` files) are copied into the new project. The template library has 33 official templates: **basic** shapes and diagrams, **high-school math** (triangles, circles, function plots, Venn diagrams, exam sheets…) and **university/academic** graphics (data plots, 3D surfaces, commutative diagrams, automata, a Beamer presentation, a paper skeleton…). Most official templates are Turkish-language documents.",
		},
		{
			type: "p",
			text: "You can also turn your own projects into templates. See [Templates and snippets](/yardim/sablonlar-ve-kod-parcaciklari#sablon-olarak-kaydet).",
		},
		{ type: "h2", id: "sinirlar", text: "Limits" },
		{
			type: "list",
			items: [
				"Up to 5 MB per uploaded file.",
				"The server limits the total size of a project sent for compilation and the size of the output it produces. The default limits are 512 KB for sources and 10 MB for output.",
				"File and folder names may contain letters (including Turkish letters: ç, ğ, ı, ö, ş, ü), digits, dots (`.`), hyphens (`-`) and underscores (`_`). Spaces aren't allowed (they're turned into hyphens automatically for uploads); paths containing `..` or starting with `/` are rejected.",
			],
		},
		{
			type: "callout",
			tone: "tip",
			text: "If the image you want to upload is called `Experiment Photo.png`, rename it on your computer first to something like `experiment-photo.png`.",
		},
	],
};
