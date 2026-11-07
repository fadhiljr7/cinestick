// sets/pharmacy.js — a pharmacy aisle under cool fluorescent light: tall shelves of medicine bottles, a hand-lettered sign.
import { E, V, mood, layer, backdrop, rr, linGrad, glow, alpha, shade, mix, rng, text, seg } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { S as STY } from '/engine/core.js';
const INK = '#0e0b12';   // only for dark structural shapes (lamp pole, table legs); no outlines in this style

export const BOTTLE_COLS = ['#d98b2b', '#f2efe8', '#5a8fd6', '#e06a5a', '#7fd1b9', '#f2c21a'];
export function bottle(g, x, y, s, col, label = '#ffffff') {
  rr(g, x - 30 * s, y - 100 * s, 60 * s, 100 * s, 8 * s); g.fillStyle = col; g.fill(); 
  rr(g, x - 34 * s, y - 124 * s, 68 * s, 26 * s, 5 * s); g.fillStyle = '#d8d2c8'; g.fill();
  g.fillStyle = shade(label, -0.1); g.fillRect(x - 24 * s, y - 76 * s, 48 * s, 40 * s); g.fillStyle = alpha('#0e0b12', 0.45); g.fillRect(x - 18 * s, y - 64 * s, 36 * s, 5 * s); g.fillRect(x - 18 * s, y - 52 * s, 26 * s, 5 * s);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x - 24 * s, y - 96 * s, 8 * s, 70 * s);
}
// shelf rows; returns the slot positions so a shot can stamp them
export function pharmacy(g, t, cam) {
  const M = mood('interiorCool'), GY = E.H * V(0.8, 0.68), CX = E.W / 2;
  layer(g, cam, 0.3, (g) => { backdrop(g, [shade(M.wall, -0.3), M.wall]);
    for (let i = -3; i <= 3; i++) { rr(g, CX + i * 420 - 160, V(40, 120), 320, 24, 10); g.fillStyle = '#e8f6ff'; g.fill(); glow(g, CX + i * 420, V(52, 132), 300, '#cfefff', 0.35); }
    rr(g, CX - 260, V(110, 240), 520, 110, 14); g.fillStyle = '#1d4a44'; g.fill(); glow(g, CX, V(165, 296), 360, '#7fe0c8', 0.25);
    text(g, 'PHARMACY', CX, V(165, 296), { size: V(64, 72), color: '#c8fff0', font: 'Fredoka', weight: 700, spacing: 6, glow: 24, glowColor: 'rgba(120,240,210,.8)' });
    
  });
  const slots = [];
  layer(g, cam, 0.85, (g) => {
    const top = GY - V(860, 1060), rows = 5, rh = V(170, 205), x0 = -E.W * 0.6, x1 = E.W * 1.6;
    g.fillStyle = linGrad(g, 0, top - 40, 0, top + rows * rh, [shade(M.wall, 0.15), shade(M.wall, -0.2)]); g.fillRect(x0, top - 40, x1 - x0, rows * rh + 60);
    const r = rng(5);
    for (let j = 0; j < rows; j++) {
      const sy = top + (j + 1) * rh;
      for (let x = x0 + 60; x < x1 - 40; x += 104) { const c = BOTTLE_COLS[Math.floor(r() * BOTTLE_COLS.length)]; bottle(g, x, sy - 6, 1.05, c); slots.push({ x, y: sy - 6, row: j }); }
      rr(g, x0, sy - 6, x1 - x0, 22, 4); g.fillStyle = shade(M.wall, 0.35); g.fill(); g.fillStyle = alpha('#cfefff', 0.35); g.fillRect(x0, sy - 6, x1 - x0, 3);
      g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x0, sy + 16, x1 - x0, 18);
    }
    g.fillStyle = linGrad(g, 0, GY, 0, E.H, [shade(M.floor, 0.3), shade(M.floor, -0.2)]); g.fillRect(x0, GY, x1 - x0, E.H);
    
  });
  FX.dust(g, t, { count: 30, color: '#e8f6ff', a: 0.25 });
  return { GY, CX, M, slots };
}
