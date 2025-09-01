"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
// Import pdf.js core (build) for browser usage
// NOTE: Next.js + React 19 hoạt động ổn với build ESM này
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from "pdfjs-dist";

// Dùng worker từ CDN khớp phiên bản đã cài trong package.json (5.4.149)
// pdf.js v5 dùng file worker .mjs
GlobalWorkerOptions.workerSrc =
  (GlobalWorkerOptions as any).workerSrc ||
  "https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs";

export type PdfClientReaderProps = {
  title: string;
  src: string; // public url to pdf e.g. /insights-pdf/slug.pdf
  className?: string;
};

export function PdfClientReader({ title, src, className }: PdfClientReaderProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [fitWidth, setFitWidth] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const task = getDocument(src);
        const pdf: PDFDocumentProxy = await task.promise;
        if (cancelled) return;
        setNumPages(pdf.numPages);
        // Render pages sequentially
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: 1 });
          const canvas = document.createElement("canvas");
          const ratio = Math.min(window.devicePixelRatio || 1, 2); // limit for perf
          canvas.width = viewport.width * ratio;
          canvas.height = viewport.height * ratio;
          const ctx = canvas.getContext("2d")!;
          const renderContext = { canvasContext: ctx, viewport: page.getViewport({ scale: ratio }) } as any;
          await page.render(renderContext).promise;
          if (cancelled) return;
          const holder = document.createElement("div");
          holder.className = "pdf-page-item mx-auto overflow-hidden rounded-md border bg-background shadow-sm";
          holder.appendChild(canvas);
          containerRef.current?.appendChild(holder);
          // ensure canvas scales as image-like block
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.setAttribute("aria-label", `Page ${p}`);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to render PDF", e);
        const el = document.createElement("div");
        el.className = "rounded-md border bg-destructive/10 p-3 text-sm text-destructive";
        el.textContent = "Không thể hiển thị PDF. Vui lòng kiểm tra lại file trong public/insights-pdf hoặc thử tải lại trang.";
        containerRef.current?.appendChild(el);
      }
    };
    // clear previous
    if (containerRef.current) containerRef.current.innerHTML = "";
    load();
    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [src]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "+" || (e.key === "=" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        setScale((s) => Math.min(2.5, +(s + 0.1).toFixed(2)));
      } else if (e.key === "-" || (e.key === "_" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(2)));
      } else if (e.key.toLowerCase() === "0" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setScale(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pageWidthClass = useMemo(() => (fitWidth ? "w-full" : "max-w-[820px]"), [fitWidth]);

  return (
    <div className={cn("mx-auto w-full max-w-5xl", className)}>
      <div className="sticky top-16 z-10 mb-3 flex items-center gap-2 rounded-md border bg-background/70 px-2 py-1 backdrop-blur">
        <div className="flex-1 truncate px-2 text-sm text-muted-foreground">
          {title} {numPages ? `( ${numPages} trang )` : ""}
        </div>
        <button
          className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent"
          onClick={() => setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(2)))}
        >
          <ZoomOut className="size-4" />
          <span>-</span>
        </button>
        <div className="w-14 text-center text-xs tabular-nums">{Math.round(scale * 100)}%</div>
        <button
          className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent"
          onClick={() => setScale((s) => Math.min(2.5, +(s + 0.1).toFixed(2)))}
        >
          <ZoomIn className="size-4" />
          <span>+</span>
        </button>
        <button
          className="ml-1 inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent"
          onClick={() => setScale(1)}
        >
          <RotateCw className="size-4" />
          <span>100%</span>
        </button>
        <button
          className={cn("ml-1 inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent", fitWidth && "bg-accent")}
          onClick={() => setFitWidth((v) => !v)}
        >
          <Maximize2 className="size-4" />
          <span>Fit</span>
        </button>
      </div>

      <div
        className={cn("space-y-6", pageWidthClass)
        }
        style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        ref={containerRef}
      />
    </div>
  );
}
