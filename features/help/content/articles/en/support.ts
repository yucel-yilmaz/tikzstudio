import type { HelpArticle } from "@/features/help/content/types";

export const troubleshooting: HelpArticle = {
	slug: "sorun-giderme",
	title: "Troubleshooting",
	summary:
		"What common LaTeX errors mean, and how to fix missing packages, timeouts, the compile limit and an empty preview.",
	icon: "wrench",
	keywords: [
		"error",
		"undefined control sequence",
		"not found",
		"missing",
		"timeout",
		"timed out",
		"too many compile requests",
		"empty preview",
		"pgfkeys",
	],
	blocks: [
		{
			type: "p",
			text: "When a compile **Failed**, look at the **Compile log** first. The first line starting with `!` is the real error; later errors are often a consequence of the first one. Something like `l.15` tells you the line of the error, and a red marker appears next to that line in the editor.",
		},
		{
			type: "callout",
			tone: "tip",
			text: "Always fix the **topmost** error and compile again. A single missing `}` can cause dozens of error lines.",
		},
		{ type: "h2", id: "sik-hatalar", text: "Common errors" },
		{
			type: "table",
			head: ["Message in the log", "Meaning and fix"],
			rows: [
				[
					"`Undefined control sequence`",
					"The command name is misspelled (`\\drw`, `\\nod`) or the package that provides it isn't loaded. Check the spelling of the command on that line and the `\\usepackage` line it needs.",
				],
				[
					"`File 'xyz.sty' not found`",
					"The package couldn't be found. With Tectonic, the package isn't in the cache: switch the engine to **pdfLaTeX** and try again. If it's your own `.sty` file, make sure you uploaded it to the project.",
				],
				[
					"`I did not find the tikz library 'xyz'`",
					"The TikZ library name is wrong, or it isn't cached for Tectonic. Check the name, then try **pdfLaTeX**.",
				],
				[
					"`Environment tikzpicture undefined`",
					"`\\usepackage{tikz}` is missing from the preamble.",
				],
				[
					"`I do not know the key '/tikz/...'`",
					"The option name is misspelled (e.g. `colour=red`) or a required library isn't loaded (e.g. `\\usetikzlibrary{arrows.meta}` for `-Stealth` arrows). If you use Turkish `babel`, apply the setup on the [Turkish documents](/yardim/turkce-belgeler) page.",
				],
				[
					"`Missing $ inserted`",
					"Math such as `x^2` or `\\alpha` was written outside `$...$`. In node text, use `{$x^2$}` too.",
				],
				[
					"`Missing } inserted`, `Extra }`, `File ended while scanning`",
					"Your braces aren't balanced. Every `{` needs a matching `}`.",
				],
				[
					"`Emergency stop` / `no legal \\end found`",
					"The `\\end{document}` line is missing or an environment (`\\begin{...}`) was never closed.",
				],
				[
					"`Can be used only in preamble`",
					"A `\\usepackage` or `\\usetikzlibrary` line comes after `\\begin{document}`; move it to the preamble.",
				],
				[
					"`No shape named 'A' is known`",
					"The node you refer to as `(A)` isn't defined, or its name is spelled differently (case matters).",
				],
				[
					"`Dimension too large`",
					"The plotted values are too large (e.g. `1/x` near zero). Narrow the plot's `domain` or limit the `y` values.",
				],
				[
					"`Main file not found.`",
					"The project has no file to compile. Create a `.tex` file in the **Files** panel and choose **Set as main file**.",
				],
			],
		},
		{
			type: "h2",
			id: "eksik-paket",
			text: "Missing package or library with Tectonic",
		},
		{
			type: "p",
			text: 'Tectonic is fast, but it can only use packages prepared in the compile sandbox in advance, and it can\'t go online. A document that works on your own computer may give a "not found" error here. To fix it:',
		},
		{
			type: "list",
			ordered: true,
			items: [
				"Choose **pdfLaTeX** in the engine selector in the toolbar.",
				"Press **Compile** again.",
				"If your document uses `fontspec`, choose **XeLaTeX**; if it uses `biblatex`, choose **pdfLaTeX + Biber**.",
			],
		},
		{
			type: "p",
			text: "Packages that pdfLaTeX can't find either aren't installed in the compile sandbox. In that case you can upload the package's `.sty` file to the project or ask the server administrator to add it.",
		},
		{ type: "h2", id: "zaman-asimi", text: "Timeouts" },
		{
			type: "p",
			text: "A compile that takes longer than about 12 seconds is stopped and its status becomes **Timed out**. Common causes:",
		},
		{
			type: "list",
			items: [
				"A very high `samples` value in plots. For most curves, `samples=50` to `100` is plenty.",
				"Very large or nested `\\foreach` loops.",
				"Long, multi-page documents. Preparing individual figures in separate `standalone` files is faster.",
				"A macro stuck in an infinite loop.",
			],
		},
		{
			type: "code",
			title: "A faster plot",
			code: String.raw`% Slow:  samples=2000
\draw[domain=-3:3, samples=80, smooth, variable=\x] plot ({\x}, {sin(\x r)});`,
		},
		{
			type: "h2",
			id: "derleme-siniri",
			text: 'The "Too many compile requests" warning',
		},
		{
			type: "p",
			text: "You can compile at most 5 times per minute. If you see this warning, wait a minute. Instead of compiling after every small change, make a few changes and then compile.",
		},
		{ type: "h2", id: "bos-onizleme", text: "The preview is empty or broken" },
		{
			type: "list",
			items: [
				'If it says **"No preview yet"**, the project hasn\'t compiled successfully yet. Check the status badge: if it says **Failed**, fix the error in the log.',
				"If the compile **Succeeded** but the page is empty, your document may have no visible content (e.g. an empty `tikzpicture`) or the drawing may extend off the page. The `standalone` document class crops the page to the drawing.",
				'If it says **"Couldn\'t load the PDF"** or you see a grey box, reload the page (Ctrl+Shift+R, or Cmd+Shift+R on a Mac). Old compile files are deleted after 24 hours; compile again.',
			],
		},
		{ type: "h2", id: "diger", text: "Other problems" },
		{
			type: "list",
			items: [
				"**Couldn't save** badge: your connection may have dropped. Copy your code somewhere, reload the page and paste it back.",
				"**A file won't upload**: it may be larger than 5 MB. Spaces in file names are turned into hyphens automatically; Turkish letters are kept. See [Projects and files](/yardim/projeler-ve-dosyalar#sinirlar).",
				"**A file I `\\input` can't be found**: the path must be relative to the project root (`figures/triangle.tex`); make sure the file name matches exactly, including upper and lower case.",
			],
		},
	],
};

