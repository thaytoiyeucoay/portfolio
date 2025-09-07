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
import { ExternalLink, Paperclip, Upload, Search, Send, Sparkles, FileText, Settings, Plus, Trash2, RefreshCw, Link as LinkIcon, BookOpen, Info, Quote, Copy, Check, Volume2, Square, Bot } from "lucide-react";
// eslint-disable-next-line import/no-unresolved
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import Image from "next/image";

export default function ChatbotRagPage() {
  // Chat state (UI-only)
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string; citations?: Array<{ title: string; url?: string; snippet?: string }>; }>>([
    {
      id: "m1",
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý AI cá nhân của Khánh Duy Bùi. Tôi có thể trả lời các câu hỏi về kinh nghiệm, kỹ năng, dự án và thông tin chuyên môn của anh ấy. Bạn cũng có thể tải lên tài liệu để tôi phân tích và trả lời dựa trên nội dung đó.",
      citations: [
        { title: "Thông tin cá nhân", snippet: "AI Engineer với kinh nghiệm phát triển các hệ thống AI/ML, chuyên về NLP và Computer Vision..." },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [allowWeb, setAllowWeb] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // TTS state
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsVoice, setTtsVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [ttsRate, setTtsRate] = useState(1);
  const [preferFemale, setPreferFemale] = useState<boolean>(() => {
    try { return localStorage.getItem("tts_prefer_female_vi") === "1" || true; } catch { return true; }
  });

  // Helpers: persist selected voice and friendly label
  function extractVariantName(v: SpeechSynthesisVoice) {
    const raw = `${v.name}`;
    // Try to extract Vietnamese proper name after brand keywords
    const mMs = /Microsoft\s+([A-Za-zÀ-ỹ]+)[^A-Za-zÀ-ỹ]?/i.exec(raw);
    if (mMs?.[1]) return mMs[1];
    const mGg = /Google\s+([A-Za-zÀ-ỹ]+)[^A-Za-zÀ-ỹ]?/i.exec(raw);
    if (mGg?.[1]) return mGg[1];
    // Clean parentheses content and generic terms
    const cleaned = raw.replace(/\([^)]*\)/g, "").replace(/[–\-]/g, " ");
    const blacklist = new Set(["Microsoft","Google","Vietnamese","Vietnam","Online","Natural","Desktop","Voice","Standard","Neural"]);
    const cand = cleaned.split(/\s+/).filter(Boolean).find(tok => !blacklist.has(tok) && /[A-Za-zÀ-ỹ]/.test(tok));
    return cand || "";
  }

  async function onAskWeb() {
    if (!input.trim()) return;
    setSending(true);
    const userContent = input + " (yêu cầu tìm kiếm web)";
    const userMsg = { id: crypto.randomUUID(), role: "user" as const, content: userContent };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userContent, forceWeb: true, allowWeb })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Chat API error");

      const payload = data.data as {
        answer: string;
        sources: Array<{ title: string; content: string; source: string; similarity: number }>;
        searchUsed: boolean;
      };
      const citations = (payload.sources || []).map((s) => ({
        title: s.title,
        url: /^https?:\/\//i.test(s.source) ? s.source : undefined,
        snippet: s.content,
      }));
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: payload.answer,
        citations,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
      const errMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: "Xin lỗi anh, em gặp lỗi khi tìm kiếm web. Anh thử lại giúp em với nhé. 🙏",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  }

  function friendlyVoiceName(v: SpeechSynthesisVoice, withVariant = true) {
    const raw = `${v.name}`;
    const isGoogle = /google/i.test(raw);
    const isMS = /microsoft/i.test(raw);
    const lower = raw.toLowerCase();
    const gender = /female|nu|nữ/.test(lower) ? "Nữ" : /male|nam/.test(lower) ? "Nam" : "Tự nhiên";
    const brand = isGoogle ? "Google" : isMS ? "Microsoft" : "Hệ thống";
    const variant = withVariant ? extractVariantName(v) : "";
    return `${gender} – ${brand}${variant ? ` · ${variant}` : ""}`;
  }

  function saveVoiceURI(uri: string | null) {
    try { if (uri) localStorage.setItem("tts_voice_uri_vi", uri); } catch {}
  }

  function getSavedVoiceURI(): string | null {
    try { return localStorage.getItem("tts_voice_uri_vi"); } catch { return null; }
  }

  function pickDefaultViVoice(viOnly: SpeechSynthesisVoice[], preferFemaleFlag: boolean) {
    if (viOnly.length === 0) return null;
    const isFemale = (v: SpeechSynthesisVoice) => {
      const n = (v.name || "").toLowerCase();
      // Common indicators in various engines
      const keywords = ["female", "nu", "nữ", "female", "woman", "w"];
      const vietnameseNamesLikelyFemale = ["hoaimy", "linh", "trang", "mai", "thao", "thu", "hoa", "anh"];
      return keywords.some(k => n.includes(k)) || vietnameseNamesLikelyFemale.some(k => n.includes(k));
    };
    const priority = (v: SpeechSynthesisVoice) => (/google/i.test(v.name) ? 2 : /microsoft/i.test(v.name) ? 1 : 0);
    if (preferFemaleFlag) {
      const females = viOnly.filter(isFemale);
      if (females.length > 0) {
        females.sort((a, b) => priority(b) - priority(a));
        return females[0];
      }
    }
    // no female found, fallback to overall priority
    const sorted = [...viOnly].sort((a, b) => priority(b) - priority(a));
    return sorted[0];
  }

  // KB state (UI-only)
  const [docs, setDocs] = useState<Array<{ name: string; sizeKB: number }>>([
    { name: "product-guide.pdf", sizeKB: 842 },
    { name: "faq.md", sizeKB: 16 },
  ]);
  const [temperature, setTemperature] = useState(0.2);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Load voices (Web Speech API)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    function scoreVoice(v: SpeechSynthesisVoice) {
      const name = (v.name || "").toLowerCase();
      let score = 0;
      if (v.lang?.toLowerCase().startsWith("vi")) score += 10; // chỉ Việt Nam
      if (name.includes("google")) score += 4;
      if (name.includes("microsoft")) score += 3;
      if (name.includes("natural")) score += 2;
      if (name.includes("female") || name.includes("nu")) score += 1;
      return score;
    }

    function pickViVN(all: SpeechSynthesisVoice[]) {
      // Lọc chỉ giọng tiếng Việt và sắp xếp theo "độ hay" heuristic
      const viList = all.filter((v) => v.lang?.toLowerCase().startsWith("vi"));
      if (viList.length === 0) return null;
      viList.sort((a, b) => scoreVoice(b) - scoreVoice(a));
      return viList[0] || null;
    }

    const load = () => {
      const list = synth.getVoices();
      const viOnly = list.filter((v) => v.lang?.toLowerCase().startsWith("vi"));
      viOnly.sort((a, b) => scoreVoice(b) - scoreVoice(a));
      setVoices(viOnly);
      if (!ttsVoice && viOnly.length) {
        const saved = getSavedVoiceURI();
        const found = saved ? viOnly.find((v) => v.voiceURI === saved) : null;
        const best = found || pickDefaultViVoice(viOnly, preferFemale);
        if (best) {
          setTtsVoice(best);
          saveVoiceURI(best.voiceURI);
        }
      }
    };

    // Một số trình duyệt load voice bất đồng bộ
    load();
    if (typeof synth.onvoiceschanged !== "undefined") {
      synth.onvoiceschanged = load;
    }
  }, [ttsVoice]);

  // persist whenever voice changes
  useEffect(() => {
    if (ttsVoice?.voiceURI) saveVoiceURI(ttsVoice.voiceURI);
  }, [ttsVoice?.voiceURI]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  // Speak latest assistant message automatically
  // Tắt auto TTS: chỉ đọc khi người dùng bấm vào nút âm thanh của từng tin nhắn
  useEffect(() => { /* no auto-speak */ }, [messages]);

  const disabled = useMemo(() => sending || !input.trim(), [sending, input]);

  function onAttach() {
    fileInputRef.current?.click();
  }

  function speak(id: string, text: string, force = false) {
    if (!force && !ttsEnabled) return;
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

  function previewVoice(v: SpeechSynthesisVoice | null, text = "Xin chào, mình là trợ lý AI của Khánh Duy.") {
    if (!v) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = v.lang || "vi-VN";
      u.voice = v;
      u.rate = ttsRate;
      u.pitch = 1;
      synth.speak(u);
    } catch {}
  }

  function refreshVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const list = synth.getVoices();
    const viOnly = list.filter((vv) => vv.lang?.toLowerCase().startsWith("vi"));
    // Simple priority: Google > Microsoft > others
    const priority = (name: string) => name.includes("Google") ? 2 : name.includes("Microsoft") ? 1 : 0;
    viOnly.sort((a, b) => priority((b.name||"")) - priority((a.name||"")));
    setVoices(viOnly);
    if (!ttsVoice && viOnly.length) setTtsVoice(viOnly[0]);
  }

  function onUploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    // Optimistic UI: show files immediately
    const newDocs = Array.from(files).map((f) => ({ name: f.name, sizeKB: Math.max(1, Math.round(f.size / 1024)) }));
    setDocs((prev) => [...newDocs, ...prev]);
    fetch("/api/documents", { method: "POST", body: form })
      .then((r) => r.json())
      .then((res) => {
        if (!res?.success) throw new Error(res?.message || "Upload failed");
        // no-op: docs already appended; could refresh stats from res.data
      })
      .catch((e) => {
        // Revert optimistic on failure
        setDocs((prev) => prev.filter((d) => !newDocs.some((nd) => nd.name === d.name && nd.sizeKB === d.sizeKB)));
        console.error("Upload error", e);
        alert("Tải tài liệu thất bại. Vui lòng thử lại.");
      });
  }

  async function onAsk() {
    if (!input.trim()) return;
    setSending(true);
    const userContent = input;
    const userMsg = { id: crypto.randomUUID(), role: "user" as const, content: userContent };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userContent, allowWeb })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Chat API error");

      const payload = data.data as {
        answer: string;
        sources: Array<{ title: string; content: string; source: string; similarity: number }>;
        searchUsed: boolean;
      };
      const citations = (payload.sources || []).map((s) => ({
        title: s.title,
        url: /^https?:\/\//i.test(s.source) ? s.source : undefined,
        snippet: s.content,
      }));
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: payload.answer,
        citations,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
      const errMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: "Xin lỗi anh, em gặp lỗi khi xử lý yêu cầu. Anh thử lại giúp em với nhé. 🙏",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  }

  async function initRag() {
    try {
      const res = await fetch("/api/init", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Init failed");
      alert(`Khởi tạo tri thức cá nhân thành công (chunks: ${data.data?.personalDataChunks || 0})`);
    } catch (e) {
      console.error(e);
      alert("Khởi tạo thất bại. Vui lòng thử lại.");
    }
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

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1200);
    });
  }

  return (
    <div className="relative container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-3xl font-bold text-transparent flex items-center gap-3">
            <Bot className="h-8 w-8 text-emerald-400" />
            Trợ lý AI của Khánh Duy
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Xin chào! Tôi là trợ lý AI cá nhân của Khánh Duy Bùi. Hãy hỏi tôi về kinh nghiệm, kỹ năng, dự án hoặc bất kỳ điều gì bạn muốn biết.
          </p>
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
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                <Input type="file" className="hidden" multiple ref={fileInputRef} onChange={(e) => onUploadFiles(e.target.files)} />
                <Button size="sm" className="shrink-0 w-full sm:w-auto" onClick={onAttach}>
                  <Upload className="mr-2 size-4" /> Tải file
                </Button>
                <Button size="sm" className="shrink-0 w-full sm:w-auto" variant="outline">
                  <LinkIcon className="mr-2 size-4" /> Thêm URL
                </Button>
                <Button size="sm" className="shrink-0 w-full sm:w-auto" variant="ghost" title="Re-index" aria-label="Re-index">
                  <RefreshCw className="size-4" />
                </Button>
                <Button
                  size="sm"
                  className="shrink-0 w-full sm:w-auto"
                  variant="secondary"
                  onClick={initRag}
                  title="Khởi tạo tri thức cá nhân từ hồ sơ của anh"
                >
                  <Sparkles className="mr-2 size-4" /> Khởi tạo<span className="hidden sm:inline"> tri thức</span>
                </Button>
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
              <CardDescription>Tuỳ chỉnh giọng đọc và tham số.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lựa chọn model đã được loại bỏ theo yêu cầu */}
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
                <label className="text-xs text-muted-foreground">Giọng đọc (Tiếng Việt)</label>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm">
                    {ttsVoice ? friendlyVoiceName(ttsVoice) : "Chưa có giọng Việt"}
                  </div>
                  <Badge variant="secondary">Đang sử dụng</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => previewVoice(ttsVoice)}>Nghe thử</Button>
                  <Button size="sm" variant="ghost" onClick={refreshVoices}>Làm mới</Button>
                </div>
                {voices.length === 0 && (
                  <div className="text-[11px] text-muted-foreground">Mẹo: Hãy bật gói giọng đọc tiếng Việt của hệ điều hành/trình duyệt để sử dụng TTS.</div>
                )}
                {/* Selector và danh sách giọng đã ẩn theo yêu cầu */}
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
                <Badge variant="outline">Embed: text-embedding-004</Badge>
                <Badge variant="outline">Vector DB: SQLite</Badge>
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
                    <Sparkles className="size-4" /> Trợ lý ảo của Khánh Duy Bùi
                  </CardTitle>
                  <CardDescription>Hỏi đáp dựa trên nguồn kiến thức đã tải lên.</CardDescription>
                </div>
                <div className="hidden gap-2 sm:flex items-center">
                  <Button size="sm" variant={allowWeb ? "default" : "outline"} onClick={() => setAllowWeb((v) => !v)}>
                    <Search className="mr-2 size-4" /> {allowWeb ? "Web search: Bật" : "Web search: Tắt"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              <div className="h-[540px] w-full overflow-auto p-4">
                <div className="mx-auto max-w-3xl space-y-4">
                  {messages.map((m) => (
                    <div key={m.id} className="w-full">
                      {m.role === "assistant" ? (
                        <div className="flex w-full gap-3 justify-start">
                          <div className="mt-1">
                            <ChatAvatar talking={false} />
                          </div>
                          <div className="group relative max-w-[82%] rounded-2xl border p-4 pr-12 pb-10 text-sm shadow-sm backdrop-blur-sm transition-colors border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                            <div className="prose prose-invert max-w-none leading-relaxed [&_*]:break-words">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypePrism]}
                                components={{
                                  code(props: any) {
                                    const { inline, className, children } = props || {};
                                    return (
                                      <CodeBlock inline={inline} className={className} onCopy={copyCode}>
                                        {children}
                                      </CodeBlock>
                                    );
                                  },
                                }}
                              >
                                {m.content}
                              </ReactMarkdown>
                            </div>
                            {m.citations && m.citations.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">Trích dẫn</div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {(m.citations.slice(0, 2)).map((c, i) => (
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
                                {m.citations.length > 2 && (
                                  <div className="text-[11px] text-muted-foreground">… và {m.citations.length - 2} nguồn khác</div>
                                )}
                              </div>
                            )}
                            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg bg-background/40 hover:bg-background/60 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity" onClick={() => copyMessage(m.id, m.content)}>
                                      {copiedId === m.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="left">Sao chép</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 rounded-lg bg-background/40 hover:bg-background/60"
                                      onClick={() => (speakingId === m.id ? stopSpeaking() : speak(m.id, m.content, true))}
                                    >
                                      {speakingId === m.id ? <Square className="size-4" /> : <Volume2 className="size-4" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="left">{speakingId === m.id ? "Dừng" : "Đọc to"}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-start gap-3">
                            <div className="group relative max-w-[82%] rounded-2xl border p-4 text-sm shadow-sm backdrop-blur-sm transition-colors border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-indigo-500/10">
                              <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed [&_*]:break-words">{m.content}</div>
                            </div>
                            <div className="mt-1 h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-sky-500/40">
                              <Image src="/avatar.jpg" alt="User avatar" width={40} height={40} className="h-full w-full object-cover" />
                            </div>
                          </div>
                          <div className="mr-[52px]">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg bg-background/40 hover:bg-background/60" onClick={() => copyMessage(m.id, m.content)}>
                                    {copiedId === m.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">Sao chép</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
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
              <div className="sticky bottom-0 border-t border-white/10 bg-background/60 px-3 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/50">
                <div className="mx-auto max-w-3xl">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-background/80 px-2 py-1.5 shadow-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl" onClick={onAttach} aria-label="Đính kèm">
                            <Paperclip className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Đính kèm</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Input type="file" className="hidden" multiple ref={fileInputRef} onChange={(e) => onUploadFiles(e.target.files)} />
                    <div className="relative flex-1">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Hỏi tôi về Khánh Duy hoặc tải tài liệu để phân tích..."
                        rows={2}
                        className="peer min-h-[44px] w-full resize-none rounded-full bg-black/10 px-4 py-2 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/50 transition"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (!disabled) onAsk();
                          }
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/0 via-emerald-400/0 to-sky-400/0 peer-focus:from-emerald-400/10 peer-focus:to-sky-400/10" />
                    </div>
                    <Button
                      className="h-9 shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white hover:from-emerald-400 hover:to-sky-400"
                      onClick={onAsk}
                      disabled={disabled}
                    >
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

          {/* Tips
          <Card className="border-white/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Info className="size-4" /> Gợi ý sử dụng</CardTitle>
              <CardDescription>Một vài câu hỏi mẫu để bắt đầu.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  "Kể về kinh nghiệm làm việc của Khánh Duy",
                  "Kỹ năng chuyên môn của Khánh Duy là gì?",
                  "Dự án nào Khánh Duy tự hào nhất?",
                ].map((s, i) => (
                  <Button key={i} size="sm" variant="outline" onClick={() => setInput(s)}>
                    <Quote className="mr-2 size-4" /> {s}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}

function ChatAvatar({ talking = false }: { talking?: boolean }) {
  return (
    <div className={cn(
      "relative h-10 w-10 shrink-0 rounded-full grid place-items-center overflow-hidden",
      talking ? "ring-2 ring-emerald-400/70 shadow-[0_0_0_4px_rgba(16,185,129,0.18)] animate-[pulse_2s_ease-in-out_infinite]" : "ring-[1.5px] ring-emerald-500/40"
    )}>
      <svg viewBox="0 0 80 80" className="h-10 w-10">
        {/* background */}
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="38" fill="url(#g)" />

        {/* group with idle sway when not talking */}
        <g className={!talking ? 'idle' : undefined}>
          {/* long hair back (falls down both sides) */}
          <path d="M18 30c2-12 10-20 22-20s20 8 22 20c0 0-4 2-9 3-3 1-5 2-7 4-2 2-3 5-3 9 0 6 4 10 4 14 0 2-2 4-4 4s-4-2-4-4c0-4 4-8 4-14 0-4-1-7-3-9-2-2-4-3-7-4-5-1-9-3-9-3z" fill="#111827" />

          {/* face */}
          <circle cx="40" cy="44" r="18" fill="#fde7e9" />

          {/* blush */}
          <ellipse cx="30" cy="48" rx="4" ry="2.5" fill="#fca5a5" opacity="0.5" />
          <ellipse cx="50" cy="48" rx="4" ry="2.5" fill="#fca5a5" opacity="0.5" />

          {/* eyes */}
          <g fill="#111827" transform="translate(0,2)">
            <ellipse className="blink" cx="32" cy="44" rx="2.6" ry="2.6" />
            <ellipse className="blink" cx="48" cy="44" rx="2.6" ry="2.6" />
          </g>

          {/* mouth */}
          {talking ? (
            <ellipse cx="40" cy="53" rx="4.5" ry="2.5" fill="#ef4444" className="talk" />
          ) : (
            <path d="M34 54c2 2 10 2 12 0" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          )}

          {/* hair front fringe */}
          <path d="M24 32c6-6 12-8 16-8s10 2 16 8c-4 0-8 0-12 2-3 1-5 2-8 2-4-2-8-4-12-4z" fill="#1f2937" />
        </g>
      </svg>
      <style jsx>{`
        .blink { transform-origin: center; animation: blink 3.8s ease-in-out infinite; }
        @keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 94% { transform: scaleY(0.1); } 96% { transform: scaleY(1); } }
        .talk { transform-origin: center; animation: talk 0.35s ease-in-out infinite; }
        @keyframes talk { 0%,100% { transform: scaleY(0.6); } 50% { transform: scaleY(1.1); } }
        .idle { transform-origin: 40px 40px; animation: sway 4.5s ease-in-out infinite; }
        @keyframes sway { 0%, 100% { transform: rotate(0deg) translateY(0); } 50% { transform: rotate(-1.5deg) translateY(0.4px); } }
      `}</style>
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
