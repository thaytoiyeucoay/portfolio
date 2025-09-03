"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Command } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <nav className="container mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="font-semibold">
          Duy Bùi
        </Link>
        <div className="flex items-center gap-6">
          <button
            onClick={() => window.dispatchEvent(new Event("open-cmdk"))}
            className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Open Command Palette"
          >
            <Command className="size-3.5" />
            <span className="hidden sm:inline">Search</span>
          </button>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
