"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CatDogPage() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preds, setPreds] = useState<Array<{ className: string; probability: number }>>([]);
  const [verdict, setVerdict] = useState<"Cat" | "Dog" | "Unknown">("Unknown");

  // Lazy-load tfjs + mobilenet ở client
  const classify = async () => {
    if (!imgRef.current) return;
    setLoading(true);
    setError(null);
    setPreds([]);
    setVerdict("Unknown");
    try {
      // Load TFJS to register backend + mobilenet model
      const tf = await import("@tensorflow/tfjs");
      if (tf?.setBackend) {
        try {
          await tf.setBackend("webgl");
          await tf.ready();
        } catch {}
      }
      const mobilenet = await import("@tensorflow-models/mobilenet");
      // Load model (smaller version for tốc độ)
      const model = await mobilenet.load({ version: 2, alpha: 0.5 });
      const results = await model.classify(imgRef.current!);
      setPreds(results);
      // Suy luận mèo/chó từ className (MobileNet có nhiều nhãn liên quan)
      const top = results[0]?.className?.toLowerCase() || "";
      const isCat = /(\bcat\b|siamese|persian|tabby|tiger cat|lynx|cheetah|leopard)/i.test(top);
      const isDog = /(\bdog\b|puppy|terrier|retriever|bulldog|husky|poodle|shepherd|shiba|corgi)/i.test(top);
      if (isCat && !isDog) setVerdict("Cat");
      else if (isDog && !isCat) setVerdict("Dog");
      else {
        // Nếu top-1 mơ hồ, check top-3
        const joined = results.map((r: any) => r.className.toLowerCase()).join("; ");
        const anyCat = /(\bcat\b|siamese|persian|tabby|tiger cat|lynx|cheetah|leopard)/i.test(joined);
        const anyDog = /(\bdog\b|puppy|terrier|retriever|bulldog|husky|poodle|shepherd|shiba|corgi)/i.test(joined);
        if (anyCat && !anyDog) setVerdict("Cat");
        else if (anyDog && !anyCat) setVerdict("Dog");
        else setVerdict("Unknown");
      }
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    // Clear previous state
    setPreds([]);
    setVerdict("Unknown");
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
  }, [imgUrl]);

  return (
    <main className="container mx-auto max-w-4xl px-6 py-10 space-y-8">
      <h1 className="text-2xl font-semibold">Cat vs Dog Classifier</h1>
      <Card className="bg-background/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Phân loại mèo/chó từ ảnh</CardTitle>
          <CardDescription>Chạy hoàn toàn trên trình duyệt bằng TensorFlow.js + MobileNet (no server, no key)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input type="file" accept="image/*" onChange={onFileChange} />
            <Button onClick={classify} disabled={!imgUrl || loading}>
              {loading ? "Đang phân loại..." : "Phân loại"}
            </Button>
            <Button asChild variant="secondary">
              <a href="/">Back to Projects</a>
            </Button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 grid gap-6 sm:grid-cols-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-white/10">
              {imgUrl ? (
                // Dùng thẻ img thường cho mobilenet.classify
                // eslint-disable-next-line @next/next/no-img-element
                <img ref={imgRef} src={imgUrl} alt="preview" className="h-full w-full object-contain bg-muted/20" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Chọn ảnh để xem preview</div>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Kết quả</h3>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm">Verdict:</span>
                <Badge variant="secondary">{verdict}</Badge>
              </div>
              {preds.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {preds.map((p, idx) => (
                    <li key={idx} className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2">
                      <span className="pr-3">{p.className}</span>
                      <Badge variant="outline">{(p.probability * 100).toFixed(1)}%</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có kết quả. Tải ảnh và bấm "Phân loại".</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
