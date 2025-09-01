"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PdfLikeReaderProps = {
  title: string;
  pages: string[]; // image urls, e.g., /insights/slug/page-1.png
  className?: string;
};

export function PdfLikeReader({ title, pages, className }: PdfLikeReaderProps) {
  const [scale, setScale] = useState(1);
  const [fitWidth, setFitWidth] = useState(true);

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

  const pageWidthClass = useMemo(() => (fitWidth ? "w-full" : "max-w-[820px]"), [fitWidth]); // ~A4 width at 96dpi

  const Toolbar = (
    <div className="sticky top-16 z-10 mb-3 flex items-center gap-2 rounded-md border bg-background/70 px-2 py-1 backdrop-blur">
      <div className="flex-1 truncate px-2 text-sm text-muted-foreground">{title}</div>
      <button
        className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent"
        onClick={() => setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(2)))}
        aria-label="Zoom out"
      >
        <ZoomOut className="size-4" />
        <span>-</span>
      </button>
      <div className="w-14 text-center text-xs tabular-nums">{Math.round(scale * 100)}%</div>
      <button
        className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent"
        onClick={() => setScale((s) => Math.min(2.5, +(s + 0.1).toFixed(2)))}
        aria-label="Zoom in"
      >
        <ZoomIn className="size-4" />
        <span>+</span>
      </button>
      <button
        className="ml-1 inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent"
        onClick={() => setScale(1)}
        aria-label="Reset zoom"
      >
        <RotateCw className="size-4" />
        <span>100%</span>
      </button>
      <button
        className={cn("ml-1 inline-flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-accent", fitWidth && "bg-accent")}
        onClick={() => setFitWidth((v) => !v)}
        aria-label="Toggle fit width"
      >
        <Maximize2 className="size-4" />
        <span>Fit</span>
      </button>
    </div>
  );

  return (
    <div className={cn("mx-auto w-full max-w-5xl", className)}>
      {Toolbar}
      <div className="space-y-6">
        {pages.map((src, i) => (
          <div key={i} className={cn("mx-auto overflow-hidden rounded-md border bg-background shadow-sm", pageWidthClass)} style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
            {/* page background to simulate paper */}
            <div className="bg-white p-0 dark:bg-zinc-900">
              <img src={src} alt={`Page ${i + 1}`} className="block h-auto w-full select-none" draggable={false} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
