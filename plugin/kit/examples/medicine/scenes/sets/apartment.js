// sets/apartment.js — Maya and Cap's small apartment at dusk. Key light: the big window behind the couch (sunset + city);
// practical: a floor lamp on the left. Props carry a thin Stickfolk ink outline; the light is aiTrends (glows, pools, dust).
// apartment(g, t, cam, { lamp: 0..1, cold: 0..1, night: bool }) -> { GY, CX, M, couch, table, rim, wash }
import { E, V, mood, layer, backdrop, rr, circle, linGrad, glow, alpha, shade, mix, seg } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { S as STY } from '/engine/core.js';
const INK = '#0e0b12';   // only for dark structural shapes (lamp pole, table legs); no outlines in this style

export const aptGround = () => E.H * V(0.8, 0.68);
const ol = () => {};   // aiTrends: flat shapes, no outlines

export function apartment(g, t, cam, o = {}) {
  const M0 = mood('interiorWarm'), MN = mood('night');
  const cold = o.cold ?? (o.night ? 1 : 0), lamp = o.lamp ?? 1;
  const M = { ...M0, wall: mix(M0.wall, MN.wall, cold), floor: mix(M0.floor, MN.floor, cold), rim: mix(M0.rim, MN.rim, cold), key: mix(M0.key, MN.key, cold) };
  const GY = aptGround(), CX = E.W / 2;
  const wall = shade(mix(M.wall, '#5a4a66', 0.25), -0.1), wallDark = shade(wall, -0.45);
  const sky = o.night ? ['#0b1028', '#1d2550', '#3a3570'] : cold > 0.5 ? ['#141a3a', '#2c3470', '#5a5aa0'] : ['#3d3360', '#8a5a86', '#e8956b', '#f7cf98'];
  const winW = V(1000, 760), winH = V(520, 760), winX = CX - winW / 2 + V(80, 40), winY = GY - V(700, 1080);

  layer(g, cam, 0.15, (g) => {                                   // sky + city through the window
    backdrop(g, sky);
    if (!o.night && cold < 0.5) FX.sun(g, winX + winW * 0.72, winY + winH * 0.78, 50, '#fff3dc', '#ffc68a', 5);
    else { FX.stars(g, t, { area: [0, 0, E.W, E.H * 0.5], count: 80 }); FX.moon(g, winX + winW * 0.75, winY + winH * 0.22, 34); }
    FX.skyline(g, { x: -E.W, y: winY + winH * 0.98, w: E.W * 3, minH: 80, maxH: V(260, 380), color: mix(sky[1], '#0e0b12', 0.7), windowColor: alpha('#ffd59a', 0.7), lit: o.night || cold > 0.5 ? 0.45 : 0.2, seed: 8 });
  });
  layer(g, cam, 0.6, (g) => {                                    // back wall with the big window cut out
    g.save(); g.beginPath(); g.rect(-E.W, -E.H, E.W * 3, E.H * 3); g.rect(winX + winW, winY, -winW, winH); g.clip('evenodd');
    g.fillStyle = linGrad(g, 0, 0, 0, GY, [shade(wall, -0.25), wall, shade(wall, -0.2)]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H + 4);
    g.restore();
    g.fillStyle = alpha('#000', 0.18); for (let x = -E.W; x < E.W * 2; x += 120) g.fillRect(x, -E.H, 3, GY + E.H);      // wallpaper stripes
    FX.windowFrame(g, { x: winX, y: winY, w: winW, h: winH, cols: 3, rows: 2, frame: wallDark, bar: 14 }, () => {});
    g.beginPath(); g.rect(winX - 14, winY - 14, winW + 28, winH + 28); ol(g, 4);
    rr(g, winX - 30, winY + winH, winW + 60, 22, 4); g.fillStyle = shade(wall, 0.12); g.fill(); ol(g);              // sill
    if (cold < 0.5) FX.godRays(g, winX + winW * 0.7, winY + winH * 0.8, { count: 7, len: V(1400, 1700), spread: 0.9, angle: Math.PI * 0.62, color: '#ffcf9a', a: 0.06 * (1 - cold) });
    // wall clock (right)
    const cx = CX + V(560, 380), cy = winY + V(60, 40);
    FX.clock(g, cx, cy, V(52, 58), (o.clockT ?? t * 0.05), { speed: o.clockSpeed ?? 1 }); g.beginPath(); g.arc(cx, cy, V(52, 58), 0, 7); ol(g, 4);
    // framed poster (left)
    rr(g, CX - V(760, 470), winY + 40, 150, 200, 6); g.fillStyle = shade(wall, -0.3); g.fill(); ol(g, 4);
    g.fillStyle = mix('#7fd1b9', wall, 0.5); g.beginPath(); g.arc(CX - V(685, 395), winY + 120, 40, 0, 7); g.fill();
  });
  layer(g, cam, 0.9, (g) => {                                    // floor
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 500, [shade(M.floor, 0.05), shade(M.floor, -0.35)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 2; for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(CX + i * 90, GY); g.lineTo(CX + i * 260, GY + 900); g.stroke(); }
    
    rr(g, CX - V(520, 430), GY + 30, V(1040, 860), 110, 55); g.fillStyle = alpha(mix('#8a4a4a', M.floor, 0.55), 0.85); g.fill();     // rug
    if (cold < 0.5) FX.pool(g, winX + winW * 0.6, GY + 90, V(700, 520), 80, M.key, 0.18 * (1 - cold));
  });
  // floor lamp (practical) on the left
  layer(g, cam, 0.95, (g) => {
    const lx = CX - V(640, 420), top = GY - V(560, 620);
    seg(g, [[lx, GY], [lx, top + 40]], 8, INK);
    rr(g, lx - 40, GY - 10, 80, 12, 6); g.fillStyle = INK; g.fill();
    g.fillStyle = lamp > 0.5 ? '#ffe2a8' : '#5a5060'; g.beginPath(); g.moveTo(lx - 70, top + 60); g.lineTo(lx - 46, top); g.lineTo(lx + 46, top); g.lineTo(lx + 70, top + 60); g.closePath(); g.fill(); ol(g, 4);
    if (lamp > 0) { glow(g, lx, top + 40, 420, M.practical, 0.45 * lamp); FX.lightCone(g, lx, top + 60, { angle: Math.PI / 2, spread: 0.7, len: 700, color: M.practical, a: 0.12 * lamp }); FX.pool(g, lx + 60, GY + 40, 380, 60, M.practical, 0.3 * lamp); }
  });
  const couch = { x: CX - V(180, 150), seat: GY - V(96, 100), w: V(560, 460) };
  const table = { x: CX + V(170, 120), top: GY - V(80, 80) };
  return { GY, CX, M, couch, table, lamp, cold,
    rim: { color: cold > 0.5 ? M.rim : '#ffc68a', dir: [0.35, -1], w: 5 },
    wash: [cold > 0.5 ? '#1a2048' : '#3a1f3a', 0.32 + 0.15 * cold] };
}

