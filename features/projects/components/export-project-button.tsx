import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { projectExportUrl } from "@/lib/client-api";

/** Downloads every project file as a .zip (works with Overleaf and local TeX). */
export function ExportProjectButton({ projectId }: { projectId: string }) {
	return (
		<div className="space-y-2 rounded-lg border p-3">
			<p className="text-sm font-medium">Projeyi indir</p>
			<p className="text-xs text-muted-foreground">
				Tüm dosyalar (görseller dahil) tek bir .zip olarak iner; Overleaf'e veya
				bilgisayarınızdaki LaTeX kurulumuna aynen aktarabilirsiniz.
				Kaydedilmemiş değişiklikler dahil edilmez.
			</p>
			<Button asChild variant="outline" size="sm" className="w-full">
				<a href={projectExportUrl(projectId)} download>
					<Download />
					.zip olarak indir
				</a>
			</Button>
		</div>
	);
}
