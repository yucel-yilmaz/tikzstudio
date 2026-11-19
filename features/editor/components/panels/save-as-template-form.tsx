"use client";

import { BookmarkPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
	const [title, setTitle] = useState(defaultTitle);
	const [category, setCategory] = useState("Kişisel");
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
					Şablon olarak kaydet
				</div>
				<p className="text-xs text-muted-foreground">
					Projedeki tüm dosyalar (şekiller, görseller, stil dosyaları) yeni
					projelerde kullanabileceğiniz kişisel bir şablona kopyalanır.
					Kaydedilmemiş değişiklikler önce kaydedilir.
				</p>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="save-template-title" className="text-xs font-medium">
					Şablon adı
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
					Kategori
				</label>
				<Input
					id="save-template-category"
					value={category}
					onChange={(event) => setCategory(event.target.value)}
					placeholder="ör. Ödev, Makale şekilleri"
					maxLength={60}
				/>
			</div>
			<div className="space-y-1.5">
				<label
					htmlFor="save-template-description"
					className="text-xs font-medium"
				>
					Açıklama
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
				{saving ? "Kaydediliyor…" : "Şablon olarak kaydet"}
			</Button>
		</form>
	);
}
