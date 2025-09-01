"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Command } from "lucide-react";
import { UnderlineLink } from "@/components/ui/underline-link";

const sections = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "dataviz", label: "Data Viz" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export function Navbar() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.2, 0.6, 1] }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <nav className="container mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="font-semibold">
          Duy Bùi
        </Link>
        <div className="flex items-center gap-6">
          <ul className="hidden gap-4 sm:flex">
            {sections.map((s) => (
              <li key={s.id}>
                <UnderlineLink
                  href={`/#${s.id}`}
                  className={cn(
                    "group",
                    active === s.id && "text-foreground"
                  )}
                >
                  {s.label}
                </UnderlineLink>
              </li>
            ))}
          </ul>
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
