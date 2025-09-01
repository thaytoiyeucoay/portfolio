"use client";

import { HTMLAttributes, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SpotlightProps = HTMLAttributes<HTMLDivElement> & {
  size?: number; // px radius
  strength?: number; // opacity 0..1
};

export function Spotlight({ className, size = 180, strength = 0.18, ...props }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [bg, setBg] = useState<string>("transparent");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rect = el.getBoundingClientRect();
    const onResize = () => (rect = el.getBoundingClientRect());
    const onMove = (e: PointerEvent) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setBg(`radial-gradient(${size}px ${size}px at ${x}px ${y}px, rgba(255,255,255,${strength}), transparent 60%)`);
    };
    const onLeave = () => setBg("transparent");
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [size, strength]);

  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: bg, mixBlendMode: "soft-light" }}
      />
      {props.children}
    </div>
  );
}
