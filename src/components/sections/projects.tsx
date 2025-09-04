"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projects as allProjects } from "@/data/projects";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Smile, Frown, Angry, Heart, HelpCircle, Laugh, Meh, AlertTriangle, CheckCircle2, XCircle, PartyPopper, Zap, Brain, Sun, Cloud, Star, ThumbsUp, ThumbsDown, Tag } from "lucide-react";

const categories = ["All", "AI", "Web", "Data"] as const;

export function ProjectsSection() {
  const [tab, setTab] = useState<(typeof categories)[number]>("All");
  const filtered = useMemo(
    () => (tab === "All" ? allProjects : allProjects.filter((p) => p.category === tab)),
    [tab]
  );

  // Inline mini emotion analyzer for the Projects grid
  const [emoText, setEmoText] = useState("");
  const [emoLoading, setEmoLoading] = useState(false);
  const [emoError, setEmoError] = useState<string | null>(null);
  const [emoResults, setEmoResults] = useState<Array<{ label: string; score: number }>>([]);

  useEffect(() => {
    if (!emoText.trim()) {
      setEmoResults([]);
      setEmoError(null);
    }
  }, [emoText]);

  const labelIcon = (label: string) => {
    const key = label.toLowerCase();
    // Common mapping for GoEmotions-style labels
    if (["joy", "amusement", "excitement", "admiration", "optimism", "relief"].includes(key)) return <Smile className="size-3.5" />;
    if (["love", "caring", "gratitude"].includes(key)) return <Heart className="size-3.5" />;
    if (["anger", "annoyance"].includes(key)) return <Angry className="size-3.5" />;
    if (["sadness", "grief", "disappointment"].includes(key)) return <Frown className="size-3.5" />;
    if (["approval", "pride"].includes(key)) return <ThumbsUp className="size-3.5" />;
    if (["disapproval", "remorse"].includes(key)) return <ThumbsDown className="size-3.5" />;
    if (["surprise", "realization"].includes(key)) return <PartyPopper className="size-3.5" />;
    if (["fear", "nervousness"].includes(key)) return <AlertTriangle className="size-3.5" />;
    if (["confidence"].includes(key)) return <CheckCircle2 className="size-3.5" />;
    if (["disgust"].includes(key)) return <XCircle className="size-3.5" />;
    if (["amusement", "excitement"].includes(key)) return <Laugh className="size-3.5" />;
    if (["curiosity"].includes(key)) return <Brain className="size-3.5" />;
    if (["neutral"].includes(key)) return <Meh className="size-3.5" />;
    if (["gratitude"].includes(key)) return <Star className="size-3.5" />;
    if (["embarrassment"].includes(key)) return <Cloud className="size-3.5" />;
    if (["excitement"].includes(key)) return <Zap className="size-3.5" />;
    return <Tag className="size-3.5" />;
  };

  const analyzeEmotions = async () => {
    if (!emoText.trim()) return;
    setEmoLoading(true);
    setEmoError(null);
    setEmoResults([]);
    try {
      const resp = await fetch("/api/emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: emoText }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setEmoError(data?.error || "Request failed");
      } else {
        setEmoResults(Array.isArray(data?.results) ? data.results : []);
      }
    } catch (e: any) {
      setEmoError(String(e));
    } finally {
      setEmoLoading(false);
    }
  };

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
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {/* Interactive: Emotion Detection project card */}
                <motion.div
                  key="Emotion Detection"
                  className="group"
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 4 }}
                >
                  <div>
                    <Card className="relative h-full overflow-hidden bg-background border border-white/10 rounded-xl shadow-sm">
                      {/* Persistent action button at top-right */}
                      <div className="absolute right-3 top-3 z-10">
                        <Button asChild size="sm" variant="secondary" className="gap-2">
                          <a href="/emotion">
                            Full Project <ExternalLink className="size-4" />
                          </a>
                        </Button>
                      </div>
                      <div className="relative h-56 w-full overflow-hidden rounded-md">
                        <Image
                          src="/emotiondetection.png"
                          alt="Emotion Detection"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-base">Emotion Detection</CardTitle>
                        <CardDescription>Powered by Hugging Face Inference API</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Textarea
                          placeholder="Nhập văn bản (tiếng Anh cho model mặc định)..."
                          value={emoText}
                          onChange={(e) => setEmoText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={analyzeEmotions} disabled={emoLoading || !emoText.trim()}>
                            {emoLoading ? "Đang phân tích..." : "Phân tích"}
                          </Button>
                          {emoError && (
                            <span className="text-xs text-red-400">{emoError}</span>
                          )}
                        </div>
                        {emoText.trim() && emoResults.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {emoResults.map((r) => (
                              <Badge key={r.label} variant="secondary" className="flex items-center gap-1">
                                {labelIcon(r.label)}
                                <span className="capitalize">{r.label}</span>
                                <span className="opacity-70">{(r.score * 100).toFixed(1)}%</span>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>

                      {/* Removed hover overlay */}
                    </Card>
                  </div>
                </motion.div>
                {(c === "All" ? allProjects : allProjects.filter((p) => p.category === c)).map((p) => (
                  <motion.div
                    key={p.title}
                    className="group"
                    layout
                    initial={{ opacity: 0, scale: 0.98, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 4 }}
                  >
                    <div>
                      <Card className="relative h-full overflow-hidden bg-background border border-white/10 rounded-xl shadow-sm transition-transform duration-150 ease-out hover:translate-y-[2px] hover:ring-1 hover:ring-white/15">
                        <div className="relative h-40 w-full overflow-hidden">
                          <Image
                            src={p.img}
                            alt={p.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain p-6 transition-transform duration-200"
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
                    </div>
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
