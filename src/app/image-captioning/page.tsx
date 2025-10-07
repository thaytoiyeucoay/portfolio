"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
export const dynamic = 'force-dynamic';

export default function ImageCaptioningPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string>("standard");
  const [samples, setSamples] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const candidates = [
      "/samples/captioning/street.jpg",
      "/samples/captioning/mountain.jpg",
      "/samples/captioning/room.jpg",
      "/samples/captioning/food.jpg",
      "/samples/captioning/pet.jpg",
    ];
    const probe = async () => {
      const found: string[] = [];
      await Promise.all(
        candidates.map(async (url) => {
          try {
            const res = await fetch(url, { method: "GET" });
            if (res.ok) found.push(url);
          } catch {}
        })
      );
      if (!cancelled) setSamples(found);
    };
    probe();
    return () => { cancelled = true; };
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    const url = URL.createObjectURL(f);
    setImageUrl(url);
    setFileName(f.name);
    setCaption("");
    setError(null);
  };

  const captionIt = async () => {
    const f = inputRef.current?.files?.[0] || null;
    const sampleUrl = !f && imageUrl && imageUrl.startsWith("/samples/") ? imageUrl : null;
    if (!f && !sampleUrl) return;
    setLoading(true);
    setError(null);
    setCaption("");
    setLatencyMs(null);
    setModel(null);
    try {
      const fd = new FormData();
      if (f) {
        fd.append("image", f);
      } else if (sampleUrl) {
        const blob = await fetch(sampleUrl).then(r => r.blob());
        fd.append("image", blob, sampleUrl.split("/").pop() || "sample.jpg");
      }
      fd.append("modelId", modelId);
      const resp = await fetch("/api/hf-image-caption", {
        method: "POST",
        body: fd,
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);
      setCaption(String(data?.caption || ""));
      if (typeof data?.latencyMs === "number") setLatencyMs(data.latencyMs);
      if (typeof data?.model === "string") setModel(data.model);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-4xl px-6 py-10 space-y-8">
      <h1 className="text-2xl font-semibold">Image Captioning (Server API)</h1>
      <Card className="bg-background/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Describe images with AI</CardTitle>
          <CardDescription>
            Sử dụng Hugging Face Inference API qua API route server-side. Đặt biến môi trường <code>HF_API_KEY</code> trên server để gọi an toàn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {["Next.js", "TypeScript", "Hugging Face", "ViT+GPT2", "CV"].map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>

          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-muted-foreground">Chọn mô hình</span>
              <select
                className="rounded-md border border-white/10 bg-background/50 p-2 outline-none focus:ring-2 focus:ring-primary"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
              >
                <option value="fast">Nhanh (BLIP-base)</option>
                <option value="standard">Chuẩn (ViT-GPT2)</option>
                <option value="xl">Xịn (BLIP-large)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  className="hidden"
                />
                <Button variant="outline" onClick={() => inputRef.current?.click()}>Chọn ảnh</Button>
                <span className="truncate text-xs text-muted-foreground max-w-[240px]" title={fileName}>
                  {fileName || "Chưa chọn ảnh"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button className="whitespace-nowrap" onClick={captionIt} disabled={!imageUrl || loading}>
                  {loading ? "Đang mô tả..." : "Tạo caption"}
                </Button>
                <Button variant="ghost" onClick={() => { setImageUrl(null); setFileName(""); setCaption(""); setError(null); }}>Reset</Button>
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}

            {/* Sample gallery */}
            <div className="rounded-lg border border-white/10 bg-background/40 p-3">
              <div className="mb-2 text-sm font-medium">Ảnh mẫu</div>
              {samples.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {samples.map((s) => (
                    <button
                      key={s}
                      className={`overflow-hidden rounded border border-white/10 transition hover:ring-1 hover:ring-white/20 ${imageUrl===s?"ring-1 ring-primary":""}`}
                      onClick={() => { setImageUrl(s); setFileName(s.split('/').pop()||""); setCaption(""); setError(null); if (inputRef.current) inputRef.current.value = ""; }}
                      title={s}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s} alt={s} className="h-20 w-20 object-cover" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/file.svg'}} />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Đặt ảnh vào thư mục /public/samples/captioning/ để hiển thị tại đây.</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative aspect-square w-full overflow-hidden rounded-md border border-white/10">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="preview" className="h-full w-full object-contain bg-muted/20" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Chọn ảnh để xem preview</div>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium">Kết quả</h3>
                <div className="rounded-md border border-white/10 p-3 text-sm min-h-[80px] bg-background/40">
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
                      <div className="h-2 w-full animate-pulse rounded bg-white/10" />
                      <div className="h-2 w-5/6 animate-pulse rounded bg-white/10" />
                    </div>
                  ) : caption ? (
                    <p className="leading-relaxed">{caption}</p>
                  ) : (
                    <p className="text-muted-foreground">Chưa có kết quả</p>
                  )}
                </div>
                {(model || latencyMs != null) && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {model ? (<>
                      Model: <code>{model}</code>{latencyMs != null ? ` • Latency: ${latencyMs}ms` : ""}
                    </>) : (latencyMs != null ? `Latency: ${latencyMs}ms` : null)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-background/40 p-4 text-sm">
            <h4 className="mb-2 font-medium">Lý thuyết chi tiết</h4>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li><b>Kiến trúc</b>: backbone thị giác (ViT/CNN) trích xuất đặc trưng ảnh → decoder ngôn ngữ (GPT2/Transformer) sinh câu mô tả.</li>
              <li><b>Tiền xử lý</b>: resize/center crop, chuẩn hóa ảnh; tokenizer cho decoder.</li>
              <li><b>Giải mã</b>: greedy/beam search; có thể kèm <i>length penalty</i>, <i>no repeat ngram</i>.</li>
              <li><b>Hạn chế</b>: không hiểu ngữ cảnh bên ngoài ảnh; vật thể nhỏ/che khuất có thể bị bỏ sót.</li>
              <li><b>Mẹo</b>: nén ảnh về ~512px để tăng tốc; cache kết quả theo hash ảnh nếu cần.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
