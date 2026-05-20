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

type AuthMode = "login" | "signup";

const endpointByMode: Record<AuthMode, string> = {
	login: "/api/auth/sign-in/email",
	signup: "/api/auth/sign-up/email",
};

export function AuthForm({ mode }: { mode: AuthMode }) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(formData: FormData) {
		setError(null);

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
				message?: string;
			} | null;
			setError(body?.message ?? "Authentication failed.");
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
							TikZLab Workspace
						</Badge>
						<div className="space-y-3">
							<h1 className="max-w-lg text-4xl font-semibold tracking-tight lg:text-5xl">
								A workspace designed for serious TikZ work in the browser.
							</h1>
							<p className="max-w-xl text-base leading-7 text-(--ink-1)">
								Code editor, secure compilation, PDF preview and log stream on
								the same surface. A fast production environment without
								unnecessary tool clutter for technical diagrams.
							</p>
						</div>
					</div>

					<div className="grid gap-3">
						{[
							"Save projects and manage every change in one session.",
							"Compile in a sandbox and see output and errors instantly.",
							"Start new documents faster with templates and snippets.",
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
							{mode === "signup" ? "Sign up" : "Sign in"}
						</Badge>
						<Button asChild variant="ghost" size="sm">
							<Link href="/" className="gap-2">
								<ArrowLeft size={15} />
								Home
							</Link>
						</Button>
					</div>
					<div className="space-y-2">
						<CardTitle className="text-3xl">
							{mode === "signup"
								? "Create your TikZLab account"
								: "Back to your workspace"}
						</CardTitle>
						<CardDescription className="text-sm leading-6">
							Sign in to save, compile, and manage your TikZ projects.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-5">
					<form action={handleSubmit} className="space-y-5">
						{mode === "signup" ? (
							<label className="block space-y-2">
								<span className="text-sm font-medium">Full name</span>
								<div className="relative">
									<User2
										className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--ink-1)"
										size={16}
									/>
									<Input
										name="name"
										required
										className="pl-11"
										placeholder="Enter your full name"
									/>
								</div>
							</label>
						) : null}

						<label className="block space-y-2">
							<span className="text-sm font-medium">Email</span>
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
									placeholder="you@example.com"
								/>
							</div>
						</label>

						<label className="block space-y-2">
							<span className="text-sm font-medium">Password</span>
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
									placeholder="At least 8 characters"
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
								? "Processing…"
								: mode === "signup"
									? "Create account"
									: "Sign in"}
						</Button>
					</form>

					<div className="rounded-3xl border border-(--line) bg-white/75 p-4 text-sm leading-6 text-(--ink-1)">
						{mode === "signup" ? "Already have an account?" : "New here?"}{" "}
						<Link
							href={mode === "signup" ? "/login" : "/signup"}
							className="font-medium text-(--accent-strong)"
						>
							{mode === "signup" ? "Sign in" : "Create account"}
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
