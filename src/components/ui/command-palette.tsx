"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Command, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { projects } from "@/data/projects";
import { posts } from "@/data/posts";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const onKey = useCallback((e: KeyboardEvent) => {
    const mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
    if ((mac && e.metaKey && e.key.toLowerCase() === "k") || (!mac && e.ctrlKey && e.key.toLowerCase() === "k")) {
      e.preventDefault();
      setOpen((v) => !v);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    const openHandler = () => setOpen(true);
    const closeHandler = () => setOpen(false);
    window.addEventListener("open-cmdk", openHandler as EventListener);
    window.addEventListener("close-cmdk", closeHandler as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-cmdk", openHandler as EventListener);
      window.removeEventListener("close-cmdk", closeHandler as EventListener);
    };
  }, [onKey]);

  const sections = useMemo(() => [
    { type: "section", id: "about", title: "About", href: "#about" },
    { type: "section", id: "projects", title: "Projects", href: "#projects" },
    { type: "section", id: "skills", title: "Skills", href: "#skills" },
    { type: "section", id: "contact", title: "Contact", href: "#contact" },
  ], []);

  const dataset = useMemo(() => {
    const p = projects?.map((p) => ({ type: "project" as const, id: p.title, title: p.title, href: p.link || "#projects" })) ?? [];
    const b = posts?.map((p) => ({ type: "post" as const, id: p.slug, title: p.title, href: p.url ?? "#" })) ?? [];
    return [...sections, ...p, ...b];
  }, [sections]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return dataset.slice(0, 8);
    return dataset.filter((item) => item.title.toLowerCase().includes(query)).slice(0, 10);
  }, [dataset, q]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-24 w-[min(640px,92vw)] -translate-y-0 overflow-hidden rounded-xl bg-popover/95 shadow-lg backdrop-blur-md sm:max-w-2xl">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sections, projects, posts..."
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex items-center gap-1">
              <Command className="size-3" />K
            </kbd>
          </div>
          <ul className="max-h-80 overflow-auto p-2">
            {results.map((r) => (
              <li key={`${r.type}:${r.id}`}>
                <a
                  href={r.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-muted/60",
                    r.type === "section" && "text-foreground",
                    r.type === "project" && "text-sky-500",
                    r.type === "post" && "text-emerald-500"
                  )}
                >
                  <span className="truncate">{r.title}</span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </a>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-2 py-4 text-center text-xs text-muted-foreground">No results</li>
            )}
          </ul>
      </DialogContent>
    </Dialog>
  );
}
