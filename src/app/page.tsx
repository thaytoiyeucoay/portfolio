import { Hero } from "@/components/hero";
import { AboutSection } from "@/components/sections/about";
import { TimelineSection } from "@/components/sections/timeline";
import { ProjectsSection } from "@/components/sections/projects";
import { SkillsSection } from "@/components/sections/skills";
import { ContactSection } from "@/components/sections/contact";
import { InsightsSection } from "@/components/sections/insights";
import { DataVizSection } from "@/components/sections/data-viz";
import { StructuredData } from "@/components/structured-data";

export default function Home() {
  return (
    <>
      <StructuredData />
      <main className="container mx-auto max-w-6xl px-6 py-10 space-y-16">
        <Hero />
        <AboutSection />
        <TimelineSection />
        <ProjectsSection />
        {/* <DataVizSection /> */}
        <SkillsSection />
        <InsightsSection />
        <ContactSection />
      </main>
    </>
  );
}
