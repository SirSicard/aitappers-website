"use client";

import { motion, type SVGMotionProps } from "framer-motion";
import { type ComponentProps } from "react";

/**
 * AI Tappers Logomark
 *
 * Design: A diamond (rotated square) with a precise dot at center.
 * The diamond represents architecture, systems, structure.
 * The dot is the "tap point" — precision, connection, unlocking.
 *
 * Works at 16px (favicon) through 200px+ (hero).
 * Single color, no fills on the diamond — stroke only.
 */

interface LogoMarkProps extends ComponentProps<"svg"> {
  size?: number;
  color?: string;
  /** For animated variant — pass motion props to paths */
  animated?: boolean;
  /** Stroke width scales with size, but can be overridden */
  strokeWidth?: number;
}

export function LogoMark({
  size = 32,
  color = "currentColor",
  animated = false,
  strokeWidth,
  ...props
}: LogoMarkProps) {
  const sw = strokeWidth ?? (size <= 20 ? 2.5 : 2);

  if (animated) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        {...props}
      >
        <motion.path
          d="M16 2L30 16L16 30L2 16Z"
          stroke={color}
          strokeWidth={sw}
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.circle
          cx="16"
          cy="16"
          r="2.5"
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M16 2L30 16L16 30L2 16Z"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2.5" fill={color} />
    </svg>
  );
}

interface LogoProps extends ComponentProps<"div"> {
  size?: "sm" | "md" | "lg";
  color?: string;
  showWordmark?: boolean;
}

const sizes = {
  sm: { icon: 20, text: "text-sm" },
  md: { icon: 28, text: "text-lg" },
  lg: { icon: 36, text: "text-xl" },
} as const;

export function Logo({
  size = "md",
  color = "currentColor",
  showWordmark = true,
  ...props
}: LogoProps) {
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5" {...props}>
      <LogoMark size={s.icon} color={color} />
      {showWordmark && (
        <span
          className={`font-display font-semibold tracking-tight ${s.text}`}
          style={{ color }}
        >
          AI Tappers
        </span>
      )}
    </div>
  );
}

/** Large animated logo for intro splash */
export function LogoAnimated({
  size = 80,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <LogoMark size={size} color={color} animated />
      <motion.span
        className="font-display text-2xl font-semibold tracking-tight"
        style={{ color }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
      >
        AI Tappers
      </motion.span>
    </div>
  );
}
