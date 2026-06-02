"use client";

import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectDetail } from "@/lib/types";

type ProjectSettingsPanelProps = {
	project: ProjectDetail | undefined;
	onSubmit(payload: {
		title: string;
		description: string;
		isPublic: boolean;
	}): Promise<void>;
};

export function ProjectSettingsPanel({
	project,
	onSubmit,
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
						Project name
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
						Description
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
							Public read access
						</div>
						<p className="text-xs text-muted-foreground">
							Mark for sharing. Permission control is on the server.
						</p>
					</div>
					<Switch name="isPublic" defaultChecked={project?.isPublic} />
				</div>
				<Button type="submit" size="sm" className="w-full">
					<Settings2 />
					Save settings
				</Button>
			</form>
		</ScrollArea>
	);
}
