"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import { markers } from "@/data/markers";

// --- Helpers ---
function latLonToXYZ(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// --- Neural Network ---
function NeuralNetwork({ nodeCount = 60, radius = 4 }: { nodeCount?: number; radius?: number }) {
  const { nodes, edges } = useMemo(() => {
    const ns: THREE.Vector3[] = [];
    const e: [number, number][] = [];
    for (let i = 0; i < nodeCount; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(radius * (0.4 + Math.random() * 0.6));
      ns.push(v);
    }
    // connect nearest neighbors
    for (let i = 0; i < nodeCount; i++) {
      const dists = ns.map((v, idx) => ({ idx, d: v.distanceTo(ns[i]) }));
      dists.sort((a, b) => a.d - b.d);
      for (let k = 1; k < 4; k++) e.push([i, dists[k].idx]);
    }
    return { nodes: ns, edges: e };
  }, [nodeCount, radius]);

  return (
    <group>
      {/* nodes */}
      {nodes.map((p, i) => (
        <mesh key={i} position={p.toArray()}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.2} />
        </mesh>
      ))}
      {/* edges */}
      {edges.map(([a, b], i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...nodes[a].toArray(), ...nodes[b].toArray()])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#a78bfa" linewidth={1} transparent opacity={0.7} />
        </line>
      ))}
    </group>
  );
}

// --- Globe ---
function Globe({ radius = 2 }: { radius?: number }) {
  const ringMat = new THREE.MeshBasicMaterial({ color: "#22d3ee", transparent: true, opacity: 0.25 });
  return (
    <group>
      <mesh rotation={[0, 0, 0]}> 
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* equator ring visual */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.01, radius * 1.02, 128]} />
        <primitive object={ringMat} attach="material" />
      </mesh>

      {/* markers */}
      {markers.map((m) => {
        const p = latLonToXYZ(m.lat, m.lon, radius + 0.02);
        return (
          <group key={m.label} position={p.toArray()}>
            <mesh>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial color={m.type === "study" ? "#22c55e" : m.type === "work" ? "#f59e0b" : "#ef4444"} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function Experience3DSection() {
  return (
    <section id="experience-3d" className="mt-16 scroll-mt-24">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-2xl font-semibold"
      >
        3D / AR / VR Experience
      </motion.h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Neural network */}
        <div className="relative h-[420px] overflow-hidden rounded-xl border bg-background/60 backdrop-blur-xl">
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 2]} intensity={0.8} />
            <Suspense fallback={<Html center className="text-xs text-muted-foreground">Loading…</Html>}>
              <NeuralNetwork />
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} />
          </Canvas>
        </div>

        {/* Globe */}
        <div className="relative h-[420px] overflow-hidden rounded-xl border bg-background/60 backdrop-blur-xl">
          <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 5, 2]} intensity={0.8} />
            <Suspense fallback={<Html center className="text-xs text-muted-foreground">Loading…</Html>}>
              <group rotation={[0.4, -0.8, 0]}>
                <Globe />
              </group>
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.8} />
          </Canvas>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Gợi ý: Có thể nâng cấp với texture Earth, arcs bay giữa các điểm, và chế độ VR (WebXR) ở bản tiếp theo.
      </p>
    </section>
  );
}
