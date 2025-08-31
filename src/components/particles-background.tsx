"use client";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useState } from "react";
import { loadSlim } from "@tsparticles/slim";

type Props = {
  fullScreen?: boolean;
  className?: string;
};

export function ParticlesBackground({ fullScreen = false, className }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const options = {
    background: { color: { value: "transparent" } },
    fullScreen: { enable: fullScreen, zIndex: 0 },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" },
        resize: true,
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { quantity: 2 },
      },
    },
    particles: {
      color: { value: "#6ee7ff" },
      links: { color: "#6ee7ff", distance: 150, enable: true, opacity: 0.25, width: 1 },
      move: { enable: true, speed: 1.2, direction: "none", outModes: { default: "out" } },
      number: { value: 80, density: { enable: true, area: 800 } },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  } as const;

  if (!ready) return null;

  return (
    <Particles id="tsparticles" options={options as any} className={className ?? (fullScreen ? undefined : "absolute inset-0 -z-10")} />
  );
}
