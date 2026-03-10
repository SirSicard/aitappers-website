"use client";

import { motion } from "framer-motion";
import { FadeUp } from "@/components/motion";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const sources = [
  { label: "Systems", sub: "ERP / CRM / Ops Platforms", x: 100 },
  { label: "Documents", sub: "Contracts / SOPs / Reports", x: 300 },
  { label: "Communications", sub: "Email / Chat / Updates", x: 500 },
];

const capabilities = [
  "Knowledge Assistants",
  "Contract Intelligence",
  "Operational Monitoring",
  "Workflow Assistants",
];

export function ArchitectureDiagram() {
  return (
    <FadeUp>
      <div className="w-full max-w-2xl mx-auto mt-12 mb-4">
        <svg viewBox="0 0 600 420" fill="none" className="w-full h-auto">
          {/* Source boxes */}
          {sources.map((s, i) => (
            <motion.g
              key={s.label}
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: easeOutExpo,
              }}
            >
              <rect
                x={s.x - 75}
                y={20}
                width={150}
                height={60}
                rx={8}
                stroke="hsl(36 87% 56%)"
                strokeWidth={1}
                fill="hsl(228 10% 8%)"
              />
              <text
                x={s.x}
                y={44}
                textAnchor="middle"
                fill="hsl(0 0% 95%)"
                fontSize={13}
                fontWeight={600}
                fontFamily="var(--font-display), system-ui, sans-serif"
              >
                {s.label}
              </text>
              <text
                x={s.x}
                y={62}
                textAnchor="middle"
                fill="hsl(228 5% 55%)"
                fontSize={9}
                fontFamily="var(--font-sans), system-ui, sans-serif"
              >
                {s.sub}
              </text>
            </motion.g>
          ))}

          {/* Lines from sources to AI layer */}
          {sources.map((s, i) => (
            <motion.line
              key={`line-${i}`}
              x1={s.x}
              y1={80}
              x2={300}
              y2={140}
              stroke="hsl(36 87% 56%)"
              strokeWidth={1}
              strokeOpacity={0.3}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.3 + i * 0.08,
                ease: easeOutExpo,
              }}
            />
          ))}

          {/* AI Capability Layer */}
          <motion.g
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5, ease: easeOutExpo }}
          >
            <rect
              x={100}
              y={140}
              width={400}
              height={130}
              rx={10}
              stroke="hsl(36 87% 56%)"
              strokeWidth={1.5}
              fill="hsl(228 10% 8%)"
            />
            <text
              x={300}
              y={168}
              textAnchor="middle"
              fill="hsl(36 87% 56%)"
              fontSize={11}
              fontWeight={600}
              fontFamily="var(--font-mono), monospace"
              letterSpacing="0.1em"
            >
              AI CAPABILITY LAYER
            </text>
            {capabilities.map((c, i) => (
              <text
                key={c}
                x={300}
                y={195 + i * 20}
                textAnchor="middle"
                fill="hsl(228 5% 55%)"
                fontSize={11}
                fontFamily="var(--font-sans), system-ui, sans-serif"
              >
                {c}
              </text>
            ))}
          </motion.g>

          {/* Line from AI layer to teams */}
          <motion.line
            x1={300}
            y1={270}
            x2={300}
            y2={310}
            stroke="hsl(36 87% 56%)"
            strokeWidth={1}
            strokeOpacity={0.3}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.7, ease: easeOutExpo }}
          />

          {/* Operational Teams */}
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8, ease: easeOutExpo }}
          >
            <rect
              x={150}
              y={310}
              width={300}
              height={50}
              rx={8}
              stroke="hsl(36 87% 56%)"
              strokeWidth={1}
              fill="hsl(228 10% 8%)"
            />
            <text
              x={300}
              y={332}
              textAnchor="middle"
              fill="hsl(0 0% 95%)"
              fontSize={12}
              fontWeight={600}
              fontFamily="var(--font-display), system-ui, sans-serif"
            >
              Operational Teams
            </text>
            <text
              x={300}
              y={350}
              textAnchor="middle"
              fill="hsl(228 5% 55%)"
              fontSize={9}
              fontFamily="var(--font-sans), system-ui, sans-serif"
            >
              Operators / Managers / Analysts
            </text>
          </motion.g>

          {/* Result labels */}
          <motion.g
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.0, ease: easeOutExpo }}
          >
            <text
              x={300}
              y={390}
              textAnchor="middle"
              fill="hsl(36 87% 56%)"
              fontSize={11}
              fontFamily="var(--font-sans), system-ui, sans-serif"
              fontWeight={500}
            >
              Better Decisions / Faster Workflows / Less Manual Work
            </text>
          </motion.g>
        </svg>
      </div>
    </FadeUp>
  );
}
