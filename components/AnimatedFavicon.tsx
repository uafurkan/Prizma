'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#ff4d6d', '#ff8c42', '#ffd166', '#06d6a0', '#4d9fff', '#b56cff'];
const SIZE = 64;
const ROTATION_SPEED = 0.0008; // ~8s per full revolution
const COLOR_SPEED = 0.0003;   // color cycle speed

export default function AnimatedFavicon() {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
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

    // Get triangle vertices for given angle
    function getTrianglePoints(angle: number): [number, number][] {
      const cx = SIZE / 2;
      const cy = SIZE / 2 + 2;
      const radius = SIZE * 0.40;
      const points: [number, number][] = [];
      for (let i = 0; i < 3; i++) {
        const a = angle + (i * Math.PI * 2) / 3 - Math.PI / 2;
        points.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
      }
      return points;
    }

    // Draw a line segment with a gradient between two colors
    function drawEdge(
      p1: [number, number],
      p2: [number, number],
      color1: string,
      color2: string
    ) {
      if (!ctx) return;
      const grad = ctx.createLinearGradient(p1[0], p1[1], p2[0], p2[1]);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    let lastFrame = 0;

    function render(now: number) {
      // Throttle to ~12 fps
      if (now - lastFrame < 83) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }
      lastFrame = now;

      if (!ctx || !link) return;
      const elapsed = now - startTime;
      const angle = elapsed * ROTATION_SPEED;

      ctx.clearRect(0, 0, SIZE, SIZE);

      const pts = getTrianglePoints(angle);

      // 6 color stops distributed along 3 edges (2 per edge)
      // Each edge gets a gradient from one color to the next
      const c0 = getAnimatedColor(0, elapsed);
      const c1 = getAnimatedColor(1, elapsed);
      const c2 = getAnimatedColor(2, elapsed);
      const c3 = getAnimatedColor(3, elapsed);
      const c4 = getAnimatedColor(4, elapsed);
      const c5 = getAnimatedColor(5, elapsed);

      // Edge 0: vertex 0 → vertex 1 (top → bottom-right)
      drawEdge(pts[0], pts[1], c0, c2);
      // Edge 1: vertex 1 → vertex 2 (bottom-right → bottom-left)
      drawEdge(pts[1], pts[2], c2, c4);
      // Edge 2: vertex 2 → vertex 0 (bottom-left → top)
      drawEdge(pts[2], pts[0], c4, c0);

      link!.href = canvas.toDataURL('image/png');
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return null;
}
