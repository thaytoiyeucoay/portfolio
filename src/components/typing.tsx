"use client";

import { useEffect, useState } from "react";

interface TypingProps {
  text: string;
  speed?: number; // ms per character
  className?: string;
}

export function Typing({ text, speed = 40, className }: TypingProps) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setDisplay((prev) => (i < text.length ? prev + text[i++] : prev));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return <span className={className}>{display}</span>;
}
