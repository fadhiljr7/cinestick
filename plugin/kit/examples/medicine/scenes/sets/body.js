// sets/body.js — inside Maya's body: a warm red tissue cave, soft key light from above (a pink glow through the tissue),
// red blood cells drifting at several depths (blurred in the foreground), wet highlights, floating specks.
// body(g, t, cam, { dim: 0..1, purple: 0..1 (resistant glow takes over), cyan: 0..1 (medicine glow) }) -> { GY, CX, M, rim, wash }
import { E, V, mood, layer, blurLayer, backdrop, linGrad, radGrad, glow, alpha, shade, mix, rng, circle } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { S as STY } from '/engine/core.js';
const INK = '#0e0b12';   // only for dark structural shapes (lamp pole, table legs); no outlines in this style
import { PURPLE, ACCENT } from '../cast.js';

export const bodyGround = () => E.H * V(0.8, 0.68);

function folds(g, y, amp, col, seed, edge) {      // a wavy band of tissue
  const r = rng(seed); g.fillStyle = col; g.beginPath(); g.moveTo(-E.W, E.H * 2);
  const ph = r() * 6, f = 0.004 + r() * 0.003;
  for (let x = -E.W; x <= E.W * 2; x += 20) g.lineTo(x, y - Math.abs(Math.sin(x * f + ph)) * amp - Math.sin(x * f * 2.7 + ph) * amp * 0.25);
  g.lineTo(E.W * 2, E.H * 2); g.closePath(); g.fill();
  if (edge) { g.lineWidth = 3; g.strokeStyle = alpha('#ffb0b8', 0.12); g.stroke(); }
}
export function rbc(g, x, y, r, rot, col = '#d8344a') {     // red blood cell disc
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(1, 0.62);
  g.fillStyle = col; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  
  g.fillStyle = shade(col, -0.25); g.beginPath(); g.arc(0, 0, r * 0.5, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,220,220,.35)'; g.beginPath(); g.ellipse(-r * 0.3, -r * 0.5, r * 0.4, r * 0.15, -0.3, 0, 7); g.fill();
  g.restore();
}
function cells(g, t, n, seed, depthR, speed) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x0 = r() * E.W * 1.6 - E.W * 0.3, y0 = r() * E.H, rr = depthR * (0.7 + r() * 0.6), sp = speed * (0.6 + r() * 0.8);
    const x = ((x0 + t * sp) % (E.W * 1.6) + E.W * 1.6) % (E.W * 1.6) - E.W * 0.3, y = y0 + Math.sin(t * 0.8 + i) * 20;
    rbc(g, x, y, rr, r() * 6 + t * 0.3 * (r() - 0.5));
  }
}

export function body(g, t, cam, o = {}) {
  const M = mood('body'), GY = bodyGround(), CX = E.W / 2, dim = o.dim ?? 0, purple = o.purple ?? 0, cyan = o.cyan ?? 0;
  const wall = mix(M.wall, '#2a0a3a', purple * 0.5);
  layer(g, cam, 0.1, (g) => {
    backdrop(g, M.sky.map(c => shade(mix(c, '#1a0630', purple * 0.5), -dim * 0.5)));
    glow(g, CX + V(200, 120), GY - V(700, 1150), V(900, 900), mix(M.key, PURPLE, purple), 0.35 * (1 - dim * 0.6));     // the light through the tissue
    FX.godRays(g, CX + V(200, 120), GY - V(820, 1300), { count: 6, len: V(1300, 1700), spread: 0.7, angle: Math.PI / 2, color: mix(M.key, PURPLE, purple), a: 0.07 * (1 - dim), t });
  });
  blurLayer(g, 6, (g) => { cells(g, t, 10, 3, V(30, 34), 40); }, cam, 0.25);
  layer(g, cam, 0.4, (g) => { folds(g, GY - V(380, 560), V(120, 160), shade(wall, -0.35 - dim * 0.3), 4, false); });
  layer(g, cam, 0.6, (g) => { folds(g, GY - V(200, 300), V(90, 120), shade(wall, -0.15 - dim * 0.3), 9, true);
    g.fillStyle = alpha('#ffd0d8', 0.08 * (1 - dim)); for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(CX - 900 + i * 260, GY - V(240, 330) + (i % 2) * 40, 60, 14, 0, 0, 7); g.fill(); } });
  layer(g, cam, 0.9, (g) => {            // the wet floor of the cave
    g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 600, [shade(M.floor, 0.12 - dim * 0.3), shade(M.dark, -dim * 0.3)]); g.fillRect(-E.W, GY - 30, E.W * 3, E.H * 2);
    g.beginPath(); g.moveTo(-E.W, GY - 30); for (let x = -E.W; x <= E.W * 2; x += 30) g.lineTo(x, GY - 30 + Math.sin(x * 0.01) * 10); g.lineWidth = 3; g.strokeStyle = alpha('#ffc0c8', 0.18); g.stroke();
    g.fillStyle = alpha('#ffc0c8', 0.12 * (1 - dim)); for (let i = 0; i < 12; i++) { g.beginPath(); g.ellipse(CX - 1100 + i * 210, GY + 40 + (i % 3) * 60, 70, 8, 0, 0, 7); g.fill(); }
    FX.pool(g, CX + V(120, 60), GY + 30, V(700, 520), 70, mix(M.key, PURPLE, purple), 0.22 * (1 - dim * 0.7));
    if (cyan > 0) FX.pool(g, CX, GY + 30, V(900, 640), 90, ACCENT, 0.35 * cyan);
  });
  return { GY, CX, M, rim: { color: mix(M.rim, '#d6b0ff', purple), dir: [0.25, -1], w: 5 }, wash: [mix('#3a0818', '#1a0630', purple), 0.3 + dim * 0.3] };
}
// foreground: big blurred blood cells drifting past the lens
export function bodyFg(g, t, cam, n = 3, seed = 21) { blurLayer(g, 12, (g) => cells(g, t, n, seed, V(120, 140), 90), cam, 1.7); FX.dust(g, t, { count: 40, color: '#ffd0d8', a: 0.35, speed: 10 }); }
