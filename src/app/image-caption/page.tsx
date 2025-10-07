"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Copy, Check, Upload, Image as ImgIcon, Tag, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default function ImageCaptionPage() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<Array<{ text: string; score?: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function onPick() {
    inputRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(url);
    setFileName(f.name);
    setCaption("");
    setTags([]);
    setError(null);
    // Send multipart
    const form = new FormData();
    form.append("file", f);
    analyze(form);
  }

  async function analyze(body: FormData | string) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/caption", {
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify({ imageUrl: body }) as any,
        headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "API error");
      setCaption(data.data.caption);
      const base = Array.isArray(data.data.tags) ? data.data.tags : [];
      // auto-append common tags for discoverability
      const extra = ["ai", "photo"]; // tránh trùng, giữ đến 8 tag
      const merged = Array.from(new Set([...base, ...extra])).slice(0, 8);
      setTags(merged);
      setCandidates(Array.isArray(data.data.candidates) ? data.data.candidates : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    const text = `${caption}\n#${tags.join(" #")}`.trim();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 1200);
    });
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-3xl font-bold text-transparent flex items-center gap-3">
            <ImgIcon className="h-8 w-8 text-emerald-400" /> Image Captioning & Tags
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Tải ảnh hoặc dán URL để sinh mô tả và gợi ý hashtag đăng mạng xã hội.</p>
        </div>
        <div>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href="/">
              <ArrowLeft className="size-4" /> Về trang chủ
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Uploader */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="border-white/10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader>
              <CardTitle className="text-base">Ảnh đầu vào</CardTitle>
              <CardDescription>Hỗ trợ kéo-thả, chọn file hoặc dán URL trực tiếp.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <input type="file" accept="image/*" ref={inputRef} className="hidden" onChange={onFile} />
              <div
                role="button"
                onClick={onPick}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) {
                    const url = URL.createObjectURL(f);
                    if (imgUrl) URL.revokeObjectURL(imgUrl);
                    setImgUrl(url);
                    setFileName(f.name);
                    setCaption("");
                    setTags([]);
                    setError(null);
                    const form = new FormData();
                    form.append("file", f);
                    analyze(form);
                  }
                }}
                className={cn(
                  "rounded-xl border border-dashed border-white/15 bg-gradient-to-b from-white/5 to-transparent p-5 text-sm text-muted-foreground transition-colors text-center",
                  dragOver && "border-emerald-400/50 bg-emerald-500/10"
                )}
              >
                <Upload className="inline-block mr-2 size-4"/> Kéo-thả hoặc chọn ảnh từ máy
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Dán URL ảnh..." onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      setImgUrl(val);
                      analyze(val);
                    }
                  }
                }} />
                <Button variant="secondary" size="sm" onClick={() => {
                  const el = document.querySelector<HTMLInputElement>('input[placeholder="Dán URL ảnh..."]');
                  const val = el?.value.trim();
                  if (val) {
                    setImgUrl(val);
                    analyze(val);
                  }
                }}>Phân tích</Button>
              </div>
              {imgUrl && (
                <div className="rounded-md border border-white/10 p-2 text-xs text-muted-foreground break-all">{fileName || imgUrl}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Result */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="border-white/10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Sparkles className="size-4"/> Kết quả</CardTitle>
              <CardDescription>{loading ? "Đang phân tích ảnh..." : "Mô tả ảnh và gợi ý hashtag"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl} alt="preview" className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Chưa có ảnh</div>
                  )}
                </div>
                <div className="space-y-4">
                  <section>
                    <div className="text-sm font-medium mb-1">Caption</div>
                    {loading ? (
                      <div className="rounded-xl border border-white/10 p-3 text-sm min-h-[84px] bg-black/20">
                        <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
                        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-white/10" />
                      </div>
                    ) : (
                      <textarea
                        rows={4}
                        className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                        placeholder="Chưa có kết quả."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                      />
                    )}
                  </section>
                  <section>
                    <div className="text-sm font-medium mb-1">Hashtags</div>
                    {loading ? (
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="h-6 w-16 animate-pulse rounded bg-white/10" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {tags.length ? tags.map((t) => (
                          <Badge key={t} variant="secondary">#{t}</Badge>
                        )) : <span className="text-sm text-muted-foreground">Chưa có</span>}
                      </div>
                    )}
                  </section>
                  {candidates.length > 1 && (
                    <section className="space-y-2">
                      <div className="text-sm font-medium">Độ tự tin (nhiều phương án)</div>
                      <div className="space-y-2">
                        {candidates.slice(0,5).map((c, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-[12px] opacity-80">
                              <span className="truncate pr-2">{c.text}</span>
                              {typeof c.score === 'number' && <span>{Math.round(c.score*100)}%</span>}
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((c.score || 0.5)*100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  <section className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" onClick={copyAll} className="gap-2">
                            <Copy className="size-4"/> Copy caption + tags
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Sao chép dùng cho mạng xã hội</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {copied && <span className="text-xs text-muted-foreground">Đã sao chép!</span>}
                    {error && <span className="text-xs text-red-400">{error}</span>}
                  </section>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
