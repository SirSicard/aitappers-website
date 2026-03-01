"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}

export function FadeUp({
  children,
  delay = 0,
  className,
  as = "div",
}: FadeUpProps) {
  const shouldReduceMotion = useReducedMotion();
  const Component = motion.create(as);

  return (
    <Component
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.5, ease: easeOutExpo, delay }}
      className={className}
    >
      {children}
    </Component>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}

export function Stagger({
  children,
  className,
  stagger = 0.06,
}: StaggerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15%" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : stagger,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChild({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={
        shouldReduceMotion
          ? {}
          : {
              hidden: { opacity: 0, y: 24 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, ease: easeOutExpo },
              },
            }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.4, ease: easeOutExpo, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
