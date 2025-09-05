export type ProjectMetric = {
  label: string;
  value: string;
  tooltip?: string;
};

export type Project = {
  title: string;
  desc: string;
  img: string;
  tags: string[];
  link: string; // primary link (usually internal case study or demo)
  category: "AI" | "Web" | "Data";
  status?: "live" | "demo";
  repo?: string; // GitHub URL
  live?: string; // live demo URL
  caseStudy?: string; // internal case-study route
  metrics?: ProjectMetric[]; // snapshot metrics for hover reveal
};

export const projects: Project[] = [
  {
    title: "AI Chatbot RAG",
    desc: "LLM chatbot with retrieval-augmented generation over docs.",
    img: "/projects/ai-chatbot.svg",
    tags: ["Next.js", "RAG", "OpenAI", "Pinecone"],
    link: "/chatbot-rag",
    status: "demo",
    repo: "https://github.com/",
    live: "/chatbot-rag",
    caseStudy: "/insights/vector-db-101",
    metrics: [
      { label: "Latency", value: "~900ms", tooltip: "UI-only mock; khi kết nối vLLM có thể 200–600ms tuỳ GPU" },
      { label: "Tokens", value: "~200", tooltip: "Độ dài đầu ra trung bình cho câu trả lời" },
      { label: "Recall", value: "85%", tooltip: "Ước lượng với chunking + rerank nhỏ" },
    ],
    category: "AI",
  },
  {
    title: "GPU Vision Pipeline",
    desc: "Real-time object detection + tracking with ONNX/TensorRT.",
    img: "/projects/gpu-vision.svg",
    tags: ["PyTorch", "TensorRT", "CUDA"],
    link: "#",
    status: "live",
    repo: "https://github.com/",
    live: "#",
    caseStudy: "/insights/gpu-vs-cpu",
    metrics: [
      { label: "FPS", value: "60", tooltip: "1080p trên RTX 4090 với TensorRT-INT8" },
      { label: "Latency", value: "<18ms" },
    ],
    category: "AI",
  },
  {
    title: "Analytics Dashboard",
    desc: "Scalable analytics dashboard with auth and charts.",
    img: "/projects/analytics.svg",
    tags: ["Next.js", "tRPC", "Postgres"],
    link: "#",
    status: "demo",
    repo: "https://github.com/",
    live: "#",
    category: "Web",
  },
  {
    title: "ETL Pipeline",
    desc: "Data ingestion and transformation for BI workloads.",
    img: "/projects/etl.svg",
    tags: ["Airflow", "dbt", "BigQuery"],
    link: "#",
    status: "live",
    repo: "https://github.com/",
    live: "#",
    category: "Data",
  },
  {
    title: "AI Portfolio",
    desc: "Interactive 3D + motion powered personal portfolio.",
    img: "/next.svg",
    tags: ["Three.js", "Framer Motion", "shadcn/ui"],
    link: "#",
    status: "live",
    repo: "https://github.com/",
    live: "#",
    category: "Web",
  },
];
