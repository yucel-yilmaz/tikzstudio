import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShareScreen } from "@/features/share/components/share-screen";
import { getPublicProject } from "@/server/services/projects";

type Props = { params: Promise<{ projectId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { projectId } = await params;
	const project = await getPublicProject(projectId);

	if (!project) {
		return { title: "Project not found" };
	}

	return {
		title: `${project.title} — TikZ Studio`,
		description:
			project.description ?? "A TikZ project created with TikZ Studio.",
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
