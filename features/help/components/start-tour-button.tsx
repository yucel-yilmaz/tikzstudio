"use client";

import { Compass } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { startTour } from "@/features/help/tour/tour-state";

/**
 * Restarts the onboarding tour from the help center and opens the dashboard,
 * where it begins (visitors who are signed out land on the login page first;
 * the tour waits for them on the dashboard).
 */
export function StartTourButton({
	label = "Öğreticiyi başlat",
	variant = "default",
}: {
	label?: string;
	variant?: "default" | "outline" | "secondary";
}) {
	const router = useRouter();

	return (
		<Button
			type="button"
			variant={variant}
			size="lg"
			onClick={() => {
				startTour("dashboard");
				router.push("/dashboard");
			}}
		>
			<Compass />
			{label}
		</Button>
	);
}
