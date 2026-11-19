"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

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
import { createSnippet, deleteSnippet } from "@/lib/client-api";
import { useT } from "@/lib/i18n/client";
import type { CreateSnippetInput, SnippetDto } from "@/lib/types";

type SnippetsPanelProps = {
	snippets: SnippetDto[];
	onInsert(content: string): void;
};

export function SnippetsPanel({ snippets, onInsert }: SnippetsPanelProps) {
	const t = useT();
	const queryClient = useQueryClient();
	const [isCreating, setIsCreating] = useState(false);
	const [form, setForm] = useState<CreateSnippetInput>({
		title: "",
		trigger: "",
		category: "",
		content: "",
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateSnippetInput) => createSnippet(data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["snippets"] });
			setIsCreating(false);
			setForm({ title: "", trigger: "", category: "", content: "" });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteSnippet(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["snippets"] });
		},
	});

	return (
		<>
			<div className="flex items-center justify-between px-4 pb-2 pt-3">
				<span className="text-xs text-muted-foreground">
					{t("snippets.count", { count: snippets.length })}
				</span>
				<Button
					size="sm"
					variant="ghost"
					className="h-7 gap-1 px-2 text-xs"
					onClick={() => setIsCreating((v) => !v)}
				>
					<Plus className="size-3" />
					{t("common.new")}
				</Button>
			</div>

			<Dialog
				open={isCreating}
				onOpenChange={(open) => {
					setIsCreating(open);
					if (!open)
						setForm({ title: "", trigger: "", category: "", content: "" });
				}}
			>
				<DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0 sm:max-w-lg">
					<DialogHeader className="border-b px-4 py-3">
						<DialogTitle className="text-sm font-medium">
							{t("snippets.newSnippet")}
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
								placeholder={t("common.title")}
								value={form.title}
								onChange={(e) =>
									setForm((f) => ({ ...f, title: e.target.value }))
								}
								required
								autoFocus
							/>
							<div className="flex gap-2">
								<Input
									placeholder={t("snippets.triggerPlaceholder")}
									value={form.trigger}
									onChange={(e) =>
										setForm((f) => ({ ...f, trigger: e.target.value }))
									}
									required
								/>
								<Input
									placeholder={t("common.category")}
									value={form.category}
									onChange={(e) =>
										setForm((f) => ({ ...f, category: e.target.value }))
									}
								/>
							</div>
							<Textarea
								placeholder={t("common.content")}
								className="min-h-40 flex-1 font-mono text-xs"
								value={form.content}
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
								{t("common.cancel")}
							</Button>
							<Button type="submit" disabled={createMutation.isPending}>
								{t("common.save")}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			<ScrollArea className="min-h-0 flex-1 px-4 pb-4">
				<div className="space-y-2">
					{snippets.map((snippet) => (
						<div key={snippet.id} className="group relative">
							<button
								type="button"
								onClick={() => onInsert(snippet.content)}
								className="w-full rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-border hover:bg-muted/50"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 space-y-1">
										<div className="text-sm font-medium">{snippet.title}</div>
										<p className="text-xs text-muted-foreground">
											{snippet.category}
										</p>
									</div>
									<Badge variant="outline" className="shrink-0">
										\{snippet.trigger}
									</Badge>
								</div>
							</button>
							{snippet.ownerId !== null && (
								<button
									type="button"
									className="absolute right-2 top-2 hidden rounded p-0.5 text-muted-foreground hover:text-destructive group-hover:flex"
									onClick={() => deleteMutation.mutate(snippet.id)}
									aria-label={t("common.delete")}
								>
									<Trash2 className="size-3" />
								</button>
							)}
						</div>
					))}
				</div>
			</ScrollArea>
		</>
	);
}
