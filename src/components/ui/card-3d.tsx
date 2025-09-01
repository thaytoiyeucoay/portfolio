"use client";

import { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  intensity?: number; // tilt intensity in deg
  glare?: boolean; // toggle highlight glare
  perspective?: number; // px
  scaleOnHover?: boolean;
};

export function Card3D({ children, className, intensity = 8, glare = false, perspective = 700, scaleOnHover = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const prefersReduced = useReducedMotion();
  const isCoarse = typeof window !== "undefined" && matchMedia("(pointer: coarse)").matches;
  const target = useRef({ rx: 0, ry: 0 });
  const current = useRef({ rx: 0, ry: 0 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rect = el.getBoundingClientRect();
    const onResize = () => (rect = el.getBoundingClientRect());

    const onMove = (e: PointerEvent) => {
      if (prefersReduced || isCoarse) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x / rect.width) * 2 - 1; // -1..1
      const py = (y / rect.height) * 2 - 1;
      target.current.rx = -py * intensity;
      target.current.ry = px * intensity;
      if (raf.current == null) startRaf();
    };

    const onLeave = () => {
      target.current.rx = 0;
      target.current.ry = 0;
      if (raf.current == null) startRaf();
    };

    const startRaf = () => {
      const tick = () => {
        // smooth interpolate
        current.current.rx += (target.current.rx - current.current.rx) * 0.12;
        current.current.ry += (target.current.ry - current.current.ry) * 0.12;
        const rx = current.current.rx;
        const ry = current.current.ry;
        const gx = (Math.max(-1, Math.min(1, ry / intensity)) * 50 + 50).toFixed(0);
        const gy = (Math.max(-1, Math.min(1, -rx / intensity)) * 50 + 50).toFixed(0);
        setStyle({
          transform: `${scaleOnHover ? "scale(1.01)" : ""} rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`,
          transformStyle: "preserve-3d",
          perspective: `${perspective}px`,
          boxShadow: `0 10px 24px -12px rgba(0,0,0,0.35)`,
          backgroundImage: glare
            ? `radial-gradient(600px 200px at ${gx}% ${gy}%, rgba(255,255,255,0.10), transparent 60%)`
            : undefined,
          willChange: "transform",
        });
        if (Math.abs(target.current.rx - rx) < 0.01 && Math.abs(target.current.ry - ry) < 0.01) {
          raf.current && cancelAnimationFrame(raf.current);
          raf.current = null;
          return;
        }
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [intensity, prefersReduced, glare, isCoarse, perspective, scaleOnHover]);

  const computed = useMemo(() => ({
    transformStyle: "preserve-3d",
    transition: prefersReduced ? undefined : "transform 120ms ease-out",
    willChange: "transform",
    ...style,
  }) as CSSProperties, [style, prefersReduced]);

  return (
    <div ref={ref} className={cn("[transform-style:preserve-3d]", className)} style={computed}>
      {children}
    </div>
  );
}
