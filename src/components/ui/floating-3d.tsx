"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Sphere, Box, Icosahedron } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

interface Floating3DProps {
  className?: string;
  type?: "sphere" | "cube" | "icosahedron";
  color?: string;
  size?: number;
  autoRotate?: boolean;
}

function FloatingShape({ type = "sphere", color = "#10b981", size = 1 }: Omit<Floating3DProps, 'className' | 'autoRotate'>) {
  const meshRef = useRef<THREE.Mesh>(null);

  const material = (
    <meshStandardMaterial 
      color={color} 
      emissive={color} 
      emissiveIntensity={0.1}
      roughness={0.3}
      metalness={0.7}
    />
  );

  const shapes = {
    sphere: <Sphere ref={meshRef} args={[size, 32, 32]}>{material}</Sphere>,
    cube: <Box ref={meshRef} args={[size, size, size]}>{material}</Box>,
    icosahedron: <Icosahedron ref={meshRef} args={[size, 0]}>{material}</Icosahedron>
  };

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={1}
      floatingRange={[-0.2, 0.2]}
    >
      {shapes[type]}
    </Float>
  );
}

function Scene({ type, color, size, autoRotate }: Omit<Floating3DProps, 'className'>) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={color} />
      <FloatingShape type={type} color={color} size={size} />
      {autoRotate && <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />}
    </>
  );
}

export function Floating3D({ 
  className = "w-32 h-32", 
  type = "icosahedron", 
  color = "#10b981", 
  size = 1,
  autoRotate = true 
}: Floating3DProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <Scene type={type} color={color} size={size} autoRotate={autoRotate} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Pre-configured 3D elements
export function FloatingGem() {
  return <Floating3D type="icosahedron" color="#8b5cf6" className="w-24 h-24" size={0.8} />;
}

export function FloatingCube() {
  return <Floating3D type="cube" color="#3b82f6" className="w-20 h-20" size={0.7} />;
}

export function FloatingSphere() {
  return <Floating3D type="sphere" color="#10b981" className="w-28 h-28" size={1} />;
}
