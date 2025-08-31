"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Typing } from "@/components/typing";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const ySubtitle = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const yCtas = useTransform(scrollYProgress, [0, 1], [0, -10]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <section ref={ref} className="relative isolate min-h-[80dvh] w-full overflow-hidden rounded-2xl bg-background/40 backdrop-blur-xl">
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center md:py-28">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground"
        >
          <span className="size-2 rounded-full bg-emerald-400" />
          Available for freelance & collab
        </motion.span>

        <motion.h1 style={{ y: yTitle }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-balance text-4xl font-bold sm:text-5xl md:text-6xl"
        >
          I’m Duy Bùi — AI Engineer & Developer
        </motion.h1>

        <motion.p style={{ y: ySubtitle }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          <Typing
            text="Building intelligent systems with data & code."
            speed={30}
          />
        </motion.p>

        <motion.div style={{ y: yCtas }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button size="lg" asChild>
            <a href="#projects" className="inline-flex items-center gap-2">
              View Projects <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#contact">Contact Me</a>
          </Button>
        </motion.div>
      </div>

      {/* subtle radial glow */}
      <motion.div style={{ opacity: glowOpacity }} className="pointer-events-none absolute -inset-40 -z-10 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(56,189,248,.12),rgba(56,189,248,0)_60%)]" />
    </section>
  );
}
