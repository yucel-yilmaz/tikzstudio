import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AuthCard, Notice } from "@/features/auth/components/auth-card";
import { authErrorMessage } from "@/lib/auth-errors";
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

	if (error) {
		return (
			<AuthCard badge="E-posta doğrulama" title="Doğrulama tamamlanamadı">
				<Notice tone="error">
					{authErrorMessage(
						error,
						"Doğrulama bağlantısı geçersiz. Giriş yapmayı deneyin; gerekirse yeni bir bağlantı gönderebilirsiniz.",
					)}
				</Notice>
				<Button asChild className="w-full">
					<Link href="/login">Giriş yap</Link>
				</Button>
			</AuthCard>
		);
	}

	return (
		<AuthCard badge="E-posta doğrulama" title="E-posta adresiniz doğrulandı">
			<Notice tone="success">Teşekkürler! Hesabınız etkinleştirildi.</Notice>
			<Button asChild className="w-full">
				<Link href={session ? "/dashboard" : "/login"}>
					{session ? "Panele git" : "Giriş yap"}
				</Link>
			</Button>
		</AuthCard>
	);
}
