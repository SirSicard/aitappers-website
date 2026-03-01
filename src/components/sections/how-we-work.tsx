"use client";

import { FadeUp, Stagger, StaggerChild } from "@/components/motion";

const steps = [
  {
    number: "01",
    title: "Discovery",
    subtitle: "Fixed-fee. Time-bound. No build commitment.",
    description:
      "We map your operations, identify where AI creates real value, and assess feasibility and risk for each use case. You get a clear recommendation and prioritised roadmap. If nothing is worth building, we tell you.",
    deliverables: [
      "Use-case priority map",
      "Value, feasibility, and risk signals",
      "Governance requirements",
      "Build recommendation",
    ],
  },
  {
    number: "02",
    title: "Build",
    subtitle: "Small, scoped units. One problem at a time.",
    description:
      "Each build tackles a single, well-defined problem with clear acceptance criteria. We work inside your systems, not ours. Every solution fits your governance framework and is designed for real users from the start.",
    deliverables: [
      "Working solution with real data",
      "Integration with your systems",
      "Governance compliance",
      "User adoption plan",
    ],
  },
  {
    number: "03",
    title: "Support",
    subtitle: "Your terms. Your ownership model.",
    description:
      "Once it works, you decide how ownership looks. Full handover with documentation. A retainer where we monitor and optimise. Or an SLA where we stay accountable for performance.",
    deliverables: [
      "You own it: complete handover",
      "We watch it: monitoring retainer",
      "We are on the hook: performance SLA",
    ],
  },
];

export function HowWeWork() {
  return (
    <section id="how-we-work" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp>
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-4">
            How We Work
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 max-w-3xl">
            A clear path from question to production.
          </h2>
          <p className="text-muted-foreground text-lg mb-16 max-w-2xl">
            No open-ended engagements. No scope creep. Each phase has a defined
            output and a clear decision point before the next.
          </p>
        </FadeUp>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-[39px] top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent" />

          <Stagger className="flex flex-col gap-12" stagger={0.1}>
            {steps.map((step) => (
              <StaggerChild key={step.number}>
                <div className="group relative flex flex-col lg:flex-row gap-6 lg:gap-10">
                  {/* Step number */}
                  <div className="flex-shrink-0 flex items-start">
                    <div className="relative z-10 w-20 h-20 rounded-xl bg-card border border-border group-hover:border-accent/40 flex items-center justify-center transition-colors duration-300">
                      <span className="font-mono text-lg text-accent font-semibold">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6 lg:pb-0">
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-1">
                      {step.title}
                    </h3>
                    <p className="text-accent text-sm font-medium mb-4">
                      {step.subtitle}
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                      {step.description}
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {step.deliverables.map((d, i) => (
                        <li
                          key={i}
                          className="text-xs font-mono px-3 py-1.5 rounded-full border border-accent/40 text-accent"
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
