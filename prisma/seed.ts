import { prisma } from "../lib/prisma";
import {
	mathSnippets,
	mathTemplates,
	type SeedSnippet,
	type SeedTemplate,
} from "./math-templates";

const defaultDocument = String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}

\begin{document}

\begin{tikzpicture}
  \draw[->] (0,0) -- (3,0);
  \node at (1.5,0.3) {Hello TikZ};
\end{tikzpicture}

\end{document}
`;

const templates: SeedTemplate[] = [
	{
		title: "Basic Line and Arrow",
		category: "Basic Shapes",
		description: "Simple directed line segment.",
		content: defaultDocument,
	},
	{
		title: "Rectangle Node",
		category: "Nodes",
		description: "Single rounded rectangle node.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}
  \node[draw, rounded corners, minimum width=4cm, minimum height=1cm] {Rectangle Node};
\end{tikzpicture}
\end{document}
`,
	},
	{
		title: "Circle Node",
		category: "Nodes",
		description: "Single circular node.",
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
		title: "Flowchart",
		category: "Flowcharts",
		description: "Three-step flowchart.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}
  \node[draw, rounded corners] (start) at (0,0) {Start};
  \node[draw, rounded corners] (process) at (0,-1.7) {Process};
  \node[draw, rounded corners] (end) at (0,-3.4) {End};
  \draw[->] (start) -- (process);
  \draw[->] (process) -- (end);
\end{tikzpicture}
\end{document}
`,
	},
	{
		title: "Coordinate Plane",
		category: "Coordinate System",
		description: "Labeled x-y axes.",
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
		title: "Function Plot",
		category: "Graphs",
		description: "Quadratic function sample.",
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
		title: "Triangle Geometry",
		category: "Geometry",
		description: "Annotated triangle diagram.",
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
		title: "Directed Graph",
		category: "Graphs",
		description: "Three-node directed graph.",
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
		title: "Tree Diagram",
		category: "Trees",
		description: "Simple rooted tree.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}[
  level distance=1.3cm,
  sibling distance=2.4cm,
  every node/.style={draw, rounded corners, inner sep=4pt}
]
  \node {Root}
    child { node {Left} }
    child { node {Right} };
\end{tikzpicture}
\end{document}
`,
	},
	{
		title: "Simple Neural Network Diagram",
		category: "Flowcharts",
		description: "Tiny feed-forward network.",
		content: String.raw`\documentclass[tikz,border=10pt]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}[x=1.5cm, y=1cm]
  \foreach \y in {0,1,2} \node[draw, circle] (i\y) at (0,\y) {};
  \foreach \y in {0.5,1.5} \node[draw, circle] (h\y) at (2,\y) {};
  \node[draw, circle] (o) at (4,1) {};
  \foreach \i in {0,1,2} \foreach \h in {0.5,1.5} \draw[->] (i\i) -- (h\h);
  \foreach \h in {0.5,1.5} \draw[->] (h\h) -- (o);
\end{tikzpicture}
\end{document}
`,
	},
];

const snippets: SeedSnippet[] = [
	{
		title: "Basic Arrow",
		category: "Arrows",
		trigger: "arrow-basic",
		content: String.raw`\draw[->] (0,0) -- (3,0);`,
	},
	{
		title: "Rectangle",
		category: "Basic Shapes",
		trigger: "shape-rect",
		content: String.raw`\draw (0,0) rectangle (3,2);`,
	},
	{
		title: "Circle",
		category: "Basic Shapes",
		trigger: "shape-circle",
		content: String.raw`\draw (0,0) circle (1cm);`,
	},
	{
		title: "Node",
		category: "Nodes",
		trigger: "node-basic",
		content: String.raw`\node[draw] (A) at (0,0) {A};`,
	},
	{
		title: "Coordinate Grid",
		category: "Coordinate System",
		trigger: "grid-basic",
		content: String.raw`\draw[step=1, gray!30] (-3,-3) grid (3,3);`,
	},
	{
		title: "Flow Step",
		category: "Flowcharts",
		trigger: "flow-step",
		content: String.raw`\node[draw, rounded corners] (step) at (0,0) {Step};`,
	},
	{
		title: "Triangle",
		category: "Geometry",
		trigger: "triangle",
		content: String.raw`\draw (0,0) -- (2,0) -- (1,1.7) -- cycle;`,
	},
	{
		title: "Tree Child",
		category: "Trees",
		trigger: "tree-child",
		content: String.raw`child { node {Label} }`,
	},
	{
		title: "Directed Edge",
		category: "Graphs",
		trigger: "graph-edge",
		content: String.raw`\draw[->] (A) -- (B);`,
	},
	{
		title: "Circuit Wire",
		category: "Circuit Diagrams",
		trigger: "wire-basic",
		content: String.raw`\draw (0,0) -- (2,0);`,
	},
];

/**
 * Idempotent seed: official (owner-less) templates and snippets are matched by
 * title / trigger and updated in place, so the script can be re-run safely
 * after adding or editing seed content.
 */
async function upsertOfficialTemplate(template: SeedTemplate) {
	const files = template.files ?? [];
	const data = {
		title: template.title,
		category: template.category,
		description: template.description,
		content: template.content ?? null,
		isOfficial: true,
	};

	const existing = await prisma.template.findFirst({
		where: { title: template.title, ownerId: null },
	});

	await prisma.$transaction(async (tx) => {
		const saved = existing
			? await tx.template.update({ where: { id: existing.id }, data })
			: await tx.template.create({ data });

		await tx.templateFile.deleteMany({ where: { templateId: saved.id } });
		if (files.length) {
			await tx.templateFile.createMany({
				data: files.map((file, index) => ({
					templateId: saved.id,
					path: file.path,
					content: file.content,
					isMain: file.isMain ?? index === 0,
				})),
			});
		}
	});
}

async function upsertOfficialSnippet(snippet: SeedSnippet) {
	const existing = await prisma.snippet.findFirst({
		where: { trigger: snippet.trigger, ownerId: null },
	});
	const data = {
		title: snippet.title,
		category: snippet.category,
		trigger: snippet.trigger,
		description: snippet.description ?? null,
		content: snippet.content,
	};

	if (existing) {
		await prisma.snippet.update({ where: { id: existing.id }, data });
	} else {
		await prisma.snippet.create({ data });
	}
}

async function main() {
	for (const template of [...templates, ...mathTemplates]) {
		await upsertOfficialTemplate(template);
	}

	for (const snippet of [...snippets, ...mathSnippets]) {
		await upsertOfficialSnippet(snippet);
	}

	const [templateCount, snippetCount] = await Promise.all([
		prisma.template.count({ where: { ownerId: null } }),
		prisma.snippet.count({ where: { ownerId: null } }),
	]);
	console.log(
		`Seed complete: ${templateCount} official templates, ${snippetCount} official snippets.`,
	);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
