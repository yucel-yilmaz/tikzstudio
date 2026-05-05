import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";
import { requireServerSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await requireServerSession();

  return <DashboardScreen userName={session.user.name} />;
}
