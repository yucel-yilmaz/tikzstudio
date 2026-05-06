"use client";

import { LoaderCircle, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function PdfPreview({
	src,
	zoom,
	onZoomChange,
}: {
	src: string | null;
	zoom: number;
	onZoomChange(nextZoom: number): void;
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const previewFrameRef = useRef<HTMLDivElement | null>(null);
	const [previewWidth, setPreviewWidth] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!src) {
			setPreviewWidth(0);
			return;
		}

		const frame = previewFrameRef.current;
		if (!frame) {
			return;
		}

		const updateWidth = () => setPreviewWidth(frame.clientWidth);
		updateWidth();

		const observer = new ResizeObserver(updateWidth);
		observer.observe(frame);

		return () => observer.disconnect();
	}, [src]);

	useEffect(() => {
		let active = true;
		let renderTask: { cancel(): void } | null = null;

		async function renderPreview() {
			const canvas = canvasRef.current;
			if (!src || !canvas || !previewWidth) {
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
				pdfjs.GlobalWorkerOptions.workerSrc = new URL(
					"pdfjs-dist/legacy/build/pdf.worker.mjs",
					import.meta.url,
				).toString();
				const pdfUrl = `${src}${src.includes("?") ? "&" : "?"}ts=${Date.now()}`;
				const response = await fetch(pdfUrl, {
					cache: "no-store",
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error(
						`PDF yuklenemedi (${response.status} ${response.statusText}).`,
					);
				}

				const pdfDocument = await pdfjs.getDocument({
					data: new Uint8Array(await response.arrayBuffer()),
				}).promise;

				if (!active) {
					return;
				}

				const page = await pdfDocument.getPage(1);
				const baseViewport = page.getViewport({ scale: 1 });
				const dpr = window.devicePixelRatio || 1;
				const availableWidth = Math.max(80, previewWidth - 32);
				const fitScale = availableWidth / baseViewport.width;
				const cssScale = fitScale * zoom;
				const viewport = page.getViewport({ scale: cssScale * dpr });

				if (!active) {
					return;
				}

				const cssWidth = baseViewport.width * cssScale;
				const cssHeight = baseViewport.height * cssScale;

				canvas.width = viewport.width;
				canvas.height = viewport.height;
				canvas.style.width = `${cssWidth}px`;
				canvas.style.height = `${cssHeight}px`;

				const task = page.render({ canvas, viewport });
				renderTask = task;
				await task.promise;
			} catch (renderError) {
				if (
					renderError instanceof Error &&
					renderError.name === "RenderingCancelledException"
				) {
					return;
				}
				setError(
					renderError instanceof Error
						? renderError.message
						: "PDF render failed.",
				);
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		}

		void renderPreview();

		return () => {
			active = false;
			renderTask?.cancel();
		};
	}, [previewWidth, src, zoom]);

	if (!src) {
		return (
			<div className="flex h-full min-h-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 p-4 text-center">
				<div className="max-w-xs space-y-2">
					<p className="text-sm font-medium">Henüz önizleme yok</p>
					<p className="text-sm text-muted-foreground">
						Derleme tamamlandığında PDF burada görüntülenecek.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full min-w-0 flex-col gap-3 overflow-hidden">
			<div className="flex items-center justify-between gap-3">
				<div className="space-y-1">
					<p className="text-sm font-medium">PDF Önizleme</p>
					<p className="text-xs text-muted-foreground">
						Yakınlaştırma {Math.round(zoom * 100)}%
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						onClick={() => onZoomChange(Math.max(0.6, zoom - 0.2))}
					>
						<Minus />
					</Button>
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						onClick={() => onZoomChange(Math.min(2.4, zoom + 0.2))}
					>
						<Plus />
					</Button>
				</div>
			</div>

			<div
				ref={previewFrameRef}
				className="relative min-h-0 flex-1 overflow-hidden rounded-xl border bg-muted/30"
			>
				<div
					className={cn(
						"absolute inset-0 z-10 hidden items-center justify-center gap-2 bg-background/80 backdrop-blur-sm",
						loading && "flex",
					)}
				>
					<LoaderCircle className="animate-spin" size={16} />
					<span className="text-sm text-muted-foreground">
						PDF yükleniyor...
					</span>
				</div>

				{error ? (
					<div className="absolute inset-0 z-20 flex items-center justify-center p-4">
						<p className="text-center text-sm text-destructive">{error}</p>
					</div>
				) : null}

				<ScrollArea className="h-full">
					<div className="flex min-h-full min-w-0 items-start justify-center p-4">
						<canvas
							ref={canvasRef}
							className="block max-w-full rounded-md border bg-white shadow-sm"
						/>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
