"use client";

import { HeroGrid } from "@/components/hero-grid";
import { FadeUp } from "@/components/motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroGrid />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <FadeUp>
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-6">
            Governance-first AI partner
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            AI that works inside
            <br />
            <span className="text-accent">your reality.</span>
          </h1>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            We help organisations design, build, and operate AI inside real
            workflows. With governance, ownership, and human oversight built in
            from day one.
          </p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-accent text-background font-medium text-sm hover:bg-accent/90 transition-all duration-200 hover:shadow-[0_0_20px_hsla(195,70%,50%,0.3)]"
            >
              Book a Discovery Call
            </a>
            <a
              href="#how-we-work"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted/50 transition-colors duration-200"
            >
              See How We Work
            </a>
          </div>
        </FadeUp>
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
