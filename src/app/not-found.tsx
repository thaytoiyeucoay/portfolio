export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <main className="container mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">404 — Không tìm thấy trang</h1>
      <p className="text-muted-foreground mb-6">Trang bạn truy cập không tồn tại hoặc đã bị di chuyển.</p>
      <a href="/" className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-white/5">
        Về trang chủ
      </a>
    </main>
  );
}
