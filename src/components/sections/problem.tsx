"use client";

import { FadeUp, Stagger, StaggerChild } from "@/components/motion";

const problems = [
  {
    stat: "87%",
    text: "of AI projects never make it to production. The bottleneck is rarely the technology.",
  },
  {
    stat: "Shadow AI",
    text: "is already in your organisation. People are screenshotting sensitive data into ChatGPT right now.",
  },
  {
    stat: "Tools",
    text: "are not solutions. Buying a platform without governance, adoption, or ownership planning is a recipe for waste.",
  },
  {
    stat: "Demos",
    text: 'impress boardrooms. Production systems serve real users. Most "AI initiatives" never bridge the gap.',
  },
];

export function Problem() {
  return (
    <section id="problem" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp>
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-4">
            The Problem
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-16 max-w-3xl">
            Most AI projects fail. Not because of the AI.
          </h2>
        </FadeUp>

        <Stagger className="grid md:grid-cols-2 gap-8" stagger={0.08}>
          {problems.map((item, i) => (
            <StaggerChild key={i}>
              <div className="group p-6 rounded-xl border border-border bg-card/50 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300">
                <p className="font-display text-2xl md:text-3xl font-bold text-accent mb-3">
                  {item.stat}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {item.text}
                </p>
              </div>
            </StaggerChild>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
