import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { ParticlesBackground } from "@/components/particles-background";
import { RouteAwareParticles } from "@/components/route-aware-particles";
import { CommandPalette } from "@/components/ui/command-palette";
import { Dock } from "@/components/ui/dock";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Khánh Duy Bùi — AI Engineer & Developer",
  description:
    "AI Engineer & Developer building intelligent systems with data & code. Portfolio with clean UI and performance.",
  authors: [{ name: "Duy Bùi" }],
  keywords: [
    "AI Engineer",
    "Developer",
    "Machine Learning",
    "Deep Learning",
    "Next.js",
    "Portfolio",
  ],
  openGraph: {
    type: "website",
    url: "/",
    title: "Khánh Duy Bùi — AI Engineer & Developer",
    description:
      "AI Engineer & Developer building intelligent systems with data & code.",
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khánh Duy Bùi — AI Engineer & Developer",
    description:
      "AI Engineer & Developer building intelligent systems with data & code.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-background text-foreground`}
      >
        {/* Route-aware particles background (hidden on content-heavy pages) */}
        <RouteAwareParticles />
        <Providers>
          <div className="relative z-10">
            <Navbar />
            {children}
            {/* Global UI */}
            <CommandPalette />
            <Dock />
          </div>
        </Providers>
      </body>
    </html>
  );
}
