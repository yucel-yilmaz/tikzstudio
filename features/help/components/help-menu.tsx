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

/**
 * "Yardım" entry point for the dashboard and editor headers: links into the
 * help center and restarts the onboarding tour on the current page.
 */
export function HelpMenu({
	page,
	size = "default",
}: {
	page: TourPage;
	size?: "default" | "sm";
}) {
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
					aria-label="Yardım"
				>
					<CircleHelp />
					<span>Yardım</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-60">
				<DropdownMenuLabel>Yardım</DropdownMenuLabel>
				<DropdownMenuItem asChild>
					<Link href="/yardim" {...linkProps}>
						<BookOpen />
						Yardım merkezi
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => startTour(page)}>
					<Compass />
					Öğreticiyi başlat
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/yardim/sorun-giderme" {...linkProps}>
						<Wrench />
						Sorun giderme
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/yardim/turkce-belgeler" {...linkProps}>
						<Languages />
						Türkçe belgeler
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
