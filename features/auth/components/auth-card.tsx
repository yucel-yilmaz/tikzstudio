import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

/** Centered single-card layout for the smaller auth pages. */
export function AuthCard({
	badge,
	title,
	description,
	children,
	backHref = "/login",
	backLabel = "Girişe dön",
}: {
	badge: string;
	title: string;
	description?: ReactNode;
	children: ReactNode;
	backHref?: string;
	backLabel?: string;
}) {
	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(200,85,61,0.14),transparent_24%),linear-gradient(180deg,rgba(255,250,242,0.92),rgba(244,239,231,0.96))] px-4 py-8">
			<div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
				<Card className="w-full border-white/60 bg-[color-mix(in_srgb,var(--surface-1)_90%,white_10%)]">
					<CardHeader className="space-y-4 pb-3">
						<div className="flex items-center justify-between gap-3">
							<Badge variant="default" className="normal-case tracking-normal">
								{badge}
							</Badge>
							<Button asChild variant="ghost" size="sm">
								<Link href={backHref} className="gap-2">
									<ArrowLeft size={15} />
									{backLabel}
								</Link>
							</Button>
						</div>
						<div className="space-y-2">
							<CardTitle className="text-2xl">{title}</CardTitle>
							{description ? (
								<CardDescription className="text-sm leading-6">
									{description}
								</CardDescription>
							) : null}
						</div>
					</CardHeader>
					<CardContent className="space-y-5">{children}</CardContent>
				</Card>
			</div>
		</main>
	);
}

export function Notice({
	tone,
	children,
}: {
	tone: "success" | "error" | "info";
	children: ReactNode;
}) {
	const styles = {
		success:
			"border-[rgba(22,128,61,0.2)] bg-[rgba(22,128,61,0.08)] text-[rgb(21,94,47)]",
		error:
			"border-[rgba(180,35,24,0.18)] bg-[rgba(180,35,24,0.08)] text-(--danger)",
		info: "border-(--line) bg-white/75 text-(--ink-1)",
	}[tone];
	return (
		<div
			role={tone === "error" ? "alert" : "status"}
			className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${styles}`}
		>
			{children}
		</div>
	);
}
