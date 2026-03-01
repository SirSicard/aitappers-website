"use client";

import Image from "next/image";
import { FadeUp, ScaleIn } from "@/components/motion";

const team = [
  {
    name: "Marcus Cronan",
    role: "Commercial Lead & Governance",
    bio: "25+ years in global digital media. Led campaigns for Adidas, Hyundai, and Skittles. Now applies that strategic rigour to AI implementation, ensuring every engagement delivers measurable business value within proper governance frameworks.",
    image: "/images/marcus.png",
    linkedin: "https://www.linkedin.com/in/marcuscronan888/",
  },
  {
    name: "Mattias Herzig",
    role: "Technical Authority & Architecture",
    bio: "AI engineer and systems architect. Designs and delivers AI solutions that work inside real infrastructure. Responsible for technical quality, architecture decisions, and making sure what gets built actually works in production.",
    image: "/images/mattias.png",
    linkedin: "https://www.linkedin.com/in/mattiasherzig/",
  },
];

export function Team() {
  return (
    <section id="team" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp>
          <p className="text-sm font-mono text-accent tracking-widest uppercase mb-4">
            The Team
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-16 max-w-3xl">
            Two founders. Full ownership of every engagement.
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-10">
          {team.map((person, i) => (
            <FadeUp key={person.name} delay={i * 0.1}>
              <div className="group">
                <ScaleIn delay={i * 0.1 + 0.1}>
                  <div className="relative aspect-[3/4] w-full max-w-sm rounded-xl overflow-hidden mb-6 bg-card border border-border">
                    <Image
                      src={person.image}
                      alt={`${person.name}, ${person.role} at AI Tappers`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </ScaleIn>
                <h3 className="font-display text-xl font-semibold mb-1">
                  {person.name}
                </h3>
                <p className="text-accent text-sm font-medium mb-3">
                  {person.role}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-md">
                  {person.bio}
                </p>
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                  aria-label={`${person.name} on LinkedIn`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
