"use client";

import { useEffect, useRef, useCallback } from "react";

// --- Logo shape: diamond + center dot as particle target positions ---
// Diamond path: M16 2 L30 16 L16 30 L2 16 Z (in 32x32 viewBox)
// We sample points along the edges + fill the center dot

function generateLogoTargets(
  centerX: number,
  centerY: number,
  scale: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  // Diamond corners in local space (viewBox 32x32, centered at 16,16)
  const corners = [
    { x: 0, y: -14 }, // top
    { x: 14, y: 0 },  // right
    { x: 0, y: 14 },  // bottom
    { x: -14, y: 0 }, // left
  ];

  // Sample points along each edge
  const pointsPerEdge = 18;
  for (let e = 0; e < 4; e++) {
    const a = corners[e];
    const b = corners[(e + 1) % 4];
    for (let i = 0; i < pointsPerEdge; i++) {
      const t = i / pointsPerEdge;
      points.push({
        x: centerX + (a.x + (b.x - a.x) * t) * scale,
        y: centerY + (a.y + (b.y - a.y) * t) * scale,
      });
    }
  }

  // Center dot — filled circle of particles (r=2.5 in viewBox)
  const dotRadius = 2.5 * scale;
  const dotParticles = 12;
  // Center point
  points.push({ x: centerX, y: centerY });
  // Rings
  for (let ring = 1; ring <= 2; ring++) {
    const r = (dotRadius * ring) / 2;
    const count = ring === 1 ? 4 : dotParticles - 4;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + ring * 0.3;
      points.push({
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
      });
    }
  }

  return points;
}

// --- Particle types ---
interface Particle {
  // Current position
  x: number;
  y: number;
  // Scattered position (start)
  scatterX: number;
  scatterY: number;
  // Logo target position
  logoX: number;
  logoY: number;
  // Constellation grid position
  gridX: number;
  gridY: number;
  // Velocity for ambient drift
  vx: number;
  vy: number;
  // Base size
  size: number;
  // Assembly delay (0-1, for staggered assembly)
  assemblyDelay: number;
  // Is this a "logo" particle or a "background" particle?
  isLogo: boolean;
}

interface Blob {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  hue: number;
}

// --- Animation phases ---
const enum Phase {
  SCATTER = 0,
  ASSEMBLE = 1,
  HOLD = 2,
  WIPE = 3,
  CONSTELLATION = 4,
}

const ASSEMBLE_DURATION = 1000;
const HOLD_DURATION = 500;
const WIPE_DURATION = 800;
const TOTAL_INTRO = ASSEMBLE_DURATION + HOLD_DURATION + WIPE_DURATION + 200; // +buffer

const STORAGE_KEY = "aitappers-intro-seen";

interface ParticleSystemProps {
  onIntroComplete: () => void;
  skipIntro: boolean;
}