// the couch (drawn at depth 1 behind the characters); back only, or seat too
export function couchBack(g, A) {
  const { x, seat, w } = A.couch, col = shade(mix('#4a4f86', A.M.wall, 0.45), -0.15);
  rr(g, x - w / 2, seat - V(170, 180), w, V(200, 210), 40); g.fillStyle = linGrad(g, 0, seat - V(170, 180), 0, seat, [shade(col, 0.12), shade(col, -0.2)]); g.fill(); ol(g, 4);
  for (const sx of [-1, 1]) { rr(g, x + sx * w / 2 - 50, seat - 70, 100, 110, 30); g.fillStyle = shade(col, 0.05); g.fill(); ol(g, 4); }
}
export function couchSeat(g, A) {
  const { x, seat, w } = A.couch, col = shade(mix('#4a4f86', A.M.wall, 0.45), -0.15);
  rr(g, x - w / 2 + 30, seat - 10, w - 60, 46, 18); g.fillStyle = shade(col, 0.12); g.fill(); ol(g, 4);
  rr(g, x - w / 2 + 20, seat + 30, w - 40, A.GY - seat - 34, 10); g.fillStyle = shade(col, -0.25); g.fill(); ol(g, 4);
}
export function coffeeTable(g, A, o = {}) {
  const { x, top } = A.table, col = shade('#6a4434', -0.15);
  for (const dx of [-110, 110]) seg(g, [[x + dx, top + 10], [x + dx, A.GY]], 10, INK);
  rr(g, x - 150, top - 6, 300, 22, 6); g.fillStyle = col; g.fill(); ol(g, 4);
  g.fillStyle = alpha(A.M.key, 0.35); g.fillRect(x - 144, top - 4, 288, 4);
  if (o.bottle !== false) { // the antibiotic bottle (the accent stripe on the label)
    const bx = x + 60, by = top - 6; rr(g, bx - 22, by - 70, 44, 70, 6); g.fillStyle = '#d98b2b'; g.fill(); ol(g, 3);
    rr(g, bx - 25, by - 88, 50, 20, 4); g.fillStyle = '#fff6e6'; g.fill(); ol(g, 3);
    g.fillStyle = '#fff'; g.fillRect(bx - 18, by - 56, 36, 32); g.fillStyle = '#22c3e6'; g.fillRect(bx - 18, by - 46, 36, 10);
  }
  if (o.glass !== false) { const gx = x - 70, gy = top - 6; g.fillStyle = 'rgba(190,230,255,.6)'; g.beginPath(); g.rect(gx - 18, gy - 56, 36, 56); g.fill(); ol(g, 3); g.fillStyle = 'rgba(120,190,240,.55)'; g.fillRect(gx - 16, gy - 30, 32, 28); }
}
export function desk(g, A) {   // Cap's desk with a glowing laptop (right side)
  const x = A.CX + V(520, 380), top = A.GY - V(150, 160);
  for (const dx of [-120, 120]) seg(g, [[x + dx, top], [x + dx, A.GY]], 10, INK);
  rr(g, x - 150, top - 12, 300, 20, 5); g.fillStyle = shade('#5a3e34', -0.2); g.fill(); ol(g, 4);
  rr(g, x - 70, top - 100, 140, 88, 8); g.fillStyle = '#2a2a3a'; g.fill(); ol(g, 3);
  g.fillStyle = '#9fe0ff'; g.fillRect(x - 60, top - 92, 120, 72); glow(g, x, top - 56, 200, '#9fe0ff', 0.25);
}
