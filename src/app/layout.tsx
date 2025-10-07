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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.startsWith('http') 
      ? process.env.NEXT_PUBLIC_SITE_URL 
      : process.env.NEXT_PUBLIC_SITE_URL 
        ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
        : "https://portfolio-khanhduybui.vercel.app"
  ),
  title: {
    default: "Khánh Duy Bùi — AI Engineer & Full-Stack Developer Portfolio",
    template: "%s | Khánh Duy Bùi"
  },
  description:
    "Khánh Duy Bùi - AI Engineer & Full-Stack Developer. Student at Hanoi University of Science and Technology. Specialized in LLM, RAG, CV/NLP, React, Next.js, PyTorch, TensorFlow. Building intelligent systems with modern web technologies.",
  authors: [{ name: "Khánh Duy Bùi", url: "https://linkedin.com/in/khanhduyhust160804" }],
  creator: "Khánh Duy Bùi",
  publisher: "Khánh Duy Bùi",
  keywords: [
    "Khánh Duy Bùi",
    "AI Engineer Vietnam",
    "Full-Stack Developer",
    "Machine Learning Engineer",
    "Deep Learning",
    "LLM Developer",
    "RAG Systems",
    "Computer Vision",
    "NLP Engineer",
    "React Developer",
    "Next.js Developer",
    "PyTorch",
    "TensorFlow",
    "LangChain",
    "Portfolio",
    "Hanoi University Science Technology",
    "Vietnam AI Developer",
    "Chatbot RAG",
    "Emotion Detection",
    "Cat Dog Classifier"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Khánh Duy Bùi Portfolio",
    title: "Khánh Duy Bùi — AI Engineer & Full-Stack Developer",
    description:
      "AI Engineer & Full-Stack Developer building intelligent systems. Student at Hanoi University of Science and Technology. Specialized in LLM, RAG, React, PyTorch.",
    images: [{
      url: "/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: "Khánh Duy Bùi - AI Engineer & Developer Portfolio"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khánh Duy Bùi — AI Engineer & Full-Stack Developer",
    description:
      "AI Engineer & Full-Stack Developer. Student at HUST. Specialized in LLM, RAG, CV/NLP, React, PyTorch.",
    images: ["/opengraph-image.png"],
    creator: "@khanhduybui",
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "PJQB_KM8pGh-_1fb2rfH1oREBzQLU7KABzWDM-GrDIk",
  }
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