export const faq: HelpArticle = {
	slug: "sss",
	title: "Frequently asked questions",
	summary:
		"Short answers about installation, where your files are stored, moving from Overleaf, collaboration and more.",
	icon: "help",
	keywords: [
		"faq",
		"question",
		"overleaf",
		"zip",
		"collaboration",
		"beamer",
		"pgfplots",
		"word",
		"language",
	],
	blocks: [
		{
			type: "faq",
			items: [
				{
					question: "Do I need to install LaTeX on my computer?",
					answer: [
						"No. All compiling happens on the server; an up-to-date browser is all you need.",
					],
				},
				{
					question: "Where is my work stored?",
					answer: [
						"Your projects and files are stored in the database of this TikZ Studio server and saved automatically. We recommend downloading the PDF of important output regularly.",
					],
				},
				{
					question: "Can I move a project from Overleaf or my computer?",
					answer: [
						"Yes. In Overleaf, download the project as a `.zip` with **Menu → Download → Source** (or zip a folder on your computer), then click **Import (.zip)** on the dashboard. All files (including images, `.bib` and `.sty` files) are imported into a new project, and the file containing `\\documentclass` is chosen as the main file.",
						"Limits: the ZIP can be at most 20 MB, with at most 300 files and 5 MB per file. Build leftovers such as `.aux` and `.log` and hidden files are skipped. Files with spaces in their names are renamed with hyphens; the import warning tells you when this happens, and you'll need to update the paths in your document.",
						"The other way round: use **Download as .zip** in the project settings panel to download all files and import them into Overleaf or your own LaTeX installation.",
					],
				},
				{
					question: "Can I work on the same project with others?",
					answer: [
						"Real-time collaborative editing isn't available yet. You can make your project **Public** and share its link; the other person gets their own copy with **Fork to my projects**. See [Sharing](/yardim/paylasma).",
					],
				},
				{
					question: "How do I add my figures to Word or PowerPoint?",
					answer: [
						"Use **Download PNG** to get a 300 DPI image and insert it into your document. If you want to scale it up without losing quality, use **Download SVG**.",
					],
				},
				{
					question: "Can I use pgfplots, tkz-euclide, tikz-cd or Beamer?",
					answer: [
						"Yes. The official templates include examples made with all of these packages, and they work with Tectonic. If a package that isn't used in the official templates gives an error with Tectonic, switch to **pdfLaTeX**.",
					],
				},
				{
					question:
						"Can I write multi-page documents (lecture notes, a thesis)?",
					answer: [
						"Yes. The preview shows all pages one below the other (the first 30 pages); use **Download PDF** for the whole document. PNG and SVG are generated from the first page only. For long documents, splitting chapters into separate files and pulling them in with `\\input` keeps things organized.",
					],
				},
				{
					question: "Is my engine choice saved?",
					answer: [
						"Yes. The engine you choose in the toolbar is stored with the project, and you continue with the same engine the next time you open it.",
					],
				},
				{
					question: "How do I switch the language?",
					answer: [
						"Use the **TR / EN** switch on the home page, the sign-in pages, the dashboard, the editor toolbar or the **My account** page. Your choice is remembered in this browser and, when you're signed in, on your account, so the emails we send you use the same language.",
					],
				},
				{
					question: "I forgot my password. What should I do?",
					answer: [
						"Click **Forgot password?** on the sign-in page and enter your email address. The link you receive is valid for 1 hour and can be used once. When your password changes, you're signed out on your other devices.",
						"If the email doesn't arrive, check your spam folder. If the server administrator hasn't set up email delivery, reset links can't be sent; in that case, contact the administrator.",
					],
				},
				{
					question: "Can I use it on my phone?",
					answer: [
						"Yes, the screen is stacked vertically on phones. It works well for quick fixes and previews; a computer is more comfortable for longer writing.",
					],
				},
				{
					question: "How do I see the tour again?",
					answer: [
						"Choose **Start the tour** from the **Help** menu on the dashboard or in the editor, or use the button on the [Getting started](/yardim/baslarken#ogretici) page.",
					],
				},
			],
		},
	],
};
