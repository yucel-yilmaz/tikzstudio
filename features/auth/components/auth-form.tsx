"use client";

import { ArrowLeft, LockKeyhole, Mail, User2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuthClient } from "@/lib/auth-client";
import type { SocialProviderId } from "@/lib/auth-providers";

const SOCIAL_LABELS: Record<SocialProviderId, string> = {
	github: "GitHub",
	google: "Google",
};

type AuthMode = "login" | "signup";

// better-auth returns English messages; show Turkish ones for known codes.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
	INVALID_EMAIL_OR_PASSWORD: "E-posta veya şifre hatalı.",
	USER_ALREADY_EXISTS: "Bu e-posta adresiyle zaten bir hesap var.",
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
		"Bu e-posta adresiyle zaten bir hesap var. Başka bir e-posta deneyin.",
	PASSWORD_TOO_SHORT: "Şifre en az 8 karakter olmalı.",
	PASSWORD_TOO_LONG: "Şifre çok uzun.",
	INVALID_EMAIL: "Geçerli bir e-posta adresi girin.",
	TOO_MANY_REQUESTS:
		"Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.",
};

function authErrorMessage(error?: { code?: string } | null) {
	return (
		(error?.code && AUTH_ERROR_MESSAGES[error.code]) || "Giriş başarısız oldu."
	);
}

const endpointByMode: Record<AuthMode, string> = {
	login: "/api/auth/sign-in/email",
	signup: "/api/auth/sign-up/email",
};

