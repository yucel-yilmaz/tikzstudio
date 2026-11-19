import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";
import { OnboardingTour } from "@/features/help/tour/onboarding-tour";
import { requireServerSession } from "@/lib/session";

export default async function DashboardPage() {
	const session = await requireServerSession();

	return (
		<>
			<DashboardScreen userName={session.user.name} />
			<OnboardingTour page="dashboard" />
		</>
	);
}
