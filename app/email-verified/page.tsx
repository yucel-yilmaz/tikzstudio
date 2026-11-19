import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AuthCard, Notice } from "@/features/auth/components/auth-card";
import { authErrorMessage } from "@/lib/auth-errors";
import { getI18n } from "@/lib/i18n/server";
import { getServerSession } from "@/lib/session";

/** Landing page of the email verification link (better-auth redirects here). */
export default async function EmailVerifiedPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const error = typeof params.error === "string" ? params.error : null;
	const session = await getServerSession();
	const { t } = await getI18n();

	if (error) {
		return (
			<AuthCard
				badge={t("auth.emailVerificationBadge")}
				title={t("auth.verificationFailedTitle")}
			>
				<Notice tone="error">
					{authErrorMessage(t, error, t("auth.verificationFailedFallback"))}
				</Notice>
				<Button asChild className="w-full">
					<Link href="/login">{t("common.signIn")}</Link>
				</Button>
			</AuthCard>
		);
	}

	return (
		<AuthCard
			badge={t("auth.emailVerificationBadge")}
			title={t("auth.verifiedTitle")}
		>
			<Notice tone="success">{t("auth.verifiedBody")}</Notice>
			<Button asChild className="w-full">
				<Link href={session ? "/dashboard" : "/login"}>
					{session ? t("common.goToDashboard") : t("common.signIn")}
				</Link>
			</Button>
		</AuthCard>
	);
}
