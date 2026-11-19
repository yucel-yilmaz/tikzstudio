import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShareScreen } from "@/features/share/components/share-screen";
import { getI18n } from "@/lib/i18n/server";
import { getPublicProject } from "@/server/services/projects";

type Props = { params: Promise<{ projectId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { projectId } = await params;
	const project = await getPublicProject(projectId);
	const { t } = await getI18n();

	if (!project) {
		return { title: t("meta.projectNotFound") };
	}

	return {
		title: `${project.title} — TikZ Studio`,
		description: project.description ?? t("meta.shareDescription"),
	};
}

export default async function SharePage({ params }: Props) {
	const { projectId } = await params;
	const project = await getPublicProject(projectId);

	if (!project) {
		notFound();
	}

	return <ShareScreen projectId={projectId} />;
}
