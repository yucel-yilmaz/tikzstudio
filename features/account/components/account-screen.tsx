"use client";

import {
	ArrowLeft,
	BadgeCheck,
	KeyRound,
	LogOut,
	MailWarning,
	ShieldCheck,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
import { Notice } from "@/features/auth/components/auth-card";
import { postAuth } from "@/lib/auth-errors";

type AccountScreenProps = {
	name: string;
	email: string;
	emailVerified: boolean;
	hasPassword: boolean;
};

export function AccountScreen({
	name,
	email,
	emailVerified,
	hasPassword,
}: AccountScreenProps) {
	return (
		<div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
			<div className="flex items-center justify-between gap-3">
				<div>
					<Badge variant="outline" className="normal-case tracking-normal">
						Hesabım
					</Badge>
					<h1 className="mt-2 text-3xl font-semibold tracking-tight">
						Hesap ve güvenlik
					</h1>
				</div>
				<Button asChild variant="outline" size="sm">
					<Link href="/dashboard" className="gap-2">
						<ArrowLeft size={15} />
						Panele dön
					</Link>
				</Button>
			</div>

			<ProfileCard name={name} email={email} emailVerified={emailVerified} />
			{hasPassword ? (
				<ChangePasswordCard />
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<KeyRound className="size-5" />
							Şifre
						</CardTitle>
						<CardDescription>
							Bu hesap GitHub veya Google ile oluşturuldu; şifre yerine o
							hesapla giriş yaparsınız.
						</CardDescription>
					</CardHeader>
				</Card>
			)}
			<SessionsCard />
			<DeleteAccountCard email={email} hasPassword={hasPassword} />
		</div>
	);
}

function ProfileCard({
	name,
	email,
	emailVerified,
}: {
	name: string;
	email: string;
	emailVerified: boolean;
}) {
	const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
	const [error, setError] = useState<string | null>(null);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">{name}</CardTitle>
				<CardDescription className="flex flex-wrap items-center gap-2">
					{email}
					{emailVerified ? (
						<span className="inline-flex items-center gap-1 text-xs text-[rgb(21,94,47)]">
							<BadgeCheck className="size-4" />
							Doğrulandı
						</span>
					) : (
						<span className="inline-flex items-center gap-1 text-xs text-(--danger)">
							<MailWarning className="size-4" />
							Doğrulanmadı
						</span>
					)}
				</CardDescription>
			</CardHeader>
			{emailVerified ? null : (
				<CardContent className="space-y-3">
					<p className="text-sm text-(--ink-1)">
						E-posta adresinizi doğrulamak, şifrenizi unuttuğunuzda hesabınıza
						yeniden ulaşabilmeniz için önemlidir.
					</p>
					{error ? <Notice tone="error">{error}</Notice> : null}
					{state === "sent" ? (
						<Notice tone="success">
							Doğrulama bağlantısı {email} adresine gönderildi.
						</Notice>
					) : (
						<Button
							variant="outline"
							size="sm"
							disabled={state === "sending"}
							onClick={async () => {
								setError(null);
								setState("sending");
								const result = await postAuth("/send-verification-email", {
									email,
									callbackURL: "/email-verified",
								});
								setState(result.ok ? "sent" : "idle");
								if (!result.ok) setError(result.message);
							}}
						>
							Doğrulama bağlantısı gönder
						</Button>
					)}
				</CardContent>
			)}
		</Card>
	);
}

