"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/footer";
import { LogoMark } from "@/components/logo";
import { FadeUp, Stagger, StaggerChild, ScaleIn } from "@/components/motion";
import { ArchitectureDiagram } from "./diagram";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const challenges = [
  {
    title: "Information Fragmentation",
    text: "Critical knowledge is spread across documents, emails, operational systems and internal repositories. Teams spend hours searching for information that should take seconds to find.",
    detail:
      "In a typical organisation, the same piece of information lives in five different places. An operator searching for a specific clause, a historical decision, or a procedure has to know which system to look in, which tags to use, and often resorts to asking colleagues. Industry benchmarks suggest knowledge workers spend over 9 hours per week just searching for information. Multiply that across 100 operators and the cost is staggering.",
  },
  {
    title: "Manual Information Work",
    text: "Employees gather, interpret and synthesise information from multiple systems before a single decision can be made. The same data gets re-keyed, re-checked, and re-interpreted across tools that don't talk to each other.",
    detail:
      "We consistently find that operators spend 5 to 10 hours per week on manual data entry, correction, and cross-referencing. Speed calculations done on handheld calculators because the system can't do it. Compliance figures maintained in personal Excel files because the platform doesn't support them. Reports compiled by copying from three different tools into a fourth. None of this is value-adding work.",
  },
  {
    title: "Operational Complexity",
    text: "As organisations grow, workflows become increasingly dependent on human interpretation of fragmented information. Processes that worked for 50 people break down at 200.",
    detail:
      "The challenge is not that processes don't exist. It is that documented procedures and actual practice diverge over time. New hires learn from colleagues, not from the manual. Regional offices develop their own workflows. The result is that the same task gets done in dozens of different ways across the organisation, making standardisation, quality control, and knowledge transfer increasingly difficult.",
  },
  {
    title: "Shadow AI",
    text: "Your team is already using ChatGPT, Copilot and other AI tools independently. Sensitive data, contract terms, customer information, commercial figures, pasted into tools with zero oversight.",
    detail:
      "Every day without governance is another day of uncontrolled risk. We have seen contract terms pasted into free-tier AI tools, commercial disputes escalated because AI-drafted language was identified by opposing counsel, and sensitive operational data shared with models that have no data processing agreement. The question is not whether your people use AI. It is whether you have any visibility or control over how.",
  },
  {
    title: "Unstructured Experimentation",
    text: "Isolated AI pilots. Proof-of-concepts that dazzle in demos but collapse in production. Tool purchases without adoption plans. Activity that looks like progress but produces nothing operational.",
    detail:
      "87% of AI projects never make it to production. The pattern is consistent: a vendor demo impresses leadership, a pilot gets funded, it works beautifully with curated data in controlled conditions, and then it meets reality. Messy inputs, edge cases, users who don't read instructions, systems that need to work at 3 AM on a Sunday. Bridging that gap requires engineering discipline, operational thinking, and honest scoping.",
  },
];

const timelineSteps = [
  {
    number: "01",
    title: "Listen",
    weeks: "Week 1-2",
    description:
      "We interview 15 to 20 stakeholders across your organisation. Not just leadership. Directors, team leads, the people on the tools every day. Structured questionnaires and open interviews designed to capture what is really happening, not what the org chart says should be happening.",
    items: [
      "Day-to-day workflows and information flows",
      "Operational bottlenecks and manual work",
      "Current AI usage, including shadow AI",
      "Systems landscape and data architecture",
      "Organisational readiness and change capacity",
    ],
    footnote:
      "Every interview is transcribed and cross-referenced. We don't cherry-pick quotes that support a thesis. We let the patterns emerge.",
  },
  {
    number: "02",
    title: "Analyse",
    weeks: "Week 2-3",
    description:
      "We audit your systems, data flows, and integration points. We research your vendor ecosystem, benchmark against your industry peers, and assess what is technically feasible with your current infrastructure.",
    items: [
      "Business value and operational impact",
      "Implementation complexity",
      "System dependencies and data availability",
      "Organisational change required",
      "Governance and compliance requirements",
    ],
    footnote:
      "Every claim in our report is sourced. External research is clearly separated from interview findings. We grade our own work before you see it.",
  },
  {
    number: "03",
    title: "Recommend",
    weeks: "Week 3-4",
    description:
      "We deliver a comprehensive technical report and an executive summary. The technical document is built for your engineering and data teams. The executive summary is built for the people who need to say yes.",
    items: [
      "Prioritised AI use case catalogue",
      "Technical architecture recommendations",
      "Implementation roadmap with dependencies",
      "Risk and change management plan",
      "Governance framework aligned to your regulatory environment",
    ],
    footnote:
      "We present findings in person, walk through the roadmap, and answer every question. You leave with a clear decision: build, wait, or walk away.",
  },
];

