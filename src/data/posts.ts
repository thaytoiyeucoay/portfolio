export type Post = {
  title: string;
  slug: string;
  summary: string;
  date: string; // ISO
  tags: string[];
  url?: string; // canonical url (optional override)
};

export const posts: Post[] = [
  {
    title: "GPU vs CPU cho AI/ML",
    slug: "gpu-vs-cpu",
    summary:
      "Khi nào nên dùng GPU thay vì CPU? Nhìn vào throughput song song, băng thông bộ nhớ và chi phí triển khai.",
    date: "2025-08-25",
    tags: ["GPU", "CPU", "Performance"],
  },
  {
    title: "Phát hiện Fake News với GNN",
    slug: "fake-news-gnn",
    summary:
      "Dùng Graph Neural Networks để mô hình hoá quan hệ người dùng/bài viết, cải thiện độ chính xác so với mô hình thuần văn bản.",
    date: "2025-08-27",
    tags: ["GNN", "Graph", "NLP"],
  },
  {
    title: "Image Captioning bằng AI",
    slug: "captioning-ai",
    summary:
      "Pipeline từ CNN/ViT trích xuất đặc trưng đến Transformer sinh mô tả, mẹo fine-tune và đánh giá BLEU/CIDEr.",
    date: "2025-08-29",
    tags: ["CV", "Transformer", "Captioning"],
  },
];
