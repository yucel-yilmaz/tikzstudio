"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Minus, Plus } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function renderPreview() {
      if (!src || !canvasRef.current) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const document = await pdfjs.getDocument({
          url: `${src}?ts=${Date.now()}`,
          withCredentials: true,
        }).promise;
        const page = await document.getPage(1);
        const viewport = page.getViewport({ scale: zoom });
        const canvas = canvasRef.current;

        if (!canvas || !active) {
          return;
        }

        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Canvas context not available.");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;
      } catch (renderError) {
        setError(renderError instanceof Error ? renderError.message : "PDF render failed.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void renderPreview();

    return () => {
      active = false;
    };
  }, [src, zoom]);

  if (!src) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed bg-muted/30 p-6 text-center">
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
    <div className="flex h-full min-h-[320px] flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium">PDF Önizleme</p>
          <p className="text-xs text-muted-foreground">Yakınlaştırma {Math.round(zoom * 100)}%</p>
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

      <ScrollArea className="relative h-[420px] rounded-xl border bg-muted/20">
        <div
          className={cn(
            "absolute inset-0 z-10 hidden items-center justify-center gap-2 bg-background/80 backdrop-blur-sm",
            loading && "flex",
          )}
        >
          <LoaderCircle className="animate-spin" size={16} />
          <span className="text-sm text-muted-foreground">PDF yükleniyor...</span>
        </div>

        {error ? <p className="p-4 text-sm text-destructive">{error}</p> : null}
        <div className="flex min-h-full items-start justify-center p-4">
          <canvas ref={canvasRef} className="rounded-md border bg-background shadow-sm" />
        </div>
      </ScrollArea>
    </div>
  );
}
