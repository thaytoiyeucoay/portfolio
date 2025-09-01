"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projects as allProjects } from "@/data/projects";
import { Card3D } from "@/components/ui/card-3d";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const categories = ["All", "AI", "Web", "Data"] as const;

export function ProjectsSection() {
  const [tab, setTab] = useState<(typeof categories)[number]>("All");
  const filtered = useMemo(
    () => (tab === "All" ? allProjects : allProjects.filter((p) => p.category === tab)),
    [tab]
  );

  return (
    <section id="projects" className="mt-16 scroll-mt-24">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-2xl font-semibold"
      >
        Projects
      </motion.h2>

      <Tabs value={tab} onValueChange={(v: string) => setTab(v as any)} className="w-full">
        <TabsList className="mb-6">
          {categories.map((c) => (
            <TabsTrigger key={c} value={c}>
              {c}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map((c) => (
          <TabsContent key={c} value={c}>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(c === "All" ? allProjects : allProjects.filter((p) => p.category === c)).map((p) => (
                  <motion.div
                    key={p.title}
                    className="group"
                    layout
                    initial={{ opacity: 0, scale: 0.98, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 4 }}
                  >
                    <Card3D className="will-change-transform" intensity={6} perspective={800} scaleOnHover>
                      <Card className="relative h-full overflow-hidden bg-background/60 backdrop-blur-xl">
                        <div className="relative h-40 w-full overflow-hidden">
                          <Image
                            src={p.img}
                            alt={p.title}
                            fill
                            className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-base">{p.title}</CardTitle>
                          <CardDescription>{p.desc}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {p.tags.map((t) => (
                              <Badge key={t} variant="outline">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>

                        {/* Overlay reveal */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <div className="pointer-events-auto">
                            <Button asChild size="sm" variant="secondary" className="gap-2">
                              <a href={p.link} target="_blank" rel="noopener noreferrer">
                                Open <ExternalLink className="size-4" />
                              </a>
                            </Button>
                          </div>
                          <div className="mx-6 flex max-w-xs flex-wrap justify-center gap-2">
                            {p.tags.slice(0, 4).map((t) => (
                              <Badge key={t} variant="secondary" className="pointer-events-none">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </Card3D>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
