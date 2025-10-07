import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function buildTargetUrl(base: string, prefix: string | undefined, pathParts: string[], search: string) {
  const clean = (s?: string) => (s ? s.replace(/\/$/, "") : "");
  const baseClean = clean(base);
  const prefixClean = clean(prefix);
  const pathStr = pathParts.join("/");
  const url = `${baseClean}${prefixClean ? `/${prefixClean}` : ""}/${pathStr}${search || ""}`;
  return url;
}

async function proxy(req: NextRequest, ctx: { params: { path: string[] } }) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json({ error: "Missing API_BASE_URL" }, { status: 500 });
  }
  const prefix = process.env.API_PREFIX;
  const target = buildTargetUrl(base, prefix, ctx.params.path || [], req.nextUrl.search);

  // Clone incoming headers and strip hop-by-hop headers
  const outHeaders = new Headers(req.headers);
  outHeaders.delete("host");
  outHeaders.delete("content-length");
  outHeaders.delete("connection");
  outHeaders.delete("accept-encoding");
  outHeaders.delete("x-forwarded-host");
  outHeaders.delete("x-forwarded-proto");

  // Attach backend token if configured and Authorization not already provided by client
  const backendToken = process.env.BACKEND_TOKEN;
  if (backendToken && !outHeaders.has("authorization")) {
    outHeaders.set("authorization", `Bearer ${backendToken}`);
  }

  const init: RequestInit = {
    method: req.method,
    headers: outHeaders,
    // Forward body for relevant methods
    body: ["GET", "HEAD"].includes(req.method) ? undefined : (req.body as any),
    redirect: "manual",
  };

  const resp = await fetch(target, init);

  // Pass-through response body and headers
  const headers = new Headers(resp.headers);
  // Optionally remove sensitive headers
  headers.delete("transfer-encoding");

  return new NextResponse(resp.body, { status: resp.status, headers });
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx);
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx);
}
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx);
}
export async function HEAD(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx);
}
export async function OPTIONS(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx);
}
