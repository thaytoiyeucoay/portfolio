import { NextRequest, NextResponse } from "next/server";

// Default model for emotion classification (API-based). Override via body.model or env EMOTION_MODEL
const DEFAULT_MODEL = process.env.EMOTION_MODEL || "SamLowe/roberta-base-go_emotions";

export async function POST(req: NextRequest) {
  try {
    const { text, model } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing 'text' in request body" },
        { status: 400 }
      );
    }

    const targetModel = typeof model === "string" && model.length > 0 ? model : DEFAULT_MODEL;

    // If LOCAL_EMOTION_API is set, try local server first (e.g., FastAPI). If it fails, gracefully fallback to HF
    const localApi = process.env.LOCAL_EMOTION_API;
    if (localApi && typeof localApi === "string" && localApi.startsWith("http")) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const localResp = await fetch(localApi, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const localData = await localResp.json().catch(() => ({}));
        if (localResp.ok && Array.isArray(localData?.results)) {
          // Expecting { results: [{label, score}, ...] } from local server
          return NextResponse.json({ model: "local", results: localData.results });
        }
        // If local returns non-OK or wrong shape, fall through to HF
      } catch (_e) {
        // If local unreachable/timeout, fall through to HF
      }
    }

    // Only now we need the HF key if we proceed with HF path
    const hfKey = process.env.HF_API_KEY;
    if (!hfKey) {
      return NextResponse.json(
        { error: "Server missing HF_API_KEY. Add it to .env.local and restart dev server." },
        { status: 500 }
      );
    }

    // Small helper to call HF with retry if model is loading (503)
    const callHf = async () => {
      const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(targetModel)}`;
      const payload = { inputs: text, options: { wait_for_model: true } } as const;
      const headers = {
        Authorization: `Bearer ${hfKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      let lastStatus = 0;
      let lastBody = "";
      for (let attempt = 0; attempt < 3; attempt++) {
        const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
        lastStatus = resp.status;
        if (resp.ok) {
          const json = await resp.json();
          return { ok: true as const, json };
        }
        const txt = await resp.text();
        lastBody = txt;
        // Retry on 503 or explicit loading message
        if (resp.status === 503 || /loading/i.test(txt)) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        // Other errors: stop retrying
        return { ok: false as const, status: resp.status, text: txt };
      }
      return { ok: false as const, status: lastStatus || 503, text: lastBody || "Unknown HF error" };
    };

    const hf = await callHf();
    if (!hf.ok) {
      return NextResponse.json(
        { error: "HF API error", details: hf.text, status: hf.status, model: targetModel },
        { status: 502 }
      );
    }

    const data = hf.json;
    // HF may return array of arrays for multi-label; normalize to flat list of {label, score}
    let predictions: Array<{ label: string; score: number }>; 
    if (Array.isArray(data)) {
      if (Array.isArray(data[0])) {
        predictions = data[0];
      } else {
        predictions = data as Array<{ label: string; score: number }>;
      }
    } else if (data && data[0] && data[0].label && typeof data[0].score === "number") {
      predictions = data as Array<{ label: string; score: number }>;
    } else {
      predictions = [];
    }

    // Sort desc by score & limit top 6 to keep UI clean
    predictions.sort((a, b) => b.score - a.score);
    const top = predictions.slice(0, 6);

    return NextResponse.json({ model: targetModel, results: top });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected server error", details: String(err) },
      { status: 500 }
    );
  }
}
