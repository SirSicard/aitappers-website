"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface Node {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
}

interface Blob {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  hue: number;
}

export function HeroGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const targetRef = useRef({ x: -1000, y: -1000 });
  const nodesRef = useRef<Node[]>([]);
  const blobsRef = useRef<Blob[]>([]);
  const initializedRef = useRef(false);
  const scrollRef = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  const initNodes = useCallback((w: number, h: number) => {
    // Create nodes for the full document height
    const docH = Math.max(h, document.documentElement.scrollHeight);
    const spacing = 50;
    const cols = Math.ceil(w / spacing) + 2;
    const rows = Math.ceil(docH / spacing) + 2;
    const nodes: Node[] = [];

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * spacing - spacing * 0.5;
        const y = j * spacing - spacing * 0.5;
        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          size: 1 + Math.random() * 0.8,
        });
      }
    }
    nodesRef.current = nodes;
  }, []);

  const initBlobs = useCallback((w: number, h: number) => {
    const docH = Math.max(h, document.documentElement.scrollHeight);
    blobsRef.current = [
      {
        x: w * 0.3,
        y: docH * 0.1,
        radius: Math.min(w, h) * 0.25,
        vx: 0.3,
        vy: 0.2,
        hue: 195,
      },
      {
        x: w * 0.7,
        y: docH * 0.4,
        radius: Math.min(w, h) * 0.2,
        vx: -0.25,
        vy: 0.15,
        hue: 210,
      },
      {
        x: w * 0.5,
        y: docH * 0.7,
        radius: Math.min(w, h) * 0.18,
        vx: 0.15,
        vy: -0.2,
        hue: 180,
      },
    ];
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, time: number) => {
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const blobs = blobsRef.current;
      const scroll = scrollRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y + scroll; // Mouse in document space

      // Visible range (with padding for connections)
      const viewTop = scroll - 100;
      const viewBottom = scroll + h + 100;

      // --- Layer 1: Gradient blobs (only visible ones) ---
      for (const blob of blobs) {
        blob.x += blob.vx;
        blob.y += blob.vy;

        const docH = document.documentElement.scrollHeight;
        const pad = blob.radius * 0.5;
        if (blob.x < -pad || blob.x > w + pad) blob.vx *= -1;
        if (blob.y < -pad || blob.y > docH + pad) blob.vy *= -1;

        // Skip if not visible
        if (blob.y + blob.radius < viewTop || blob.y - blob.radius > viewBottom)
          continue;

        const morphRadius =
          blob.radius + Math.sin(time * 0.0008 + blob.hue) * blob.radius * 0.15;

        const drawY = blob.y - scroll;

        const gradient = ctx.createRadialGradient(
          blob.x, drawY, 0,
          blob.x, drawY, morphRadius
        );
        gradient.addColorStop(0, `hsla(${blob.hue}, 70%, 50%, 0.09)`);
        gradient.addColorStop(0.4, `hsla(${blob.hue}, 60%, 40%, 0.04)`);
        gradient.addColorStop(1, `hsla(${blob.hue}, 50%, 30%, 0)`);

        ctx.beginPath();
        ctx.arc(blob.x, drawY, morphRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // --- Layer 2: Constellation network (only visible nodes) ---
      const connectionDist = 90;
      const mouseRadius = 200;
      const mouseGravity = 30;

      // Filter to visible nodes
      const visibleNodes: Node[] = [];
      for (const node of nodes) {
        if (node.y < viewTop - 50 || node.y > viewBottom + 50) continue;
        visibleNodes.push(node);
      }

      // Update visible node positions
      for (const node of visibleNodes) {
        const driftX = Math.sin(time * 0.0004 + node.baseX * 0.01) * 8;
        const driftY = Math.cos(time * 0.0003 + node.baseY * 0.012) * 8;

        let targetX = node.baseX + driftX;
        let targetY = node.baseY + driftY;

        const dmx = mx - node.x;
        const dmy = my - node.y;
        const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);

        if (mouseDist < mouseRadius && mouseDist > 0) {
          const force = (1 - mouseDist / mouseRadius) * mouseGravity;
          targetX += (dmx / mouseDist) * force;
          targetY += (dmy / mouseDist) * force;
        }

        node.x += (targetX - node.x) * 0.04;
        node.y += (targetY - node.y) * 0.04;
      }

      // Draw connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < visibleNodes.length; i++) {
        for (let j = i + 1; j < visibleNodes.length; j++) {
          const a = visibleNodes[i];
          const b = visibleNodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.1;

            let mouseBoost = 0;
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const midMouseDist = Math.sqrt(
              (midX - mx) ** 2 + (midY - my) ** 2
            );
            if (midMouseDist < mouseRadius) {
              mouseBoost = (1 - midMouseDist / mouseRadius) * 0.15;
            }

            ctx.beginPath();
            ctx.moveTo(a.x, a.y - scroll);
            ctx.lineTo(b.x, b.y - scroll);
            ctx.strokeStyle = `hsla(195, 60%, 60%, ${alpha + mouseBoost})`;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of visibleNodes) {
        const dmx = mx - node.x;
        const dmy = my - node.y;
        const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
        const mouseInfluence =
          mouseDist < mouseRadius ? 1 - mouseDist / mouseRadius : 0;

        const size = node.size + mouseInfluence * 1.5;
        const alpha = 0.08 + mouseInfluence * 0.25;
        const drawY = node.y - scroll;

        if (mouseInfluence > 0.3) {
          ctx.beginPath();
          ctx.arc(node.x, drawY, size + 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(195, 70%, 55%, ${mouseInfluence * 0.06})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, drawY, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(195, 65%, 65%, ${alpha})`;
        ctx.fill();
      }
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!initializedRef.current) {
        initNodes(w, h);
        initBlobs(w, h);
        initializedRef.current = true;
      }
    };

    const onMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };

    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };

    resize();
    scrollRef.current = window.scrollY;
    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });

    const loop = (time: number) => {
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.08;

      draw(ctx, window.innerWidth, window.innerHeight, time);
      animId = requestAnimationFrame(loop);
    };

    if (!shouldReduceMotion) {
      animId = requestAnimationFrame(loop);
    } else {
      draw(ctx, window.innerWidth, window.innerHeight, 0);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [draw, initNodes, initBlobs, shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
