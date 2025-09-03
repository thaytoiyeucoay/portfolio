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
  {
    title: "Vector Databases 101 cho RAG",
    slug: "vector-db-101",
    summary:
      "Các bước cốt lõi của RAG: chunking, embeddings, ANN index (HNSW/IVF-PQ), reranking và tối ưu chất lượng truy hồi.",
    date: "2025-09-01",
    tags: ["RAG", "Vector DB", "Search"],
  },
  {
    title: "Fine-tuning LLM với LoRA & QLoRA",
    slug: "lora-qlora",
    summary:
      "Giảm số tham số cần huấn luyện bằng low-rank adapters; QLoRA huấn luyện trên trọng số 4-bit để tiết kiệm VRAM.",
    date: "2025-09-02",
    tags: ["LLM", "Fine-tuning", "LoRA"],
  },
  {
    title: "LLM Serving ở quy mô lớn",
    slug: "llm-serving-scale",
    summary:
      "So sánh vLLM và TensorRT-LLM: quản lý KV cache, batching, tối ưu kernel và lưu ý đo đạc hiệu năng.",
    date: "2025-09-03",
    tags: ["Serving", "vLLM", "TensorRT-LLM"],
  },
];