export function ParticleSystem({ onIntroComplete, skipIntro }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const blobsRef = useRef<Blob[]>([]);
  const phaseRef = useRef<Phase>(skipIntro ? Phase.CONSTELLATION : Phase.SCATTER);
  const phaseStartRef = useRef(0);
  const introStartRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const targetMouseRef = useRef({ x: -1000, y: -1000 });
  const scrollRef = useRef(0);
  const initializedRef = useRef(false);
  const introCompleteCalledRef = useRef(skipIntro);
  const wipeProgressRef = useRef(skipIntro ? 1 : 0);

  // Grid wipe tiles
  const wipeTilesRef = useRef<{ col: number; row: number; delay: number; cx: number; cy: number }[]>([]);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    const docH = Math.max(h, document.documentElement.scrollHeight || h * 3);

    // Logo targets
    const logoScale = Math.min(w, h) * 0.035;
    const logoTargets = generateLogoTargets(w / 2, h / 2, logoScale);

    // Grid spacing for constellation
    const spacing = 50;
    const cols = Math.ceil(w / spacing) + 2;
    const rows = Math.ceil(docH / spacing) + 2;

    // Create logo particles
    for (let i = 0; i < logoTargets.length; i++) {
      const t = logoTargets[i];
      // Find nearest grid position for this logo particle's constellation destination
      const gridX = Math.round(t.x / spacing) * spacing;
      const gridY = Math.round(t.y / spacing) * spacing;

      particles.push({
        x: skipIntro ? gridX : Math.random() * w,
        y: skipIntro ? gridY : Math.random() * h,
        scatterX: Math.random() * w,
        scatterY: Math.random() * h,
        logoX: t.x,
        logoY: t.y,
        gridX,
        gridY,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: 1.4 + Math.random() * 0.6,
        assemblyDelay: Math.random() * 0.4,
        isLogo: true,
      });
    }

    // Create background constellation particles
    const logoParticleGridKeys = new Set(
      particles.map(p => `${Math.round(p.gridX / spacing)}_${Math.round(p.gridY / spacing)}`)
    );

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const key = `${i}_${j}`;
        if (logoParticleGridKeys.has(key)) continue; // Already have a logo particle here

        const gx = i * spacing - spacing * 0.5;
        const gy = j * spacing - spacing * 0.5;

        particles.push({
          x: skipIntro ? gx : Math.random() * w,
          y: skipIntro ? gy : Math.random() * h,
          scatterX: Math.random() * w,
          scatterY: Math.random() * h,
          logoX: gx, // background particles don't form logo, stay scattered
          logoY: gy,
          gridX: gx,
          gridY: gy,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          size: 1 + Math.random() * 0.8,
          assemblyDelay: 0,
          isLogo: false,
        });
      }
    }

    particlesRef.current = particles;

    // Grid wipe tiles
    const tileCols = 8;
    const tileRows = 6;
    const tiles: { col: number; row: number; delay: number; cx: number; cy: number }[] = [];
    const centerCol = (tileCols - 1) / 2;
    const centerRow = (tileRows - 1) / 2;
    let maxDist = 0;

    for (let c = 0; c < tileCols; c++) {
      for (let r = 0; r < tileRows; r++) {
        const dist = Math.sqrt((c - centerCol) ** 2 + (r - centerRow) ** 2);
        if (dist > maxDist) maxDist = dist;
        tiles.push({
          col: c,
          row: r,
          delay: dist,
          cx: (c + 0.5) / tileCols,
          cy: (r + 0.5) / tileRows,
        });
      }
    }
    // Normalize delays to 0-1
    for (const tile of tiles) {
      tile.delay /= maxDist;
    }
    wipeTilesRef.current = tiles;
  }, [skipIntro]);

  const initBlobs = useCallback((w: number, h: number) => {
    const docH = Math.max(h, document.documentElement.scrollHeight || h * 3);
    blobsRef.current = [
      { x: w * 0.3, y: docH * 0.1, radius: Math.min(w, h) * 0.25, vx: 0.3, vy: 0.2, hue: 195 },
      { x: w * 0.7, y: docH * 0.4, radius: Math.min(w, h) * 0.2, vx: -0.25, vy: 0.15, hue: 210 },
      { x: w * 0.5, y: docH * 0.7, radius: Math.min(w, h) * 0.18, vx: 0.15, vy: -0.2, hue: 180 },
    ];
  }, []);

  const draw = useCallback((
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
  ) => {
    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;
    const blobs = blobsRef.current;
    const phase = phaseRef.current;
    const scroll = scrollRef.current;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y + scroll;

    const phaseElapsed = time - phaseStartRef.current;

    // --- Phase transitions ---
    if (phase === Phase.SCATTER && !skipIntro) {
      // Auto-transition after 500ms of scatter
      if (phaseElapsed > 500) {
        phaseRef.current = Phase.ASSEMBLE;
        phaseStartRef.current = time;
      }
    } else if (phase === Phase.ASSEMBLE) {
      if (phaseElapsed > ASSEMBLE_DURATION) {
        phaseRef.current = Phase.HOLD;
        phaseStartRef.current = time;
      }
    } else if (phase === Phase.HOLD) {
      if (phaseElapsed > HOLD_DURATION) {
        phaseRef.current = Phase.WIPE;
        phaseStartRef.current = time;
      }
    } else if (phase === Phase.WIPE) {
      const wipeT = Math.min(phaseElapsed / WIPE_DURATION, 1);
      wipeProgressRef.current = wipeT;
      if (wipeT >= 1) {
        phaseRef.current = Phase.CONSTELLATION;
        phaseStartRef.current = time;
        if (!introCompleteCalledRef.current) {
          introCompleteCalledRef.current = true;
          onIntroComplete();
        }
      }
    }

    const isIntro = phase < Phase.CONSTELLATION;
    const viewTop = scroll - 100;
    const viewBottom = scroll + h + 100;

    // --- Blobs (only in constellation phase or during wipe) ---
    if (phase >= Phase.WIPE) {
      const blobAlpha = phase === Phase.WIPE
        ? Math.min(phaseElapsed / WIPE_DURATION, 1)
        : 1;

      for (const blob of blobs) {
        blob.x += blob.vx;
        blob.y += blob.vy;
        const docH = document.documentElement.scrollHeight || h * 3;
        const pad = blob.radius * 0.5;
        if (blob.x < -pad || blob.x > w + pad) blob.vx *= -1;
        if (blob.y < -pad || blob.y > docH + pad) blob.vy *= -1;

        if (blob.y + blob.radius < viewTop || blob.y - blob.radius > viewBottom) continue;

        const morphRadius = blob.radius + Math.sin(time * 0.0008 + blob.hue) * blob.radius * 0.15;
        const drawY = blob.y - scroll;

        const gradient = ctx.createRadialGradient(blob.x, drawY, 0, blob.x, drawY, morphRadius);
        gradient.addColorStop(0, `hsla(${blob.hue}, 70%, 50%, ${0.09 * blobAlpha})`);
        gradient.addColorStop(0.4, `hsla(${blob.hue}, 60%, 40%, ${0.04 * blobAlpha})`);
        gradient.addColorStop(1, `hsla(${blob.hue}, 50%, 30%, 0)`);

        ctx.beginPath();
        ctx.arc(blob.x, drawY, morphRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // --- Update particle positions ---
    const connectionDist = 90;
    const mouseRadius = 200;
    const mouseGravity = 30;

    const visibleParticles: Particle[] = [];

    for (const p of particles) {
      let targetX: number;
      let targetY: number;
      let lerpSpeed: number;

      if (phase === Phase.SCATTER) {
        // Gentle drift from scatter positions
        const drift = Math.sin(time * 0.001 + p.scatterX * 0.01) * 3;
        targetX = p.scatterX + drift;
        targetY = p.scatterY + Math.cos(time * 0.0008 + p.scatterY * 0.01) * 3;
        lerpSpeed = 0.02;
      } else if (phase === Phase.ASSEMBLE) {
        const rawT = phaseElapsed / ASSEMBLE_DURATION;
        // Per-particle staggered timing
        const adjustedT = Math.max(0, Math.min(1, (rawT - p.assemblyDelay * 0.3) / (1 - p.assemblyDelay * 0.3)));
        // Spring-like easing: overshoot slightly
        const eased = 1 - Math.pow(1 - adjustedT, 3) * Math.cos(adjustedT * Math.PI * 0.5);

        if (p.isLogo) {
          targetX = p.scatterX + (p.logoX - p.scatterX) * eased;
          targetY = p.scatterY + (p.logoY - p.scatterY) * eased;
        } else {
          // Background particles drift gently, don't assemble
          const drift = Math.sin(time * 0.001 + p.scatterX * 0.01) * 3;
          targetX = p.scatterX + drift;
          targetY = p.scatterY + Math.cos(time * 0.0008 + p.scatterY * 0.01) * 3;
        }
        lerpSpeed = 0.15;
      } else if (phase === Phase.HOLD) {
        if (p.isLogo) {
          // Breathing effect
          const breathe = Math.sin(time * 0.005) * 1.5;
          const dx = p.logoX - w / 2;
          const dy = p.logoY - h / 2;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          targetX = p.logoX + (dx / dist) * breathe;
          targetY = p.logoY + (dy / dist) * breathe;
        } else {
          const drift = Math.sin(time * 0.001 + p.scatterX * 0.01) * 3;
          targetX = p.scatterX + drift;
          targetY = p.scatterY + Math.cos(time * 0.0008 + p.scatterY * 0.01) * 3;
        }
        lerpSpeed = 0.1;
      } else if (phase === Phase.WIPE) {
        const wipeT = Math.min(phaseElapsed / WIPE_DURATION, 1);
        // Ease out expo
        const eased = 1 - Math.pow(1 - wipeT, 3);

        if (p.isLogo) {
          // Scatter from logo position to grid position
          targetX = p.logoX + (p.gridX - p.logoX) * eased;
          targetY = p.logoY + (p.gridY - p.logoY) * eased;
        } else {
          // Background particles move to grid positions
          targetX = p.scatterX + (p.gridX - p.scatterX) * eased;
          targetY = p.scatterY + (p.gridY - p.scatterY) * eased;
        }
        lerpSpeed = 0.15;
      } else {
        // Constellation mode — same as original hero-grid
        const driftX = Math.sin(time * 0.0004 + p.gridX * 0.01) * 8;
        const driftY = Math.cos(time * 0.0003 + p.gridY * 0.012) * 8;
        targetX = p.gridX + driftX;
        targetY = p.gridY + driftY;

        // Mouse interaction
        const dmx = mx - p.x;
        const dmy = my - p.y;
        const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
        if (mouseDist < mouseRadius && mouseDist > 0) {
          const force = (1 - mouseDist / mouseRadius) * mouseGravity;
          targetX += (dmx / mouseDist) * force;
          targetY += (dmy / mouseDist) * force;
        }
        lerpSpeed = 0.04;
      }

      p.x += (targetX - p.x) * lerpSpeed;
      p.y += (targetY - p.y) * lerpSpeed;

      // Filter to visible particles
      if (isIntro || (p.y > viewTop - 50 && p.y < viewBottom + 50)) {
        visibleParticles.push(p);
      }
    }

    // --- Draw connections (constellation phase + wipe transition) ---
    if (phase >= Phase.WIPE) {
      const connAlpha = phase === Phase.WIPE
        ? Math.min(phaseElapsed / WIPE_DURATION, 1) * 0.5
        : 1;

      ctx.lineWidth = 0.5;
      for (let i = 0; i < visibleParticles.length; i++) {
        for (let j = i + 1; j < visibleParticles.length; j++) {
          const a = visibleParticles[i];
          const b = visibleParticles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.1 * connAlpha;

            let mouseBoost = 0;
            if (phase === Phase.CONSTELLATION) {
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;
              const midMouseDist = Math.sqrt((midX - mx) ** 2 + (midY - my) ** 2);
              if (midMouseDist < mouseRadius) {
                mouseBoost = (1 - midMouseDist / mouseRadius) * 0.15;
              }
            }

            const drawAY = isIntro ? a.y : a.y - scroll;
            const drawBY = isIntro ? b.y : b.y - scroll;

            ctx.beginPath();
            ctx.moveTo(a.x, drawAY);
            ctx.lineTo(b.x, drawBY);
            ctx.strokeStyle = `hsla(195, 60%, 60%, ${alpha + mouseBoost})`;
            ctx.stroke();
          }
        }
      }
    }

    // --- Draw particles ---
    for (const p of visibleParticles) {
      const drawY = isIntro ? p.y : p.y - scroll;

      let alpha: number;
      let size = p.size;

      if (isIntro && p.isLogo && (phase === Phase.ASSEMBLE || phase === Phase.HOLD)) {
        // Logo particles brighter during assembly/hold
        alpha = 0.6;
        size = p.size * 1.3;
      } else if (isIntro && !p.isLogo) {
        // Background particles dimmer during intro
        alpha = 0.04;
      } else if (isIntro) {
        alpha = 0.15;
      } else {
        // Constellation mode — mouse interaction brightness
        const dmx = mx - p.x;
        const dmy = my - p.y;
        const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
        const mouseInfluence = mouseDist < mouseRadius ? 1 - mouseDist / mouseRadius : 0;
        size = p.size + mouseInfluence * 1.5;
        alpha = 0.08 + mouseInfluence * 0.25;

        // Glow on close mouse
        if (mouseInfluence > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, drawY, size + 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(195, 70%, 55%, ${mouseInfluence * 0.06})`;
          ctx.fill();
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, drawY, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(195, 65%, 65%, ${alpha})`;
      ctx.fill();
    }
  }, [skipIntro, onIntroComplete]);

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
        initParticles(w, h);
        initBlobs(w, h);
        initializedRef.current = true;
      }
    };

    const onMove = (e: MouseEvent) => {
      targetMouseRef.current.x = e.clientX;
      targetMouseRef.current.y = e.clientY;
    };

    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };

    resize();
    scrollRef.current = window.scrollY;
    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });

    if (skipIntro) {
      phaseRef.current = Phase.CONSTELLATION;
    } else {
      introStartRef.current = performance.now();
      phaseStartRef.current = performance.now();
    }

    const loop = (time: number) => {
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.08;

      draw(ctx, window.innerWidth, window.innerHeight, time);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [draw, initParticles, initBlobs, skipIntro]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}

