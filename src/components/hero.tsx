"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Typing } from "@/components/typing";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Cpu, Zap } from "lucide-react";
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
    <section ref={ref} className="relative isolate min-h-[80dvh] w-full overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 opacity-30"
        >
          <Brain className="w-8 h-8 text-purple-400" />
        </motion.div>
        <motion.div 
          animate={{
            y: [10, -10, 10],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-32 right-16 opacity-30"
        >
          <Cpu className="w-6 h-6 text-blue-400" />
        </motion.div>
        <motion.div 
          animate={{
            y: [-5, 15, -5],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-32 left-20 opacity-30"
        >
          <Zap className="w-7 h-7 text-yellow-400" />
        </motion.div>
      </div>

      <motion.div variants={container} initial="initial" animate="animate" className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center md:py-28">
        <motion.span 
          variants={item} 
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-md px-4 py-2 text-xs text-muted-foreground shadow-lg"
        >
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          Available for freelance & collab
        </motion.span>

        <motion.h1 
          style={{ y: yTitle }} 
          variants={item} 
          className="text-balance text-4xl font-bold tracking-tight leading-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent"
        >
          I'm <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">Duy Bùi</span> — AI Engineer & Developer
        </motion.h1>

        <motion.p style={{ y: ySubtitle }} variants={item} className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
          <Typing
            text="Building intelligent systems with data & code."
            speed={30}
          />
        </motion.p>

        <motion.div style={{ y: yCtas }} variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 shadow-lg shadow-emerald-500/25" asChild>
            <a href="#projects" className="inline-flex items-center gap-2">
              View Projects <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm" asChild>
            <a href="#contact">Contact Me</a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
