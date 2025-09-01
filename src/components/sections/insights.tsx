"use client";

import { motion } from "framer-motion";
import { posts } from "@/data/posts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
    <section id="insights" className="mt-16 scroll-mt-24">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-2xl font-semibold"
      >
        Insights
      </motion.h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
              <Card className="h-full bg-background/60 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  <CardDescription>{new Date(p.date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{p.summary}</p>
                  <div className="mt-3 text-xs text-muted-foreground">{p.tags.join(" • ")}</div>
                  <div className="mt-4">
                    <Link href={href} className="text-primary underline underline-offset-4">Read</Link>
                  </div>
                </CardContent>
              </Card>
              <ArticleJsonLd url={jsonUrl} title={p.title} date={p.date} summary={p.summary} />
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
