"use client";

import { FadeUp, Stagger, StaggerChild } from "@/components/motion";

const sectors = [
  "Global Shipping",
  "Beverage & FMCG",
  "Healthcare",
  "E-commerce",
  "Digital Agencies",
  "Professional Services",
];

const testimonials = [
  {
    quote:
      "Marcus and Mattias are aware of all the systems coming out, which makes them very able to guide corporates to make the most of the opportunities.",
    author: "Tom S.",
    company: "Adsmith Digital",
  },
  {
    quote:
      "You clearly have superb knowledge in this field, with the much-needed emphasis on security.",
    author: "Sharne",
    company: "Institute of Preventative Medicine",
  },
  {
    quote:
      "The insights gained from AI Tappers are invaluable. They have truly helped us embrace AI to its fullest potential.",
    author: "Genevieve",
    company: "Head of HR, RocketMill",
  },
];

export function Trust() {
  return (
    <section id="trust" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp>
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-4">
            Trusted Across Industries
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-16 max-w-3xl">
            From startups to enterprise. Real problems, real results.
          </h2>
        </FadeUp>

        {/* Sectors */}
        <Stagger className="flex flex-wrap gap-3 mb-16" stagger={0.05}>
          {sectors.map((sector) => (
            <StaggerChild key={sector}>
              <span className="px-4 py-2 rounded-full border border-accent/40 text-sm text-accent font-mono">
                {sector}
              </span>
            </StaggerChild>
          ))}
        </Stagger>

        {/* Testimonials */}
        <Stagger className="grid md:grid-cols-3 gap-6" stagger={0.08}>
          {testimonials.map((t, i) => (
            <StaggerChild key={i}>
              <blockquote className="p-6 rounded-xl border border-border bg-card/30 h-full flex flex-col">
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer>
                  <p className="text-sm font-medium text-foreground">
                    {t.author}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.company}</p>
                </footer>
              </blockquote>
            </StaggerChild>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
