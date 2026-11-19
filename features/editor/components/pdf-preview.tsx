"use client";

import { LoaderCircle, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/** Pages rendered in the preview; longer documents show a notice instead. */
export const MAX_PREVIEW_PAGES = 30;

// Minimal structural types for the parts of PDF.js used here.
type PdfViewport = { width: number; height: number };
type PdfRenderTask = { promise: Promise<void>; cancel(): void };
type PdfPage = {
	getViewport(options: { scale: number }): PdfViewport;
	render(options: {
		canvas: HTMLCanvasElement;
		viewport: PdfViewport;
	}): PdfRenderTask;
};
type PdfDocument = {
	numPages: number;
	getPage(pageNumber: number): Promise<PdfPage>;
	destroy(): Promise<void>;
};

export function PdfPreview({
	src,
	zoom,
	onZoomChange,
}: {
	src: string | null;
	zoom: number;
	onZoomChange(nextZoom: number): void;
}) {
	const pagesRef = useRef<HTMLDivElement | null>(null);
	const previewFrameRef = useRef<HTMLDivElement | null>(null);
	const [previewWidth, setPreviewWidth] = useState(0);
	const [pdfDocument, setPdfDocument] = useState<PdfDocument | null>(null);
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

	// Download and parse the PDF once per output; zooming and resizing only
	// re-render the already loaded document.
	useEffect(() => {
		let active = true;
		let loaded: PdfDocument | null = null;
		setPdfDocument(null);
		if (!src) return;

		async function load(url: string) {
			setLoading(true);
			setError(null);
			try {
				const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
				pdfjs.GlobalWorkerOptions.workerSrc = new URL(
					"pdfjs-dist/legacy/build/pdf.worker.mjs",
					import.meta.url,
				).toString();
				const pdfUrl = `${url}${url.includes("?") ? "&" : "?"}ts=${Date.now()}`;
				const response = await fetch(pdfUrl, {
					cache: "no-store",
					credentials: "include",
				});
				if (!response.ok) {
					throw new Error(
						`PDF yüklenemedi (${response.status} ${response.statusText}).`,
					);
				}
				const document = (await pdfjs.getDocument({
					data: new Uint8Array(await response.arrayBuffer()),
				}).promise) as unknown as PdfDocument;
				if (!active) {
					void document.destroy();
					return;
				}
				loaded = document;
				setPdfDocument(document);
			} catch (loadError) {
				if (active) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "PDF görüntülenemedi.",
					);
					setLoading(false);
				}
			}
		}

		void load(src);

		return () => {
			active = false;
			if (loaded) void loaded.destroy();
		};
	}, [src]);

	useEffect(() => {
		const container = pagesRef.current;
		if (!pdfDocument || !container || !previewWidth) return;

		let active = true;
		const tasks: PdfRenderTask[] = [];

		async function renderPages(document: PdfDocument, target: HTMLElement) {
			setLoading(true);
			try {
				const pageCount = Math.min(document.numPages, MAX_PREVIEW_PAGES);
				const dpr = window.devicePixelRatio || 1;
				const availableWidth = Math.max(80, previewWidth - 32);
				const canvases: HTMLCanvasElement[] = [];

				for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
					const page = await document.getPage(pageNumber);
					if (!active) return;

					const baseViewport = page.getViewport({ scale: 1 });
					const cssScale = (availableWidth / baseViewport.width) * zoom;
					const viewport = page.getViewport({ scale: cssScale * dpr });

					const canvas = window.document.createElement("canvas");
					canvas.width = viewport.width;
					canvas.height = viewport.height;
					canvas.style.width = `${baseViewport.width * cssScale}px`;
					canvas.style.height = `${baseViewport.height * cssScale}px`;
					canvas.className =
						"block max-w-full rounded-md border bg-white shadow-sm";
					canvas.setAttribute("aria-label", `Sayfa ${pageNumber}`);

					const task = page.render({ canvas, viewport });
					tasks.push(task);
					await task.promise;
					if (!active) return;
					canvases.push(canvas);
				}

				// Swap all pages at once so the preview does not flicker.
				target.replaceChildren(...canvases);
			} catch (renderError) {
				if (
					renderError instanceof Error &&
					renderError.name === "RenderingCancelledException"
				) {
					return;
				}
				if (active) {
					setError(
						renderError instanceof Error
							? renderError.message
							: "PDF görüntülenemedi.",
					);
				}
			} finally {
				if (active) setLoading(false);
			}
		}

		void renderPages(pdfDocument, container);

		return () => {
			active = false;
			for (const task of tasks) task.cancel();
		};
	}, [pdfDocument, previewWidth, zoom]);

	if (!src) {
		return (
			<div className="flex h-full min-h-0 items-center justify-center rounded-xl border border-dashed bg-muted/30 p-4 text-center">
				<div className="max-w-xs space-y-2">
					<p className="text-sm font-medium">Henüz önizleme yok</p>
					<p className="text-sm text-muted-foreground">
						Derleme tamamlandığında PDF burada görünecek.
					</p>
				</div>
			</div>
		);
	}

	const pageCount = pdfDocument?.numPages ?? 0;

	return (
		<div className="flex h-full min-w-0 flex-col gap-3 overflow-hidden">
			<div className="flex items-center justify-between gap-3">
				<div className="space-y-1">
					<p className="text-sm font-medium">PDF önizleme</p>
					<p className="text-xs text-muted-foreground">
						Yakınlaştırma %{Math.round(zoom * 100)}
						{pageCount > 1 ? ` · ${pageCount} sayfa` : ""}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						onClick={() => onZoomChange(Math.max(0.6, zoom - 0.2))}
						aria-label="Uzaklaştır"
						title="Uzaklaştır"
					>
						<Minus />
					</Button>
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						onClick={() => onZoomChange(Math.min(2.4, zoom + 0.2))}
						aria-label="Yakınlaştır"
						title="Yakınlaştır"
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
					<span className="text-sm text-muted-foreground">PDF yükleniyor…</span>
				</div>

				{error ? (
					<div className="absolute inset-0 z-20 flex items-center justify-center p-4">
						<p className="text-center text-sm text-destructive">{error}</p>
					</div>
				) : null}

				<ScrollArea className="h-full">
					<div className="flex min-h-full min-w-0 flex-col items-center gap-4 p-4">
						<div
							ref={pagesRef}
							data-testid="pdf-pages"
							className="flex min-w-0 flex-col items-center gap-4"
						/>
						{pageCount > MAX_PREVIEW_PAGES ? (
							<p className="text-center text-xs text-muted-foreground">
								Önizlemede ilk {MAX_PREVIEW_PAGES} sayfa gösteriliyor; belgenin
								tamamı ({pageCount} sayfa) için PDF'i indirin.
							</p>
						) : null}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
