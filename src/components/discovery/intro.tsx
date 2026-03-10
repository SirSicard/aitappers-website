"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";

interface DiscoveryIntroProps {
  onComplete: () => void;
}

// --- Generate particle targets from text ---
function generateTextTargets(
  canvas: HTMLCanvasElement,
  text: string,
  screenW: number,
  screenH: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const ctx = canvas.getContext("2d");
  if (!ctx) return points;

  canvas.width = Math.min(screenW, 1400);
  canvas.height = Math.min(screenH, 700);

  const targetWidth = canvas.width * 0.75;
  let fontSize = canvas.width * 0.14;
  ctx.font = `600 ${fontSize}px "Geist Sans", "Geist", ui-sans-serif, system-ui, sans-serif`;
  const measured = ctx.measureText(text);
  fontSize = fontSize * (targetWidth / measured.width);
  fontSize = Math.max(fontSize, 24);

  ctx.font = `600 ${fontSize}px "Geist Sans", "Geist", ui-sans-serif, system-ui, sans-serif`;
  const m = ctx.measureText(text);
  const textX = (canvas.width - m.width) / 2;
  const ascent = m.actualBoundingBoxAscent || fontSize * 0.75;
  const descent = m.actualBoundingBoxDescent || fontSize * 0.25;
  const textY = (canvas.height + ascent + descent) / 2 - descent;

  ctx.fillStyle = "#fff";
  ctx.fillText(text, textX, textY);

  const step = screenW > 768 ? 5 : 8;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const scaleX = screenW / canvas.width;
  const scaleY = screenH / canvas.height;

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const i = (y * canvas.width + x) * 4;
      if (data[i + 3] > 128) {
        points.push({ x: x * scaleX, y: y * scaleY });
      }
    }
  }

  return points;
}

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  size: number;
  alpha: number;
}

export function DiscoveryIntro({ onComplete }: DiscoveryIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [fading, setFading] = useState(false);

  const SCATTER_DURATION = 0;
  const ASSEMBLE_DURATION = 1200;
  const HOLD_DURATION = 800;
  const TOTAL = SCATTER_DURATION + ASSEMBLE_DURATION + HOLD_DURATION;

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = (canvas as any).__particles;
    if (!particles) return;

    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / ASSEMBLE_DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const accentR = 217;
    const accentG = 169;
    const accentB = 78;

    for (const p of particles) {
      const x = p.startX + (p.targetX - p.startX) * eased;
      const y = p.startY + (p.targetY - p.startY) * eased;
      const alpha = 0.15 + 0.85 * eased;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accentR}, ${accentG}, ${accentB}, ${alpha})`;
      ctx.fill();
    }

    if (elapsed < TOTAL) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      setFading(true);
      setTimeout(onComplete, 600);
    }
  }, [onComplete, ASSEMBLE_DURATION, TOTAL]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement("canvas");
    }

    const targets = generateTextTargets(offscreenRef.current, "Discovery", w, h);

    const particles: Particle[] = targets.map((t) => ({
      x: t.x,
      y: t.y,
      targetX: t.x,
      targetY: t.y,
      startX: Math.random() * w,
      startY: Math.random() * h,
      size: Math.random() * 1.5 + 0.8,
      alpha: 0,
    }));

    (canvas as any).__particles = particles;
    startTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  return (
    <motion.div
      className="fixed inset-0 bg-background z-50"
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />
    </motion.div>
  );
}
