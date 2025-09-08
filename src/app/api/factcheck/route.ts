import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

type TavilyResult = {
  title: string;
  url: string;
  content: string;
  score?: number;
};

async function tavilyExtract(targetUrl: string): Promise<TavilyResult | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.tavily.com/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, url: targetUrl })
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (!data?.content) return null;
    return { title: data?.title || targetUrl, url: targetUrl, content: String(data.content).slice(0, 4000) };
  } catch {
    return null;
  }
}

function getDomain(u: string): string {
  try {
    const d = new URL(u).hostname.replace(/^www\./, "");
    return d;
  } catch {
    return "";
  }
}

const VN_TRUSTED = [
  'vnexpress.net', 'tuoitre.vn', 'zingnews.vn', 'thanhnien.vn', 'nhandan.vn',
  'vtv.vn', 'vov.vn', 'laodong.vn', 'dantri.com.vn', 'vietnamplus.vn', 'vneconomy.vn', 'bnews.vn', 'vtc.vn',
  'chinhphu.vn', 'moh.gov.vn', 'moit.gov.vn', 'most.gov.vn', 'mic.gov.vn', 'molisa.gov.vn',
  'mofa.gov.vn', 'bocongan.gov.vn', 'vss.gov.vn', 'hanoi.gov.vn', 'tphcm.gov.vn',
];

function isVietnamese(text: string): boolean {
  if (!text) return false;
  const diacritics = /[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựỳýỵỷỹ]/i;
  return diacritics.test(text);
}

async function tavilySearch(query: string, onlyVn = false): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('Missing TAVILY_API_KEY');
  const strict = process.env.FACTCHECK_STRICT_DOMAINS !== 'false';
  const trusted = [
    // Vietnam mainstream outlets
    'vnexpress.net', 'tuoitre.vn', 'zingnews.vn', 'thanhnien.vn', 'nhandan.vn',
    'vtv.vn', 'vov.vn', 'laodong.vn', 'dantri.com.vn', 'vietnamplus.vn', 'vneconomy.vn', 'bnews.vn', 'vtc.vn',
    // Vietnam gov/official portals
    'chinhphu.vn', 'moh.gov.vn', 'moit.gov.vn', 'most.gov.vn', 'mic.gov.vn', 'molisa.gov.vn',
    'mofa.gov.vn', 'bocongan.gov.vn', 'vss.gov.vn', 'hanoi.gov.vn', 'tphcm.gov.vn',
    // International reputable
    'reuters.com', 'apnews.com', 'bbc.com', 'theguardian.com', 'nytimes.com', 'washingtonpost.com',
    'npr.org', 'aljazeera.com', 'factcheck.org', 'snopes.com', 'politifact.com',
    // Institutions / knowledge bases
    'who.int', 'cdc.gov', 'ecdc.europa.eu', 'oecd.org', 'worldbank.org', 'imf.org', 'un.org',
    'wikipedia.org', 'britannica.com'
  ];
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      topic: 'news',
      max_results: 10,
      include_answer: false,
      include_images: false,
      include_domains: onlyVn ? VN_TRUSTED : (strict ? trusted : []),
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
  // Re-rank: prioritize VN trusted, then .vn, then others
  const scoreDomain = (u: string) => {
    const d = getDomain(u);
    if (!d) return 0;
    if (VN_TRUSTED.includes(d)) return 3;
    if (d.endsWith('.vn')) return 2;
    return 1;
  };
  return results.sort((a, b) => scoreDomain(b.url) - scoreDomain(a.url));
}

const SYS = `Bạn là hệ thống fact-check tiếng Việt.
Trả về JSON với các khóa (giữ nguyên tên khóa tiếng Anh, giá trị bằng tiếng Việt):
- verdict: 'đúng', 'sai', 'một phần', hoặc 'không chắc'
- score: số 0-100 thể hiện độ tin cậy tổng hợp
- summary: tóm tắt ngắn gọn kết luận và lý do
- points: mảng 3-6 gạch đầu dòng, mỗi gạch 1 câu ngắn
- citations: mảng tối đa 6 phần tử: { title, url }
Nguyên tắc:
1) Nếu tin tức là tiếng Việt, ƯU TIÊN nguồn trích dẫn tiếng Việt và các báo/website chính thống tại Việt Nam.
2) Chỉ sử dụng nguồn uy tín; nếu nguồn không uy tín, giảm score và ghi rõ trong summary.
3) Không suy đoán ngoài dữ kiện trong citations. Nếu chưa đủ, trả 'không chắc'.
Chỉ trả về JSON thuần (không kèm markdown).`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, text } = body || {};
    const query = (url || text || '').trim();
    if (!query) return NextResponse.json({ error: 'Missing url or text' }, { status: 400 });

    // Build search query
    const isVi = isVietnamese(text || url || "") || (url ? getDomain(url).endsWith('.vn') : false);
    const searchQuery = url ? `Kiểm chứng mức độ chính xác của nội dung tại URL: ${url}` : `Kiểm chứng tin tức${isVi ? ' (tiếng Việt)' : ''}: ${text}`;
    // If URL is provided, try extracting its content first (primary source)
    const primary = url ? await tavilyExtract(url) : null;
    const web = await tavilySearch(searchQuery, isVi);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash' });

    const allSources: TavilyResult[] = [primary, ...web].filter(Boolean) as TavilyResult[];
    const sourcesBlock = allSources.map((w, i) => `(${i + 1}) ${w.title} - ${w.url}\n${w.content.slice(0, 1500)}`).join('\n\n');
    const userInput = url ? `URL người dùng: ${url}` : `Tin người dùng: ${text}`;
    const viHint = isVi ? "Nếu phần lớn nguồn không phải tiếng Việt, giảm score và cân nhắc trả 'không chắc'. Dịch trích dẫn tiếng Anh sang tiếng Việt khi cần." : "";
    const prompt = `${SYS}\n\n${userInput}\n\nNguồn web thu thập được (ưu tiên tiếng Việt):\n${sourcesBlock}\n\n${viHint}\nHãy đánh giá tổng hợp theo Nguyên tắc.`;
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
      : allSources.slice(0, 6).map(w => ({ title: w.title, url: w.url }));

    // If Vietnamese input but insufficient Vietnamese sources (count VN_TRUSTED or .vn), force 'không chắc'
    if (isVi) {
      const vnCount = allSources.filter(s => {
        const d = getDomain(s.url);
        return VN_TRUSTED.includes(d) || d.endsWith('.vn');
      }).length;
      if (vnCount < 2) {
        parsed.verdict = 'không chắc';
        parsed.score = Math.min(parsed.score, 50);
        parsed.summary = parsed.summary || 'Thiếu nguồn tiếng Việt đáng tin cậy để kiểm chứng.';
      }
    }

    return NextResponse.json({ success: true, data: { ...parsed, sources: allSources } });
  } catch (e: any) {
    console.error('Factcheck API error:', e);
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}
