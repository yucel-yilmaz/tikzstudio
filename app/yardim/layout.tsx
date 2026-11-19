import type { Metadata } from "next";

import { HelpShell } from "@/features/help/components/help-shell";

export const metadata: Metadata = {
	title: {
		template: "%s · TikZ Studio Yardım",
		default: "Yardım merkezi · TikZ Studio",
	},
	description:
		"TikZ Studio yardım merkezi: başlarken, editör, derleme motorları, Türkçe belgeler, sorun giderme ve sıkça sorulan sorular.",
};

export default function HelpLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <HelpShell>{children}</HelpShell>;
}
