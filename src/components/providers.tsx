"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light","dark","dim","oled"]}>
      {children}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
