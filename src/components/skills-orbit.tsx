"use client";

import { motion } from "framer-motion";
import { SiPython, SiTensorflow, SiPytorch, SiReact, SiNextdotjs, SiNodedotjs } from "react-icons/si";

const items = [
  { icon: SiPython, label: "Python" },
  { icon: SiTensorflow, label: "TensorFlow" },
  { icon: SiPytorch, label: "PyTorch" },
  { icon: SiReact, label: "React" },
  { icon: SiNextdotjs, label: "Next.js" },
  { icon: SiNodedotjs, label: "Node.js" },
] as const;

export function SkillsOrbit() {
  return (
    <div className="relative mx-auto h-60 w-60">
      <div className="absolute inset-0 rounded-full border border-border/60" />
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
      >
        {items.map((Item, i) => {
          const angle = (i / items.length) * Math.PI * 2;
          const r = 110;
          const x = Math.cos(angle) * r + 120; // center 120,120
          const y = Math.sin(angle) * r + 120;
          const Icon = Item.icon;
          return (
            <motion.div
              key={Item.label}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background/70 p-2 shadow-md backdrop-blur"
              style={{ left: x, top: y }}
              whileHover={{ scale: 1.1 }}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
          );
        })}
      </motion.div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background/70 px-3 py-1 text-xs backdrop-blur">
        AI / ML
      </div>
    </div>
  );
}
