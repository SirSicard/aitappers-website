"use client";

import { useEffect, useRef, useCallback } from "react";

// --- Text-based particle targets: render "AI TAPPERS" and sample filled pixels ---

function generateTextTargets(
  screenW: number,
  screenH: number,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];

  const offscreen = document.createElement("canvas");
  const canvasW = Math.min(screenW, 1600);
  const canvasH = Math.min(screenH, 800);
  offscreen.width = canvasW;
  offscreen.height = canvasH;
  const octx = offscreen.getContext("2d");
  if (!octx) return points;

  const targetWidth = canvasW * 0.85;
  let fontSize = canvasW * 0.18;
  octx.font = `600 ${fontSize}px "Geist Sans", "Geist", ui-sans-serif, system-ui, -apple-system, sans-serif`;
  let measured = octx.measureText("AI TAPPERS");
  fontSize = fontSize * (targetWidth / measured.width);
  fontSize = Math.max(fontSize, 24);

  octx.font = `600 ${fontSize}px "Geist Sans", "Geist", ui-sans-serif, system-ui, -apple-system, sans-serif`;
  measured = octx.measureText("AI TAPPERS");

  const textWidth = measured.width;
  const textX = (canvasW - textWidth) / 2;
  const ascent = measured.actualBoundingBoxAscent || fontSize * 0.75;
  const descent = measured.actualBoundingBoxDescent || fontSize * 0.25;
  const totalH = ascent + descent;
  const textY = (canvasH + totalH) / 2 - descent;

  octx.fillStyle = "#fff";
  octx.fillText("AI TAPPERS", textX, textY);

  // FIX 3: Reduce particle count — larger step on mobile, slightly larger on desktop
  const step = screenW > 768 ? 5 : 8;
  const imageData = octx.getImageData(0, 0, canvasW, canvasH);
  const data = imageData.data;

  const scaleX = screenW / canvasW;
  const scaleY = screenH / canvasH;

  for (let y = 0; y < canvasH; y += step) {
    for (let x = 0; x < canvasW; x += step) {
      const idx = (y * canvasW + x) * 4;
      if (data[idx + 3] > 128) {
        points.push({
          x: x * scaleX,
          y: y * scaleY,
        });
      }
    }
  }

  return points;
}

// --- Spatial hash for O(n) connection lookups ---
class SpatialHash {
  private cellSize: number;
  private cells: Map<string, number[]>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  clear() {
    this.cells.clear();
  }

  private key(cx: number, cy: number): string {
    return `${cx}_${cy}`;
  }

  insert(index: number, x: number, y: number) {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const k = this.key(cx, cy);
    let arr = this.cells.get(k);
    if (!arr) {
      arr = [];
      this.cells.set(k, arr);
    }
    arr.push(index);
  }

  // Returns indices of particles in same + adjacent cells
  queryNeighbors(x: number, y: number): number[] {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const result: number[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const arr = this.cells.get(this.key(cx + dx, cy + dy));
        if (arr) {
          for (let i = 0; i < arr.length; i++) {
            result.push(arr[i]);
          }
        }
      }
    }
    return result;
  }
}

// --- Particle types ---
interface Particle {
  x: number;
  y: number;
  scatterX: number;
  scatterY: number;
  logoX: number;
  logoY: number;
  gridX: number;
  gridY: number;
  vx: number;
  vy: number;
  size: number;
  assemblyDelay: number;
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

const CONNECTION_DIST = 90;
const MAX_CONNECTIONS_PER_FRAME = 300;

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
  const spatialHashRef = useRef(new SpatialHash(CONNECTION_DIST));
  const lastFrameTimeRef = useRef(0);

  const wipeTilesRef = useRef<{ col: number; row: number; delay: number; cx: number; cy: number }[]>([]);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    const docH = Math.max(h, document.documentElement.scrollHeight || h * 3);

    const logoTargets = generateTextTargets(w, h);

    const spacing = 50;
    const cols = Math.ceil(w / spacing) + 2;
    const rows = Math.ceil(docH / spacing) + 2;

