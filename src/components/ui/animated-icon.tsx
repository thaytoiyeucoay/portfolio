"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
  animation?: "float" | "bounce" | "pulse" | "spin" | "shake";
  color?: "emerald" | "blue" | "purple" | "yellow" | "pink";
  glowEffect?: boolean;
}

export function AnimatedIcon({ 
  icon: Icon, 
  className, 
  size = 24, 
  animation = "float",
  color = "emerald",
  glowEffect = false
}: AnimatedIconProps) {
  const colorClasses = {
    emerald: "text-emerald-400",
    blue: "text-blue-400", 
    purple: "text-purple-400",
    yellow: "text-yellow-400",
    pink: "text-pink-400"
  };

  const getAnimation = () => {
    switch (animation) {
      case "float":
        return {
          y: [-10, 10, -10],
          transition: { duration: 4, repeat: Infinity }
        };
      case "bounce":
        return {
          y: [0, -20, 0],
          transition: { duration: 2, repeat: Infinity }
        };
      case "pulse":
        return {
          scale: [1, 1.2, 1],
          transition: { duration: 2, repeat: Infinity }
        };
      case "spin":
        return {
          rotate: 360,
          transition: { duration: 3, repeat: Infinity }
        };
      case "shake":
        return {
          x: [-5, 5, -5, 5, 0],
          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3 }
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      animate={getAnimation()}
      className={cn(
        "inline-block",
        colorClasses[color],
        glowEffect && "drop-shadow-lg",
        className
      )}
    >
      <Icon size={size} />
    </motion.div>
  );
}

// Predefined animated icon sets for quick use
export function FloatingBrainIcon(props: Omit<AnimatedIconProps, 'icon' | 'animation'>) {
  return <AnimatedIcon icon={require("lucide-react").Brain} animation="float" {...props} />;
}

export function SpinningCpuIcon(props: Omit<AnimatedIconProps, 'icon' | 'animation'>) {
  return <AnimatedIcon icon={require("lucide-react").Cpu} animation="spin" {...props} />;
}

export function PulsingZapIcon(props: Omit<AnimatedIconProps, 'icon' | 'animation'>) {
  return <AnimatedIcon icon={require("lucide-react").Zap} animation="pulse" {...props} />;
}
