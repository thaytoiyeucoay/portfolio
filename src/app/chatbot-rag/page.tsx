"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ExternalLink, Paperclip, Upload, Search, Send, Sparkles, FileText, Settings, Plus, Trash2, RefreshCw, Link as LinkIcon, BookOpen, Info, Quote, Copy, Check, Volume2, Square } from "lucide-react";
// eslint-disable-next-line import/no-unresolved
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";

export default function ChatbotRagPage() {
  // Chat state (UI-only)
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string; citations?: Array<{ title: string; url?: string; snippet?: string }>; }>>([
    {
      id: "m1",
      role: "assistant",
      content: "Xin chào! Tôi là Chatbot RAG. Hãy tải tài liệu hoặc đặt câu hỏi – tôi sẽ trích xuất câu trả lời dựa trên nguồn kiến thức của bạn.",
      citations: [
        { title: "Hướng dẫn sử dụng (PDF)", snippet: "Mục tiêu: Hệ thống RAG kết hợp tìm kiếm và sinh đáp án bằng LLM..." },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // TTS state
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsVoice, setTtsVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [ttsRate, setTtsRate] = useState(1);

  // KB state (UI-only)
  const [docs, setDocs] = useState<Array<{ name: string; sizeKB: number }>>([
    { name: "product-guide.pdf", sizeKB: 842 },
    { name: "faq.md", sizeKB: 16 },
  ]);
  const [model, setModel] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState(0.2);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Load voices (Web Speech API)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    function pickViVN(all: SpeechSynthesisVoice[]) {
      // Ưu tiên giọng vi-VN
      const vi = all.find((v) => v.lang?.toLowerCase().startsWith("vi"));
      return vi || all.find((v) => v.lang?.toLowerCase().includes("en")) || null;
    }

    const load = () => {
      const list = synth.getVoices();
      setVoices(list);
      if (!ttsVoice && list.length) setTtsVoice(pickViVN(list));
    };

    // Một số trình duyệt load voice bất đồng bộ
    load();
    if (typeof synth.onvoiceschanged !== "undefined") {
      synth.onvoiceschanged = load;
    }
  }, [ttsVoice]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  // Speak latest assistant message automatically
  useEffect(() => {
    if (!ttsEnabled) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    // Chỉ auto-speak nếu vừa thêm (tránh đọc lại khi mount)
    // Heuristic: nếu đang sending -> không đọc; đọc khi gửi xong và assistant đã append
    if (!sending) {
      speak(lastAssistant.id, lastAssistant.content);
    }
  }, [messages]);

  const disabled = useMemo(() => sending || !input.trim(), [sending, input]);

  function onAttach() {
    fileInputRef.current?.click();
  }

  function speak(id: string, text: string) {
    if (!ttsEnabled) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = ttsVoice?.lang || "vi-VN";
      if (ttsVoice) u.voice = ttsVoice;
      u.rate = ttsRate;
      u.pitch = 1;
      u.onend = () => setSpeakingId((prev) => (prev === id ? null : prev));
      setSpeakingId(id);
      synth.speak(u);
    } catch (e) {
      // noop
    }
  }

  function stopSpeaking() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingId(null);
  }

  function onUploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    // UI-only: append to docs list
    const newDocs = Array.from(files).map((f) => ({ name: f.name, sizeKB: Math.max(1, Math.round(f.size / 1024)) }));
    setDocs((prev) => [...newDocs, ...prev]);
  }

  function onAsk() {
    if (!input.trim()) return;
    setSending(true);
    const userMsg = { id: crypto.randomUUID(), role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Fake assistant response after delay (UI-only)
    setTimeout(() => {
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content:
          "Đây là câu trả lời mẫu dựa trên RAG. Khi tích hợp backend, câu trả lời sẽ được tổng hợp từ các đoạn trích liên quan trong bộ tài liệu của bạn.",
        citations: [
          { title: "faq.md", snippet: "RAG: Retrieval-Augmented Generation giúp mô hình trả lời chính xác hơn..." },
          { title: "product-guide.pdf", snippet: "Chương 2: Pipeline ingest -> chunk -> embed -> index -> retrieve -> rerank -> generate" },
        ],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setSending(false);
    }, 900);
  }

  function onClearChat() {
    setMessages([]);
  }

  function copyMessage(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    });
  }

  return (
    <div className="relative container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-2xl font-semibold text-transparent">Chatbot RAG</h1>
          <p className="text-sm text-muted-foreground">Giao diện demo cho chatbot dùng Retrieval-Augmented Generation. UI-only, chưa kết nối backend.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClearChat}>
            <Trash2 className="mr-2 size-4" /> Xoá hội thoại
          </Button>
          <Button
            variant={ttsEnabled ? "secondary" : "outline"}
            size="sm"
            onClick={() => setTtsEnabled((v) => !v)}
            title="Bật/Tắt đọc to câu trả lời"
          >
            <Volume2 className="mr-2 size-4" /> Âm thanh: {ttsEnabled ? "Bật" : "Tắt"}
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <a href="/" className="gap-2 inline-flex items-center">
              Trang chủ <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Knowledge Base & Settings */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-white/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><BookOpen className="size-4" /> Knowledge Base</CardTitle>
              <CardDescription>Tải tài liệu để làm nguồn tri thức cho RAG.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input type="file" className="hidden" multiple ref={fileInputRef} onChange={(e) => onUploadFiles(e.target.files)} />
                <Button size="sm" onClick={onAttach}><Upload className="mr-2 size-4" /> Tải file</Button>
                <Button size="sm" variant="outline"><LinkIcon className="mr-2 size-4" /> Thêm URL</Button>
                <Button size="sm" variant="ghost" title="Re-index"><RefreshCw className="size-4" /></Button>
              </div>
              <div className="rounded-md border border-white/10">
                <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
                  <span>{docs.length} tài liệu</span>
                  <span>Tổng ~{docs.reduce((a, b) => a + b.sizeKB, 0)}KB</span>
                </div>
                <Separator />
                <div className="max-h-56 overflow-auto">
                  {docs.map((d, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-muted-foreground" />
                        <span className="truncate" title={d.name}>{d.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{d.sizeKB}KB</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Settings className="size-4" /> Cấu hình</CardTitle>
              <CardDescription>Tuỳ chỉnh mô hình và tham số.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Model</label>
                <div className="flex items-center gap-2">
                  <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm outline-none">
                    <option className="bg-background" value="gpt-4o-mini">gpt-4o-mini</option>
                    <option className="bg-background" value="gpt-4.1">gpt-4.1</option>
                    <option className="bg-background" value="claude-3.5-sonnet">claude-3.5-sonnet</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Nhiệt độ: {temperature.toFixed(1)}</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Giọng đọc (TTS)</label>
                <div className="flex items-center gap-2">
                  <select
                    value={ttsVoice?.voiceURI ?? ""}
                    onChange={(e) => {
                      const v = voices.find((vv) => vv.voiceURI === e.target.value) || null;
                      setTtsVoice(v);
                    }}
                    className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm outline-none"
                    disabled={voices.length === 0}
                  >
                    {voices.length === 0 ? (
                      <option className="bg-background" value="">Không tìm thấy giọng đọc</option>
                    ) : (
                      voices.map((v) => (
                        <option className="bg-background" key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Tốc độ đọc: {ttsRate.toFixed(1)}x</label>
                <input
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  value={ttsRate}
                  onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">Chunking: Recursive</Badge>
                <Badge variant="outline">Embed: text-embedding-3-small</Badge>
                <Badge variant="outline">Vector DB: Pinecone</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Chat */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="size-4" /> Trợ lý RAG
                  </CardTitle>
                  <CardDescription>Hỏi đáp dựa trên nguồn kiến thức đã tải lên.</CardDescription>
                </div>
                <div className="hidden gap-2 sm:flex">
                  <Button size="sm" variant="outline"><Search className="mr-2 size-4" /> Chỉ tìm kiếm</Button>
                  <Button size="sm" variant="secondary"><Plus className="mr-2 size-4" /> Prompt mới</Button>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              <div className="h-[540px] w-full overflow-auto p-4">
                <div className="mx-auto max-w-3xl space-y-4">
                  {messages.map((m) => (
                    <div key={m.id} className={cn("flex w-full gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                      {m.role === "assistant" && (
                        <div className="mt-1">
                          <ChatAvatar talking={false} />
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[82%] rounded-2xl border p-3 text-sm shadow-sm",
                        m.role === "assistant"
                          ? "border-emerald-500/20 bg-emerald-500/10"
                          : "border-sky-500/20 bg-sky-500/10"
                      )}>
                        <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed [&_*]:break-words">{m.content}</div>
                        {m.citations && m.citations.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">Trích dẫn</div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {m.citations.map((c, i) => (
                                <div key={i} className="rounded-md border border-white/10 p-3">
                                  <div className="mb-1 flex items-center gap-2 text-xs font-medium">
                                    <FileText className="size-4" /> {c.title}
                                  </div>
                                  {c.snippet && (
                                    <div className="text-xs text-muted-foreground line-clamp-3">{c.snippet}</div>
                                  )}
                                  {c.url && (
                                    <div className="mt-2 text-xs">
                                      <a className="inline-flex items-center gap-1 underline decoration-dotted" href={c.url} target="_blank" rel="noreferrer">
                                        Mở nguồn <ExternalLink className="size-3" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-2 flex justify-end">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyMessage(m.id, m.content)}>
                                  {copiedId === m.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">Sao chép</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {m.role === "assistant" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => (speakingId === m.id ? stopSpeaking() : speak(m.id, m.content))}
                                  >
                                    {speakingId === m.id ? <Square className="size-4" /> : <Volume2 className="size-4" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">{speakingId === m.id ? "Dừng" : "Đọc to"}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                      {m.role === "user" && (
                        <div className="mt-1 grid h-7 w-7 place-items-center rounded-full bg-sky-500/15 text-[10px] ring-1 ring-sky-500/30">U</div>
                      )}
                    </div>
                  ))}
                  {sending && (
                    <div className="flex w-full gap-3">
                      <div className="mt-1">
                        <ChatAvatar talking={true} />
                      </div>
                      <div className="max-w-[82%] rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm shadow-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="sr-only">Đang nhập</span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="inline-block size-1.5 rounded-full bg-white/80 animate-bounce" />
                            <span className="inline-block size-1.5 rounded-full bg-white/80 animate-bounce [animation-delay:.15s]" />
                            <span className="inline-block size-1.5 rounded-full bg-white/80 animate-bounce [animation-delay:.3s]" />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Composer */}
              <div className="sticky bottom-0 border-t border-white/10 bg-background/60 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/50">
                <div className="mx-auto max-w-3xl">
                  <div className="flex items-end gap-2 rounded-full border border-white/10 bg-background/80 p-1.5 shadow-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-9 w-9" onClick={onAttach}>
                            <Paperclip className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Đính kèm</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Input type="file" className="hidden" multiple ref={fileInputRef} onChange={(e) => onUploadFiles(e.target.files)} />
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Đặt câu hỏi dựa trên tài liệu của bạn..."
                      rows={2}
                      className="min-h-[44px] flex-1 resize-none rounded-full bg-transparent px-3"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (!disabled) onAsk();
                        }
                      }}
                    />
                    <Button className="h-9 shrink-0 rounded-full" onClick={onAsk} disabled={disabled}>
                      {sending ? "Đang gửi..." : (
                        <span className="inline-flex items-center gap-2"><Send className="size-4" /><span className="hidden sm:inline">Gửi</span></span>
                      )}
                    </Button>
                  </div>
                  <div className="mt-1 pl-2 text-[11px] text-muted-foreground">Nhấn Enter để gửi • Shift+Enter để xuống dòng</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-white/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Info className="size-4" /> Gợi ý sử dụng</CardTitle>
              <CardDescription>Một vài câu hỏi mẫu để bắt đầu.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  "Tóm tắt chương 2 trong product-guide.pdf",
                  "Tạo checklist triển khai dự án dựa trên tài liệu",
                  "Liệt kê 5 tính năng chính và dẫn nguồn",
                ].map((s, i) => (
                  <Button key={i} size="sm" variant="outline" onClick={() => setInput(s)}>
                    <Quote className="mr-2 size-4" /> {s}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ChatAvatar({ talking = false }: { talking?: boolean }) {
  return (
    <div className="relative h-7 w-7 shrink-0 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 grid place-items-center overflow-hidden">
      <svg viewBox="0 0 40 40" className="h-6 w-6">
        <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeOpacity="0.25" />
        {/* eyes */}
        <circle cx="14" cy="17" r="2" fill="currentColor" />
        <circle cx="26" cy="17" r="2" fill="currentColor" />
        {/* mouth */}
        <rect x="14" y="24" width="12" height="3" rx="1.5" className={talking ? "fill-current animate-pulse" : "fill-current"} />
      </svg>
    </div>
  );
}

function CodeBlock({ inline, className, children, onCopy }: { inline?: boolean; className?: string; children: any; onCopy: (code: string) => void }) {
  const match = /language-(\w+)/.exec(className || "");
  const codeText = String(children || "").trim();
  if (inline) {
    return <code className="rounded bg-muted/30 px-1 py-0.5 text-[0.85em]">{children}</code>;
  }
  return (
    <div className="group relative">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => onCopy(codeText)}
              >
                <Copy className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Sao chép</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {match && <div className="absolute left-2 top-2 z-10 rounded-md border border-white/10 bg-background/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{match[1]}</div>}
      <pre className="mt-6 overflow-auto rounded-lg border border-white/10 p-3 text-sm">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
