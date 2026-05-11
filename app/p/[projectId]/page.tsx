import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShareScreen } from "@/features/share/components/share-screen";
import { getPublicProject } from "@/server/services/projects";

type Props = { params: Promise<{ projectId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { projectId } = await params;
	const project = await getPublicProject(projectId);

	if (!project) {
		return { title: "Proje bulunamadı" };
	}

	return {
		title: `${project.title} — TikZ Studio`,
		description:
			project.description ??
			"TikZ Studio üzerinde oluşturulmuş bir TikZ projesi.",
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
