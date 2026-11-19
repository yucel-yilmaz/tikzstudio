import {
	compilingAndEngines,
	outputsAndExport,
} from "@/features/help/content/articles/tr/compiling";
import {
	editor,
	gettingStarted,
	projectsAndFiles,
} from "@/features/help/content/articles/tr/getting-started";
import {
	sharing,
	templatesAndSnippets,
	turkishDocuments,
} from "@/features/help/content/articles/tr/more";
import {
	faq,
	troubleshooting,
} from "@/features/help/content/articles/tr/support";
import type { HelpSection } from "@/features/help/content/types";

/** Turkish help center: sections in the order they appear on the index. */
export const helpSections: HelpSection[] = [
	{
		id: "ilk-adimlar",
		title: "İlk adımlar",
		description: "Hesap, ilk proje ve ekranın bölümleri.",
		articles: [gettingStarted, editor, projectsAndFiles],
	},
	{
		id: "derleme",
		title: "Derleme ve çıktı",
		description: "Motorlar, sınırlar, önizleme ve indirme.",
		articles: [compilingAndEngines, outputsAndExport],
	},
	{
		id: "daha-fazlasi",
		title: "Daha fazlası",
		description: "Şablonlar, paylaşma ve Türkçe belgeler.",
		articles: [templatesAndSnippets, sharing, turkishDocuments],
	},
	{
		id: "destek",
		title: "Sorun mu var?",
		description: "Hata mesajları ve sık sorulan sorular.",
		articles: [troubleshooting, faq],
	},
];