    for (let i = 0; i < logoTargets.length; i++) {
      const t = logoTargets[i];
      const gridX = Math.random() * w;
      const gridY = Math.random() * docH;

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

    const logoParticleGridKeys = new Set(
      particles.map(p => `${Math.round(p.gridX / spacing)}_${Math.round(p.gridY / spacing)}`)
    );

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const key = `${i}_${j}`;
        if (logoParticleGridKeys.has(key)) continue;

        const gx = i * spacing - spacing * 0.5;
        const gy = j * spacing - spacing * 0.5;

        particles.push({
          x: skipIntro ? gx : Math.random() * w,
          y: skipIntro ? gy : Math.random() * h,
          scatterX: Math.random() * w,
          scatterY: Math.random() * h,
          logoX: gx,
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
    const frameDelta = time - lastFrameTimeRef.current;
    lastFrameTimeRef.current = time;
    // FIX 5: If last frame was slow (>20ms = below 50fps), skip connections this frame
    const skipConnections = frameDelta > 20;

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

    // --- Blobs ---
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
    const mouseRadius = 200;
    const mouseGravity = 30;

    const visibleParticles: Particle[] = [];
    const visibleIndices: number[] = [];

    for (let idx = 0; idx < particles.length; idx++) {
      const p = particles[idx];
      let targetX: number;
      let targetY: number;
      let lerpSpeed: number;

      if (phase === Phase.SCATTER) {
        const drift = Math.sin(time * 0.001 + p.scatterX * 0.01) * 3;
        targetX = p.scatterX + drift;
        targetY = p.scatterY + Math.cos(time * 0.0008 + p.scatterY * 0.01) * 3;
        lerpSpeed = 0.02;
      } else if (phase === Phase.ASSEMBLE) {
        const rawT = phaseElapsed / ASSEMBLE_DURATION;
        const adjustedT = Math.max(0, Math.min(1, (rawT - p.assemblyDelay * 0.3) / (1 - p.assemblyDelay * 0.3)));
        const eased = 1 - Math.pow(1 - adjustedT, 3) * Math.cos(adjustedT * Math.PI * 0.5);

        if (p.isLogo) {
          targetX = p.scatterX + (p.logoX - p.scatterX) * eased;
          targetY = p.scatterY + (p.logoY - p.scatterY) * eased;
        } else {
          const drift = Math.sin(time * 0.001 + p.scatterX * 0.01) * 3;
          targetX = p.scatterX + drift;
          targetY = p.scatterY + Math.cos(time * 0.0008 + p.scatterY * 0.01) * 3;
        }
        lerpSpeed = 0.15;
      } else if (phase === Phase.HOLD) {
        if (p.isLogo) {
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
        const eased = 1 - Math.pow(1 - wipeT, 3);

        if (p.isLogo) {
          // Logo particles scatter smoothly from logo to random grid positions
          targetX = p.logoX + (p.gridX - p.logoX) * eased;
          targetY = p.logoY + (p.gridY - p.logoY) * eased;
          lerpSpeed = 0.15;
        } else {
          // FIX 7: Background particles snap to grid instantly at wipe start
          targetX = p.gridX;
          targetY = p.gridY;
          lerpSpeed = 1; // instant snap
        }
      } else {
        // Constellation mode
        const driftX = Math.sin(time * 0.0004 + p.gridX * 0.01) * 8;
        const driftY = Math.cos(time * 0.0003 + p.gridY * 0.012) * 8;
        targetX = p.gridX + driftX;
        targetY = p.gridY + driftY;

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

      if (isIntro || (p.y > viewTop - 50 && p.y < viewBottom + 50)) {
        visibleParticles.push(p);
        visibleIndices.push(idx);
      }
    }

    // --- Draw connections with spatial hashing ---
    if (phase >= Phase.WIPE && !skipConnections) {
      // FIX 4: During wipe, don't draw connections until 50% complete
      const wipeT = phase === Phase.WIPE ? Math.min(phaseElapsed / WIPE_DURATION, 1) : 1;
      if (wipeT >= 0.5 || phase === Phase.CONSTELLATION) {
        const connAlpha = phase === Phase.WIPE
          ? ((wipeT - 0.5) / 0.5) * 0.5  // Fade in from 50% to 100% of wipe
          : 1;

        // FIX 1: Build spatial hash
        const hash = spatialHashRef.current;
        hash.clear();
        for (let i = 0; i < visibleParticles.length; i++) {
          const p = visibleParticles[i];
          const drawY = isIntro ? p.y : p.y - scroll;
          hash.insert(i, p.x, drawY);
        }

        // FIX 6: Batch connections by alpha bucket (quantize to 10 levels)
        const buckets: { ax: number; ay: number; bx: number; by: number }[][] = [];
        for (let i = 0; i < 10; i++) buckets.push([]);

        let connectionCount = 0;
        const connectionDistSq = CONNECTION_DIST * CONNECTION_DIST;
        const drawn = new Set<string>();

        for (let i = 0; i < visibleParticles.length && connectionCount < MAX_CONNECTIONS_PER_FRAME; i++) {
          const a = visibleParticles[i];
          const drawAY = isIntro ? a.y : a.y - scroll;
          const neighbors = hash.queryNeighbors(a.x, drawAY);

          for (let ni = 0; ni < neighbors.length && connectionCount < MAX_CONNECTIONS_PER_FRAME; ni++) {
            const j = neighbors[ni];
            if (j <= i) continue; // avoid duplicates

            const b = visibleParticles[j];
            const drawBY = isIntro ? b.y : b.y - scroll;
            const dx = a.x - b.x;
            const dy = drawAY - drawBY;
            const distSq = dx * dx + dy * dy;

            if (distSq < connectionDistSq) {
              const dist = Math.sqrt(distSq);
              let alpha = (1 - dist / CONNECTION_DIST) * 0.1 * connAlpha;

              let mouseBoost = 0;
              if (phase === Phase.CONSTELLATION) {
                const midX = (a.x + b.x) / 2;
                const midY = (drawAY + drawBY) / 2;
                const midMouseDist = Math.sqrt((midX - mx) ** 2 + (midY - (my - scroll)) ** 2);
                if (midMouseDist < mouseRadius) {
                  mouseBoost = (1 - midMouseDist / mouseRadius) * 0.15;
                }
              }

              const totalAlpha = alpha + mouseBoost;
              const bucket = Math.min(9, Math.floor(totalAlpha * 40)); // quantize
              buckets[bucket].push({ ax: a.x, ay: drawAY, bx: b.x, by: drawBY });
              connectionCount++;
            }
          }
        }

        // FIX 6: Draw each bucket in one beginPath/stroke call
        ctx.lineWidth = 0.5;
        for (let b = 0; b < 10; b++) {
          const lines = buckets[b];
          if (lines.length === 0) continue;
          const bucketAlpha = (b + 0.5) / 40;
          ctx.beginPath();
          ctx.strokeStyle = `hsla(195, 60%, 60%, ${bucketAlpha})`;
          for (let li = 0; li < lines.length; li++) {
            const l = lines[li];
            ctx.moveTo(l.ax, l.ay);
            ctx.lineTo(l.bx, l.by);
          }
          ctx.stroke();
        }
      }
    }

    // --- Draw particles ---
    for (const p of visibleParticles) {
      const drawY = isIntro ? p.y : p.y - scroll;

      let alpha: number;
      let size = p.size;

      if (isIntro && p.isLogo && (phase === Phase.ASSEMBLE || phase === Phase.HOLD)) {
        alpha = 0.6;
        size = p.size * 1.3;
      } else if (isIntro && !p.isLogo) {
        alpha = 0.04;
      } else if (isIntro) {
        alpha = 0.15;
      } else {
        const dmx = mx - p.x;
        const dmy = my - p.y;
        const mouseDist = Math.sqrt(dmx * dmx + dmy * dmy);
        const mouseInfluence = mouseDist < mouseRadius ? 1 - mouseDist / mouseRadius : 0;
        size = p.size + mouseInfluence * 1.5;
        alpha = 0.08 + mouseInfluence * 0.25;

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
// FIX 2 (partial): Reduced to fewer tiles with will-change for GPU compositing

interface GridWipeProps {
  active: boolean;
  progress: number;
}

export function GridWipeOverlay({ active }: GridWipeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";
    tilesRef.current = [];

    const cols = 8;
    const rows = 6;
    const centerCol = (cols - 1) / 2;
    const centerRow = (rows - 1) / 2;

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
        const delay = (dist / maxDist) * 400;

        tile.style.cssText = `
          position: absolute;
          left: ${(c / cols) * 100}%;
          top: ${(r / rows) * 100}%;
          width: ${100 / cols}%;
          height: ${100 / rows}%;
          background: hsl(228 12% 5%);
          transform-origin: center center;
          will-change: transform, opacity;
          transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms,
                      opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms;
          backface-visibility: hidden;
        `;
        container.appendChild(tile);
        tilesRef.current.push(tile);
      }
    }

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
