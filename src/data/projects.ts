export type Project = {
  title: string;
  desc: string;
  img: string;
  tags: string[];
  link: string;
  category: "AI" | "Web" | "Data";
};

export const projects: Project[] = [
  {
    title: "AI Chatbot RAG",
    desc: "LLM chatbot with retrieval-augmented generation over docs.",
    img: "/next.svg",
    tags: ["Next.js", "RAG", "OpenAI", "Pinecone"],
    link: "#",
    category: "AI",
  },
  {
    title: "GPU Vision Pipeline",
    desc: "Real-time object detection + tracking with ONNX/TensorRT.",
    img: "/next.svg",
    tags: ["PyTorch", "TensorRT", "CUDA"],
    link: "#",
    category: "AI",
  },
  {
    title: "Analytics Dashboard",
    desc: "Scalable analytics dashboard with auth and charts.",
    img: "/next.svg",
    tags: ["Next.js", "tRPC", "Postgres"],
    link: "#",
    category: "Web",
  },
  {
    title: "ETL Pipeline",
    desc: "Data ingestion and transformation for BI workloads.",
    img: "/next.svg",
    tags: ["Airflow", "dbt", "BigQuery"],
    link: "#",
    category: "Data",
  },
  {
    title: "AI Portfolio",
    desc: "Interactive 3D + motion powered personal portfolio.",
    img: "/next.svg",
    tags: ["Three.js", "Framer Motion", "shadcn/ui"],
    link: "#",
    category: "Web",
  },
];
