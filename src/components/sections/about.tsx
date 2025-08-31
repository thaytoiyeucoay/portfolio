"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AboutSection() {
  const skills = ["Python", "PyTorch", "TensorFlow", "LangChain", "Next.js", "React", "Node.js", "OpenAI", "RAG", "Vector DB"];

  return (
    <section id="about" className="mt-16 scroll-mt-24">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-2xl font-semibold"
      >
        About Me
      </motion.h2>
      <Card className="bg-background/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-2 ring-primary/30">
              {/* Cập nhật đường dẫn ảnh thật của bạn tại đây, ví dụ: /avatar.jpg */}
              <AvatarImage src="/avatar.jpg" alt="Khánh Duy Bùi" />
              <AvatarFallback className="text-sm">DB</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">Khánh Duy Bùi</CardTitle>
              <div className="mt-1 text-sm text-muted-foreground">
                AI Engineer & Full‑stack Developer
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mình xây dựng các hệ thống AI end‑to‑end: từ xử lý dữ liệu, huấn luyện mô hình (LLM/CV/NLP), đến triển khai vào sản phẩm thực tế với hiệu năng và trải nghiệm người dùng cao. 
            Ưu tiên kiến trúc sạch, đo lường, và tối ưu hoá chi phí vận hành.
          </p>
          <p className="text-sm text-muted-foreground">
            Gần đây mình tập trung vào ứng dụng LLM (RAG, function calling, tool use), tối ưu hạ tầng inference (GPU/ONNX/TensorRT), và các sản phẩm web hiện đại với Next.js, shadcn/ui, Framer Motion.
          </p>

          {/* Thông tin cá nhân nhanh - chỉnh sửa giá trị ngay bên dưới */}
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Date of birth</div>
              <div className="font-medium">16/08/2004</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Education</div>
              <div className="font-medium">Toán Tin — Hanoi University of Science and Technology</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="font-medium">duy.bk1608@gmail.com</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Phone</div>
              <div className="font-medium">0862 607 525</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Address</div>
              <div className="font-medium">Hai Phong, Viet Nam</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Website</div>
              <div className="font-medium"><a className="underline underline-offset-4" href="https://yourdomain.com" target="_blank" rel="noreferrer">yourdomain.com</a></div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">LinkedIn</div>
              <div className="font-medium"><a className="underline underline-offset-4" href="https://linkedin.com/in/your-id" target="_blank" rel="noreferrer">linkedin.com/in/your-id</a></div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">GitHub</div>
              <div className="font-medium"><a className="underline underline-offset-4" href="https://github.com/your-id" target="_blank" rel="noreferrer">github.com/your-id</a></div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Experience</div>
              <div className="font-medium">4+ năm Dev / 2+ năm AI</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Sở trường</div>
              <div className="font-medium">LLM, RAG, CV/NLP</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Stack</div>
              <div className="font-medium">PyTorch, Next.js, Cloud</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <Badge key={s} variant="secondary" className="backdrop-blur">
                {s}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
