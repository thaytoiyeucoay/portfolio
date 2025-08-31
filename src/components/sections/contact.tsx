"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Facebook, Instagram, Mail, Phone, Github, Linkedin } from "lucide-react";

export function ContactSection() {
  const [loading, setLoading] = useState(false);
  const socials = [
    { label: "Facebook", href: "https://facebook.com/", icon: Facebook },
    { label: "Instagram", href: "https://instagram.com/", icon: Instagram },
    { label: "Gmail", href: "mailto:you@example.com", icon: Mail },
    { label: "Phone", href: "tel:+84123456789", icon: Phone },
    { label: "GitHub", href: "https://github.com/", icon: Github },
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: Linkedin },
  ] as const;
  return (
    <section id="contact" className="mt-16 scroll-mt-24">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-2xl font-semibold"
      >
        Contact
      </motion.h2>

      <Card className="bg-background/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Let’s build something great</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Social links */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {socials.map(({ label, href, icon: Icon }) => (
              <Button
                key={label}
                asChild
                variant="outline"
                size="icon"
                className="size-9 rounded-full"
                aria-label={label}
              >
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
                  <Icon className="size-4" />
                </a>
              </Button>
            ))}
          </div>

          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const formData = new FormData(form);
              const payload = Object.fromEntries(formData.entries());
              try {
                setLoading(true);
                const res = await fetch("/api/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error("Request failed");
                toast.success("Message sent! I will reply soon.");
                form.reset();
              } catch (err) {
                toast.error("Failed to send. Please try again.");
              } finally {
                setLoading(false);
              }
            }}
          >
            <Input name="name" placeholder="Your name" required className="md:col-span-1" />
            <Input name="email" type="email" placeholder="Your email" required className="md:col-span-1" />
            <Textarea name="message" placeholder="Tell me about your project..." className="md:col-span-2" required />
            <div className="md:col-span-2">
              <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
