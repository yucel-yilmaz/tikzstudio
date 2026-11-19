import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n/server";

/** Shared chrome for every /yardim page: slim header and footer. */
export async function HelpShell({ children }: { children: ReactNode }) {
	const { t } = await getI18n();

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-375 flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
			<header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/60 bg-[linear-gradient(160deg,rgba(255,250,242,0.96),rgba(244,239,231,0.94))] px-4 py-3 shadow-[0_18px_40px_rgba(44,31,20,0.06)] sm:px-5">
				<div className="flex min-w-0 items-center gap-2">
					<Link
						href="/"
						className="truncate text-base font-semibold tracking-tight"
					>
						TikZ Studio
					</Link>
					<span className="text-(--ink-1)/50" aria-hidden>
						/
					</span>
					<Link
						href="/yardim"
						className="inline-flex items-center gap-1.5 text-sm font-medium text-(--accent-strong)"
					>
						<BookOpen className="size-4" aria-hidden />
						{t("common.helpCenter")}
					</Link>
				</div>
				<div className="flex items-center gap-2">
					<LocaleSwitcher />
					<Button asChild size="sm" variant="outline">
						<Link href="/dashboard">
							{t("common.goToDashboard")}
							<ArrowRight />
						</Link>
					</Button>
				</div>
			</header>

			<div className="flex-1">{children}</div>

			<footer className="flex flex-col gap-2 border-t border-(--line) px-1 pt-4 pb-2 text-sm text-(--ink-1) sm:flex-row sm:items-center sm:justify-between">
				<p>{t("help.footer")}</p>
				<nav
					aria-label={t("common.footerLinks")}
					className="flex flex-wrap gap-x-4 gap-y-1"
				>
					<Link href="/" className="hover:text-(--ink-0)">
						{t("common.home")}
					</Link>
					<Link href="/yardim/sss" className="hover:text-(--ink-0)">
						{t("common.faq")}
					</Link>
					<Link href="/yardim/sorun-giderme" className="hover:text-(--ink-0)">
						{t("common.troubleshooting")}
					</Link>
				</nav>
			</footer>
		</div>
	);
}
