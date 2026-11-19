"use client";

import { useMutation } from "@tanstack/react-query";
import { ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { img2latex } from "@/lib/client-api";
import { cn } from "@/lib/utils";

type Img2LatexProvider = "docker" | "pix2tex" | "mathpix";

type Img2LatexDialogProps = {
	open: boolean;
	onOpenChange(open: boolean): void;
	onInsert(latex: string): void;
};

export function Img2LatexDialog({
	open,
	onOpenChange,
	onInsert,
}: Img2LatexDialogProps) {
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [result, setResult] = useState<string>("");
	const [provider, setProvider] = useState<Img2LatexProvider>("docker");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (open) {
			setFile(null);
			setPreview(null);
			setResult("");
		}
	}, [open]);

	const mutation = useMutation({
		mutationFn: (f: File) => img2latex(f, provider),
		onSuccess: (data) => setResult(data.latex),
	});

	function handleFile(f: File) {
		setFile(f);
		setResult("");
		setPreview(URL.createObjectURL(f));
	}

	function handleInsert() {
		if (result) onInsert(result);
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Görselden LaTeX'e</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<span className="shrink-0 text-sm font-medium">Sağlayıcı</span>
						<Select
							value={provider}
							onValueChange={(v) => setProvider(v as Img2LatexProvider)}
						>
							<SelectTrigger className="h-8 text-sm">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="docker">
									Docker Model Runner (yerel)
								</SelectItem>
								<SelectItem value="pix2tex">pix2tex (yerel)</SelectItem>
								<SelectItem value="mathpix">Mathpix (ücretli)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<label
						className={cn(
							"flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:bg-muted/40",
							preview ? "border-border" : "border-muted-foreground/30",
						)}
						onDragOver={(e) => e.preventDefault()}
						onDrop={(e) => {
							e.preventDefault();
							const f = e.dataTransfer.files[0];
							if (f) handleFile(f);
						}}
					>
						{preview ? (
							// biome-ignore lint/performance/noImgElement: blob URL from createObjectURL, Next.js Image does not support blob: protocol
							<img
								src={preview}
								alt="Önizleme"
								className="max-h-48 max-w-full rounded object-contain"
							/>
						) : (
							<>
								<ScanLine className="size-8 text-muted-foreground" />
								<p className="text-sm text-muted-foreground">
									Görseli buraya bırakın ya da seçmek için tıklayın (PNG, JPEG,
									WebP — en fazla 4 MB)
								</p>
							</>
						)}
						<input
							ref={inputRef}
							type="file"
							accept="image/png,image/jpeg,image/webp"
							className="hidden"
							onChange={(e) => {
								const f = e.target.files?.[0];
								if (f) handleFile(f);
							}}
						/>
					</label>

					<Button
						type="button"
						disabled={!file || mutation.isPending}
						onClick={() => file && mutation.mutate(file)}
					>
						{mutation.isPending ? "Dönüştürülüyor…" : "LaTeX'e dönüştür"}
					</Button>

					{mutation.error ? (
						<p className="text-sm text-destructive">
							{mutation.error instanceof Error
								? mutation.error.message
								: "Dönüştürme başarısız oldu."}
						</p>
					) : null}

					{result ? (
						<div className="flex flex-col gap-2">
							<p className="text-xs font-medium text-muted-foreground">Sonuç</p>
							<Textarea
								value={result}
								onChange={(e) => setResult(e.target.value)}
								className="font-mono text-xs"
								rows={5}
							/>
							<Button type="button" onClick={handleInsert}>
								Editöre ekle
							</Button>
						</div>
					) : null}
				</div>
			</DialogContent>
		</Dialog>
	);
}
