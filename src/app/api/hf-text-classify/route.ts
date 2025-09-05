import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, modelId } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing 'text'" }, { status: 400 });
    }
    // Normalize/alias some model IDs to compatible Inference models
    const aliasMap: Record<string, string> = {
      "xenova/bert-base-uncased-emotion": "j-hartmann/emotion-english-distilroberta-base",
      "bert-base-uncased-emotion": "j-hartmann/emotion-english-distilroberta-base",
    };
    const rawModel = (typeof modelId === "string" && modelId.length > 0)
      ? modelId.trim()
      : "j-hartmann/emotion-english-distilroberta-base";
    const key = rawModel.toLowerCase();
    const model = aliasMap[key] ?? rawModel;

    const HF_TOKEN = process.env.HF_API_KEY;
    if (!HF_TOKEN) {
      return NextResponse.json({ error: "Server missing HF_API_KEY env" }, { status: 500 });
    }

    // Track start time for latency
    const startedAt = Date.now();

    // Helper with timeout support
    const callOnce = async (signal: AbortSignal) => {
      return fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(model)}` , {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true, use_cache: true },
        }),
        signal,
      });
    };

    // Configurable timeout via env
    const timeoutMs = Math.max(10000, Number(process.env.HF_API_TIMEOUT_MS || 60000));
    // Retry up to 4 times with exponential backoff on 5xx/timeout
    let resp: Response | null = null;
    let lastErr: any = null;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), timeoutMs);
        resp = await callOnce(controller.signal);
        clearTimeout(tid);
        if (resp.ok) break;
        // Retry on 5xx errors
        if (resp.status >= 500) {
          const backoff = 800 * attempt; // 0.8s, 1.6s, 2.4s
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
        // Non-retryable error
        break;
      } catch (e: any) {
        lastErr = e;
        if (e?.name === 'AbortError') {
          // Timeout; retry with backoff
        }
        const backoff = 800 * attempt; // progressive pause before retry
        await new Promise((r) => setTimeout(r, backoff));
      }
    }

    if (!resp) {
      const isAbort = lastErr && (lastErr.name === 'AbortError' || /aborted/i.test(String(lastErr)));
      const msg = isAbort
        ? `HF API unreachable: timeout sau ${timeoutMs}ms (có thể do hàng đợi/cold start). Hãy thử lại hoặc chọn mô hình nhẹ hơn.`
        : `HF API unreachable: ${String(lastErr || "unknown error")}`;
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      const short = t && t.length > 500 ? t.slice(0, 500) + "…" : t;
      let hint = "";
      if (resp.status === 504 || resp.status >= 500) {
        hint = "(có thể do hàng đợi hoặc cold start; vui lòng thử lại hoặc chọn mô hình nhẹ hơn)";
      } else if (resp.status === 404) {
        hint = "(model không tồn tại hoặc private; kiểm tra đúng tên model và quyền truy cập).";
      }
      return NextResponse.json({ error: `HF API error (${resp.status}) ${hint}: ${short}` }, { status: 502 });
    }

    let data: any = null;
    try {
      data = await resp.json();
    } catch {
      const t = await resp.text().catch(() => "");
      return NextResponse.json({ error: `HF API returned non-JSON response: ${t?.slice(0, 200) || ""}` }, { status: 502 });
    }
    // HF text-classification usually returns Array<Array<{label, score}>> or Array<{label, score}>
    let scores: Array<{ label: string; score: number }> = [];
    if (Array.isArray(data)) {
      if (data.length > 0 && Array.isArray(data[0])) {
        scores = data[0];
      } else if (data.length > 0 && data[0] && typeof data[0].label === "string") {
        scores = data as Array<{ label: string; score: number }>;
      }
    }

    const latencyMs = Date.now() - startedAt;
    // Normalize and sort desc by score
    scores = scores
      .filter((x) => typeof x?.label === "string" && typeof x?.score === "number")
      .map((x) => ({ label: String(x.label), score: Number(x.score) }))
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({ model, latencyMs, scores });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
