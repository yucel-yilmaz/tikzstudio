import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatRelativeDate(value: string | Date) {
	const date = typeof value === "string" ? new Date(value) : value;
	return new Intl.DateTimeFormat("tr-TR", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

const TRANSLITERATIONS: Record<string, string> = {
	ç: "c",
	ğ: "g",
	ı: "i",
	İ: "i",
	ö: "o",
	ş: "s",
	ü: "u",
	Ç: "c",
	Ğ: "g",
	Ö: "o",
	Ş: "s",
	Ü: "u",
};

export function slugifyFilename(value: string) {
	return value
		.replace(/[çğıİöşüÇĞÖŞÜ]/g, (char) => TRANSLITERATIONS[char] ?? char)
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

const TEX_FILE_EXTENSIONS = [
	".tex",
	".sty",
	".cls",
	".bib",
	".bst",
	".ltx",
	".dtx",
	".cfg",
];

export function normalizeProjectFilePath(input: string) {
	const trimmed = input.trim().replace(/^\/+|\/+$/g, "");
	if (!trimmed) {
		return "";
	}

	const lower = trimmed.toLowerCase();
	if (TEX_FILE_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
		return trimmed;
	}

	return `${trimmed}.tex`;
}
