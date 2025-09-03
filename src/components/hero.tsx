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

  const container = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20, mass: 0.6, when: "beforeChildren", staggerChildren: 0.06 } },
  } as const;
  const item = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 18 } },
  } as const;

  return (
    <section ref={ref} className="relative isolate min-h-[80dvh] w-full">
      <motion.div variants={container} initial="initial" animate="animate" className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center md:py-28">
        <motion.span variants={item} className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-400" />
          Available for freelance & collab
        </motion.span>

        <motion.h1 style={{ y: yTitle }} variants={item} className="text-balance text-4xl font-bold tracking-tight leading-tight sm:text-5xl md:text-6xl">
          I’m Duy Bùi — AI Engineer & Developer
        </motion.h1>

        <motion.p style={{ y: ySubtitle }} variants={item} className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
          <Typing
            text="Building intelligent systems with data & code."
            speed={30}
          />
        </motion.p>

        <motion.div style={{ y: yCtas }} variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <a href="#projects" className="inline-flex items-center gap-2">
              View Projects <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#contact">Contact Me</a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
