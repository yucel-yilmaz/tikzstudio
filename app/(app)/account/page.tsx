import { AccountScreen } from "@/features/account/components/account-screen";
import { prisma } from "@/lib/prisma";
import { requireServerSession } from "@/lib/session";

export default async function AccountPage() {
	const session = await requireServerSession();
	// Accounts created through GitHub/Google have no password to change.
	const credentialAccount = await prisma.account.findFirst({
		where: { userId: session.user.id, providerId: "credential" },
		select: { id: true },
	});

	return (
		<AccountScreen
			name={session.user.name}
			email={session.user.email}
			emailVerified={session.user.emailVerified}
			hasPassword={Boolean(credentialAccount)}
		/>
	);
}
