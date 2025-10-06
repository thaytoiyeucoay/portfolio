"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projects as allProjects } from "@/data/projects";
import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Smile, Frown, Angry, Heart, Laugh, Meh, AlertTriangle, CheckCircle2, XCircle, PartyPopper, Zap, Brain, Cloud, Star, ThumbsUp, ThumbsDown, Tag, Bot, Github, Link as LinkIcon, BookOpen, Layers } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FloatingCube } from "@/components/ui/floating-3d";
import { AnimatedIcon } from "@/components/ui/animated-icon";

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

  // Inline: Chatbot RAG (UI-only)
  const [ragQ, setRagQ] = useState("");
  const [ragLoading, setRagLoading] = useState(false);
  const [ragError, setRagError] = useState<string | null>(null);
  const [ragAns, setRagAns] = useState("");
  const [ragCitations, setRagCitations] = useState<Array<{ title: string }>>([]);

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

  // Inline: Cat vs Dog classifier
  const [cdImgUrl, setCdImgUrl] = useState<string | null>(null);
  const [cdLoading, setCdLoading] = useState(false);
  const [cdError, setCdError] = useState<string | null>(null);
  const [cdPreds, setCdPreds] = useState<Array<{ className: string; probability: number }>>([]);
  const [cdVerdict, setCdVerdict] = useState<"Cat" | "Dog" | "Unknown">("Unknown");
  const cdInputRef = useRef<HTMLInputElement | null>(null);
  const [cdFileName, setCdFileName] = useState<string>("");

  const askRag = async () => {
    if (!ragQ.trim()) return;
    setRagLoading(true);
    setRagError(null);
    setRagAns("");
    setRagCitations([]);
    // UI-only: fake a response
    setTimeout(() => {
      setRagAns(
        "Đây là câu trả lời mẫu từ Chatbot RAG dựa trên tài liệu của bạn. Khi tích hợp backend, câu trả lời sẽ đính kèm trích dẫn chi tiết."
      );
      setRagCitations([{ title: "product-guide.pdf" }, { title: "faq.md" }]);
      setRagLoading(false);
    }, 600);
  };

  const onCdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (cdImgUrl) URL.revokeObjectURL(cdImgUrl);
    setCdImgUrl(url);
    setCdFileName(file.name);
    setCdPreds([]);
    setCdVerdict("Unknown");
    setCdError(null);
  };

  const classifyCatDog = async () => {
    if (!cdImgUrl) return;
    setCdLoading(true);
    setCdError(null);
    setCdPreds([]);
    setCdVerdict("Unknown");
    try {
      const tf = await import("@tensorflow/tfjs");
      if (tf?.setBackend) {
        try {
          await tf.setBackend("webgl");
          await tf.ready();
        } catch {}
      }
      const mobilenet = await import("@tensorflow-models/mobilenet");
      const model = await mobilenet.load({ version: 2, alpha: 0.5 });
      // Create a transient image element for classification (avoid conflict with next/image)
      const img = document.createElement('img');
      img.src = cdImgUrl;
      await new Promise((res, rej) => { img.onload = () => res(null as any); img.onerror = rej; });
      const results = await model.classify(img as HTMLImageElement);
      setCdPreds(results as any);
      const top = (results as any)[0]?.className?.toLowerCase() || "";
      const isCat = /(\bcat\b|siamese|persian|tabby|tiger cat|lynx|cheetah|leopard)/i.test(top);
      const isDog = /(\bdog\b|puppy|terrier|retriever|bulldog|husky|poodle|shepherd|shiba|corgi)/i.test(top);
      if (isCat && !isDog) setCdVerdict("Cat");
      else if (isDog && !isCat) setCdVerdict("Dog");
      else {
        const joined = (results as any).map((r: any) => r.className.toLowerCase()).join("; ");
        const anyCat = /(\bcat\b|siamese|persian|tabby|tiger cat|lynx|cheetah|leopard)/i.test(joined);
        const anyDog = /(\bdog\b|puppy|terrier|retriever|bulldog|husky|poodle|shepherd|shiba|corgi)/i.test(joined);
        if (anyCat && !anyDog) setCdVerdict("Cat");
        else if (anyDog && !anyCat) setCdVerdict("Dog");
        else setCdVerdict("Unknown");
      }
    } catch (e: any) {
      setCdError(String(e?.message || e));
    } finally {
      setCdLoading(false);
    }
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
    <section id="projects" className="mt-16 scroll-mt-24 relative">
      {/* Floating 3D Element */}
      <div className="absolute -top-10 right-0 -z-10 opacity-15">
        <FloatingCube />
      </div>
      
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-2xl font-semibold flex items-center gap-3"
      >
        <AnimatedIcon icon={Layers} animation="spin" color="blue" size={32} />
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
                    <Card className="relative h-full overflow-hidden bg-gradient-to-br from-background to-background/80 border border-white/10 rounded-2xl shadow-xl backdrop-blur-sm transition-all hover:ring-2 hover:ring-emerald-400/40 hover:shadow-emerald-500/20 group">
                      {/* Project image with consistent aspect ratio */}
                      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                        <img
                          src="/emotiondetection.png"
                          alt="Emotion Detection"
                          className="h-full w-full object-contain p-6 transition-transform duration-200 group-hover:scale-105"
                        />
                        {/* Status badge */}
                        <div className="absolute left-3 top-3">
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            LIVE
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">Emotion Detection</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          Real-time text emotion analysis using Hugging Face Transformers API
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">Hugging Face</Badge>
                          <Badge variant="outline" className="text-xs">NLP</Badge>
                          <Badge variant="outline" className="text-xs">React</Badge>
                        </div>
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
                        
                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-4">
                          <Button asChild size="sm" variant="outline" className="gap-2">
                            <a href="/emotion" target="_blank">
                              <ExternalLink className="size-4" /> Try Live
                            </a>
                          </Button>
                          <Button asChild size="sm" variant="ghost" className="gap-2">
                            <a href="https://github.com/thaytoiyeucoay" target="_blank">
                              <Github className="size-4" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                {/* Interactive: Chatbot RAG mini card */}
                <motion.div
                  key="Chatbot RAG"
                  className="group"
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 4 }}
                >
                  <div>
                    <Card className="relative h-full overflow-hidden bg-gradient-to-br from-background to-background/80 border border-white/10 rounded-2xl shadow-xl backdrop-blur-sm transition-all hover:ring-2 hover:ring-blue-400/40 hover:shadow-blue-500/20 group">
                      {/* Project image with consistent aspect ratio */}
                      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <img
                          src="/projects/ai-chatbot.svg"
                          alt="Chatbot RAG"
                          className="h-full w-full object-contain p-6 transition-transform duration-200 group-hover:scale-105"
                        />
                        {/* Status badge */}
                        <div className="absolute left-3 top-3">
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                            LIVE
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <Bot className="size-5" /> Chatbot RAG
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          Document-based question answering system with RAG architecture
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">RAG</Badge>
                          <Badge variant="outline" className="text-xs">LLM</Badge>
                          <Badge variant="outline" className="text-xs">Vector DB</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Textarea
                          placeholder="Đặt câu hỏi nhanh..."
                          value={ragQ}
                          onChange={(e) => setRagQ(e.target.value)}
                          rows={2}
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={askRag} disabled={ragLoading || !ragQ.trim()}>
                            {ragLoading ? "Đang suy nghĩ..." : "Hỏi"}
                          </Button>
                          {ragError && <span className="text-xs text-red-400">{ragError}</span>}
                        </div>
                        {ragAns && (
                          <div className="rounded-md border border-white/10 p-2 text-xs text-muted-foreground">
                            {ragAns}
                            {ragCitations.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {ragCitations.map((c) => (
                                  <Badge key={c.title} variant="outline">{c.title}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-4">
                          <Button asChild size="sm" variant="outline" className="gap-2">
                            <a href="/chatbot-rag" target="_blank">
                              <ExternalLink className="size-4" /> Try Live
                            </a>
                          </Button>
                          <Button asChild size="sm" variant="ghost" className="gap-2">
                            <a href="https://github.com/thaytoiyeucoay" target="_blank">
                              <Github className="size-4" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                {/* Interactive: Cat vs Dog Classifier card */}
                <motion.div
                  key="CatDog"
                  className="group"
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 4 }}
                >
                  <div>
                    <Card className="relative h-full overflow-hidden bg-gradient-to-br from-background to-background/80 border border-white/10 rounded-2xl shadow-xl backdrop-blur-sm transition-all hover:ring-2 hover:ring-purple-400/40 hover:shadow-purple-500/20 group">
                      {/* Project image with consistent aspect ratio */}
                      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                        <img
                          src="/projects/cat-dog.svg"
                          alt="Cat vs Dog Classifier"
                          className="h-full w-full object-contain p-6 transition-transform duration-200 group-hover:scale-105"
                        />
                        {/* Status badge */}
                        <div className="absolute left-3 top-3">
                          <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                            LIVE
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">Cat vs Dog Classifier</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          Real-time image classification using TensorFlow.js and MobileNet running in browser
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">TensorFlow.js</Badge>
                          <Badge variant="outline" className="text-xs">MobileNet</Badge>
                          <Badge variant="outline" className="text-xs">Computer Vision</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <input
                          ref={cdInputRef}
                          type="file"
                          accept="image/*"
                          onChange={onCdFile}
                          className="hidden"
                        />
                        <div
                          role="button"
                          onClick={() => cdInputRef.current?.click()}
                          className="rounded-md border border-dashed border-white/15 bg-muted/10 p-3 text-xs text-muted-foreground hover:bg-muted/20 transition-colors"
                        >
                          {cdFileName ? (
                            <div className="flex items-center justify-between">
                              <span className="truncate" title={cdFileName}>{cdFileName}</span>
                              <span className="opacity-70">Nhấn để đổi ảnh</span>
                            </div>
                          ) : (
                            <div className="text-center">Nhấn để chọn ảnh (jpg, png...)</div>
                          )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="relative aspect-square w-full overflow-hidden rounded-md border border-white/10 bg-muted/10">
                            {cdImgUrl ? (
                              <img src={cdImgUrl} alt="preview" className="h-full w-full object-contain" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Chưa có ảnh</div>
                            )}
                          </div>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="opacity-80">Kết luận:</span>
                              <Badge variant="secondary" className="text-xs">{cdVerdict}</Badge>
                            </div>
                            <div className="space-y-2">
                              {cdPreds.slice(0, 3).map((p, i) => (
                                <div key={i} className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="truncate pr-3">{p.className}</span>
                                    <span className="opacity-70">{(p.probability * 100).toFixed(1)}%</span>
                                  </div>
                                  <Progress
                                    value={Math.round(p.probability * 100)}
                                    className="bg-emerald-500/20 h-2 rounded-full"
                                    indicatorClassName="bg-emerald-500"
                                  />
                                </div>
                              ))}
                              {cdPreds.length === 0 && (
                                <div className="text-xs text-muted-foreground">Chưa có kết quả. Tải ảnh và nhấn "Phân loại".</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" onClick={classifyCatDog} disabled={!cdImgUrl || cdLoading}>
                                {cdLoading ? "Đang phân loại..." : "Phân loại"}
                              </Button>
                              {cdError && <span className="text-xs text-red-400">{cdError}</span>}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-4">
                          <Button asChild size="sm" variant="outline" className="gap-2">
                            <a href="/cat-dog" target="_blank">
                              <ExternalLink className="size-4" /> Try Live
                            </a>
                          </Button>
                          <Button asChild size="sm" variant="ghost" className="gap-2">
                            <a href="https://github.com/thaytoiyeucoay" target="_blank">
                              <Github className="size-4" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
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
                    <Card className="relative h-full overflow-hidden bg-gradient-to-br from-background to-background/80 border border-white/10 rounded-2xl shadow-xl backdrop-blur-sm transition-all hover:ring-2 hover:ring-white/20 hover:shadow-white/5 group">
                        {/* Status badge */}
                        {p.status && (
                          <div className="absolute left-3 top-3 z-10">
                            <Badge variant={p.status === "live" ? "secondary" : "outline"} className="uppercase">
                              {p.status}
                            </Badge>
                          </div>
                        )}

                        <div className="relative aspect-video w-full overflow-hidden">
                          <Image
                            src={p.img}
                            alt={p.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain p-6 transition-transform duration-200 group-hover:scale-105"
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

                        {/* Hover overlay with metrics and actions */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          {/* Metrics */}
                          {p.metrics && p.metrics.length > 0 && (
                            <div className="pointer-events-none mx-4 grid max-w-xs grid-cols-2 gap-2 text-xs">
                              <TooltipProvider>
                                {p.metrics.map((m, i) => (
                                  <Tooltip key={i}>
                                    <TooltipTrigger asChild>
                                      <div className="pointer-events-auto rounded-md border border-white/15 bg-white/10 px-2 py-1 backdrop-blur">
                                        <div className="opacity-80">{m.label}</div>
                                        <div className="text-sm font-semibold">{m.value}</div>
                                      </div>
                                    </TooltipTrigger>
                                    {m.tooltip && <TooltipContent>{m.tooltip}</TooltipContent>}
                                  </Tooltip>
                                ))}
                              </TooltipProvider>
                            </div>
                          )}

                          {/* Quick Actions */}
                          <div className="pointer-events-auto mt-1 flex items-center gap-2">
                            {p.repo && (
                              <Button asChild size="sm" variant="outline" className="gap-2">
                                <a href={p.repo} target="_blank" rel="noopener noreferrer">
                                  <Github className="size-4" /> GitHub
                                </a>
                              </Button>
                            )}
                            {p.live && (
                              <Button asChild size="sm" variant="secondary" className="gap-2">
                                <a href={p.live} target="_blank" rel="noopener noreferrer">
                                  <LinkIcon className="size-4" /> Live
                                </a>
                              </Button>
                            )}
                            {p.caseStudy && (
                              <Button asChild size="sm" variant="outline" className="gap-2">
                                <a href={p.caseStudy}>
                                  <BookOpen className="size-4" /> Case Study
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
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
