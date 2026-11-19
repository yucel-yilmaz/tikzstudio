"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useI18n } from "@/lib/i18n/client";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * TR / EN toggle. Stores the choice in the `locale` cookie (and on the
 * account when signed in) via POST /api/locale, then re-renders the page on
 * the server so every string, `<html lang>` and date format follow it.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
	const { locale, t } = useI18n();
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [requested, setRequested] = useState<Locale | null>(null);

	async function change(next: Locale) {
		if (next === locale || pending) return;
		setRequested(next);
		try {
			const response = await fetch("/api/locale", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ locale: next }),
			});
			if (!response.ok) throw new Error(String(response.status));
			startTransition(() => router.refresh());
		} catch {
			setRequested(null);
		}
	}

	const active = pending && requested ? requested : locale;

	return (
		<fieldset
			className={cn(
				"inline-flex items-center gap-0.5 rounded-full border border-(--line) bg-white/70 p-0.5 text-xs",
				pending && "opacity-70",
				className,
			)}
			data-testid="locale-switcher"
		>
			<legend className="sr-only">{t("locale.label")}</legend>
			<Languages
				className="mx-1.5 size-3.5 text-(--ink-1)"
				aria-hidden="true"
			/>
			{LOCALES.map((option) => (
				<button
					key={option}
					type="button"
					lang={option}
					aria-pressed={active === option}
					aria-label={t("locale.switchTo", {
						language: LOCALE_LABELS[option],
					})}
					title={LOCALE_LABELS[option]}
					disabled={pending}
					onClick={() => void change(option)}
					className={cn(
						"rounded-full px-2.5 py-1 font-medium uppercase tracking-wide transition-colors",
						active === option
							? "bg-(--ink-0) text-white"
							: "text-(--ink-1) hover:bg-white hover:text-(--ink-0)",
					)}
				>
					{option}
				</button>
			))}
		</fieldset>
	);
}
