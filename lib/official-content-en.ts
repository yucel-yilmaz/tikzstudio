/**
 * English names for the official (seeded) templates and snippets.
 *
 * The database keeps the Turkish originals: seed matching and the preview
 * image file names depend on the Turkish template titles. API responses
 * swap in these strings when the request's locale is English. Only the
 * metadata is translated; the LaTeX content of the templates stays as is.
 *
 * Keys: templates by their Turkish title, snippets by trigger, categories by
 * their Turkish name. `tests/lib/official-content-en.test.ts` fails when an
 * official template, snippet or category has no entry here.
 */

type Text = { title: string; description: string };

export const OFFICIAL_TEMPLATES_EN: Record<string, Text> = {
	"Öğretici: İlk TikZ çiziminiz": {
		title: "Tutorial: your first TikZ drawing",
		description:
			"Coordinates, \\draw, \\node, colours, a \\foreach loop and a simple function plot, in a starter document with every line explained (comments in Turkish).",
	},
	"Ok ve doğru parçası": {
		title: "Arrow and line segment",
		description: "A simple directed line segment.",
	},
	"Dikdörtgen düğüm": {
		title: "Rectangle node",
		description: "A single rectangular node with rounded corners.",
	},
	"Çember düğüm": {
		title: "Circle node",
		description: "A single circular node.",
	},
	"Akış şeması": {
		title: "Flowchart",
		description: "A three-step flowchart.",
	},
	"Koordinat düzlemi": {
		title: "Coordinate plane",
		description: "Labelled x–y axes.",
	},
	"Fonksiyon grafiği": {
		title: "Function plot",
		description: "An example quadratic function.",
	},
	"Basit üçgen": {
		title: "Simple triangle",
		description: "A triangle with labelled vertices.",
	},
	"Yönlü çizge": {
		title: "Directed graph",
		description: "A directed graph with three nodes.",
	},
	"Ağaç diyagramı": {
		title: "Tree diagram",
		description: "A simple rooted tree.",
	},
	"Basit yapay sinir ağı": {
		title: "Simple neural network",
		description: "A small feed-forward network.",
	},
	"Üçgen: açılar, kenarlar ve yükseklik": {
		title: "Triangle: angles, sides and altitude",
		description:
			"Triangle ABC with angle arcs, side labels and an altitude with a right-angle mark.",
	},
	"Çember: merkez, teğet ve kiriş": {
		title: "Circle: centre, tangent and chord",
		description:
			"A circle with centre O, a tangent at T (with a right-angle mark) and the chord AB.",
	},
	"Üçgen ve çevrel çember (tkz-euclide)": {
		title: "Triangle and circumcircle (tkz-euclide)",
		description:
			"A triangle, its circumcircle and angle marks drawn with tkz-euclide, a package popular with teachers.",
	},
	"Doğrunun grafiği ve kesişim noktası": {
		title: "Lines and their intersection",
		description:
			"Graphs of two lines, the axes and their intersection point (pgfplots).",
	},
	"Parabol: kökler, tepe noktası, simetri ekseni": {
		title: "Parabola: roots, vertex, axis of symmetry",
		description:
			"The parabola f(x) = x² − 2x − 3 with its roots, vertex and axis of symmetry.",
	},
	"Parçalı fonksiyon (limit / süreklilik)": {
		title: "Piecewise function (limits / continuity)",
		description:
			"A piecewise function graph with open and closed points, for limit and continuity questions.",
	},
	"Birim çember: sin ve cos": {
		title: "Unit circle: sin and cos",
		description:
			"The angle θ on the unit circle, the projections cos θ and sin θ, and P(cos θ, sin θ).",
	},
	"Sayı doğrusu ve aralıklar": {
		title: "Number line and intervals",
		description:
			"The interval [−2, 3) on a number line, with closed and open endpoints.",
	},
	"Venn şeması (üç küme)": {
		title: "Venn diagram (three sets)",
		description:
			"Sets A, B and C inside the universal set E, with the region A∩B shaded.",
	},
	"Olasılık ağacı (iki aşamalı)": {
		title: "Probability tree (two stages)",
		description:
			"Drawing two balls from a bag without replacement: probabilities on the branches, outcomes at the leaves.",
	},
	"Katı cisimler: prizma, silindir, koni": {
		title: "Solids: prism, cylinder, cone",
		description:
			"A rectangular prism, a cylinder and a cone, with hidden edges dashed.",
	},
	"İki eğri arasındaki alan (integral)": {
		title: "Area between two curves (integral)",
		description:
			"The region between y = x + 2 and y = x², shaded (pgfplots fillbetween).",
	},
	"Sınav kâğıdı (çok dosyalı, A–E şıklı)": {
		title: "Exam paper (multi-file, choices A–E)",
		description:
			"An A4 exam paper with a header, two columns, questions with figures and multiple-choice answers A–E. Figures live in separate files.",
	},
	"Veri grafiği: ölçümler, hata çubukları ve uyum doğrusu": {
		title: "Data plot: measurements, error bars and fit line",
		description:
			"Experimental data for a paper or thesis, with error bars, a linear fit and a legend (pgfplots).",
	},
	"Gruplandırılmış çubuk grafik": {
		title: "Grouped bar chart",
		description:
			"Grouped bars for comparing methods, with value labels and a legend.",
	},
	"Normal dağılım ve taralı olasılık": {
		title: "Normal distribution with shaded probability",
		description:
			"The standard normal density curve with the region P(−1 ≤ Z ≤ 1) shaded.",
	},
	"3B yüzey grafiği": {
		title: "3D surface plot",
		description:
			"The surface z = sin(x)·cos(y) with a colour map and a colour bar (pgfplots surf).",
	},
	"Vektörler ve dik izdüşüm": {
		title: "Vectors and orthogonal projection",
		description:
			"Vectors u and v, the projection of v onto u and the orthogonal component.",
	},
	"Değişmeli diyagram (tikz-cd)": {
		title: "Commutative diagram (tikz-cd)",
		description:
			"A commutative square for homomorphisms and a diagram of the isomorphism theorem.",
	},
	"Sonlu durum otomatı": {
		title: "Finite state automaton",
		description:
			"A DFA recognising binary numbers divisible by 3 (automata library).",
	},
	"Blok diyagram: geri beslemeli kontrol sistemi": {
		title: "Block diagram: feedback control system",
		description:
			"A block diagram with a summing junction, controller, plant and feedback path.",
	},
	"Sunum slaytı (Beamer + TikZ)": {
		title: "Presentation slides (Beamer + TikZ)",
		description:
			"A Beamer presentation with a title slide and a content slide containing a TikZ figure.",
	},
	"Makale iskeleti (çok dosyalı)": {
		title: "Article skeleton (multi-file)",
		description:
			"An article skeleton with an abstract, sections, an equation, a figure in a separate file, a table and a bibliography.",
	},
};

