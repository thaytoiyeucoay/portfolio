"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Score = { label: string; score: number };

export default function EmotionPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Score[] | null>(null);
  // Sử dụng 1 mô hình tốt cho emotion detection (English)
  const MODEL_ID = "j-hartmann/emotion-english-distilroberta-base";
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);
  // Dùng Hugging Face Inference API qua API route server-side

  const enEmotionViMap: Record<string, string> = {
    joy: "Vui mừng",
    sadness: "Buồn bã",
    anger: "Tức giận",
    fear: "Sợ hãi",
    love: "Yêu thương",
    surprise: "Ngạc nhiên",
    neutral: "Trung lập",
    disgust: "Ghê tởm",
  };

  // Không cần load mô hình client-side nữa.

  const samplePrompts = useMemo(
    () => [
      "I just got a promotion at work!",
      "I'm feeling really down today...",
      "This is so frustrating and annoying.",
      "Thank you so much, I appreciate your help!",
      "I’m anxious about the exam tomorrow.",
    ],
    []
  );

  const analyze = async () => {
    const payload = { text: text.trim(), modelId: MODEL_ID };
    if (!payload.text) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setLatencyMs(null);
    setUsedModel(null);
    try {
      const resp = await fetch("/api/hf-text-classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);
      const sorted = (data?.scores || []).sort((a: Score, b: Score) => b.score - a.score);
      if (typeof data?.latencyMs === 'number') setLatencyMs(data.latencyMs);
      if (typeof data?.model === 'string') setUsedModel(data.model);
      setResults(sorted);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-4xl px-6 py-10 space-y-8">
      <h1 className="text-2xl font-semibold">Emotion Analyzer (Server API)</h1>
      <Card className="bg-background/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Detect emotions from text</CardTitle>
          <CardDescription>
            Sử dụng Hugging Face Inference API qua API route server-side. Đặt biến môi trường <code>HF_API_KEY</code> trên server để gọi an toàn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {["Next.js", "TypeScript", "Transformers.js", "NLP", "Emotion"].map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted-foreground">Mô hình: </span>
            <code className="rounded bg-white/5 px-2 py-1 text-xs">{MODEL_ID}</code>
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-medium">Nhập câu cần phân tích cảm xúc</label>
            <textarea
              className="min-h-[120px] rounded-md border border-white/10 bg-background/50 p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ví dụ: I feel so happy and grateful today!"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((s, i) => (
                <Button key={i} type="button" size="sm" variant="secondary" onClick={() => setText(s)}>
                  {s}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={analyze} disabled={!text.trim() || loading}>
                {loading ? "Đang phân tích…" : "Phân tích"}
              </Button>
              <Button variant="ghost" onClick={() => { setText(""); setResults(null); setError(null); }}>Reset</Button>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Kết quả</h3>
            {results ? (
              <ul className="space-y-2">
                {results.map((r) => {
                  const lower = r.label.toLowerCase();
                  const friendly = enEmotionViMap[lower] || lower;
                  return (
                    <li key={r.label} className="rounded-md border border-white/10 p-3">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="capitalize">{friendly}</span>
                        <span>{(r.score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full rounded bg-white/10">
                        <div
                          className="h-2 rounded bg-primary"
                          style={{ width: `${Math.max(4, Math.min(100, r.score * 100))}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {results && (
              <p className="mt-2 text-xs text-muted-foreground">
                {usedModel ? (<>
                  Model: <code>{usedModel}</code>{latencyMs != null ? ` • Latency: ${latencyMs}ms` : ""}
                </>) : (latencyMs != null ? `Latency: ${latencyMs}ms` : null)}
              </p>
            )}
            <p className="text-sm text-muted-foreground">Nhập câu và bấm "Phân tích" để xem xác suất cho từng cảm xúc.</p>
          </div>

          {results && results.length > 1 && (
            <div className="rounded-lg border border-white/10 bg-background/40 p-4 text-sm">
              <h4 className="mb-2 font-medium">Vì sao dự đoán như vậy?</h4>
              {(() => {
                const top1 = results[0];
                const top2 = results[1];
                const confidence = top1.score - top2.score;
                let note = "";
                if (confidence > 0.3) note = "Mức tự tin cao (top-1 vượt xa top-2).";
                else if (confidence > 0.15) note = "Mức tự tin vừa phải (top-1 nhỉnh hơn top-2).";
                else note = "Mức tự tin thấp (top-1 sát top-2). Câu có thể mơ hồ/đa nghĩa.";
                return (
                  <p className="text-muted-foreground">
                    Nhãn mạnh nhất là <b className="capitalize">{enEmotionViMap[top1.label.toLowerCase()] || top1.label.toLowerCase()}</b> với {(top1.score * 100).toFixed(1)}%. {note}
                  </p>
                );
              })()}
            </div>
          )}

          <div className="pt-2">
            <h3 className="mb-2 text-sm font-medium">Giải thích nhanh</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li><b>Pipeline</b>: text → tokenizer → mô hình transformer → logits → softmax → xác suất từng nhãn.</li>
              <li><b>Top-k</b>: hiển thị toàn bộ nhãn với xác suất; giá trị cao nhất là dự đoán chính.</li>
              <li><b>Lưu ý</b>: câu mơ hồ/đa nghĩa và ngữ cảnh văn hóa có thể ảnh hưởng kết quả.</li>
            </ul>
          </div>

          <div className="pt-2">
            <details className="rounded-lg border border-white/10 bg-background/40 p-4">
              <summary className="cursor-pointer select-none text-sm font-semibold">Lý thuyết chi tiết</summary>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p><b>Tokenization</b>: văn bản được tách thành tokens theo từ vựng (WordPiece/BPE), ánh xạ sang IDs đầu vào.</p>
                <p><b>Transformer encoder</b>: tạo biểu diễn ngữ nghĩa bằng self-attention; lớp cuối sinh <i>logits</i> cho mỗi nhãn.</p>
                <p><b>Softmax</b>: chuẩn hoá logits thành phân phối xác suất; tổng bằng 1.0. Sự khác biệt lớn giữa top-1 và top-2 thể hiện độ tự tin.</p>
                <p><b>Hiệu năng</b>: mô hình browser dùng WebAssembly/WebGL; lần chạy đầu tải trọng số (cache), lần sau nhanh hơn.</p>
                <p><b>Giới hạn</b>: dữ liệu huấn luyện tiếng Anh; câu đa ngôn ngữ có thể kém chính xác. Có thể thay mô hình đa ngôn ngữ nếu cần.</p>
              </div>
            </details>
          </div>

          <div className="pt-2">
            <details className="rounded-lg border border-white/10 bg-background/40 p-4">
              <summary className="cursor-pointer select-none text-sm font-semibold">Performance tips</summary>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Lần chạy đầu sẽ tải trọng số mô hình từ CDN, các lần sau nhanh hơn nhờ cache.</li>
                <li>Có thể "warm-up" bằng cách chạy phân tích với một câu ngắn sau khi mở trang.</li>
                <li>Trên thiết bị yếu, hãy đóng tab nặng khác; mô hình dùng WebAssembly/WebGL.</li>
                <li>Nếu cần chạy offline, mình có thể cấu hình phục vụ trọng số từ thư mục <code>/public/</code>.</li>
              </ul>
            </details>
          </div>

          <div className="pt-2">
            <Button asChild>
              <a href="/">Back to Projects</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
