"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

export default function CursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const GOLD = "212, 175, 55";
    const MOUSE_RADIUS = 170; // how far the cursor affects particles
    const LINK_DIST = 120; // max distance for particle-to-particle lines

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;

    const mouse = { x: -1000, y: -1000 };
    const glow = { x: -1000, y: -1000 }; // eased position, so the glow trails the cursor

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(140, Math.floor((width * height) / 12000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.6,
      }));
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        mouse.x = -1000;
        mouse.y = -1000;
      }
    };

    const frame = () => {
      ctx.clearRect(0, 0, width, height);

      // Glow that eases toward the cursor
      glow.x += (mouse.x - glow.x) * 0.12;
      glow.y += (mouse.y - glow.y) * 0.12;
      const g = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, 260);
      g.addColorStop(0, `rgba(${GOLD}, 0.18)`);
      g.addColorStop(1, `rgba(${GOLD}, 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // Move + draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Push particles away from the cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.x += (dx / dist) * force * 2.2;
          p.y += (dy / dist) * force * 2.2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD}, 0.7)`;
        ctx.fill();
      }

      // Lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgba(${GOLD}, ${(1 - d / LINK_DIST) * 0.25})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Lines from the cursor to nearby particles
      for (const p of particles) {
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < MOUSE_RADIUS) {
          ctx.strokeStyle = `rgba(${GOLD}, ${(1 - d / MOUSE_RADIUS) * 0.6})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      if (!reduceMotion) raf = requestAnimationFrame(frame);
    };

    resize();
    frame();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}