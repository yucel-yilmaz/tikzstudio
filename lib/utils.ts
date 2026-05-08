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

export function slugifyFilename(value: string) {
	return value
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
