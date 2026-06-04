'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#ff4d6d', '#ff8c42', '#ffd166', '#06d6a0', '#4d9fff', '#b56cff'];
const SIZE = 64;
const ROTATION_SPEED = 0.0008; // radians per ms (~8s per revolution)
const COLOR_SPEED = 0.0004;   // color cycle speed

export default function AnimatedFavicon() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create or find the favicon link element
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      document.head.appendChild(link);
    }

    const startTime = performance.now();

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function hexToRgb(hex: string) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    }

    function getAnimatedColor(offset: number, time: number): string {
      const t = ((time * COLOR_SPEED) + offset) % COLORS.length;
      const idx = Math.floor(t);
      const frac = t - idx;
      const c1 = hexToRgb(COLORS[idx % COLORS.length]);
      const c2 = hexToRgb(COLORS[(idx + 1) % COLORS.length]);
      const r = Math.round(lerp(c1[0], c2[0], frac));
      const g = Math.round(lerp(c1[1], c2[1], frac));
      const b = Math.round(lerp(c1[2], c2[2], frac));
      return `rgb(${r},${g},${b})`;
    }

    function draw(now: number) {
      if (!ctx || !link) return;
      const elapsed = now - startTime;
      const angle = elapsed * ROTATION_SPEED;

      ctx.clearRect(0, 0, SIZE, SIZE);

      const cx = SIZE / 2;
      const cy = SIZE / 2 + 2; // slight offset so triangle is visually centered
      const radius = SIZE * 0.42;

      // Triangle vertices (equilateral)
      const points: [number, number][] = [];
      for (let i = 0; i < 3; i++) {
        const a = angle + (i * Math.PI * 2) / 3 - Math.PI / 2;
        points.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
      }

      // Create gradient across triangle
      const grad = ctx.createLinearGradient(points[0][0], points[0][1], points[1][0], points[1][1]);
      grad.addColorStop(0, getAnimatedColor(0, elapsed));
      grad.addColorStop(0.5, getAnimatedColor(2, elapsed));
      grad.addColorStop(1, getAnimatedColor(4, elapsed));

      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      ctx.lineTo(points[1][0], points[1][1]);
      ctx.lineTo(points[2][0], points[2][1]);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();

      // Update favicon - throttle to ~10fps to save CPU
      link.href = canvas.toDataURL('image/png');

      rafRef.current = requestAnimationFrame(draw);
    }

    // Use a slower interval for the favicon to save resources
    let intervalId: ReturnType<typeof setInterval>;
    let lastFrame = 0;

    function throttledDraw(now: number) {
      if (!ctx || !link) return;
      // ~10 fps for favicon
      if (now - lastFrame < 100) {
        rafRef.current = requestAnimationFrame(throttledDraw);
        return;
      }
      lastFrame = now;
      
      const elapsed = now - startTime;
      const angle = elapsed * ROTATION_SPEED;

      ctx.clearRect(0, 0, SIZE, SIZE);

      const cx = SIZE / 2;
      const cy = SIZE / 2 + 2;
      const radius = SIZE * 0.42;

      const points: [number, number][] = [];
      for (let i = 0; i < 3; i++) {
        const a = angle + (i * Math.PI * 2) / 3 - Math.PI / 2;
        points.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
      }

      const grad = ctx.createLinearGradient(points[0][0], points[0][1], points[1][0], points[1][1]);
      grad.addColorStop(0, getAnimatedColor(0, elapsed));
      grad.addColorStop(0.5, getAnimatedColor(2, elapsed));
      grad.addColorStop(1, getAnimatedColor(4, elapsed));

      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      ctx.lineTo(points[1][0], points[1][1]);
      ctx.lineTo(points[2][0], points[2][1]);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();

      link!.href = canvas.toDataURL('image/png');
      rafRef.current = requestAnimationFrame(throttledDraw);
    }

    rafRef.current = requestAnimationFrame(throttledDraw);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return null; // This component renders nothing visible
}