function ChangePasswordCard() {
	const [current, setCurrent] = useState("");
	const [next, setNext] = useState("");
	const [confirm, setConfirm] = useState("");
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{
		tone: "success" | "error";
		text: string;
	} | null>(null);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<KeyRound className="size-5" />
					Şifre değiştir
				</CardTitle>
				<CardDescription>
					Şifreniz değiştiğinde diğer cihazlardaki oturumlarınız kapatılır.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className="space-y-4"
					onSubmit={async (event) => {
						event.preventDefault();
						setMessage(null);
						if (next !== confirm) {
							setMessage({ tone: "error", text: "Yeni şifreler eşleşmiyor." });
							return;
						}
						setSaving(true);
						const result = await postAuth("/change-password", {
							currentPassword: current,
							newPassword: next,
							revokeOtherSessions: true,
						});
						setSaving(false);
						if (result.ok) {
							setCurrent("");
							setNext("");
							setConfirm("");
							setMessage({
								tone: "success",
								text: "Şifreniz güncellendi; diğer oturumlarınız kapatıldı.",
							});
						} else {
							setMessage({ tone: "error", text: result.message });
						}
					}}
				>
					<label className="block space-y-2">
						<span className="text-sm font-medium">Mevcut şifre</span>
						<Input
							type="password"
							required
							autoComplete="current-password"
							value={current}
							onChange={(event) => setCurrent(event.target.value)}
						/>
					</label>
					<div className="grid gap-4 sm:grid-cols-2">
						<label className="block space-y-2">
							<span className="text-sm font-medium">Yeni şifre</span>
							<Input
								type="password"
								required
								minLength={8}
								autoComplete="new-password"
								value={next}
								onChange={(event) => setNext(event.target.value)}
								placeholder="En az 8 karakter"
							/>
						</label>
						<label className="block space-y-2">
							<span className="text-sm font-medium">Yeni şifre (tekrar)</span>
							<Input
								type="password"
								required
								minLength={8}
								autoComplete="new-password"
								value={confirm}
								onChange={(event) => setConfirm(event.target.value)}
							/>
						</label>
					</div>
					{message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
					<Button type="submit" disabled={saving}>
						{saving ? "Kaydediliyor…" : "Şifreyi güncelle"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

function SessionsCard() {
	const [state, setState] = useState<"idle" | "working" | "done">("idle");
	const [error, setError] = useState<string | null>(null);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<ShieldCheck className="size-5" />
					Oturumlar
				</CardTitle>
				<CardDescription>
					Ortak bir bilgisayarda (ör. okul laboratuvarı) çıkış yapmayı
					unuttuysanız diğer tüm oturumlarınızı buradan kapatabilirsiniz.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{error ? <Notice tone="error">{error}</Notice> : null}
				{state === "done" ? (
					<Notice tone="success">
						Bu cihaz dışındaki tüm oturumlarınız kapatıldı.
					</Notice>
				) : (
					<Button
						variant="outline"
						disabled={state === "working"}
						onClick={async () => {
							setError(null);
							setState("working");
							const result = await postAuth("/revoke-other-sessions", {});
							setState(result.ok ? "done" : "idle");
							if (!result.ok) setError(result.message);
						}}
					>
						<LogOut />
						Diğer oturumlarımı kapat
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

function DeleteAccountCard({
	email,
	hasPassword,
}: {
	email: string;
	hasPassword: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmEmail, setConfirmEmail] = useState("");
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const confirmed =
		confirmEmail.trim().toLowerCase() === email.toLowerCase() &&
		(!hasPassword || password.length > 0);

	return (
		<Card className="border-[rgba(180,35,24,0.25)]">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg text-(--danger)">
					<Trash2 className="size-5" />
					Hesabımı sil
				</CardTitle>
				<CardDescription>
					Hesabınız ve bütün projeleriniz, dosyalarınız, derleme çıktılarınız ve
					kişisel şablonlarınız kalıcı olarak silinir. Bu işlem geri alınamaz;
					önce saklamak istediğiniz projeleri .zip olarak indirin.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{open ? (
					<form
						className="space-y-4"
						onSubmit={async (event) => {
							event.preventDefault();
							if (!confirmed) return;
							setError(null);
							setDeleting(true);
							const result = await postAuth(
								"/delete-user",
								hasPassword ? { password } : {},
							);
							if (result.ok) {
								window.location.assign("/");
								return;
							}
							setDeleting(false);
							setError(result.message);
						}}
					>
						<label className="block space-y-2">
							<span className="text-sm font-medium">
								Onaylamak için e-posta adresinizi yazın
							</span>
							<Input
								value={confirmEmail}
								onChange={(event) => setConfirmEmail(event.target.value)}
								placeholder={email}
								autoComplete="off"
							/>
						</label>
						{hasPassword ? (
							<label className="block space-y-2">
								<span className="text-sm font-medium">Şifreniz</span>
								<Input
									type="password"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									autoComplete="current-password"
								/>
							</label>
						) : (
							<p className="text-xs text-(--ink-1)">
								GitHub/Google ile giriş yaptığınız için şifre istenmez; son
								girişiniz bir günden eskiyse önce çıkış yapıp yeniden giriş
								yapmanız gerekir.
							</p>
						)}
						{error ? <Notice tone="error">{error}</Notice> : null}
						<div className="flex flex-wrap gap-2">
							<Button
								type="submit"
								variant="destructive"
								disabled={!confirmed || deleting}
							>
								{deleting ? "Siliniyor…" : "Hesabımı kalıcı olarak sil"}
							</Button>
							<Button
								type="button"
								variant="outline"
								disabled={deleting}
								onClick={() => {
									setOpen(false);
									setPassword("");
									setConfirmEmail("");
									setError(null);
								}}
							>
								Vazgeç
							</Button>
						</div>
					</form>
				) : (
					<Button variant="outline" onClick={() => setOpen(true)}>
						<Trash2 />
						Hesabımı silmek istiyorum
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
