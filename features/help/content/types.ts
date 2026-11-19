/**
 * Help-center content model.
 *
 * Articles are plain typed data so they can be edited without touching any
 * component. Text fields support a tiny inline syntax rendered by
 * `InlineText`:
 *   `code`            -> inline code
 *   **kalın**         -> bold
 *   [metin](/yardim/x) -> link (internal links use next/link)
 */

export type HelpIconName =
	| "rocket"
	| "code"
	| "folder"
	| "play"
	| "download"
	| "layout"
	| "share"
	| "languages"
	| "wrench"
	| "help";

export type HelpBlock =
	| { type: "p"; text: string }
	| { type: "h2"; text: string; id: string }
	| { type: "h3"; text: string }
	| { type: "list"; items: string[]; ordered?: boolean }
	| {
			type: "code";
			code: string;
			/** Shown above the code block, e.g. a file name. */
			title?: string;
			language?: "latex" | "text";
	  }
	| {
			type: "callout";
			tone: "tip" | "warning" | "info";
			title?: string;
			text: string;
	  }
	| { type: "table"; head: string[]; rows: string[][] }
	| {
			type: "faq";
			items: { question: string; answer: string[] }[];
	  }
	| { type: "tourButton"; text?: string };

export type HelpArticle = {
	slug: string;
	title: string;
	/** One-sentence summary for the index page and metadata description. */
	summary: string;
	icon: HelpIconName;
	/** Extra words for the help-center search (not shown). */
	keywords?: string[];
	blocks: HelpBlock[];
};

export type HelpSection = {
	id: string;
	title: string;
	description: string;
	articles: HelpArticle[];
};
