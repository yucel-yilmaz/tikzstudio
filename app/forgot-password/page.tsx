import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
	return (
		<AuthCard
			badge="Şifremi unuttum"
			title="Şifrenizi sıfırlayın"
			description="Hesabınızın e-posta adresini girin; size yeni şifre belirlemeniz için bir bağlantı gönderelim."
		>
			<ForgotPasswordForm />
		</AuthCard>
	);
}
