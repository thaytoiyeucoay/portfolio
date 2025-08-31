import { Hero } from "@/components/hero";
import { AboutSection } from "@/components/sections/about";
import { TimelineSection } from "@/components/sections/timeline";
import { ProjectsSection } from "@/components/sections/projects";
import { SkillsSection } from "@/components/sections/skills";
import { InsightsSection } from "@/components/sections/insights";
import { ContactSection } from "@/components/sections/contact";

export default function Home() {
  return (
    <main className="container mx-auto max-w-6xl px-6 py-10 space-y-16">
      <Hero />
      <AboutSection />
      <TimelineSection />
      <ProjectsSection />
      <SkillsSection />
      <InsightsSection />
      <ContactSection />
    </main>
  );
}
