import type { Metadata } from "next";

import { HelpShell } from "@/features/help/components/help-shell";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const { t } = await getI18n();
	return {
		title: {
			template: t("meta.helpTitleTemplate"),
			default: t("meta.helpDefaultTitle"),
		},
		description: t("meta.helpDescription"),
	};
}

export default function HelpLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <HelpShell>{children}</HelpShell>;
}
