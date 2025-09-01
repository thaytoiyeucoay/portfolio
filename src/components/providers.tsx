"use client";

import { ThemeProvider } from "next-themes";
import { DefaultSeo } from "next-seo";
import { Toaster } from "sonner";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light","dark","dim","oled"]}>
      <DefaultSeo
        titleTemplate="%s | Duy Bùi"
        defaultTitle="Duy Bùi — AI Engineer & Developer"
        description="AI Engineer & Developer building intelligent systems with data & code. Portfolio with 3D, animations, and slick UI."
        openGraph={{
          type: "website",
          locale: "vi_VN",
          url: "https://example.com/",
          siteName: "Duy Bùi",
          title: "Duy Bùi — AI Engineer & Developer",
          description:
            "AI Engineer & Developer building intelligent systems with data & code.",
          images: [
            {
              url: "/og.png",
              width: 1200,
              height: 630,
              alt: "Duy Bùi — AI Engineer & Developer",
            },
          ],
        }}
        twitter={{ cardType: "summary_large_image", site: "@your_handle" }}
      />
      {children}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
