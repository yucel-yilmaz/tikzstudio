"use client";

import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	SaveAsTemplateForm,
	type SaveAsTemplatePayload,
} from "@/features/editor/components/panels/save-as-template-form";
import { ExportProjectButton } from "@/features/projects/components/export-project-button";
import type { ProjectDetail } from "@/lib/types";

type ProjectSettingsPanelProps = {
	project: ProjectDetail | undefined;
	onSubmit(payload: {
		title: string;
		description: string;
		isPublic: boolean;
	}): Promise<void>;
	onSaveAsTemplate(payload: SaveAsTemplatePayload): Promise<void>;
};

export function ProjectSettingsPanel({
	project,
	onSubmit,
	onSaveAsTemplate,
}: ProjectSettingsPanelProps) {
	return (
		<ScrollArea className="h-full px-4 py-4">
			<form
				key={project?.id ?? "project-settings-panel"}
				action={async (formData) => {
					await onSubmit({
						title: String(formData.get("title") ?? ""),
						description: String(formData.get("description") ?? ""),
						isPublic: formData.get("isPublic") === "on",
					});
				}}
				className="space-y-4"
			>
				<div className="space-y-2">
					<label htmlFor="project-panel-title" className="text-sm font-medium">
						Proje adı
					</label>
					<Input
						id="project-panel-title"
						name="title"
						defaultValue={project?.title ?? ""}
					/>
				</div>
				<div className="space-y-2">
					<label
						htmlFor="project-panel-description"
						className="text-sm font-medium"
					>
						Açıklama
					</label>
					<Textarea
						id="project-panel-description"
						name="description"
						rows={5}
						defaultValue={project?.description ?? ""}
					/>
				</div>
				<div className="flex items-start justify-between gap-4 rounded-lg border p-3">
					<div className="space-y-1">
						<div className="inline-flex items-center gap-2 text-sm font-medium">
							<Settings2 className="size-4" />
							Herkese açık
						</div>
						<p className="text-xs text-muted-foreground">
							Açarsanız paylaşım bağlantısına sahip herkes projeyi
							görüntüleyebilir.
						</p>
					</div>
					<Switch name="isPublic" defaultChecked={project?.isPublic} />
				</div>
				<Button type="submit" size="sm" className="w-full">
					<Settings2 />
					Ayarları kaydet
				</Button>
			</form>
			{project ? (
				<div className="mt-4">
					<ExportProjectButton projectId={project.id} />
				</div>
			) : null}
			<div className="mt-4">
				<SaveAsTemplateForm
					key={`template-${project?.id ?? "none"}`}
					defaultTitle={project?.title ?? ""}
					defaultDescription={project?.description}
					onSave={onSaveAsTemplate}
				/>
			</div>
		</ScrollArea>
	);
}
