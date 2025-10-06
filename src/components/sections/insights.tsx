"use client";

import { motion } from "framer-motion";
import { posts } from "@/data/posts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FloatingGem } from "@/components/ui/floating-3d";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { BookOpen, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function ArticleJsonLd({
  url,
  title,
  date,
  summary,
}: {
  url: string;
  title: string;
  date: string;
  summary: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    datePublished: date,
    dateModified: date,
    author: { "@type": "Person", name: "Duy Bùi" },
    publisher: { "@type": "Organization", name: "Duy Bùi" },
    description: summary,
    mainEntityOfPage: url,
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function InsightsSection() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <section id="insights" className="mt-16 scroll-mt-24 relative">
      {/* Floating 3D Element */}
      <div className="absolute -top-5 right-10 -z-10 opacity-15">
        <FloatingGem />
      </div>
      
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-2xl font-semibold flex items-center gap-3"
      >
        <AnimatedIcon icon={BookOpen} animation="float" color="yellow" size={32} />
        Insights
      </motion.h2>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        {posts.map((p, i) => {
          const href = p.url ?? `/insights/${p.slug}`;
          const jsonUrl = origin ? `${origin}${href.startsWith("#") ? "/" + href : href}` : href;
          return (
            <motion.article
              id={`insights-${p.slug}`}
              key={p.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="group h-full overflow-hidden bg-gradient-to-br from-background to-background/80 border border-white/10 rounded-2xl shadow-xl backdrop-blur-sm transition-all hover:ring-2 hover:ring-yellow-400/40 hover:shadow-yellow-500/20 hover:-translate-y-1">
                {/* Article Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                  <Image
                    src={`/insights/${p.slug}.svg`}
                    alt={p.title}
                    fill
                    className="object-contain p-6 transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* Date Badge */}
                  <div className="absolute left-3 top-3">
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(p.date).toLocaleDateString('vi-VN')}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-yellow-400 transition-colors">
                    {p.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                    {p.summary}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs hover:bg-yellow-500/10">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <Button asChild size="sm" variant="outline" className="gap-2 group-hover:border-yellow-400/50">
                      <Link href={href}>
                        <BookOpen className="size-4" /> Read Article
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="gap-2">
                      <Link href={href}>
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <ArticleJsonLd url={jsonUrl} title={p.title} date={p.date} summary={p.summary} />
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
