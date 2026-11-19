"use client";

import { BookOpen, CircleHelp, Compass, Languages, Wrench } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { startTour } from "@/features/help/tour/tour-state";
import { TOUR_TARGETS, type TourPage } from "@/features/help/tour/tour-steps";
import { useT } from "@/lib/i18n/client";

/**
 * "Help" entry point for the dashboard and editor headers: links into the
 * help center and restarts the onboarding tour on the current page.
 */
export function HelpMenu({
	page,
	size = "default",
}: {
	page: TourPage;
	size?: "default" | "sm";
}) {
	const t = useT();
	// In the editor, open help in a new tab so the work stays on screen.
	const linkProps =
		page === "editor" ? { target: "_blank", rel: "noreferrer" } : {};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size={size}
					data-tour={TOUR_TARGETS.helpMenu}
					aria-label={t("common.help")}
				>
					<CircleHelp />
					<span>{t("common.help")}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-60">
				<DropdownMenuLabel>{t("common.help")}</DropdownMenuLabel>
				<DropdownMenuItem asChild>
					<Link href="/yardim" {...linkProps}>
						<BookOpen />
						{t("common.helpCenter")}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => startTour(page)}>
					<Compass />
					{t("tour.start")}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/yardim/sorun-giderme" {...linkProps}>
						<Wrench />
						{t("common.troubleshooting")}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/yardim/turkce-belgeler" {...linkProps}>
						<Languages />
						{t("help.turkishDocuments")}
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
