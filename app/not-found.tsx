import type { Metadata } from "next";
import Link from "next/link";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const { t } = await getI18n();
	return { title: t("meta.notFoundTitle") };
}

export default async function NotFound() {
	const { t } = await getI18n();

	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-8">
			<Card className="w-full max-w-md border-white/60 bg-[linear-gradient(160deg,rgba(255,250,242,0.96),rgba(244,239,231,0.94))]">
				<CardContent className="space-y-5 p-8">
					<div className="flex items-center justify-between gap-3">
						<Badge variant="outline" className="normal-case tracking-normal">
							{t("notFound.badge")}
						</Badge>
						<LocaleSwitcher />
					</div>
					<div className="space-y-2">
						<h1 className="text-2xl font-semibold tracking-tight">
							{t("notFound.title")}
						</h1>
						<p className="text-sm leading-6 text-(--ink-1)">
							{t("notFound.description")}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button asChild>
							<Link href="/">{t("common.backToHome")}</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/yardim">{t("common.helpCenter")}</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
