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
		const frame = previewFrameRef.current;
		if (!frame) {
			return;
		}

		const updateWidth = () => setPreviewWidth(frame.clientWidth);
		updateWidth();

		const observer = new ResizeObserver(updateWidth);
		observer.observe(frame);

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		let active = true;
		let renderTask: { cancel(): void } | null = null;

		async function renderPreview() {
			console.group("[PdfPreview] renderPreview start");
			console.log("input:", { src, previewWidth, zoom });

			const canvas = canvasRef.current;
			if (!src || !canvas || !previewWidth) {
				console.warn("early return", {
					hasSrc: Boolean(src),
					hasCanvas: Boolean(canvas),
					previewWidth,
				});
				console.groupEnd();
				return;
			}

			setLoading(true);
			setError(null);

			try {
				console.log("step 1: importing pdfjs-dist...");
				const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
				console.log("step 1 ✓ pdfjs version:", pdfjs.version);

				if (!pdfjs.GlobalWorkerOptions.workerSrc) {
					pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
					console.log(
						"step 2 ✓ workerSrc set:",
						pdfjs.GlobalWorkerOptions.workerSrc,
					);
				} else {
					console.log(
						"step 2 - workerSrc already set:",
						pdfjs.GlobalWorkerOptions.workerSrc,
					);
				}

				const pdfUrl = `${src}?ts=${Date.now()}`;
				console.log("step 3: fetching PDF from:", pdfUrl);
				const pdfDocument = await pdfjs.getDocument({
					url: pdfUrl,
					withCredentials: true,
				}).promise;
				console.log("step 3 ✓ PDF loaded, pages:", pdfDocument.numPages);

				if (!active) {
					console.warn("aborted after PDF load");
					console.groupEnd();
					return;
				}

				console.log("step 4: getting page 1...");
				const page = await pdfDocument.getPage(1);
				const baseViewport = page.getViewport({ scale: 1 });
				console.log("step 4 ✓ baseViewport:", {
					width: baseViewport.width,
					height: baseViewport.height,
				});

				const dpr = window.devicePixelRatio || 1;
				const availableWidth = Math.max(80, previewWidth - 32);
				const fitScale = availableWidth / baseViewport.width;
				const cssScale = fitScale * zoom;
				const viewport = page.getViewport({ scale: cssScale * dpr });
				console.log("step 5: viewport math:", {
					dpr,
					previewWidth,
					availableWidth,
					fitScale,
					cssScale,
					renderViewport: { width: viewport.width, height: viewport.height },
				});

				if (!active) {
					console.warn("aborted before canvas setup");
					console.groupEnd();
					return;
				}

				const cssWidth = baseViewport.width * cssScale;
				const cssHeight = baseViewport.height * cssScale;

				canvas.width = viewport.width;
				canvas.height = viewport.height;
				canvas.style.width = `${cssWidth}px`;
				canvas.style.height = `${cssHeight}px`;
				console.log("step 6 ✓ canvas configured:", {
					internal: { width: canvas.width, height: canvas.height },
					css: { width: canvas.style.width, height: canvas.style.height },
					connected: canvas.isConnected,
					rect: canvas.getBoundingClientRect(),
				});

				console.log("step 7: starting render task...");
				const task = page.render({ canvas, viewport });
				renderTask = task;
				await task.promise;
				console.log("step 7 ✓ render complete");

				const ctx = canvas.getContext("2d");
				if (ctx) {
					const sample = ctx.getImageData(
						Math.floor(canvas.width / 2),
						Math.floor(canvas.height / 2),
						1,
						1,
					);
					console.log("step 8: center pixel sample:", Array.from(sample.data));
				}

				console.groupEnd();
			} catch (renderError) {
				if (
					renderError instanceof Error &&
					renderError.name === "RenderingCancelledException"
				) {
					console.warn("[PdfPreview] render cancelled");
					console.groupEnd();
					return;
				}
				console.error("[PdfPreview] render failed:", renderError);
				console.groupEnd();
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
