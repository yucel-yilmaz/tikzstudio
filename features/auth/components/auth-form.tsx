"use client";

import { ArrowLeft, LockKeyhole, Mail, MailCheck, User2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { LocaleSwitcher } from "@/components/locale-switcher";
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
import { authErrorMessage, postAuth } from "@/lib/auth-errors";
import type { SocialProviderId } from "@/lib/auth-providers";
import { useI18n } from "@/lib/i18n/client";

const SOCIAL_LABELS: Record<SocialProviderId, string> = {
	github: "GitHub",
	google: "Google",
};

type AuthMode = "login" | "signup";

const endpointByMode: Record<AuthMode, string> = {
	login: "/sign-in/email",
	signup: "/sign-up/email",
};

export function AuthForm({
	mode,
	socialProviders = [],
}: {
	mode: AuthMode;
	socialProviders?: SocialProviderId[];
}) {
	const { t, rich } = useI18n();
	const router = useRouter();
	const [navigating, startTransition] = useTransition();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
	const [checkEmailFor, setCheckEmailFor] = useState<string | null>(null);
	const [resendState, setResendState] = useState<
		"idle" | "sending" | "sent" | "error"
	>("idle");

	async function resendVerification(email: string) {
		setResendState("sending");
		const result = await postAuth(t, "/send-verification-email", {
			email,
			callbackURL: "/email-verified",
		});
		setResendState(result.ok ? "sent" : "error");
		if (!result.ok) setError(result.message);
	}
	const pending = submitting || navigating;

	async function handleSocial(provider: SocialProviderId) {
		setError(null);
		setSubmitting(true);
		const result = await getAuthClient()
			.signIn.social({ provider, callbackURL: "/dashboard" })
			.catch(() => null);
		if (!result || result.error) {
			setSubmitting(false);
			setError(
				authErrorMessage(t, result?.error?.code, t("authErrors.signInFailed")),
			);
		}
	}

	async function handleSubmit(formData: FormData) {
		setError(null);
		setUnverifiedEmail(null);
		setResendState("idle");
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

		const result = await postAuth<{ token: string | null }>(
			t,
			endpointByMode[mode],
			mode === "signup"
				? { ...payload, callbackURL: "/email-verified" }
				: payload,
			t("authErrors.signInFailed"),
		);

		if (!result.ok) {
			setError(result.message);
			if (result.code === "EMAIL_NOT_VERIFIED") {
				setUnverifiedEmail(payload.email);
			}
			return;
		}

		// With email verification required, sign-up returns no session token.
		if (mode === "signup" && !result.data?.token) {
			setCheckEmailFor(payload.email);
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
						<div className="flex flex-wrap items-center justify-between gap-2">
							<Badge variant="outline" className="normal-case tracking-normal">
								TikZ Studio
							</Badge>
							<LocaleSwitcher />
						</div>
						<div className="space-y-3">
							<h1 className="max-w-lg text-4xl font-semibold tracking-tight lg:text-5xl">
								{t("auth.heroTitle")}
							</h1>
							<p className="max-w-xl text-base leading-7 text-(--ink-1)">
								{t("auth.heroBody")}
							</p>
						</div>
					</div>

					<div className="grid gap-3">
						{[
							t("auth.benefitProjects"),
							t("auth.benefitCompile"),
							t("auth.benefitTemplates"),
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
							{mode === "signup" ? t("common.signUp") : t("common.signIn")}
						</Badge>
						<Button asChild variant="ghost" size="sm">
							<Link href="/" className="gap-2">
								<ArrowLeft size={15} />
								{t("common.home")}
							</Link>
						</Button>
					</div>
					<div className="space-y-2">
						<CardTitle className="text-3xl">
							{mode === "signup" ? t("auth.signupTitle") : t("auth.loginTitle")}
						</CardTitle>
						<CardDescription className="text-sm leading-6">
							{t("auth.cardDescription")}
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-5">
					{checkEmailFor ? (
						<div className="space-y-4 rounded-2xl border border-(--line) bg-white/75 p-5 text-sm leading-6">
							<div className="flex items-center gap-2 font-medium">
								<MailCheck className="size-5 text-(--accent-strong)" />
								{t("auth.checkInboxTitle")}
							</div>
							<p className="text-(--ink-1)">
								{rich("auth.checkInboxBody", {
									email: checkEmailFor,
									b: (chunks) => <strong>{chunks}</strong>,
								})}
							</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={resendState === "sending" || resendState === "sent"}
								onClick={() => resendVerification(checkEmailFor)}
							>
								{resendState === "sent"
									? t("auth.resent")
									: t("auth.resendLink")}
							</Button>
						</div>
					) : null}
					<form
						hidden={Boolean(checkEmailFor)}
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
								<span className="text-sm font-medium">
									{t("auth.fullName")}
								</span>
								<div className="relative">
									<User2
										className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--ink-1)"
										size={16}
									/>
									<Input
										name="name"
										required
										className="pl-11"
										placeholder={t("auth.fullNamePlaceholder")}
									/>
								</div>
							</label>
						) : null}

						<label className="block space-y-2">
							<span className="text-sm font-medium">{t("common.email")}</span>
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
									placeholder={t("common.emailPlaceholder")}
								/>
							</div>
						</label>

						<label className="block space-y-2">
							<span className="flex items-center justify-between text-sm font-medium">
								{t("auth.password")}
								{mode === "login" ? (
									<Link
										href="/forgot-password"
										className="text-xs font-normal text-(--accent-strong) hover:underline"
									>
										{t("auth.forgotPassword")}
									</Link>
								) : null}
							</span>
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
									placeholder={t("common.passwordPlaceholder")}
								/>
							</div>
						</label>

						{error ? (
							<div className="space-y-2 rounded-2xl border border-[rgba(180,35,24,0.18)] bg-[rgba(180,35,24,0.08)] px-4 py-3 text-sm text-(--danger)">
								<p>{error}</p>
								{unverifiedEmail ? (
									<button
										type="button"
										className="font-medium underline disabled:no-underline disabled:opacity-60"
										disabled={
											resendState === "sending" || resendState === "sent"
										}
										onClick={() => resendVerification(unverifiedEmail)}
									>
										{resendState === "sent"
											? t("auth.verificationResent")
											: t("auth.resendVerification")}
									</button>
								) : null}
							</div>
						) : null}

						<Button type="submit" disabled={pending} className="w-full">
							{pending
								? t("common.processing")
								: mode === "signup"
									? t("common.signUp")
									: t("common.signIn")}
						</Button>
					</form>

					{socialProviders.length > 0 ? (
						<div className="space-y-3">
							<div className="flex items-center gap-3 text-xs text-(--ink-1)">
								<span className="h-px flex-1 bg-(--line)" />
								{t("auth.or")}
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
										{t("auth.continueWith", {
											provider: SOCIAL_LABELS[provider],
										})}
									</Button>
								))}
							</div>
						</div>
					) : null}

					<div className="rounded-3xl border border-(--line) bg-white/75 p-4 text-sm leading-6 text-(--ink-1)">
						{mode === "signup" ? t("auth.haveAccount") : t("auth.newHere")}{" "}
						<Link
							href={mode === "signup" ? "/login" : "/signup"}
							className="font-medium text-(--accent-strong)"
						>
							{mode === "signup" ? t("common.signIn") : t("common.signUp")}
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
