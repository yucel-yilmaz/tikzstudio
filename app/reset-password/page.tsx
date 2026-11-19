import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AuthCard, Notice } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { authErrorMessage } from "@/lib/auth-errors";
import { getI18n } from "@/lib/i18n/server";

export default async function ResetPasswordPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const token = typeof params.token === "string" ? params.token : null;
	const error = typeof params.error === "string" ? params.error : null;
	const { t } = await getI18n();

	return (
		<AuthCard
			badge={t("auth.resetBadge")}
			title={t("auth.resetTitle")}
			description={t("auth.resetDescription")}
		>
			{token && !error ? (
				<ResetPasswordForm token={token} />
			) : (
				<div className="space-y-4">
					<Notice tone="error">
						{authErrorMessage(
							t,
							error ?? "INVALID_TOKEN",
							t("auth.resetInvalidFallback"),
						)}
					</Notice>
					<Button asChild className="w-full">
						<Link href="/forgot-password">{t("auth.requestNewLink")}</Link>
					</Button>
				</div>
			)}
		</AuthCard>
	);
}
