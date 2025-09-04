import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Emotion Analyzer",
  description: "Analyze emotions from text using Hugging Face models",
};

export default function EmotionPage() {
  return (
    <main className="container mx-auto max-w-4xl px-6 py-10 space-y-8">
      <h1 className="text-2xl font-semibold">Emotion Analyzer</h1>
      <Card className="bg-background/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Detect emotions from text</CardTitle>
          <CardDescription>Powered by Hugging Face Inference API</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A project demo for real-time emotion classification from user-provided text. It integrates Next.js
            with Hugging Face Inference API, supports multiple models, and includes robust error handling.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Next.js", "TypeScript", "Hugging Face", "NLP", "Emotion"].map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>
          <div className="mt-5">
            <Button asChild>
              <a href="/">Back to Projects</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