const stats = [
  { value: "16+", label: "Stakeholder interviews and questionnaire responses, fully cross-referenced" },
  { value: "180+", label: "Data fields mapped across core operational systems" },
  { value: "9", label: "Use cases identified, scored, and prioritised by value, feasibility, and risk" },
  { value: "8", label: "Independent research reports on vendor landscape, governance, and peer benchmarking" },
  { value: "96", label: "Pages of technical findings" },
  { value: "12", label: "Page executive summary for leadership" },
];

const capabilities = [
  {
    title: "Knowledge Assistants",
    description:
      "AI systems that retrieve and surface relevant procedures, operational guidance and internal documentation when teams need them. Reduces hours spent searching across fragmented repositories.",
  },
  {
    title: "Contract and Document Intelligence",
    description:
      "AI systems that analyse complex contractual or operational documents and highlight relevant obligations, risks and operational constraints. Replaces manual interpretation of lengthy documents.",
  },
  {
    title: "Operational Monitoring",
    description:
      "AI systems that monitor operational communications and updates, identifying emerging issues or exceptions requiring attention. Helps teams manage high volumes of operational information without missing critical signals.",
  },
  {
    title: "Strategic Signal Radar",
    description:
      "AI-powered monitoring that tracks emerging market signals, competitive activity and external trends relevant to organisational strategy. Early warning, not hindsight.",
  },
  {
    title: "Workflow Assistants",
    description:
      "AI systems that assist teams in preparing operational instructions, summaries and reports by synthesising information from multiple sources. Turns hours of manual compilation into minutes.",
  },
];

