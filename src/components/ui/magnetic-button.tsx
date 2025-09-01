"use client";

import { Button } from "@/components/ui/button";
import type React from "react";
type ButtonComponentProps = React.ComponentProps<typeof Button>;
import { useEffect, useRef, useState } from "react";

export function MagneticButton({ children, className, ...props }: ButtonComponentProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rect = el.getBoundingClientRect();
    const onResize = () => (rect = el.getBoundingClientRect());
    const onMove = (e: PointerEvent) => {
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      const max = 12; // px
      setTx(Math.max(-max, Math.min(max, x * 0.2)));
      setTy(Math.max(-max, Math.min(max, y * 0.2)));
    };
    const onLeave = () => {
      setTx(0);
      setTy(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <Button
      ref={ref}
      className={className}
      style={{ transform: `translate(${tx}px, ${ty}px)` }}
      {...props}
    >
      {children}
    </Button>
  );
}
