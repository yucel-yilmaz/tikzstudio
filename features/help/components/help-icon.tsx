import {
	CircleHelp,
	Code2,
	Download,
	FolderTree,
	Languages,
	LayoutTemplate,
	type LucideIcon,
	Play,
	Rocket,
	Share2,
	Wrench,
} from "lucide-react";

import type { HelpIconName } from "@/features/help/content/types";

const ICONS: Record<HelpIconName, LucideIcon> = {
	rocket: Rocket,
	code: Code2,
	folder: FolderTree,
	play: Play,
	download: Download,
	layout: LayoutTemplate,
	share: Share2,
	languages: Languages,
	wrench: Wrench,
	help: CircleHelp,
};

export function HelpIcon({
	name,
	className,
}: {
	name: HelpIconName;
	className?: string;
}) {
	const Icon = ICONS[name];
	return <Icon className={className} aria-hidden />;
}

export function HelpIconBadge({ name }: { name: HelpIconName }) {
	return (
		<span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(200,85,61,0.12)] text-(--accent-strong)">
			<HelpIcon name={name} className="size-5" />
		</span>
	);
}
