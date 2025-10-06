"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Copy, Check, Lightbulb, Code2, Zap, FileCode2, Braces, TerminalSquare, Brackets, ArrowLeft } from "lucide-react";

export default function CodeExplainerPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ explanation: string; issues: string[]; complexity: string; suggestions: string[] } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function onExplain() {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "API error");
      setResult(data.data);
    } catch (e) {
      setResult({ explanation: "Đã có lỗi xảy ra khi phân tích.", issues: [], complexity: "N/A", suggestions: [] });
    } finally {
      setLoading(false);
    }
  }

  function copyText(t: string) {
    navigator.clipboard.writeText(t).then(() => {
      setCopied(t);
      setTimeout(() => setCopied(null), 1200);
    });
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-3xl font-bold text-transparent flex items-center gap-3">
            <Code2 className="h-8 w-8 text-emerald-400" /> Code Snippet Explainer
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Dán đoạn mã để nhận giải thích, cảnh báo lỗi tiềm ẩn và ước lượng độ phức tạp.</p>
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
        {/* Left: Input */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="border-white/10">
            <CardHeader>
              <CardTitle className="text-base">Đoạn mã</CardTitle>
              <CardDescription>Hỗ trợ nhiều ngôn ngữ. Có thể nhập tên ngôn ngữ để mô hình bám sát hơn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-2 text-xs text-muted-foreground">Ngôn ngữ</div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {[
                    { k: "javascript", label: "JavaScript", icon: <Brackets className="size-4"/> },
                    { k: "typescript", label: "TypeScript", icon: <Brackets className="size-4"/> },
                    { k: "python", label: "Python", icon: <TerminalSquare className="size-4"/> },
                    { k: "java", label: "Java", icon: <FileCode2 className="size-4"/> },
                    { k: "go", label: "Go", icon: <Braces className="size-4"/> },
                    { k: "c++", label: "C++", icon: <Braces className="size-4"/> },
                    { k: "c#", label: "C#", icon: <Braces className="size-4"/> },
                    { k: "php", label: "PHP", icon: <FileCode2 className="size-4"/> },
                  ].map(opt => (
                    <button
                      key={opt.k}
                      type="button"
                      onClick={() => setLanguage(opt.k)}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
                        language === opt.k ? "border-emerald-400/50 bg-emerald-500/10" : "border-white/10 hover:bg-white/5"
                      )}
                      title={opt.label}
                    >
                      {opt.icon}
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Textarea rows={14} value={code} onChange={(e) => setCode(e.target.value)} placeholder={`Ví dụ:\nfunction add(a, b) {\n  return a + b;\n}`}/>
              <div className="flex items-center gap-2">
                <Button onClick={onExplain} disabled={loading || !code.trim()} className="gap-2">
                  {loading ? "Đang phân tích..." : <> <Zap className="size-4"/> Phân tích </>}
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={() => copyText(code)} disabled={!code.trim()}>
                        {copied === code ? <Check className="size-4"/> : <Copy className="size-4"/>}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Sao chép code</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Result */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="border-white/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="size-4"/> Kết quả phân tích</CardTitle>
              <CardDescription>{result ? "Giải thích và gợi ý cải thiện" : "Bấm Phân tích để xem kết quả"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!result && (
                <div className="rounded-md border border-dashed border-white/15 p-4 text-sm text-muted-foreground">
                  Chưa có kết quả. Hãy dán code ở cột bên trái và bấm "Phân tích".
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <section>
                    <div className="text-sm font-medium mb-1">Giải thích</div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{result.explanation}</p>
                  </section>
                  <section>
                    <div className="text-sm font-medium mb-1">Vấn đề tiềm ẩn</div>
                    {result.issues?.length ? (
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {result.issues.map((it, idx) => <li key={idx}>{it}</li>)}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground">Không phát hiện vấn đề đáng kể.</div>
                    )}
                  </section>
                  <section className="flex items-center gap-2">
                    <div className="text-sm font-medium">Độ phức tạp</div>
                    <Badge variant="secondary">{result.complexity || "N/A"}</Badge>
                  </section>
                  <section>
                    <div className="text-sm font-medium mb-1">Đề xuất cải thiện</div>
                    {result.suggestions?.length ? (
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground">Chưa có đề xuất.</div>
                    )}
                  </section>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
