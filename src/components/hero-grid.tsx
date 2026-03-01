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
  const shouldReduceMotion = useReducedMotion();

  const initNodes = useCallback((w: number, h: number) => {
    const spacing = 50;
    const cols = Math.ceil(w / spacing) + 2;
    const rows = Math.ceil(h / spacing) + 2;
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
    blobsRef.current = [
      {
        x: w * 0.3,
        y: h * 0.4,
        radius: Math.min(w, h) * 0.25,
        vx: 0.3,
        vy: 0.2,
        hue: 195,
      },
      {
        x: w * 0.7,
        y: h * 0.6,
        radius: Math.min(w, h) * 0.2,
        vx: -0.25,
        vy: 0.15,
        hue: 210,
      },
      {
        x: w * 0.5,
        y: h * 0.3,
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
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // --- Layer 1: Gradient blobs ---
      const blobCanvas = document.createElement("canvas");
      blobCanvas.width = w;
      blobCanvas.height = h;
      const bCtx = blobCanvas.getContext("2d")!;

      for (const blob of blobs) {
        // Drift blobs
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Bounce off edges with padding
        const pad = blob.radius * 0.5;
        if (blob.x < -pad || blob.x > w + pad) blob.vx *= -1;
        if (blob.y < -pad || blob.y > h + pad) blob.vy *= -1;

        // Slow morphing radius
        const morphRadius =
          blob.radius + Math.sin(time * 0.0008 + blob.hue) * blob.radius * 0.15;

        const gradient = bCtx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          morphRadius
        );
        gradient.addColorStop(0, `hsla(${blob.hue}, 70%, 50%, 0.12)`);
        gradient.addColorStop(0.4, `hsla(${blob.hue}, 60%, 40%, 0.06)`);
        gradient.addColorStop(1, `hsla(${blob.hue}, 50%, 30%, 0)`);

        bCtx.beginPath();
        bCtx.arc(blob.x, blob.y, morphRadius, 0, Math.PI * 2);
        bCtx.fillStyle = gradient;
        bCtx.fill();
      }

      ctx.drawImage(blobCanvas, 0, 0);

      // --- Layer 2: Constellation network ---
      const connectionDist = 90;
      const mouseRadius = 200;
      const mouseGravity = 30;

      // Update node positions
      for (const node of nodes) {
        // Ambient drift
        const driftX = Math.sin(time * 0.0004 + node.baseX * 0.01) * 8;
        const driftY = Math.cos(time * 0.0003 + node.baseY * 0.012) * 8;

        // Target position = base + drift
        let targetX = node.baseX + driftX;
        let targetY = node.baseY + driftY;

        // Mouse gravity well
        const dmx = mx - node.x;
        const dmy = my - node.y;
        const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);

        if (mouseDist < mouseRadius && mouseDist > 0) {
          const force = (1 - mouseDist / mouseRadius) * mouseGravity;
          targetX += (dmx / mouseDist) * force;
          targetY += (dmy / mouseDist) * force;
        }

        // Smooth interpolation
        node.x += (targetX - node.x) * 0.04;
        node.y += (targetY - node.y) * 0.04;
      }

      // Draw connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.15;

            // Brighter near mouse
            let mouseBoost = 0;
            const midX = (a.x + b.x) / 2;
            const midY = (a.y + b.y) / 2;
            const midMouseDist = Math.sqrt(
              (midX - mx) ** 2 + (midY - my) ** 2
            );
            if (midMouseDist < mouseRadius) {
              mouseBoost = (1 - midMouseDist / mouseRadius) * 0.2;
            }

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(195, 60%, 60%, ${alpha + mouseBoost})`;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const dmx = mx - node.x;
        const dmy = my - node.y;
        const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
        const mouseInfluence =
          mouseDist < mouseRadius ? 1 - mouseDist / mouseRadius : 0;

        const size = node.size + mouseInfluence * 1.5;
        const alpha = 0.12 + mouseInfluence * 0.35;

        // Glow for nodes near mouse
        if (mouseInfluence > 0.3) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(195, 70%, 55%, ${mouseInfluence * 0.08})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
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
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!initializedRef.current) {
        initNodes(rect.width, rect.height);
        initBlobs(rect.width, rect.height);
        initializedRef.current = true;
      }
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetRef.current.x = e.clientX - rect.left;
      targetRef.current.y = e.clientY - rect.top;
    };

    const onLeave = () => {
      targetRef.current.x = -1000;
      targetRef.current.y = -1000;
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    const loop = (time: number) => {
      // Smooth mouse tracking
      mouseRef.current.x +=
        (targetRef.current.x - mouseRef.current.x) * 0.08;
      mouseRef.current.y +=
        (targetRef.current.y - mouseRef.current.y) * 0.08;

      const rect = canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height, time);
      animId = requestAnimationFrame(loop);
    };

    if (!shouldReduceMotion) {
      animId = requestAnimationFrame(loop);
    } else {
      // Static render
      initNodes(canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);
      initBlobs(canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);
      const rect = canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height, 0);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [draw, initNodes, initBlobs, shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
