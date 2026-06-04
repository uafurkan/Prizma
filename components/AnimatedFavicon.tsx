'use client';

import { useEffect, useRef } from 'react';

// Exact same colors as the site's gradient: --prism
const BASE_COLORS = [
  [255, 77, 109],   // #ff4d6d
  [255, 140, 66],   // #ff8c42
  [255, 209, 102],  // #ffd166
  [6, 214, 160],    // #06d6a0
  [77, 159, 255],   // #4d9fff
  [181, 108, 255],  // #b56cff
];

const SIZE = 64;
// Site uses: spin-slow = 20s per revolution
const ROTATION_DURATION = 20000; // 20s in ms
// Site uses: prismRotate (hue-rotate) = 8s full cycle
const HUE_ROTATE_DURATION = 8000; // 8s in ms

export default function AnimatedFavicon() {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Find or create favicon link
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      document.head.appendChild(link);
    }

    const startTime = performance.now();

    // Apply hue rotation to an RGB color (same as CSS hue-rotate)
    function hueRotateRGB(r: number, g: number, b: number, degrees: number): [number, number, number] {
      // Convert to [0,1]
      const rr = r / 255, gg = g / 255, bb = b / 255;
      // RGB to HSL
      const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6; break;
          case gg: h = ((bb - rr) / d + 2) / 6; break;
          case bb: h = ((rr - gg) / d + 4) / 6; break;
        }
      }
      // Rotate hue
      h = (h + degrees / 360) % 1;
      if (h < 0) h += 1;
      // HSL to RGB
      let r2: number, g2: number, b2: number;
      if (s === 0) {
        r2 = g2 = b2 = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r2 = hue2rgb(p, q, h + 1/3);
        g2 = hue2rgb(p, q, h);
        b2 = hue2rgb(p, q, h - 1/3);
      }
      return [Math.round(r2 * 255), Math.round(g2 * 255), Math.round(b2 * 255)];
    }

    let lastFrame = 0;

    function render(now: number) {
      // ~12 fps to save CPU
      if (now - lastFrame < 83) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }
      lastFrame = now;

      if (!ctx || !link) return;
      const elapsed = now - startTime;

      // Rotation angle - synced with site's 20s spin-slow
      const angle = (elapsed / ROTATION_DURATION) * Math.PI * 2;

      // Hue rotation - synced with site's 8s prismRotate
      const hueDeg = (elapsed / HUE_ROTATE_DURATION) * 360;

      ctx.clearRect(0, 0, SIZE, SIZE);

      const cx = SIZE / 2;
      const cy = SIZE / 2 + 2;
      const radius = SIZE * 0.40;

      // Triangle vertices (equilateral, rotating)
      const pts: [number, number][] = [];
      for (let i = 0; i < 3; i++) {
        const a = angle + (i * Math.PI * 2) / 3 - Math.PI / 2;
        pts.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
      }

      // Apply hue-rotate to the base gradient colors (same as CSS hue-rotate filter)
      const rotatedColors = BASE_COLORS.map(([r, g, b]) => {
        const [rr, gg, bb] = hueRotateRGB(r, g, b, hueDeg);
        return `rgb(${rr},${gg},${bb})`;
      });

      // Draw each edge with its gradient segment (colors flow along perimeter)
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Edge 0→1: colors 0,1
      const g1 = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
      g1.addColorStop(0, rotatedColors[0]);
      g1.addColorStop(1, rotatedColors[2]);
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]);
      ctx.strokeStyle = g1; ctx.stroke();

      // Edge 1→2: colors 2,3
      const g2 = ctx.createLinearGradient(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
      g2.addColorStop(0, rotatedColors[2]);
      g2.addColorStop(1, rotatedColors[4]);
      ctx.beginPath(); ctx.moveTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]);
      ctx.strokeStyle = g2; ctx.stroke();

      // Edge 2→0: colors 4,5→0
      const g3 = ctx.createLinearGradient(pts[2][0], pts[2][1], pts[0][0], pts[0][1]);
      g3.addColorStop(0, rotatedColors[4]);
      g3.addColorStop(1, rotatedColors[0]);
      ctx.beginPath(); ctx.moveTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[0][0], pts[0][1]);
      ctx.strokeStyle = g3; ctx.stroke();

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