export const OFFICIAL_SNIPPETS_EN: Record<
	string,
	{ title: string; description?: string }
> = {
	"arrow-basic": { title: "Simple arrow" },
	"shape-rect": { title: "Rectangle" },
	"shape-circle": { title: "Circle" },
	"node-basic": { title: "Node" },
	"grid-basic": { title: "Coordinate grid" },
	"flow-step": { title: "Flowchart step" },
	triangle: { title: "Triangle" },
	"tree-child": { title: "Tree branch" },
	"graph-edge": { title: "Directed edge" },
	"wire-basic": { title: "Circuit wire" },
	"dik-aci": {
		title: "Right-angle mark",
		description: "Requires the angles library: \\usetikzlibrary{angles}",
	},
	aci: {
		title: "Angle arc and label",
		description: "Requires the angles and quotes libraries.",
	},
	nokta: { title: "Filled point and label" },
	"acik-nokta": { title: "Open point" },
	eksen: {
		title: "Coordinate axes (pgfplots)",
		description: "Requires \\usepackage{pgfplots}.",
	},
	"orta-nokta": {
		title: "Midpoint of a segment",
		description: "Requires the calc library.",
	},
	kesikli: { title: "Dashed (hidden) edge" },
	yay: { title: "Circular arc" },
	sekil: { title: "Figure environment" },
	tablo: {
		title: "Table (booktabs)",
		description: "Requires \\usepackage{booktabs}.",
	},
	"hata-cubugu": {
		title: "Data series with error bars",
		description: "Use inside a pgfplots axis environment.",
	},
	"degismeli-kare": {
		title: "Commutative square (tikz-cd)",
		description: "Requires \\usepackage{tikz-cd}.",
	},
	durum: {
		title: "Automaton state",
		description: "Requires the automata library.",
	},
};

export const OFFICIAL_CATEGORIES_EN: Record<string, string> = {
	Başlangıç: "Getting started",
	"Temel Şekiller": "Basic shapes",
	Düğümler: "Nodes",
	"Akış Şemaları": "Flowcharts",
	"Koordinat Sistemi": "Coordinate system",
	Grafikler: "Graphs",
	Geometri: "Geometry",
	Ağaçlar: "Trees",
	"Analitik Geometri": "Analytic geometry",
	Fonksiyonlar: "Functions",
	Trigonometri: "Trigonometry",
	"Sayılar ve Eşitsizlikler": "Numbers and inequalities",
	Kümeler: "Sets",
	Olasılık: "Probability",
	"Katı Cisimler": "Solid geometry",
	İntegral: "Integrals",
	"Soru Hazırlama": "Exam questions",
	"Akademik Grafikler": "Academic plots",
	"Olasılık ve İstatistik": "Probability and statistics",
	"Çok Değişkenli Analiz": "Multivariable calculus",
	"Lineer Cebir": "Linear algebra",
	Cebir: "Algebra",
	"Bilgisayar Bilimleri": "Computer science",
	Mühendislik: "Engineering",
	Sunum: "Presentations",
	"Akademik Yazım": "Academic writing",
	Oklar: "Arrows",
	"Devre Şemaları": "Circuit diagrams",
	Matematik: "Mathematics",
};

/** English category name for a Turkish one, or the input when unknown. */
export function categoryToEnglish(category: string) {
	return OFFICIAL_CATEGORIES_EN[category] ?? category;
}

/** Turkish category name for an English one (for the `category` filter). */
export function categoryFromEnglish(category: string) {
	for (const [tr, en] of Object.entries(OFFICIAL_CATEGORIES_EN)) {
		if (en === category) return tr;
	}
	return category;
}

type LocalizableTemplate = {
	title: string;
	description: string | null;
	category: string;
	ownerId: string | null;
};

type LocalizableSnippet = LocalizableTemplate & { trigger: string };

/**
 * Returns the template with English metadata for official templates; the
 * category of user templates is translated too, so filters group together.
 */
export function templateToEnglish<T extends LocalizableTemplate>(
	template: T,
): T {
	const en =
		template.ownerId === null
			? OFFICIAL_TEMPLATES_EN[template.title]
			: undefined;
	return {
		...template,
		...(en ?? {}),
		category: categoryToEnglish(template.category),
	};
}

export function snippetToEnglish<T extends LocalizableSnippet>(snippet: T): T {
	const en =
		snippet.ownerId === null
			? OFFICIAL_SNIPPETS_EN[snippet.trigger]
			: undefined;
	return {
		...snippet,
		...(en
			? { title: en.title, description: en.description ?? snippet.description }
			: {}),
		category: categoryToEnglish(snippet.category),
	};
}
