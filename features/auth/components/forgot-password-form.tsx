"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notice } from "@/features/auth/components/auth-card";
import { postAuth } from "@/lib/auth-errors";
import { useI18n } from "@/lib/i18n/client";

export function ForgotPasswordForm() {
	const { t, rich } = useI18n();
	const [email, setEmail] = useState("");
	const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
	const [error, setError] = useState<string | null>(null);

	if (state === "sent") {
		// Same message whether or not the address has an account, so the form
		// cannot be used to discover registered emails.
		return (
			<Notice tone="success">
				{rich("auth.forgotSent", {
					email,
					b: (chunks) => <strong>{chunks}</strong>,
				})}
			</Notice>
		);
	}

	return (
		<form
			className="space-y-4"
			onSubmit={async (event) => {
				event.preventDefault();
				setError(null);
				setState("sending");
				const result = await postAuth(t, "/request-password-reset", {
					email,
					redirectTo: "/reset-password",
				});
				if (result.ok) {
					setState("sent");
				} else {
					setState("idle");
					setError(result.message);
				}
			}}
		>
			<label className="block space-y-2">
				<span className="text-sm font-medium">{t("common.email")}</span>
				<Input
					type="email"
					name="email"
					required
					autoComplete="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					placeholder={t("common.emailPlaceholder")}
				/>
			</label>
			{error ? <Notice tone="error">{error}</Notice> : null}
			<Button type="submit" className="w-full" disabled={state === "sending"}>
				{state === "sending" ? t("common.sending") : t("auth.sendResetLink")}
			</Button>
		</form>
	);
}
