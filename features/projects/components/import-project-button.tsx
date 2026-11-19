"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FileArchive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { importProject } from "@/lib/client-api";

/**
 * Creates a project from a .zip (e.g. Overleaf "Download as source") and
 * opens it in the editor. Renamed or skipped files are reported in a toast.
 */
export function ImportProjectButton() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [importing, setImporting] = useState(false);

	async function handleFile(file: File) {
		setImporting(true);
		try {
			const { project, warnings } = await importProject(file);
			await queryClient.invalidateQueries({ queryKey: ["projects"] });
			toast.success(`"${project.title}" içe aktarıldı`, {
				description: warnings.length
					? `${warnings.length} uyarı: ${warnings.slice(0, 3).join(" ")}${warnings.length > 3 ? " …" : ""}`
					: `${project.files.length} dosya yüklendi.`,
				duration: warnings.length ? 12000 : 4000,
			});
			router.push(`/projects/${project.id}/editor`);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "ZIP içe aktarılamadı.",
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
				title="Overleaf'ten veya bilgisayarınızdan bir .zip projesini içe aktarın"
			>
				<FileArchive size={16} />
				{importing ? "İçe aktarılıyor…" : "İçe aktar (.zip)"}
			</Button>
		</>
	);
}
