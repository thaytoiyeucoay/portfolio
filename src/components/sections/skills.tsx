"use client";

import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { SkillsOrbit } from "@/components/skills-orbit";

const skills = [
  { name: "Python", level: 95 },
  { name: "PyTorch", level: 90 },
  { name: "React", level: 85 },
  { name: "Next.js", level: 85 },
  { name: "TensorFlow", level: 80 },
  { name: "LangChain", level: 80 },
];

export function SkillsSection() {
  return (
    <section id="skills" className="mt-16 scroll-mt-24">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-2xl font-semibold"
      >
        Skills
      </motion.h2>

      {/* Orbiting skills icons */}
      <div className="mb-8 flex w-full items-center justify-center">
        <SkillsOrbit />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {skills.map((s) => (
          <motion.div
            key={s.name}
            className="space-y-2"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.name}</span>
              <Badge variant="secondary">{s.level}%</Badge>
            </div>
            <AnimatedProgress value={s.level} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function AnimatedProgress({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const motionVal = useMotionValue(0);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const controls = animate(motionVal, inView ? value : 0, {
      duration: 0.8,
      ease: "easeOut",
    });
    const unsub = motionVal.on("change", (v) => setVal(Math.round(v)));
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, motionVal, value]);

  return (
    <div ref={ref}>
      <Progress value={val} />
    </div>
  );
}
