export type TimelineItem = {
  title: string;
  period: string;
  description: string;
  icon?: string; // lucide icon name or emoji fallback
};

export const timeline: TimelineItem[] = [
  {
    title: "Student",
    period: "2022 → 2026",
    description: "Learn at Hanoi University of Science and Technology",
    icon: "Code2",
  },
  {
    title: "Full‑Stack Developer",
    period: "2025 → present",
    description: "React, Blazor, .NET 9, MongoDB, SQL Server",
    icon: "Layers",
  },
  // {
  //   title: "Machine Learning Engineer",
  //   period: "2022 → 2023",
  //   description: "Xây dựng pipeline ML, training, MLOps, dữ liệu lớn.",
  //   icon: "Brain",
  // },
  // {
  //   title: "AI Engineer",
  //   period: "2023 → hiện tại",
  //   description: "LLMs, CV/NLP, phục vụ sản phẩm AI end‑to‑end và tối ưu hóa.",
  //   icon: "Cpu",
  // },
];
