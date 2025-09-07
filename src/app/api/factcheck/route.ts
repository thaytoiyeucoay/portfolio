import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

type TavilyResult = {
  title: string;
  url: string;
  content: string;
  score?: number;
};

async function tavilySearch(query: string): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('Missing TAVILY_API_KEY');
  const strict = process.env.FACTCHECK_STRICT_DOMAINS !== 'false';
  const trusted = [
    'reuters.com', 'apnews.com', 'bbc.com', 'nytimes.com', 'washingtonpost.com',
    'theguardian.com', 'npr.org', 'aljazeera.com', 'factcheck.org', 'snopes.com',
    'politiFact.com', 'who.int', 'cdc.gov', 'ecdc.europa.eu', 'oecd.org', 'worldbank.org',
    'imf.org', 'un.org', 'wikipedia.org', 'britannica.com'
  ];
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      topic: 'news',
      max_results: 6,
      include_answer: false,
      include_images: false,
      include_domains: strict ? trusted : [],
      exclude_domains: [],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Tavily error ${res.status}: ${t}`);
  }
  const data: any = await res.json();
  const results: TavilyResult[] = Array.isArray(data?.results)
    ? data.results.map((r: any) => ({ title: r.title, url: r.url, content: r.content }))
    : [];
  return results;
}

const SYS = `Bạn là hệ thống fact-check tiếng Việt.
Trả về JSON với các khóa (giữ nguyên tên khóa tiếng Anh, giá trị bằng tiếng Việt):
- verdict: 'đúng', 'sai', 'một phần', hoặc 'không chắc'
- score: số 0-100 thể hiện độ tin cậy tổng hợp
- summary: tóm tắt ngắn gọn kết luận và lý do
- points: mảng 3-6 gạch đầu dòng, mỗi gạch 1 câu ngắn
- citations: mảng tối đa 6 phần tử: { title, url }
Chỉ trả về JSON thuần (không kèm markdown).`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, text } = body || {};
    const query = (url || text || '').trim();
    if (!query) return NextResponse.json({ error: 'Missing url or text' }, { status: 400 });

    // Build search query
    const searchQuery = url ? `Kiểm chứng mức độ chính xác của nội dung tại URL: ${url}` : `Kiểm chứng tin tức: ${text}`;
    const web = await tavilySearch(searchQuery);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash' });

    const sourcesBlock = web.map((w, i) => `(${i + 1}) ${w.title} - ${w.url}\n${w.content.slice(0, 1000)}`).join('\n\n');
    const prompt = `${SYS}\n\nNguồn web thu thập được:\n${sourcesBlock}\n\nHãy đánh giá tổng hợp.\n`;
    const resp = await model.generateContent(prompt);
    const textOut = resp.response.text();

    // Parse JSON
    let parsed: any = null;
    const fenced = /```json\s*([\s\S]*?)\s*```/i.exec(textOut);
    const candidate = fenced ? fenced[1] : (() => {
      const s = textOut.indexOf('{');
      const e = textOut.lastIndexOf('}');
      if (s >= 0 && e > s) return textOut.slice(s, e + 1);
      return textOut;
    })();
    try {
      parsed = JSON.parse(candidate);
    } catch {
      parsed = { verdict: 'không chắc', score: 50, summary: textOut, points: [], citations: web.slice(0, 4).map(w => ({ title: w.title, url: w.url })) };
    }

    // Normalize
    parsed.verdict = String(parsed.verdict || 'không chắc');
    parsed.score = Math.max(0, Math.min(100, Number(parsed.score ?? 50)));
    parsed.summary = String(parsed.summary || '').trim();
    parsed.points = Array.isArray(parsed.points) ? parsed.points.map((x: any) => String(x)).slice(0, 6) : [];
    parsed.citations = Array.isArray(parsed.citations)
      ? parsed.citations.map((c: any) => ({ title: String(c?.title || ''), url: String(c?.url || '') })).slice(0, 6)
      : web.slice(0, 6).map(w => ({ title: w.title, url: w.url }));

    return NextResponse.json({ success: true, data: { ...parsed, sources: web } });
  } catch (e: any) {
    console.error('Factcheck API error:', e);
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}
