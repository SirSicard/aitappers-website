"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeUp, Stagger, StaggerChild } from "@/components/motion";

const problems = [
  {
    stat: "87%",
    text: "of AI projects never make it to production. The bottleneck is rarely the technology.",
    detail:
      "Organisations rush to adopt AI without aligning it to real workflows, clear ownership, or measurable outcomes. The result? Proof-of-concepts that dazzle in demos but collapse under production requirements. Data quality, security review, change management, and the dozen unglamorous things between 'cool prototype' and 'actually useful tool'. The technology works. The organisational readiness almost never does.",
  },
  {
    stat: "Shadow AI",
    text: "is already in your organisation. People are screenshotting sensitive data into ChatGPT right now.",
    detail:
      "Your team isn't waiting for an AI strategy. They're already pasting customer emails, financial data, and internal docs into free-tier AI tools with zero oversight. Every day without governance is another day of uncontrolled data leakage, compliance risk, and habit-forming workarounds that get harder to unwind. The question isn't whether your people use AI. It's whether you have any visibility or control over how.",
  },
  {
    stat: "Tools",
    text: "are not solutions. Buying a platform without governance, adoption, or ownership planning is a recipe for waste.",
    detail:
      "Enterprise AI platforms are a $200B+ market, and vendors are excellent at selling possibility. But a tool without adoption planning collects dust. A tool without governance creates risk. A tool without clear ownership becomes nobody's problem, until it becomes everybody's problem. We've seen six-figure platform licences gathering dust because nobody mapped them to actual work, trained actual users, or defined who's responsible when something breaks.",
  },
  {
    stat: "Demos",
    text: 'impress boardrooms. Production systems serve real users. Most "AI initiatives" never bridge the gap.',
    detail:
      "There's a graveyard of AI projects that looked incredible in a 30-minute presentation. Clean data, curated examples, perfect conditions. Production is none of those things. It's messy inputs, edge cases, users who don't read instructions, systems that need to work at 3 AM on a Sunday. Bridging that gap requires engineering discipline, operational thinking, and honest scoping. Not another pitch deck with a hockey-stick chart.",
  },
];

export function Problem() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setExpandedIndex(expandedIndex === i ? null : i);
  };

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
              <button
                onClick={() => toggle(i)}
                className="group w-full text-left p-6 rounded-xl border border-border bg-card/50 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-display text-2xl md:text-3xl font-bold text-accent mb-3">
                      {item.stat}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
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