// --- Grid Wipe Overlay ---
// This is a DOM-based overlay that creates the tile-flip effect

interface GridWipeProps {
  active: boolean;
  progress: number;
}

export function GridWipeOverlay({ active }: GridWipeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLDivElement[]>([]);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";
    tilesRef.current = [];

    const cols = 8;
    const rows = 6;
    const centerCol = (cols - 1) / 2;
    const centerRow = (rows - 1) / 2;

    // Find max distance for normalization
    let maxDist = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const dist = Math.sqrt((c - centerCol) ** 2 + (r - centerRow) ** 2);
        if (dist > maxDist) maxDist = dist;
      }
    }

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const tile = document.createElement("div");
        const dist = Math.sqrt((c - centerCol) ** 2 + (r - centerRow) ** 2);
        const delay = (dist / maxDist) * 400; // 0-400ms stagger

        tile.style.cssText = `
          position: absolute;
          left: ${(c / cols) * 100}%;
          top: ${(r / rows) * 100}%;
          width: ${100 / cols}%;
          height: ${100 / rows}%;
          background: hsl(228 12% 5%);
          transform-origin: center center;
          transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms,
                      opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms;
          backface-visibility: hidden;
        `;
        container.appendChild(tile);
        tilesRef.current.push(tile);
      }
    }

    // Trigger the wipe after a frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        for (const tile of tilesRef.current) {
          const randomAngle = (Math.random() - 0.5) * 30;
          tile.style.transform = `perspective(600px) rotateX(${70 + randomAngle}deg) scale(0.8)`;
          tile.style.opacity = "0";
        }
      });
    });
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  );
}
