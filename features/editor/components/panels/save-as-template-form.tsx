"use client";

import { BookmarkPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/lib/i18n/client";

export type SaveAsTemplatePayload = {
	title: string;
	description: string;
	category: string;
};

type SaveAsTemplateFormProps = {
	defaultTitle: string;
	defaultDescription?: string | null;
	onSave(payload: SaveAsTemplatePayload): Promise<void>;
};

/**
 * Saves the whole project (every file, including images and .sty files) as
 * a personal template. Lives in the project settings panel.
 */
export function SaveAsTemplateForm({
	defaultTitle,
	defaultDescription,
	onSave,
}: SaveAsTemplateFormProps) {
	const t = useT();
	const [title, setTitle] = useState(defaultTitle);
	const [category, setCategory] = useState(() => t("common.personalCategory"));
	const [description, setDescription] = useState(defaultDescription ?? "");
	const [saving, setSaving] = useState(false);

	return (
		<form
			onSubmit={async (event) => {
				event.preventDefault();
				setSaving(true);
				try {
					await onSave({ title, description, category });
				} finally {
					setSaving(false);
				}
			}}
			className="space-y-3 rounded-lg border p-3"
		>
			<div className="space-y-1">
				<div className="inline-flex items-center gap-2 text-sm font-medium">
					<BookmarkPlus className="size-4" />
					{t("templates.saveAsTemplate")}
				</div>
				<p className="text-xs text-muted-foreground">
					{t("templates.saveAsTemplateHint")}
				</p>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="save-template-title" className="text-xs font-medium">
					{t("templates.templateName")}
				</label>
				<Input
					id="save-template-title"
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					required
					maxLength={120}
				/>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="save-template-category" className="text-xs font-medium">
					{t("common.category")}
				</label>
				<Input
					id="save-template-category"
					value={category}
					onChange={(event) => setCategory(event.target.value)}
					placeholder={t("templates.categoryPlaceholder")}
					maxLength={60}
				/>
			</div>
			<div className="space-y-1.5">
				<label
					htmlFor="save-template-description"
					className="text-xs font-medium"
				>
					{t("common.description")}
				</label>
				<Textarea
					id="save-template-description"
					value={description}
					onChange={(event) => setDescription(event.target.value)}
					rows={3}
					maxLength={500}
				/>
			</div>
			<Button
				type="submit"
				size="sm"
				variant="outline"
				className="w-full"
				disabled={saving || !title.trim()}
			>
				<BookmarkPlus />
				{saving ? t("common.saving") : t("templates.saveAsTemplate")}
			</Button>
		</form>
	);
}
