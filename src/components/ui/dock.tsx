"use client";

import Link from "next/link";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Home, User, Boxes, Wrench, Mail, Command, Palette } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Dock() {
  const openCmd = useCallback(() => {
    window.dispatchEvent(new Event("open-cmdk"));
  }, []);

  const items = [
    { href: "#", label: "Top", icon: Home },
    { href: "#about", label: "About", icon: User },
    { href: "#projects", label: "Projects", icon: Boxes },
    { href: "#skills", label: "Skills", icon: Wrench },
    { href: "#contact", label: "Contact", icon: Mail },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
      <div className={cn(
        "pointer-events-auto flex items-center gap-2 rounded-2xl border bg-background/70 px-2 py-1 shadow-lg backdrop-blur",
        "supports-[backdrop-filter]:bg-background/60"
      )}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
            <item.icon className="size-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        ))}
        <button onClick={openCmd} aria-label="Open Command Palette" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
          <Command className="size-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
        <div className="ml-1">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
