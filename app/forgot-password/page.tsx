import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { getI18n } from "@/lib/i18n/server";

export default async function ForgotPasswordPage() {
	const { t } = await getI18n();

	return (
		<AuthCard
			badge={t("auth.forgotBadge")}
			title={t("auth.forgotTitle")}
			description={t("auth.forgotDescription")}
		>
			<ForgotPasswordForm />
		</AuthCard>
	);
}
