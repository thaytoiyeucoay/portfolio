"use client";

import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { timeline } from "@/data/timeline";

export function TimelineSection() {
  return (
    <section id="timeline" className="mt-16 scroll-mt-24">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-2xl font-semibold"
      >
        Journey
      </motion.h2>

      <div className="relative mx-auto max-w-4xl">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border/60 md:left-1/2 md:-translate-x-1/2" />
        <ol className="space-y-10">
          {timeline.map((item, idx) => {
            const Icon = (Lucide as any)[item.icon ?? "Circle"] ?? (Lucide as any)["Circle"];
            const isLeft = idx % 2 === 0;
            return (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative grid grid-cols-[1rem,1fr] gap-4 md:grid-cols-2 md:gap-8"
              >
                {/* Dot & line */}
                <div className="col-span-1 flex items-start justify-center md:col-span-2">
                  <span className="relative z-10 inline-flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary ring-2 ring-primary/30">
                    <Icon className="size-3" />
                  </span>
                </div>
                {/* Cards */}
                <div className={`md:col-span-1 ${isLeft ? "md:pr-20 md:justify-self-end" : "md:order-last md:pl-20"}`}>
                  <div className="rounded-xl border bg-background/60 p-4 backdrop-blur-xl">
                    <div className="mb-1 text-sm text-muted-foreground">{item.period}</div>
                    <div className="text-base font-semibold">{item.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="hidden md:block" />
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
