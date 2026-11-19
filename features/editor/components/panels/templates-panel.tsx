"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { TemplateThumbnail } from "@/features/templates/components/template-thumbnail";
import { createTemplate, deleteTemplate, getTemplates } from "@/lib/client-api";
import type { CreateTemplateInput } from "@/lib/types";
import { cn } from "@/lib/utils";

type TemplatesPanelProps = {
	onInsert(content: string): void;
};

export function TemplatesPanel({ onInsert }: TemplatesPanelProps) {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [form, setForm] = useState<CreateTemplateInput>({
		title: "",
		category: "",
		content: "",
	});

	const templatesQuery = useQuery({
		queryKey: ["templates"],
		queryFn: () => getTemplates(),
	});

	const templates = templatesQuery.data?.templates ?? [];

	const createMutation = useMutation({
		mutationFn: (data: CreateTemplateInput) => createTemplate(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["templates"] });
			setIsCreating(false);
			setForm({ title: "", category: "", content: "" });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteTemplate(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["templates"] });
		},
	});

	const categories = useMemo(() => {
		const set = new Set<string>();
		for (const t of templates) {
			if (t.category) set.add(t.category);
		}
		return Array.from(set).sort();
	}, [templates]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return templates.filter((t) => {
			if (category && t.category !== category) return false;
			if (!q) return true;
			return (
				t.title.toLowerCase().includes(q) ||
				(t.description?.toLowerCase().includes(q) ?? false) ||
				t.category.toLowerCase().includes(q)
			);
		});
	}, [templates, search, category]);

	return (
		<>
			<div className="shrink-0 space-y-2 border-b border-sidebar-border px-4 py-3">
				<div className="flex gap-2">
					<div className="relative flex-1">
						<Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Şablonlarda ara…"
							className="h-8 pl-8 text-sm"
						/>
					</div>
					<Button
						size="sm"
						variant="ghost"
						className="h-8 shrink-0 gap-1 px-2 text-xs"
						onClick={() => setIsCreating((v) => !v)}
					>
						<Plus className="size-3" />
						Yeni
					</Button>
				</div>
				{categories.length > 0 ? (
					<div className="flex flex-wrap gap-1">
						<button
							type="button"
							onClick={() => setCategory(null)}
							className={cn(
								"rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
								category === null
									? "border-primary/30 bg-primary/10 text-primary"
									: "border-border text-muted-foreground hover:bg-muted",
							)}
						>
							Tümü
						</button>
						{categories.map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => setCategory(cat)}
								className={cn(
									"rounded-full border px-2.5 py-0.5 text-[11px] transition-colors",
									category === cat
										? "border-primary/30 bg-primary/10 text-primary"
										: "border-border text-muted-foreground hover:bg-muted",
								)}
							>
								{cat}
							</button>
						))}
					</div>
				) : null}
			</div>

			<Dialog
				open={isCreating}
				onOpenChange={(open) => {
					setIsCreating(open);
					if (!open) setForm({ title: "", category: "", content: "" });
				}}
			>
				<DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0 sm:max-w-lg">
					<DialogHeader className="border-b px-4 py-3">
						<DialogTitle className="text-sm font-medium">
							Yeni şablon
						</DialogTitle>
					</DialogHeader>
					<form
						className="flex min-h-0 flex-1 flex-col"
						onSubmit={(e) => {
							e.preventDefault();
							createMutation.mutate(form);
						}}
					>
						<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
							<Input
								placeholder="Başlık"
								value={form.title}
								onChange={(e) =>
									setForm((f) => ({ ...f, title: e.target.value }))
								}
								required
								autoFocus
							/>
							<Input
								placeholder="Kategori"
								value={form.category}
								onChange={(e) =>
									setForm((f) => ({ ...f, category: e.target.value }))
								}
							/>
							<Textarea
								placeholder="İçerik"
								className="min-h-60 flex-1 font-mono text-xs"
								value={form.content ?? ""}
								onChange={(e) =>
									setForm((f) => ({ ...f, content: e.target.value }))
								}
								required
							/>
						</div>
						<div className="flex justify-end gap-2 border-t px-4 py-3">
							<Button
								type="button"
								variant="ghost"
								onClick={() => setIsCreating(false)}
							>
								İptal
							</Button>
							<Button type="submit" disabled={createMutation.isPending}>
								Kaydet
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			<ScrollArea className="min-h-0 flex-1">
				<div className="grid grid-cols-1 gap-2 px-4 py-4 xl:grid-cols-2">
					{filtered.length === 0 ? (
						<p className="col-span-full text-center text-xs text-muted-foreground">
							Eşleşen şablon bulunamadı.
						</p>
					) : null}
					{filtered.map((template) => {
						const mainContent =
							template.files?.find((f) => f.isMain)?.content ??
							template.content ??
							"";
						const preview = mainContent.split(/\r?\n/).slice(0, 5).join("\n");
						return (
							<div key={template.id} className="group relative">
								<button
									type="button"
									onClick={() => onInsert(mainContent)}
									className="flex w-full flex-col gap-2 rounded-lg border border-transparent bg-background/50 p-3 text-left transition-colors hover:border-border hover:bg-muted/40"
								>
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0 space-y-0.5">
											<div className="truncate text-sm font-medium">
												{template.title}
											</div>
											{template.description ? (
												<p className="line-clamp-1 text-[11px] text-muted-foreground">
													{template.description}
												</p>
											) : null}
										</div>
										<Badge variant="outline" className="shrink-0 text-[10px]">
											{template.category}
										</Badge>
									</div>
									{template.previewUrl ? (
										<TemplateThumbnail
											src={template.previewUrl}
											title={template.title}
											className="rounded-md"
										/>
									) : (
										<pre className="overflow-hidden rounded-md bg-muted/60 px-2 py-1.5 font-mono text-[10px] leading-4 text-muted-foreground group-hover:text-foreground">
											{preview}
										</pre>
									)}
								</button>
								{template.ownerId !== null && (
									<button
										type="button"
										className="absolute right-2 top-2 hidden rounded p-0.5 text-muted-foreground hover:text-destructive group-hover:flex"
										onClick={() => deleteMutation.mutate(template.id)}
										aria-label="Sil"
									>
										<Trash2 className="size-3" />
									</button>
								)}
							</div>
						);
					})}
				</div>
			</ScrollArea>
		</>
	);
}
