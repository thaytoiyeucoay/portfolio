"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function EmotionAnalyzerSection() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ label: string; score: number }>>([]);
  const [model, setModel] = useState<string>("");

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    setErrorDetail(null);
    try {
      const resp = await fetch("/api/emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, model: model || undefined }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.error || "Request failed");
        if (data?.details) setErrorDetail(typeof data.details === "string" ? data.details : JSON.stringify(data.details));
        console.error("/api/emotion error", { status: resp.status, data });
        return;
      }
      setResults(data.results || []);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="emotion" className="mt-16 scroll-mt-24">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-2xl font-semibold"
      >
        Emotion Analyzer
      </motion.h2>

      <Card className="bg-background/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg">Nhận diện cảm xúc từ văn bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <label className="text-sm text-muted-foreground">Văn bản</label>
            <Textarea
              placeholder="Nhập đoạn văn bản (tiếng Anh cho kết quả tốt với model mặc định)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">
              Model (tuỳ chọn) — mặc định: SamLowe/roberta-base-go_emotions (có thể đổi qua input bên dưới). Gợi ý model tiếng Việt: manhhd/sentiment-vietnamese
            </label>
            <input
              className="h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50"
              placeholder="vd: manhhd/sentiment-vietnamese"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={analyze} disabled={loading || !text.trim()}>
              {loading ? "Đang phân tích..." : "Phân tích"}
            </Button>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Kết quả (top):</div>
              <div className="flex flex-wrap gap-2">
                {results.map((r) => (
                  <Badge key={r.label} variant="secondary">
                    {r.label}: {(r.score * 100).toFixed(1)}%
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
