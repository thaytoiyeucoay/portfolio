import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `Bạn là một code reviewer giàu kinh nghiệm và trả lời NGẮN GỌN bằng tiếng Việt.
Trả về JSON với các khóa sau (giữ nguyên tên khóa tiếng Anh, nhưng giá trị phải bằng TIẾNG VIỆT):
- explanation: tóm tắt ngắn gọn chức năng đoạn mã
- issues: mảng các vấn đề tiềm ẩn (bảo mật, hiệu năng, tính đúng đắn, khả đọc). Mỗi mục ngắn gọn.
- complexity: độ phức tạp Big-O thời gian/không gian nếu áp dụng, nếu không thì 'N/A'
- suggestions: các đề xuất cải thiện, liệt kê ngắn gọn.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, language } = body || {};
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash' });

    const prompt = `${SYSTEM_PROMPT}\n\nLanguage: ${language || 'auto'}\n\nCode:\n\n\u3010CODE\u3011\n${code}\n\nRespond ONLY as JSON (no prose, no markdown).`;
    const resp = await model.generateContent(prompt);
    const text = resp.response.text();
    // Try parse JSON: support raw JSON, fenced ```json blocks, or loose text around JSON
    let parsed: any = null;
    const fenced = /```json\s*([\s\S]*?)\s*```/i.exec(text);
    const candidate = fenced ? fenced[1] : (() => {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start >= 0 && end > start) return text.slice(start, end + 1);
      return text; // last resort
    })();
    try {
      parsed = JSON.parse(candidate);
    } catch {
      parsed = { explanation: String(text || '').trim(), issues: [], complexity: 'N/A', suggestions: [] };
    }

    // Normalize fields
    if (!parsed || typeof parsed !== 'object') parsed = { explanation: String(text || '').trim(), issues: [], complexity: 'N/A', suggestions: [] };
    parsed.explanation = String(parsed.explanation || '').trim();
    parsed.issues = Array.isArray(parsed.issues) ? parsed.issues.map((x: any) => String(x)).slice(0, 10) : [];
    parsed.complexity = String(parsed.complexity || 'N/A');
    parsed.suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.map((x: any) => String(x)).slice(0, 10) : [];

    return NextResponse.json({ success: true, data: parsed });
  } catch (e: any) {
    console.error('Explain API error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
