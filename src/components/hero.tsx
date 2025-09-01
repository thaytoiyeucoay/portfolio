"use client";

import { motion, useScroll, useTransform, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import { Typing } from "@/components/typing";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCallback, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron, Float, MeshDistortMaterial, Environment, ContactShadows } from "@react-three/drei";
import type { Group } from "three";

function MinimalScene({ px, py }: { px: number; py: number }) {
  const group = useRef<Group>(null);
  useFrame((_: unknown, delta: number) => {
    if (!group.current) return;
    // subtle idle rotation
    group.current.rotation.y += delta * 0.1;
    // reduced parallax from mouse for a calmer effect
    group.current.rotation.x = py * 0.08;
    group.current.rotation.z = px * 0.08;
  });
  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* softer, layered lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={0.8} />
      <pointLight position={[-4, -1, 2]} intensity={0.6} color="#60a5fa" />
      <pointLight position={[2, -2, -2]} intensity={0.4} color="#22d3ee" />

      {/* floating, gently distorted gem */}
      <Float speed={1} rotationIntensity={0.25} floatIntensity={0.6}>
        <Icosahedron args={[1.15, 0]}> 
          <MeshDistortMaterial
            color="#7dd3fc"
            roughness={0.2}
            metalness={0.4}
            clearcoat={0.6}
            clearcoatRoughness={0.2}
            distort={0.22}
            speed={1.2}
          />
        </Icosahedron>
      </Float>

      {/* soft ground contact shadows */}
      <ContactShadows opacity={0.3} scale={10} blur={2.8} far={4.5} resolution={256} position={[0, -1.2, 0]} />

      {/* subtle environment reflections */}
      <Environment preset="studio" />
    </group>
  );
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const ySubtitle = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const yCtas = useTransform(scrollYProgress, [0, 1], [0, -10]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  const reduceMotion = useReducedMotion();
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const px = useSpring(mvX, { stiffness: 80, damping: 15, mass: 0.2 });
  const py = useSpring(mvY, { stiffness: 80, damping: 15, mass: 0.2 });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    mvX.set(x - 0.5);
    mvY.set(0.5 - y);
  }, [mvX, mvY]);

  const container = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20, mass: 0.6, when: "beforeChildren", staggerChildren: 0.06 } },
  } as const;
  const item = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 18 } },
  } as const;

  return (
    <section ref={ref} onMouseMove={onMouseMove} className="relative isolate min-h-[80dvh] w-full overflow-hidden rounded-2xl bg-background/40 backdrop-blur-xl">
      {/* 3D background */}
      {!reduceMotion && (
        <div className="pointer-events-none absolute inset-0 -z-20">
          <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
            <MinimalScene px={(px.get?.() ?? 0)} py={(py.get?.() ?? 0)} />
          </Canvas>
        </div>
      )}

      <motion.div variants={container} initial="initial" animate="animate" className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center md:py-28">
        <motion.span variants={item} className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-400" />
          Available for freelance & collab
        </motion.span>

        <motion.h1 style={{ y: yTitle }} variants={item} className="text-balance text-4xl font-bold sm:text-5xl md:text-6xl">
          I’m Duy Bùi — AI Engineer & Developer
        </motion.h1>

        <motion.p style={{ y: ySubtitle }} variants={item} className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
          <Typing
            text="Building intelligent systems with data & code."
            speed={30}
          />
        </motion.p>

        <motion.div style={{ y: yCtas }} variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <a href="#projects" className="inline-flex items-center gap-2">
              View Projects <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#contact">Contact Me</a>
          </Button>
        </motion.div>
      </motion.div>

      {/* subtle radial glow */}
      <motion.div style={{ opacity: glowOpacity }} className="pointer-events-none absolute -inset-40 -z-10 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(56,189,248,.12),rgba(56,189,248,0)_60%)]" />
    </section>
  );
}