export function AuthForm({
	mode,
	socialProviders = [],
}: {
	mode: AuthMode;
	socialProviders?: SocialProviderId[];
}) {
	const router = useRouter();
	const [navigating, startTransition] = useTransition();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const pending = submitting || navigating;

	async function handleSocial(provider: SocialProviderId) {
		setError(null);
		setSubmitting(true);
		const result = await getAuthClient()
			.signIn.social({ provider, callbackURL: "/dashboard" })
			.catch(() => null);
		if (!result || result.error) {
			setSubmitting(false);
			setError(authErrorMessage(result?.error));
		}
	}

	async function handleSubmit(formData: FormData) {
		setError(null);
		setSubmitting(true);
		try {
			await submitCredentials(formData);
		} finally {
			setSubmitting(false);
		}
	}

	async function submitCredentials(formData: FormData) {
		const payload =
			mode === "signup"
				? {
						name: String(formData.get("name") ?? ""),
						email: String(formData.get("email") ?? ""),
						password: String(formData.get("password") ?? ""),
					}
				: {
						email: String(formData.get("email") ?? ""),
						password: String(formData.get("password") ?? ""),
					};

		const response = await fetch(endpointByMode[mode], {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const body = (await response.json().catch(() => null)) as {
				code?: string;
			} | null;
			setError(
				response.status === 429
					? AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS
					: authErrorMessage(body),
			);
			return;
		}

		startTransition(() => {
			router.push("/dashboard");
			router.refresh();
		});
	}

	return (
		<div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
			<Card className="relative overflow-hidden border-white/60 bg-[linear-gradient(160deg,rgba(255,250,242,0.96),rgba(244,239,231,0.94))]">
				<div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[rgba(200,85,61,0.15)] blur-3xl" />
				<CardContent className="relative flex h-full flex-col justify-between gap-8 p-8 lg:p-10">
					<div className="space-y-5">
						<Badge variant="outline" className="normal-case tracking-normal">
							TikZ Studio
						</Badge>
						<div className="space-y-3">
							<h1 className="max-w-lg text-4xl font-semibold tracking-tight lg:text-5xl">
								Matematik şekilleriniz için tarayıcıda çalışan TikZ editörü.
							</h1>
							<p className="max-w-xl text-base leading-7 text-(--ink-1)">
								Kod editörü, güvenli derleme, PDF önizleme ve derleme günlüğü
								aynı ekranda. Geometri çizimleri, grafikler ve sınav kâğıtları
								için kurulum gerektirmeyen hızlı bir çalışma ortamı.
							</p>
						</div>
					</div>

					<div className="grid gap-3">
						{[
							"Projelerinizi kaydedin, tüm değişiklikleri tek yerden yönetin.",
							"Güvenli ortamda derleyin, çıktıyı ve hataları anında görün.",
							"Şablonlar ve kod parçacıklarıyla yeni belgelere hızla başlayın.",
						].map((item) => (
							<div
								key={item}
								className="rounded-3xl border border-(--line) bg-white/70 px-4 py-4 text-sm leading-6 text-(--ink-1)"
							>
								{item}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card className="border-white/60 bg-[color-mix(in_srgb,var(--surface-1)_90%,white_10%)]">
				<CardHeader className="space-y-4 pb-3">
					<div className="flex items-center justify-between gap-3">
						<Badge variant="default" className="normal-case tracking-normal">
							{mode === "signup" ? "Hesap oluştur" : "Giriş yap"}
						</Badge>
						<Button asChild variant="ghost" size="sm">
							<Link href="/" className="gap-2">
								<ArrowLeft size={15} />
								Ana sayfa
							</Link>
						</Button>
					</div>
					<div className="space-y-2">
						<CardTitle className="text-3xl">
							{mode === "signup"
								? "TikZ Studio hesabınızı oluşturun"
								: "Çalışma alanınıza dönün"}
						</CardTitle>
						<CardDescription className="text-sm leading-6">
							TikZ projelerinizi kaydetmek, derlemek ve yönetmek için giriş
							yapın.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-5">
					<form
						// onSubmit instead of `action`: React resets uncontrolled inputs
						// after a form action, which wiped the email on a failed sign-in.
						onSubmit={(event) => {
							event.preventDefault();
							void handleSubmit(new FormData(event.currentTarget));
						}}
						className="space-y-5"
					>
						{mode === "signup" ? (
							<label className="block space-y-2">
								<span className="text-sm font-medium">Ad soyad</span>
								<div className="relative">
									<User2
										className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--ink-1)"
										size={16}
									/>
									<Input
										name="name"
										required
										className="pl-11"
										placeholder="Adınızı ve soyadınızı girin"
									/>
								</div>
							</label>
						) : null}

						<label className="block space-y-2">
							<span className="text-sm font-medium">E-posta</span>
							<div className="relative">
								<Mail
									className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--ink-1)"
									size={16}
								/>
								<Input
									type="email"
									name="email"
									required
									className="pl-11"
									placeholder="ornek@okul.k12.tr"
								/>
							</div>
						</label>

						<label className="block space-y-2">
							<span className="text-sm font-medium">Şifre</span>
							<div className="relative">
								<LockKeyhole
									className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--ink-1)"
									size={16}
								/>
								<Input
									type="password"
									name="password"
									required
									minLength={8}
									className="pl-11"
									placeholder="En az 8 karakter"
								/>
							</div>
						</label>

						{error ? (
							<div className="rounded-2xl border border-[rgba(180,35,24,0.18)] bg-[rgba(180,35,24,0.08)] px-4 py-3 text-sm text-(--danger)">
								{error}
							</div>
						) : null}

						<Button type="submit" disabled={pending} className="w-full">
							{pending
								? "İşleniyor…"
								: mode === "signup"
									? "Hesap oluştur"
									: "Giriş yap"}
						</Button>
					</form>

					{socialProviders.length > 0 ? (
						<div className="space-y-3">
							<div className="flex items-center gap-3 text-xs text-(--ink-1)">
								<span className="h-px flex-1 bg-(--line)" />
								veya
								<span className="h-px flex-1 bg-(--line)" />
							</div>
							<div className="grid gap-2 sm:grid-cols-2">
								{socialProviders.map((provider) => (
									<Button
										key={provider}
										type="button"
										variant="outline"
										disabled={pending}
										onClick={() => handleSocial(provider)}
									>
										{SOCIAL_LABELS[provider]} ile devam et
									</Button>
								))}
							</div>
						</div>
					) : null}

					<div className="rounded-3xl border border-(--line) bg-white/75 p-4 text-sm leading-6 text-(--ink-1)">
						{mode === "signup" ? "Zaten hesabınız var mı?" : "Yeni misiniz?"}{" "}
						<Link
							href={mode === "signup" ? "/login" : "/signup"}
							className="font-medium text-(--accent-strong)"
						>
							{mode === "signup" ? "Giriş yap" : "Hesap oluştur"}
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
