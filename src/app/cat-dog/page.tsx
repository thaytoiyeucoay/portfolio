"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Disable SSG for this interactive page to avoid prerender-time hook/context issues
export const dynamic = 'force-dynamic';

export default function CatDogPage() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preds, setPreds] = useState<Array<{ className: string; probability: number }>>([]);
  const [verdict, setVerdict] = useState<"Cat" | "Dog" | "Unknown">("Unknown");

  // Small sample gallery (remote images)
  const samples = [
    { url: "/samples/cat1.jpg", label: "Cat 1" },
    { url: "/samples/dog1.jpg", label: "Dog 1" },
    { url: "/samples/cat2.jpg", label: "Cat 2" },
    { url: "/samples/dog2.jpg", label: "Dog 2" },
  ];

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
      // Stop webcam if active
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [imgUrl]);

  // Webcam controls
  const openWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      streamRef.current = stream;
      setError(null);
    } catch (e: any) {
      setError("Không thể mở webcam. Vui lòng kiểm tra quyền truy cập camera.");
    }
  };

  const closeWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  const captureFromWebcam = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const data = canvas.toDataURL("image/png");
    setImgUrl(data);
    setPreds([]);
    setVerdict("Unknown");
    setError(null);
  };

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

          {/* Sample gallery */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Ảnh mẫu</h3>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {samples.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="group overflow-hidden rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                  title={s.label}
                  onClick={() => {
                    setImgUrl(s.url);
                    setPreds([]);
                    setVerdict("Unknown");
                    setError(null);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.url}
                    alt={s.label}
                    className="h-16 w-full object-cover transition duration-200 group-hover:scale-105"
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      if (!t.dataset.fallback) {
                        t.src = "/file.svg";
                        t.dataset.fallback = "1";
                      }
                    }}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Đặt ảnh của bạn vào thư mục <code>/public/samples/</code> với tên cat1.jpg, dog1.jpg, cat2.jpg, dog2.jpg.</p>
          </div>

          {/* Webcam controls */}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={openWebcam}>Mở webcam</Button>
            <Button type="button" variant="outline" onClick={captureFromWebcam}>Chụp ảnh</Button>
            <Button type="button" variant="ghost" onClick={closeWebcam}>Tắt webcam</Button>
          </div>

          {/* Webcam preview */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
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
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
                  <div className="h-2 w-full animate-pulse rounded bg-white/10" />
                  <div className="h-2 w-5/6 animate-pulse rounded bg-white/10" />
                </div>
              ) : preds.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {preds.map((p, idx) => (
                    <li key={idx} className="rounded-md border border-white/10 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="pr-3 truncate" title={p.className}>{p.className}</span>
                        <Badge variant="outline">{(p.probability * 100).toFixed(1)}%</Badge>
                      </div>
                      <div className="h-2 w-full rounded bg-white/10">
                        <div className="h-2 rounded bg-primary" style={{ width: `${Math.max(4, Math.min(100, p.probability * 100))}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có kết quả. Tải ảnh, mở webcam để chụp, rồi bấm "Phân loại".</p>
              )}

              {preds.length > 1 && (
                <div className="mt-3 rounded-lg border border-white/10 bg-background/40 p-3 text-sm text-muted-foreground">
                  {(() => {
                    const sorted = [...preds].sort((a, b) => b.probability - a.probability);
                    const top1 = sorted[0];
                    const top2 = sorted[1];
                    const gap = top1.probability - top2.probability;
                    let note = "";
                    if (gap > 0.35) note = "Mức tự tin cao (top-1 chênh đáng kể so với top-2).";
                    else if (gap > 0.15) note = "Mức tự tin vừa phải (top-1 nhỉnh hơn top-2).";
                    else note = "Mức tự tin thấp (top-1 sát top-2). Ảnh có thể gây mơ hồ (góc chụp, ánh sáng, vật cản).";
                    return (
                      <p>
                        Nhãn mạnh nhất: <b>{top1.className}</b> ({(top1.probability * 100).toFixed(1)}%). {note} Verdict hiện tại: <b>{verdict}</b>.
                      </p>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-6">
          <details className="rounded-lg border border-white/10 bg-background/40 p-4">
            <summary className="cursor-pointer select-none text-sm font-semibold">Lý thuyết chi tiết</summary>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p><b>MobileNet</b>: sử dụng depthwise separable convolutions để giảm tham số, giúp suy luận nhanh trên thiết bị yếu.</p>
              <p><b>Transfer learning</b>: MobileNet được huấn luyện trên ImageNet; dự đoán trả về nhiều nhãn (retriever, tabby, v.v.). Ta suy luận Cat/Dog từ các nhãn liên quan.</p>
              <p><b>Trade-off</b>: thông số <i>alpha</i> và <i>resolution</i> cân bằng giữa tốc độ và độ chính xác. Ở đây dùng version nhỏ để tối ưu trải nghiệm.</p>
              <p><b>Hạn chế</b>: ánh sáng, góc chụp, vật cản và domain shift (giống loài lạ) có thể gây nhầm lẫn.</p>
            </div>
          </details>
        </div>
      </Card>
    </main>
  );
}
