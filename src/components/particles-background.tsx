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
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: { enable: true, mode: ["grab", "bubble"] },
        onClick: { enable: true, mode: "push" },
        resize: true,
      },
      modes: {
        grab: {
          distance: 140,
          links: { opacity: 0.5 }
        },
        bubble: {
          distance: 200,
          size: 6,
          duration: 0.3,
          opacity: 1
        },
        push: { quantity: 4 },
      },
    },
    particles: {
      color: { 
        value: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"]
      },
      links: { 
        color: "#64748b", 
        distance: 120, 
        enable: true, 
        opacity: 0.15, 
        width: 1,
        triangles: {
          enable: true,
          opacity: 0.02
        }
      },
      move: { 
        enable: true, 
        speed: { min: 0.5, max: 1.5 }, 
        direction: "none", 
        outModes: { default: "bounce" },
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200
        }
      },
      number: { value: 60, density: { enable: true, area: 800 } },
      opacity: { 
        value: { min: 0.2, max: 0.8 },
        animation: {
          enable: true,
          speed: 1,
          sync: false
        }
      },
      shape: { type: "circle" },
      size: { 
        value: { min: 1, max: 4 },
        animation: {
          enable: true,
          speed: 2,
          sync: false
        }
      },
    },
    detectRetina: true,
  } as const;

  if (!ready) return null;

  return (
    <Particles
      id="tsparticles"
      options={options as any}
      className={className ?? (fullScreen ? undefined : "absolute inset-0 -z-10")}
      style={{ pointerEvents: "none" }}
    />
  );
}
