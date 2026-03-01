"use client";

import { FadeUp, Stagger, StaggerChild } from "@/components/motion";

const differentiators = [
  {
    title: "Governance-first",
    description:
      "We do not move fast and break things. Every solution is designed around your compliance, security, and data governance requirements from the start.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Your systems, not ours",
    description:
      "We build inside your infrastructure, your tech stack, your workflows. No proprietary platforms. No lock-in. What we build, you own.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "Human in the loop",
    description:
      "This is a non-negotiable design constraint. We keep human judgment where it matters and automate where it makes sense.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Ownership by design",
    description:
      "From day one, we design for explicit ownership. You decide who maintains it, who improves it, and who is accountable.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
  },
  {
    title: "Built for adoption",
    description:
      "A tool nobody uses is a failed project. We design for the people who will actually use the system, not for the demo.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: "No hype. Results.",
    description:
      "We do not sell visions. We build things that work with real data, for real users, inside real organisations.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

export function Difference() {
  return (
    <section id="difference" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp>
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-4">
            What Makes Us Different
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-16 max-w-3xl">
            Built for how AI actually works in organisations.
          </h2>
        </FadeUp>

        <Stagger
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          stagger={0.06}
        >
          {differentiators.map((item, i) => (
            <StaggerChild key={i}>
              <div className="group p-6 rounded-xl border border-border bg-card/30 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300 h-full">
                <div className="text-accent mb-4">{item.icon}</div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </StaggerChild>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
