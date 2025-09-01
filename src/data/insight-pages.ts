export type InsightPagesMap = Record<string, string[]>; // slug -> list of page image urls

// Hướng dẫn đặt file ảnh trang (render từ PDF bằng công cụ của bạn):
// - Tạo thư mục public/insights/<slug>/
// - Đặt các trang: page-1.png, page-2.png, ... (PNG hoặc JPG đều được)
// - Ví dụ cho slug "gpu-vs-cpu": public/insights/gpu-vs-cpu/page-1.png
// Bạn chỉ cần thêm đường dẫn vào map dưới đây.

export const INSIGHT_PAGES: InsightPagesMap = {
  // Ví dụ (bạn hãy thay bằng ảnh thật)
  // "gpu-vs-cpu": [
  //   "/insights/gpu-vs-cpu/page-1.png",
  //   "/insights/gpu-vs-cpu/page-2.png",
  // ],
  // "fake-news-gnn": [
  //   "/insights/fake-news-gnn/page-1.png",
  // ],
  // "captioning-ai": [
  //   "/insights/captioning-ai/page-1.png",
  // ],
};
