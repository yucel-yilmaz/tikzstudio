import {
	ArrowRight,
	Layers3,
	ShieldCheck,
	Sparkles,
	Workflow,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-375 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
			<Card className="relative overflow-hidden border-white/60 bg-[linear-gradient(145deg,rgba(255,250,242,0.97),rgba(242,236,223,0.95))]">
				<div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-[rgba(200,85,61,0.16)] blur-3xl" />
				<div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[rgba(155,52,31,0.10)] blur-3xl" />
				<CardContent className="relative grid gap-8 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
					<div className="space-y-6">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline" className="normal-case tracking-normal">
								TikZLab
							</Badge>
							<Badge variant="default" className="normal-case tracking-normal">
								Next.js tabanlı TikZ çalışma alanı
							</Badge>
						</div>

						<div className="space-y-4">
							<h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
								TikZ diyagramlarını modern bir editör, güvenli derleme ve canlı
								PDF akışıyla üret.
							</h1>
							<p className="max-w-2xl text-base leading-7 text-(--ink-1) md:text-lg">
								Araştırma, eğitim ve teknik dokümantasyon ekipleri için
								tasarlanmış profesyonel bir tarayıcı editörü. Kod yaz, derle,
								günlükleri incele ve PDF çıktısını tek yüzeyde yönet.
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Button asChild size="lg">
								<Link href="/signup">
									Hemen başla
									<ArrowRight size={16} />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/login">Giriş yap</Link>
							</Button>
						</div>

						<div className="grid gap-3 pt-2 sm:grid-cols-3">
							{[
								["Şablon desteği", "Hazır başlangıçlarla daha hızlı üretim."],
								["Sandbox derleme", "İzolasyonlu Docker yürütmesi."],
								["PDF + günlük", "Tek bakışta çıktıyı ve hatayı izle."],
							].map(([title, description]) => (
								<div
									key={title}
									className="rounded-3xl border border-(--line) bg-white/65 p-4"
								>
									<p className="font-medium">{title}</p>
									<p className="mt-2 text-sm leading-6 text-(--ink-1)">
										{description}
									</p>
								</div>
							))}
						</div>
					</div>

					<Card className="border-[rgba(255,255,255,0.08)] bg-[#15120f] text-[#f7f2e8] shadow-[0_30px_70px_rgba(20,16,12,0.28)]">
						<CardContent className="space-y-5 p-5">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-sm font-medium">main.tex</p>
									<p className="text-xs uppercase tracking-[0.16em] text-[#c9bca7]">
										Aktif düzenleme
									</p>
								</div>
								<Badge
									variant="outline"
									className="border-[#40352d] bg-[#231d18] text-[#f2e9db]"
								>
									TECTONIC
								</Badge>
							</div>

							<pre className="overflow-auto rounded-[24px] bg-[#0e0c0a] p-4 font-mono text-sm leading-7 text-[#f8edd6]">
								{String.raw`\begin{tikzpicture}
  \node[draw, circle] (a) at (0,0) {A};
  \node[draw, circle] (b) at (2,1) {B};
  \node[draw, circle] (c) at (4,0) {C};
  \draw[->] (a) -- node[above] {$\alpha$} (b);
  \draw[->] (b) -- node[above] {$\beta$} (c);
\end{tikzpicture}`}
							</pre>

							<div className="grid gap-3">
								{[
									["Kod düzenle", "Editör panelinde TikZ kaynağını güncelle."],
									["Derle", "İzolasyonlu işlem içinde PDF üret."],
									["İncele", "Önizleme ve günlük ekranından sonucu doğrula."],
								].map(([title, description]) => (
									<div
										key={title}
										className="rounded-2xl bg-[#211b16] px-4 py-3"
									>
										<p className="font-medium">{title}</p>
										<p className="mt-1 text-sm leading-6 text-[#d7c9b5]">
											{description}
										</p>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</CardContent>
			</Card>

			<section className="grid gap-4 lg:grid-cols-3">
				{[
					{
						icon: Workflow,
						title: "Tek yüzeyli üretim akışı",
						description:
							"Kod, derleme ve PDF çıktısını ayrı araçlara bölmeden tek çalışma alanında yönet.",
					},
					{
						icon: ShieldCheck,
						title: "Güvenli derleme sınırı",
						description:
							"LaTeX yürütmesini ağsız, izole Docker ortamında çalıştırarak risk yüzeyini daralt.",
					},
					{
						icon: Layers3,
						title: "Şablon ve parça kütüphanesi",
						description:
							"Sık kullanılan blokları ve başlangıç belgelerini birkaç tıklamayla ekle.",
					},
				].map(({ icon: Icon, title, description }) => (
					<Card key={title}>
						<CardContent className="space-y-4 p-6">
							<div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(200,85,61,0.12)] text-(--accent-strong)">
								<Icon size={20} />
							</div>
							<div className="space-y-2">
								<h2 className="text-2xl font-semibold">{title}</h2>
								<p className="text-sm leading-7 text-(--ink-1)">
									{description}
								</p>
							</div>
						</CardContent>
					</Card>
				))}
			</section>

			<section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
				<Card>
					<CardContent className="space-y-5 p-6">
						<Badge variant="outline" className="normal-case tracking-normal">
							Kimler için?
						</Badge>
						<div className="space-y-3">
							<h2 className="text-3xl font-semibold">
								Diyagram kalitesini araç karmaşasına kurban etmek istemeyen
								ekipler için.
							</h2>
							<p className="text-sm leading-7 text-(--ink-1)">
								Akademik figürler, teknik şemalar, algoritma akışları ve eğitim
								içerikleri üreten ekipler için net, sade ve üretim odaklı bir
								TikZ yüzeyi.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-[color-mix(in_srgb,var(--surface-2)_72%,white_28%)]">
					<CardContent className="space-y-5 p-6">
						<div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-(--accent-strong)">
							<Sparkles size={20} />
						</div>
						<div className="space-y-3">
							<h2 className="text-2xl font-semibold">
								Hızlı başlangıç, ciddi görünüm
							</h2>
							<p className="text-sm leading-7 text-(--ink-1)">
								İlk çizgiden PDF indirmeye kadar geçen süreyi kısaltırken
								çalışma alanını profesyonel tut.
							</p>
						</div>
						<Button asChild variant="secondary">
							<Link href="/signup">
								Hesap oluştur
								<ArrowRight size={16} />
							</Link>
						</Button>
					</CardContent>
				</Card>
			</section>
		</main>
	);
}
