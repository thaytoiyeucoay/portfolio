"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, ArrowLeft, ExternalLink, ShieldAlert, ShieldCheck, Search } from "lucide-react";

export const dynamic = 'force-dynamic';

function verdictColor(v: string) {
  const s = v.toLowerCase();
  if (s.includes("đúng")) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (s.includes("sai")) return "bg-red-500/20 text-red-300 border-red-500/30";
  if (s.includes("một phần")) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  return "bg-sky-500/20 text-sky-300 border-sky-500/30";
}

export default function FakeNewsPage() {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  async function analyze() {
    const payload: any = url.trim() ? { url } : { text };
    if (!payload.url && !payload.text) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/factcheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || "API error");
      setData(json.data);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  function copyReport() {
    if (!data) return;
    const out = [
      `Kết luận: ${data.verdict} (${data.score}%)`,
      data.summary,
      data.points?.length ? `\nĐiểm chính:\n- ${data.points.join("\n- ")}` : "",
      data.citations?.length ? `\nNguồn:\n${data.citations.map((c: any, i: number) => `${i + 1}. ${c.title} - ${c.url}`).join("\n")}` : "",
    ].join("\n").trim();
    navigator.clipboard.writeText(out).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-3xl font-bold text-transparent flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-emerald-400" /> Fake News Checker
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Dán link hoặc văn bản để kiểm chứng và đối chiếu nguồn đáng tin cậy.</p>
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
        {/* Input side */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="border-white/10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader>
              <CardTitle className="text-base">Nhập dữ liệu</CardTitle>
              <CardDescription>Dán URL bài báo hoặc văn bản tin đồn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Dán URL tin tức..." value={url} onChange={(e) => setUrl(e.target.value)} />
              <textarea
                rows={5}
                placeholder="Hoặc dán văn bản tin đồn ở đây..."
                className="w-full rounded-md border border-white/10 bg-black/20 p-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button onClick={analyze} disabled={loading || (!url.trim() && !text.trim())} className="gap-2">
                {loading ? "Đang kiểm chứng..." : <><Search className="size-4"/> Kiểm chứng</>}
              </Button>
              {error && <div className="text-xs text-red-400">{error}</div>}
            </CardContent>
          </Card>
        </div>

        {/* Result side */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="border-white/10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader>
              <CardTitle className="text-base">Kết quả</CardTitle>
              <CardDescription>Đối chiếu từ web, tổng hợp bởi LLM.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!data && !loading && (
                <div className="rounded-md border border-dashed border-white/15 p-4 text-sm text-muted-foreground">Chưa có kết quả.</div>
              )}
              {loading && (
                <div className="space-y-3">
                  <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-4/6 animate-pulse rounded bg-white/10" />
                </div>
              )}
              {data && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`border ${verdictColor(data.verdict)}`}>{data.verdict}</Badge>
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="size-4 text-emerald-400" />
                      <span>Score: <span className="font-semibold">{data.score}%</span></span>
                    </div>
                  </div>
                  <div className="rounded-md border border-white/10 bg-black/20 p-3 text-sm whitespace-pre-wrap">{data.summary}</div>
                  {data.points?.length > 0 && (
                    <ul className="list-disc pl-6 text-sm space-y-1">
                      {data.points.map((p: string, i: number) => <li key={i}>{p}</li>)}
                    </ul>
                  )}
                  <div>
                    <div className="mb-1 text-sm font-medium">Citations</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {data.citations?.map((c: any, i: number) => (
                        <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="group rounded-md border border-white/10 p-2 text-xs hover:bg-white/5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate pr-2">{c.title}</div>
                            <ExternalLink className="size-3 opacity-70 group-hover:opacity-100" />
                          </div>
                          <div className="mt-1 truncate text-xs opacity-70">{c.url}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" onClick={copyReport} className="gap-2"><Copy className="size-4"/> Copy báo cáo</Button>
                        </TooltipTrigger>
                        <TooltipContent>Sao chép kết quả để chia sẻ</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {copied && <span className="text-xs text-muted-foreground">Đã sao chép!</span>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
