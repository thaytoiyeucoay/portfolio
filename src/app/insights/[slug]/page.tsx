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

export default function InsightReaderPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const post = posts.find((p) => p.slug === slug);
  const defaultMd = INSIGHT_CONTENT[slug]?.content ?? "## Chưa có nội dung\nVui lòng thêm nội dung cho slug này trong `src/data/insight-content.ts`.";
  const router = useRouter();
  const storageKey = useMemo(() => `insight_md_${slug}`, [slug]);
  const [editing, setEditing] = useState(false);
  const [md, setMd] = useState<string>(defaultMd);

  // Load draft from localStorage if any
  useEffect(() => {
    try {
      const draft = localStorage.getItem(storageKey);
      if (draft) setMd(draft);
    } catch {}
  }, [storageKey]);

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

  return (
    <main className="container mx-auto max-w-4xl px-6 py-10">
      <div className="mb-3 text-sm flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push('/#insights')}
          className="text-muted-foreground underline underline-offset-4"
        >
          ← Back to Home
        </button>
        <span className="text-muted-foreground">•</span>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="text-muted-foreground underline underline-offset-4"
        >
          {editing ? "Preview" : "Edit"}
        </button>
      </div>
      <h1 className="mb-6 text-3xl font-semibold">{title}</h1>
      {editing ? (
        <div className="space-y-3">
          <textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            className="w-full min-h-[300px] rounded-md border border-border bg-background p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/40"
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
        <article className="mdx">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{ h1: (props) => <h2 {...props} /> }}
          >
            {md}
          </ReactMarkdown>
        </article>
      )}
    </main>
  );
}
