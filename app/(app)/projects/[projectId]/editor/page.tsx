import { ErrorBoundary } from "@/components/error-boundary";
import { EditorScreen } from "@/features/editor/components/editor-screen";
import { OnboardingTour } from "@/features/help/tour/onboarding-tour";
import { requireServerSession } from "@/lib/session";

export default async function EditorPage({
	params,
}: {
	params: Promise<{ projectId: string }>;
}) {
	await requireServerSession();
	const { projectId } = await params;

	return (
		<ErrorBoundary>
			<EditorScreen projectId={projectId} />
			<OnboardingTour page="editor" />
		</ErrorBoundary>
	);
}
