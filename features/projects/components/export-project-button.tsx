"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { projectExportUrl } from "@/lib/client-api";
import { useT } from "@/lib/i18n/client";

/** Downloads every project file as a .zip (works with Overleaf and local TeX). */
export function ExportProjectButton({ projectId }: { projectId: string }) {
	const t = useT();

	return (
		<div className="space-y-2 rounded-lg border p-3">
			<p className="text-sm font-medium">{t("projects.exportTitle")}</p>
			<p className="text-xs text-muted-foreground">
				{t("projects.exportHint")}
			</p>
			<Button asChild variant="outline" size="sm" className="w-full">
				<a href={projectExportUrl(projectId)} download>
					<Download />
					{t("projects.exportButton")}
				</a>
			</Button>
		</div>
	);
}
