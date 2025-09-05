"use client";

import { posts } from "@/data/posts";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { INSIGHT_CONTENT } from "@/data/insight-content";
import { useEffect, useMemo, useState } from "react";
import "./page.css";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff, List, ListX } from "lucide-react";

type TocItem = { id: string; text: string; level: 2 | 3 };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function InsightReaderPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const post = posts.find((p) => p.slug === slug);
  const defaultMd = INSIGHT_CONTENT[slug]?.content ?? "## Chưa có nội dung\nVui lòng thêm nội dung cho slug này trong `src/data/insight-content.ts`.";
  const router = useRouter();
  const storageKey = useMemo(() => `insight_md_${slug}`, [slug]);
  const [editing, setEditing] = useState(false);
  const [md, setMd] = useState<string>(defaultMd);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [showToc, setShowToc] = useState(true);

  // Load draft from localStorage if any
  useEffect(() => {
    try {
      const draft = localStorage.getItem(storageKey);
      if (draft) setMd(draft);
    } catch {}
  }, [storageKey]);

  // Build TOC from markdown (##, ###)
  useEffect(() => {
    const items: TocItem[] = [];
    const lines = md.split(/\n/);
    for (const line of lines) {
      const m2 = /^##\s+(.+)$/.exec(line);
      const m3 = /^###\s+(.+)$/.exec(line);
      if (m2) items.push({ id: slugify(m2[1]), text: m2[1], level: 2 });
      else if (m3) items.push({ id: slugify(m3[1]), text: m3[1], level: 3 });
    }
    setToc(items);
  }, [md]);

  // Scrollspy observe headings
  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -60% 0px", threshold: [0, 1] }
    );
    toc.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc, md]);

  const onSave = () => {
    try {
      localStorage.setItem(storageKey, md);
    } catch {}
  };

  const onResetToCode = () => {
    setMd(defaultMd);
  };

  const onClearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };

  if (!post) {
    return (
      <main className="container mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Not found</h1>
        <p className="mt-2 text-muted-foreground">Bài viết không tồn tại hoặc chưa được cấu hình.</p>
      </main>
    );
  }

  const title = INSIGHT_CONTENT[slug]?.title ?? post.title;

  // Extract Key Takeaways section if exists
  const takeaways = useMemo(() => {
    const start = md.indexOf("## Takeaway");
    if (start === -1) return "";
    const next = md.indexOf("\n## ", start + 3) // next h2
    const section = next === -1 ? md.slice(start) : md.slice(start, next);
    return section.replace(/^## Takeaway\s*/i, "").trim();
  }, [md]);

  return (
    <main className="container mx-auto max-w-6xl px-6 py-10">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push('/#insights')}>
          <ArrowLeft className="mr-2 size-4" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
          {editing ? (<Eye className="mr-2 size-4" />) : (<EyeOff className="mr-2 size-4" />)}
          {editing ? "Preview" : "Edit"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowToc((v) => !v)} className="hidden sm:inline-flex">
          {showToc ? (<ListX className="mr-2 size-4" />) : (<List className="mr-2 size-4" />)}
          {showToc ? "Ẩn mục lục" : "Hiện mục lục"}
        </Button>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>

      {/* Layout: TOC + Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px,1fr]">
        {/* TOC (sticky) */}
        {showToc && (
        <aside className="insight-toc lg:sticky lg:top-20 lg:h-[calc(100vh-120px)] lg:overflow-auto">
          <div className="rounded-md border bg-background/60 backdrop-blur p-3 text-sm">
            <div className="mb-2 font-medium text-muted-foreground">Mục lục</div>
            <nav className="space-y-1">
              {toc.length === 0 && <div className="text-xs text-muted-foreground">Không có mục lục</div>}
              {toc.map((t) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className={
                    "block truncate hover:underline " +
                    (t.level === 3 ? "pl-4 text-xs" : "text-sm") +
                    (activeId === t.id ? " text-primary" : "")
                  }
                >
                  {t.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>
        )}

        {/* Content */}
        <div>
          {/* Key Takeaways */}
          {takeaways && (
            <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="mb-1 text-sm font-semibold">Key Takeaways</div>
              <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: takeaways.replace(/\n/g, '<br/>') }} />
            </div>
          )}

          {editing ? (
        <div className="space-y-3">
          <textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            className="w-full min-h[300px] rounded-md border border-border bg-background p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Nhập Markdown (hỗ trợ GFM + LaTeX)"
          />
          <div className="flex items-center gap-3 text-sm">
            <button onClick={onSave} className="rounded-md border border-border px-3 py-1 hover:bg-muted">Lưu (trình duyệt)</button>
            <button onClick={onResetToCode} className="rounded-md border border-border px-3 py-1 hover:bg-muted">Khôi phục từ code</button>
            <button onClick={onClearDraft} className="rounded-md border border-border px-3 py-1 hover:bg-muted">Xoá bản nháp</button>
          </div>
          <div className="text-xs text-muted-foreground">Lưu sẽ được giữ trong trình duyệt (localStorage). Để xuất bản, hãy cập nhật file `src/data/insight-content.ts`.</div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-background/70 p-6 backdrop-blur lg:h-[70vh] lg:overflow-y-auto">
          <article className="mdx">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: (props) => <h2 {...props} />,
                h2: ({ children, ...rest }) => {
                  const text = String(children as any);
                  const id = slugify(text);
                  return <h2 id={id} {...rest}>{children}<a className="heading-anchor" href={`#${id}`}>#</a></h2>;
                },
                h3: ({ children, ...rest }) => {
                  const text = String(children as any);
                  const id = slugify(text);
                  return <h3 id={id} {...rest}>{children}<a className="heading-anchor" href={`#${id}`}>#</a></h3>;
                },
              }}
            >
              {md}
            </ReactMarkdown>
          </article>
        </div>
      )}
        </div>
      </div>
    </main>
  );
}
