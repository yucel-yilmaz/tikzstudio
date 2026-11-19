"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FileArchive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { importProject } from "@/lib/client-api";
import { useT } from "@/lib/i18n/client";

/**
 * Creates a project from a .zip (e.g. Overleaf "Download as source") and
 * opens it in the editor. Renamed or skipped files are reported in a toast.
 */
export function ImportProjectButton() {
	const t = useT();
	const router = useRouter();
	const queryClient = useQueryClient();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [importing, setImporting] = useState(false);

	async function handleFile(file: File) {
		setImporting(true);
		try {
			const { project, warnings } = await importProject(file);
			await queryClient.invalidateQueries({ queryKey: ["projects"] });
			toast.success(t("projects.imported", { title: project.title }), {
				description: warnings.length
					? t("projects.importWarnings", {
							count: warnings.length,
							list: `${warnings.slice(0, 3).join(" ")}${warnings.length > 3 ? " …" : ""}`,
						})
					: t("projects.importedFiles", { count: project.files.length }),
				duration: warnings.length ? 12000 : 4000,
			});
			router.push(`/projects/${project.id}/editor`);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : t("projects.importFailed"),
			);
		} finally {
			setImporting(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	}

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				accept=".zip,application/zip"
				className="hidden"
				data-testid="import-zip-input"
				onChange={(event) => {
					const file = event.target.files?.[0];
					if (file) void handleFile(file);
				}}
			/>
			<Button
				type="button"
				variant="outline"
				disabled={importing}
				onClick={() => inputRef.current?.click()}
				title={t("projects.importHint")}
			>
				<FileArchive size={16} />
				{importing ? t("projects.importing") : t("projects.importButton")}
			</Button>
		</>
	);
}
