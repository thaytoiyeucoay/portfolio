import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { ParticlesBackground } from "@/components/particles-background";
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
  title: "Khánh Duy Bùi — AI Engineer & Developer",
  description:
    "AI Engineer & Developer building intelligent systems with data & code. Portfolio with 3D, animations, and slick UI.",
  authors: [{ name: "Duy Bùi" }],
  keywords: [
    "AI Engineer",
    "Developer",
    "Machine Learning",
    "Deep Learning",
    "Next.js",
    "Portfolio",
  ],
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
        {/* Global particles background */}
        <ParticlesBackground className="fixed inset-0 z-0" />
        <Providers>
          <Navbar />
          {children}
          {/* Global UI */}
          <CommandPalette />
          <Dock />
        </Providers>
      </body>
    </html>
  );
}
