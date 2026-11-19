import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AuthCard, Notice } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { authErrorMessage } from "@/lib/auth-errors";

export default async function ResetPasswordPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const token = typeof params.token === "string" ? params.token : null;
	const error = typeof params.error === "string" ? params.error : null;

	return (
		<AuthCard
			badge="Şifre sıfırlama"
			title="Yeni şifre belirleyin"
			description="Yeni şifreniz en az 8 karakter olmalı."
		>
			{token && !error ? (
				<ResetPasswordForm token={token} />
			) : (
				<div className="space-y-4">
					<Notice tone="error">
						{authErrorMessage(
							error ?? "INVALID_TOKEN",
							"Bağlantı geçersiz. Lütfen yeni bir bağlantı isteyin.",
						)}
					</Notice>
					<Button asChild className="w-full">
						<Link href="/forgot-password">Yeni bağlantı iste</Link>
					</Button>
				</div>
			)}
		</AuthCard>
	);
}
