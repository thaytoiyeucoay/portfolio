"use client";

import { usePathname } from "next/navigation";
import { ParticlesBackground } from "@/components/particles-background";

/**
 * Render particles on most pages, but disable on content-heavy routes
 * to avoid visual clutter and interaction overlap.
 */
export function RouteAwareParticles() {
  const pathname = usePathname();
  const hideOn = [
    /^\/insights\//, // insight reader pages
  ];
  const shouldHide = hideOn.some((re) => re.test(pathname || ""));

  if (shouldHide) return null;
  return <ParticlesBackground className="fixed inset-0 z-0" />;
}
