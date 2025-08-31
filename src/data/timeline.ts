export type TimelineItem = {
  title: string;
  period: string;
  description: string;
  icon?: string; // lucide icon name or emoji fallback
};

export const timeline: TimelineItem[] = [
  {
    title: "Frontend Developer",
    period: "2019 → 2020",
    description: "Học và làm các dự án web đầu tiên với HTML/CSS/JS, React.",
    icon: "Code2",
  },
  {
    title: "Full‑Stack Developer",
    period: "2020 → 2022",
    description: "Next.js, Node.js, REST/GraphQL, triển khai sản phẩm thực tế.",
    icon: "Layers",
  },
  {
    title: "Machine Learning Engineer",
    period: "2022 → 2023",
    description: "Xây dựng pipeline ML, training, MLOps, dữ liệu lớn.",
    icon: "Brain",
  },
  {
    title: "AI Engineer",
    period: "2023 → hiện tại",
    description: "LLMs, CV/NLP, phục vụ sản phẩm AI end‑to‑end và tối ưu hóa.",
    icon: "Cpu",
  },
];
