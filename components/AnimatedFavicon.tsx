'use client';

import { useEffect, useRef } from 'react';

const BASE_COLORS = [
  [255, 77, 109],   // #ff4d6d
  [255, 140, 66],   // #ff8c42
  [255, 209, 102],  // #ffd166
  [6, 214, 160],    // #06d6a0
  [77, 159, 255],   // #4d9fff
  [181, 108, 255],  // #b56cff
];

const SIZE = 64;
const ROTATION_DURATION = 20000; // 20s
const HUE_ROTATE_DURATION = 8000; // 8s

function hueRotateRGB(r: number, g: number, b: number, degrees: number): [number, number, number] {
  const rr = r / 255, gg = g / 255, bb = b / 255;
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
  h = (h + degrees / 360) % 1;
  if (h < 0) h += 1;
  let r2: number, g2: number, b2: number;
  if (s === 0) {
    r2 = g2 = b2 = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r2 = hue2rgb(p, q, h + 1 / 3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r2 * 255), Math.round(g2 * 255), Math.round(b2 * 255)];
}

export default function AnimatedFavicon() {
  useEffect(() => {
    let animFrameId = 0;
    let isCancelled = false;

    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function getOrCreateLink(): HTMLLinkElement {
      let link = document.querySelector("link[rel='icon'][data-prizma]") as HTMLLinkElement | null;
      
      // Always clean up any rogue icons injected by Next.js metadata during navigation
      document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']").forEach(el => {
        if (!el.hasAttribute('data-prizma')) el.remove();
      });

      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.setAttribute('data-prizma', 'true');
        if (document.head) {
          document.head.appendChild(link);
        }
      }
      return link;
    }

    const startTime = performance.now();
    let lastFrame = 0;

    function render(now: number) {
      if (isCancelled) return;

      try {
        if (now - lastFrame >= 100) { // ~10fps to avoid browser throttling
          lastFrame = now;

          const elapsed = now - startTime;
          const angle = (elapsed / ROTATION_DURATION) * Math.PI * 2;
          const hueDeg = (elapsed / HUE_ROTATE_DURATION) * 360;

          ctx!.clearRect(0, 0, SIZE, SIZE);

          const cx = SIZE / 2;
          const cy = SIZE / 2 + 2;
          const radius = SIZE * 0.40;

          const pts: [number, number][] = [];
          for (let i = 0; i < 3; i++) {
            const a = angle + (i * Math.PI * 2) / 3 - Math.PI / 2;
            pts.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
          }

          const rotatedColors = BASE_COLORS.map(([r, g, b]) => {
            const [rr, gg, bb] = hueRotateRGB(r, g, b, hueDeg);
            return `rgb(${rr},${gg},${bb})`;
          });

          ctx!.lineWidth = 5;
          ctx!.lineCap = 'round';
          ctx!.lineJoin = 'round';

          // Edge 0→1
          const g1 = ctx!.createLinearGradient(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
          g1.addColorStop(0, rotatedColors[0]);
          g1.addColorStop(1, rotatedColors[2]);
          ctx!.beginPath(); ctx!.moveTo(pts[0][0], pts[0][1]); ctx!.lineTo(pts[1][0], pts[1][1]);
          ctx!.strokeStyle = g1; ctx!.stroke();

          // Edge 1→2
          const g2 = ctx!.createLinearGradient(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
          g2.addColorStop(0, rotatedColors[2]);
          g2.addColorStop(1, rotatedColors[4]);
          ctx!.beginPath(); ctx!.moveTo(pts[1][0], pts[1][1]); ctx!.lineTo(pts[2][0], pts[2][1]);
          ctx!.strokeStyle = g2; ctx!.stroke();

          // Edge 2→0
          const g3 = ctx!.createLinearGradient(pts[2][0], pts[2][1], pts[0][0], pts[0][1]);
          g3.addColorStop(0, rotatedColors[4]);
          g3.addColorStop(1, rotatedColors[0]);
          ctx!.beginPath(); ctx!.moveTo(pts[2][0], pts[2][1]); ctx!.lineTo(pts[0][0], pts[0][1]);
          ctx!.strokeStyle = g3; ctx!.stroke();

          const link = getOrCreateLink();
          link.href = canvas.toDataURL('image/png');
        }
      } catch (err) {
        console.error("Favicon animation error:", err);
        // Continue animation even if an error occurs in one frame
      }

      if (!isCancelled) {
        animFrameId = requestAnimationFrame(render);
      }
    }

    animFrameId = requestAnimationFrame(render);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return null;
}
