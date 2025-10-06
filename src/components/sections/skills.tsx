"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SkillsOrbit } from "@/components/skills-orbit";
import { FloatingSphere } from "@/components/ui/floating-3d";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { Target } from "lucide-react";

const skillCategories = {
  "AI & Machine Learning": [
    "Python", "PyTorch", "TensorFlow", "LangChain", "Hugging Face", 
    "Computer Vision", "NLP", "RAG Systems", "LLM"
  ],
  "Frontend Development": [
    "React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", 
    "HTML/CSS", "JavaScript", "Responsive Design"
  ],
  "Backend Development": [
    "Node.js", ".NET", "Blazor", "MongoDB", "SQL Server", 
    "REST APIs", "GraphQL", "Database Design"
  ],
  "Tools & Technologies": [
    "Git", "Docker", "VS Code", "Jupyter", "Three.js", 
    "TensorFlow.js", "Vercel", "Cloud Platforms"
  ]
};

export function SkillsSection() {
  return (
    <section id="skills" className="mt-16 scroll-mt-24 relative">
      {/* Floating 3D Element */}
      <div className="absolute top-0 left-0 -z-10 opacity-15">
        <FloatingSphere />
      </div>
      
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-2xl font-semibold flex items-center gap-3"
      >
        <AnimatedIcon icon={Target} animation="pulse" color="emerald" size={32} />
        Skills
      </motion.h2>

      {/* Orbiting skills icons */}
      <div className="mb-8 flex w-full items-center justify-center">
        <SkillsOrbit />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 gap-8 md:grid-cols-2"
      >
        {Object.entries(skillCategories).map(([category, skills], categoryIndex) => (
          <motion.div
            key={category}
            className="space-y-4"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: categoryIndex * 0.1 }}
          >
            <h3 className="text-lg font-semibold text-foreground border-b border-white/10 pb-2">
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 text-emerald-200 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-default"
                  >
                    {skill}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// Removed AnimatedProgress component as we no longer use percentage-based skill ratings
