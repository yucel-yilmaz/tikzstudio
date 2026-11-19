"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notice } from "@/features/auth/components/auth-card";
import { postAuth } from "@/lib/auth-errors";
import { useT } from "@/lib/i18n/client";

export function ResetPasswordForm({ token }: { token: string }) {
	const t = useT();
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [state, setState] = useState<"idle" | "saving" | "done">("idle");
	const [error, setError] = useState<string | null>(null);

	if (state === "done") {
		return (
			<div className="space-y-4">
				<Notice tone="success">{t("auth.resetDone")}</Notice>
				<Button asChild className="w-full">
					<Link href="/login">{t("auth.signInWithNewPassword")}</Link>
				</Button>
			</div>
		);
	}

	return (
		<form
			className="space-y-4"
			onSubmit={async (event) => {
				event.preventDefault();
				setError(null);
				if (password !== confirm) {
					setError(t("auth.passwordsDoNotMatch"));
					return;
				}
				setState("saving");
				const result = await postAuth(t, "/reset-password", {
					newPassword: password,
					token,
				});
				if (result.ok) {
					setState("done");
				} else {
					setState("idle");
					setError(result.message);
				}
			}}
		>
			<label className="block space-y-2">
				<span className="text-sm font-medium">{t("auth.newPassword")}</span>
				<Input
					type="password"
					required
					minLength={8}
					autoComplete="new-password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					placeholder={t("common.passwordPlaceholder")}
				/>
			</label>
			<label className="block space-y-2">
				<span className="text-sm font-medium">
					{t("auth.newPasswordRepeat")}
				</span>
				<Input
					type="password"
					required
					minLength={8}
					autoComplete="new-password"
					value={confirm}
					onChange={(event) => setConfirm(event.target.value)}
				/>
			</label>
			{error ? <Notice tone="error">{error}</Notice> : null}
			<Button type="submit" className="w-full" disabled={state === "saving"}>
				{state === "saving" ? t("common.saving") : t("auth.updatePassword")}
			</Button>
		</form>
	);
}
