/**
 * Extensions stored as editable text. Everything else (images, fonts, PDFs)
 * is stored as binary content.
 */
export const TEXT_EXTENSIONS = new Set([
	".tex",
	".ltx",
	".sty",
	".cls",
	".clo",
	".cfg",
	".def",
	".fd",
	".ldf",
	".dtx",
	".ins",
	".bib",
	".bst",
	".bbx",
	".cbx",
	".lbx",
	".tikz",
	".pgf",
	".lua",
	".txt",
	".md",
	".csv",
	".dat",
	".log",
]);

export function isTextFile(filePath: string): boolean {
	const dot = filePath.lastIndexOf(".");
	if (dot <= filePath.lastIndexOf("/")) return false;
	return TEXT_EXTENSIONS.has(filePath.slice(dot).toLowerCase());
}