const afterPoints = [
  { bold: "You own the report.", rest: "It is yours regardless of what happens next." },
  { bold: "Build is scoped, not open-ended.", rest: "One use case at a time. Clear acceptance criteria. Defined ownership." },
  { bold: "We work inside your systems.", rest: "No proprietary platforms. No lock-in. What we build, you keep." },
  { bold: "Phased deployment.", rest: "Pilot first, then integrate, then expand. No big bang rollouts." },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function DiscoveryContent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Minimal centered header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex justify-center py-4">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <LogoMark size={24} color="hsl(36 87% 56%)" />
          </a>
        </div>
      </header>
      <main>
        {/* HERO */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-24">
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <FadeUp>
              <p className="text-sm font-mono text-accent tracking-widest uppercase mb-6">
                AI Capability Discovery
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                We don&apos;t guess.
                <br />
                <span className="text-accent">We map.</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Our focus is not on AI tools. Our focus is on operational
                intelligence. Discovery is a fixed-fee, time-bound deep dive
                into your organisation. You get a clear picture of where AI
                creates real value, what is feasible, and what to build first.
                No sales pitch. No commitment to build. Just answers.
              </p>
            </FadeUp>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* THE CHALLENGE */}
        <ChallengeSection />

        {/* HOW DISCOVERY WORKS */}
        <TimelineSection />

        {/* THE DEPTH */}
        <DepthSection />

        {/* WHAT GETS BUILT */}
        <CapabilitiesSection />

        {/* AFTER DISCOVERY */}
        <AfterSection />

        {/* INVESTMENT */}
        <InvestmentSection />

        {/* CTA */}
        <CTASection />
      </main>
      <Footer />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTIONS                                                           */
/* ------------------------------------------------------------------ */

function ChallengeSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const toggle = (i: number) => setExpandedIndex(expandedIndex === i ? null : i);

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp>
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-4">
            Why Most AI Projects Fail
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-16 max-w-3xl">
            The problem is never the technology.
          </h2>
        </FadeUp>
        <Stagger className="grid md:grid-cols-2 gap-6 lg:gap-8" stagger={0.08}>
          {challenges.map((item, i) => (
            <StaggerChild key={i}>
              <button
                onClick={() => toggle(i)}
                className="group w-full text-left p-6 rounded-xl border border-border bg-card/50 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-display text-lg font-semibold text-accent mb-2">
                      {item.title}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                  <motion.span
                    animate={{ rotate: expandedIndex === i ? 45 : 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-accent text-xl font-light mt-1 shrink-0"
                  >
                    +
                  </motion.span>
                </div>
                <AnimatePresence>
                  {expandedIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-muted-foreground/80 leading-relaxed mt-4 pt-4 border-t border-border/50">
                        {item.detail}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </StaggerChild>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp>
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-4">
            The Process
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 max-w-3xl">
            Four weeks. Three stages. Full transparency.
          </h2>
          <p className="text-muted-foreground text-lg mb-16 max-w-2xl">
            Each stage has a defined output and a clear decision point before
            the next. No open-ended engagements. No scope creep.
          </p>
        </FadeUp>

        <div className="relative">
          <div className="hidden lg:block absolute left-[39px] top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent" />
          <Stagger className="flex flex-col gap-12" stagger={0.1}>
            {timelineSteps.map((step) => (
              <StaggerChild key={step.number}>
                <div className="group relative flex flex-col lg:flex-row gap-6 lg:gap-10">
                  <div className="flex-shrink-0 flex items-start">
                    <div className="relative z-10 w-20 h-20 rounded-xl bg-card border border-border group-hover:border-accent/40 flex items-center justify-center transition-colors duration-300">
                      <span className="font-mono text-lg text-accent font-semibold">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 pb-6 lg:pb-0">
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-1">
                      {step.title}
                    </h3>
                    <p className="text-accent text-sm font-medium mb-4">
                      {step.weeks}
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-5 max-w-2xl">
                      {step.description}
                    </p>
                    <ul className="flex flex-wrap gap-2 mb-5">
                      {step.items.map((item, i) => (
                        <li
                          key={i}
                          className="text-xs font-mono px-3 py-1.5 rounded-full border border-accent/40 text-accent"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-muted-foreground/70 italic max-w-2xl">
                      {step.footnote}
                    </p>
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

function DepthSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp>
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-4">
            What Thorough Looks Like
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-16 max-w-3xl">
            This is not a slide deck.
          </h2>
        </FadeUp>
        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.06}>
          {stats.map((s, i) => (
            <StaggerChild key={i}>
              <div className="p-6 rounded-xl border border-border bg-card/30 h-full">
                <p className="font-display text-3xl md:text-4xl font-bold text-accent mb-3">
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.label}
                </p>
              </div>
            </StaggerChild>
          ))}
        </Stagger>
        <FadeUp delay={0.3}>
          <p className="text-xs text-muted-foreground/60 mt-8 max-w-xl">
            These numbers are from a real engagement. Every Discovery is scoped
            to your organisation. Some are larger, some smaller. The rigour is
            the same.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp>
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-4">
            AI Capabilities
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 max-w-3xl">
            From findings to operational tools.
          </h2>
          <p className="text-muted-foreground text-lg mb-16 max-w-2xl">
            Based on Discovery insights, we design targeted AI capabilities
            embedded within your existing workflows. Not new platforms. Not
            standalone tools. Intelligence layered into the systems your teams
            already use.
          </p>
        </FadeUp>

        <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.06}>
          {capabilities.map((item, i) => (
            <StaggerChild key={i}>
              <div className="group p-6 rounded-xl border border-border bg-card/30 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300 h-full">
                <h3 className="font-display text-lg font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </StaggerChild>
          ))}
          <StaggerChild>
            <div className="p-6 rounded-xl border border-dashed border-accent/30 bg-transparent h-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground/60 text-center italic">
                All systems are designed to support teams and enhance
                decision-making, not replace human expertise.
              </p>
            </div>
          </StaggerChild>
        </Stagger>

        <ArchitectureDiagram />
      </div>
    </section>
  );
}

function AfterSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp>
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-4">
            What Happens Next
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 max-w-3xl">
            You decide.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-2xl">
            Discovery ends with a recommendation. Not a sales pitch for Phase 2.
            If nothing is worth building, we tell you. If a vendor product solves
            the problem better than custom AI, we tell you that too. We have no
            incentive to recommend work that doesn't need doing.
          </p>
        </FadeUp>
        <Stagger className="grid sm:grid-cols-2 gap-6" stagger={0.08}>
          {afterPoints.map((p, i) => (
            <StaggerChild key={i}>
              <div className="p-6 rounded-xl border border-border bg-card/30">
                <p className="text-sm leading-relaxed">
                  <span className="text-foreground font-medium">{p.bold}</span>{" "}
                  <span className="text-muted-foreground">{p.rest}</span>
                </p>
              </div>
            </StaggerChild>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function InvestmentSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm font-mono text-accent tracking-widest uppercase mb-4">
              Investment
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Discovery Investment
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              The AI Capability Discovery engagement is delivered as a
              fixed-fee engagement.
            </p>
            <div className="p-8 rounded-xl border border-accent/40 bg-card/30 mb-8">
              <p className="font-display text-4xl md:text-5xl font-bold text-accent mb-3">
                &pound;30,000
              </p>
              <p className="text-sm text-muted-foreground">
                Fixed fee. Typically 4 weeks.
              </p>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2 text-left inline-block">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">&#10003;</span>
                Organisational workflow analysis
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">&#10003;</span>
                15-20 operational interviews
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">&#10003;</span>
                AI opportunity identification and scoring
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">&#10003;</span>
                Prioritised AI capability roadmap
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">&#10003;</span>
                Detailed technical report + executive summary
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">&#10003;</span>
                In-person findings presentation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">&#10003;</span>
                Governance and security framework
              </li>
            </ul>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <FadeUp>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Ready to find out what AI can actually do for your organisation?
          </h2>
          <a
            href="/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-accent text-background font-medium text-sm hover:bg-accent/90 transition-all duration-200 hover:shadow-[0_0_20px_hsla(36,87%,56%,0.3)]"
          >
            Start a Conversation
          </a>
        </FadeUp>
      </div>
    </section>
  );
}
