// shots/01_setup.js — s01–s09: the hook, the infection, the germs move in and multiply.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, rng, glow, alpha, shade, mix, rr, circle, seg } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { apartment, couchBack, couchSeat, coffeeTable, desk } from '../sets/apartment.js';
import { body, bodyFg } from '../sets/body.js';
import { MAYA, CAP, ACCENT, GREEN, person, germ, bigGerm, pill, holdPill, talk, blink, wordAt } from '../cast.js';

export const io = (t, d) => ease.inOut(t / d);
export const SIT_SICK = { ...POSES.sit, head: [10, -172], sh: [3, -142], eF: [14, -104], hF: [30, -80], eB: [6, -104], hB: [22, -80] };   // slumped
// the apartment with the couch layered correctly; o.behind / seated / front draw characters at depth 1
export function aptScene(g, t, cam, o = {}) {
  const A = apartment(g, t, cam, o.set || {});
  const s = o.s ?? 1.6; A.couch.seat = A.GY - 72 * s + 4;
  layer(g, cam, 1, (g) => {
    if (o.desk) desk(g, A);
    couchBack(g, A); o.behind?.(g, A, s); couchSeat(g, A); o.seated?.(g, A, s);
    coffeeTable(g, A, o.table || {}); o.front?.(g, A, s);
  });
  FX.dust(g, t, { count: 45, color: A.cold > 0.5 ? '#cfe0ff' : '#ffe2bd', a: 0.35 });
  if (A.cold < 0.5) FX.lensStreak(g, E.W / 2, E.H * 0.3, E.W * 1.2, '#ffe0b0', 0.12);
  return A;
}
// Maya on the couch (hips on the seat): figure feet on the floor at A.GY
export function sitMaya(g, A, x, s, o = {}) { person(g, { x, y: A.GY, s, facing: 1, outfit: MAYA, pose: breathe(o.pose || POSES.sit, o.t ?? 0, 1), expr: 'neutral', rim: A.rim, shadow: false, ...o }); }
export function aptBlur(g, t, o = {}) { blurLayer(g, 14, (g) => apartment(g, t, { z: 1.5, x: o.x ?? 0, y: -300 }, o.set || {})); veil(g, '#120a14', o.veil ?? 0.35); }
export function bodyBlur(g, t, o = {}) { blurLayer(g, 12, (g) => body(g, t, { z: 1.5, x: o.x ?? 0, y: -250 }, o.set || {})); veil(g, '#0e0208', o.veil ?? 0.32); }

// s01 — "I took one tiny pill,"  insert: a black hand lifts the glowing pill
registerShot('s01', { draw(g, t, info) {
  aptBlur(g, t, { x: -120 });
  const z = 1 + 0.08 * io(t, info.dur), lift = ease.out(prog(t, 0, 0.7)), ink = S().ink, s = 1.5;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const hx = E.W * 0.5, hy = lerp(E.H * 0.8, E.H * 0.5, lift);
  // rim edge on the arm, then ink arm + hoodie sleeve, then the fingers pinching the pill
  const arm = (dx, dy, col, w1, w2) => { seg(g, [[hx + 40 * s + dx, hy + 40 * s + dy], [E.W + 300, hy + 420 * s]], w1 * s, col); seg(g, [[hx + 150 * s + dx, hy + 150 * s + dy], [E.W + 300, hy + 420 * s]], w2 * s, col === ink ? MAYA.color : col); };
  arm(-6, -6, '#ffc68a', 74, 100); arm(0, 0, ink, 70, 96);
  circle(g, hx + 10 * s, hy + 10 * s, 46 * s, ink);
  seg(g, [[hx, hy], [hx - 70 * s, hy - 70 * s]], 22 * s, ink); seg(g, [[hx + 20 * s, hy + 6 * s], [hx - 40 * s, hy - 84 * s]], 20 * s, ink);
  pill(g, hx - 70 * s, hy - 92 * s, 18 * s, -0.7 + 0.08 * Math.sin(t * 2));
  FX.sparkle(g, hx - 40 * s, hy - 130 * s, 34 * (0.6 + 0.4 * Math.sin(t * 6)), '#e8fbff', 0.8);
  g.restore();
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
} });

// army on the cave floor: rows that recede; fn(i, p) -> germ options (or null)
export function army(g, A, n, seed, fn, o = {}) {
  const r = rng(seed), pts = [];
  for (let i = 0; i < n; i++) { const row = Math.floor(i / 6), col = i % 6, d = 1 - row * 0.15; pts.push({ i, x: E.W / 2 + (col - 2.5) * 175 * d * (o.spread ?? 1) + (r() - 0.5) * 50 + (row % 2) * 60, y: A.GY + 40 - row * 95, s: (o.s ?? 1.2) * d, ph: r() * 6, side: r() < 0.5 ? -1 : 1 }); }
  pts.reverse().forEach(p => { const d = fn(p.i, p); if (d) germ(g, { kind: 'green', x: p.x, y: p.y, facing: p.side, rim: A.rim, ...d, s: p.s * (d.scale ?? 1) }); });
}

// s02 — "and it started a war inside my body."  the pill crashes into the green army
registerShot('s02', { draw(g, t, info) {
  const hit = 0.45, [sx, sy] = t > hit ? shake(t, 14 * (1 - prog(t, hit, hit + 0.6)), 30) : [0, 0];
  const cam = { z: 1.02 + 0.05 * io(t, info.dur), x: sx, y: 150 + sy };
  const A = body(g, t, cam, { cyan: t > hit ? 1 - prog(t, hit, hit + 1.5) : 0 });
  layer(g, cam, 1, (g) => {
    army(g, A, 18, 4, (i, p) => { const d = Math.abs(p.x - E.W / 2), knocked = t > hit + d / 2400 && d < 330;
      return knocked ? { state: 'flat', side: p.x < E.W / 2 ? -1 : 1, expr: 'sleepy' } : { expr: t > hit ? 'shocked' : 'angry', arms: t > hit ? 'up' : 'fist', t: t + p.ph, sweat: t > hit }; });
    const py = lerp(-200, A.GY - 200, ease.in(prog(t, 0, hit)));
    pill(g, E.W / 2, py, 46, 0.3 + t * (t < hit ? 6 : 0.3));
    if (t < hit) FX.speedLines(g, t, { cx: E.W / 2, cy: py, count: 30, a: 0.25, inner: 120 });
  });
  if (t > hit) { FX.rings(g, E.W / 2, A.GY - 200 + 150, t - hit, { count: 3, r0: 80, r1: 700, speed: 1.4, color: ACCENT, a: 0.7 * (1 - prog(t, hit, hit + 1.4)), w: 8 }); glow(g, E.W / 2, A.GY - 50, 600, ACCENT, 0.5 * (1 - prog(t, hit, hit + 0.8))); }
  bodyFg(g, t, cam);
} });

// s03 — "But the real enemy wasn't what I expected."  one purple germ in the dark, smirks on "expected"
registerShot('s03', { draw(g, t, info) {
  bodyBlur(g, t, { set: { dim: 0.85, purple: 0.6 }, veil: 0.5 });
  const smirk = info.globalT > wordAt('d02', 'expected') - 0.05;
  layer(g, { z: 1 + 0.07 * io(t, info.dur) }, 1, (g) => {
    glow(g, E.W / 2, E.H * 0.44, 650, '#a066ff', 0.22);
    bigGerm(g, E.W / 2, E.H * 0.44, 520, { kind: 'purple', expr: smirk ? 'smirk' : 'neutral', spikes: true, scar: true, t, blink: blink(t, 2.6), rim: { color: '#d6b0ff', dir: [-0.6, -0.8], w: 7 } });
  });
  FX.dust(g, t, { count: 30, color: '#d6b0ff', a: 0.25, speed: 6 });
} });

// s04 — "It started with a sore throat."  establishing wide: Maya sick on the couch, Cap at his desk
registerShot('s04', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * io(t, info.dur), x: 30 - 40 * io(t, info.dur), y: -120 };
  aptScene(g, t, cam, { s: 1.25, desk: true,
    seated: (g, A, s) => sitMaya(g, A, A.couch.x - 60, s, { pose: SIT_SICK, expr: 'sad', t, blink: blink(t, 3.1) }),
    front: (g, A) => person(g, { x: A.CX + V(400, 300), y: A.GY, s: 1.25, facing: 1, outfit: CAP, pose: breathe(POSES.phone, t, 1, 2), expr: 'neutral', rim: A.rim, prop: 'phone', blink: blink(t, 2.7, 1) }) });
} });

// s05 — Maya: "Ugh. My throat is on fire."  medium, hand at the throat, a hot glow there
registerShot('s05', { draw(g, t, info) {
  const cam = { z: 1.45 + 0.05 * io(t, info.dur), x: -150, y: -60 };
  aptScene(g, t, cam, { s: 2.0, table: { glass: false },
    seated: (g, A, s) => {
      const x = A.couch.x - 20, p = { ...SIT_SICK, eF: [26, -128], hF: [16, -152] };
      sitMaya(g, A, x, s, { pose: p, expr: 'nervous', talk: talk(info.globalT, 'd04'), t });
      const tx = x + 8 * s, ty = A.GY - 152 * s;
      glow(g, tx, ty, 170, '#ff6a3a', 0.45 + 0.12 * Math.sin(t * 9));
      for (let i = 0; i < 6; i++) { const ph = (t * 1.4 + i / 6) % 1; circle(g, tx + Math.sin(i * 2.3 + t * 3) * 30, ty - 20 - ph * 140, 5 * (1 - ph) + 2, alpha('#ffb070', 0.8 * (1 - ph))); }
    } });
} });

function suitcase(g, x, y, s) { rr(g, x - 26 * s, y - 40 * s, 52 * s, 40 * s, 6 * s); g.fillStyle = '#8a5a2e'; g.fill(); g.fillStyle = 'rgba(255,210,170,.3)'; g.fillRect(x - 24 * s, y - 38 * s, 48 * s, 4 * s); seg(g, [[x - 10 * s, y - 40 * s], [x - 10 * s, y - 50 * s], [x + 10 * s, y - 50 * s], [x + 10 * s, y - 40 * s]], 5 * s, S().ink); }

// s06 — germ: "Nice warm throat! Let's move in!"  the leader waves the gang in
registerShot('s06', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.05 * io(t, info.dur), x: 60 * io(t, info.dur), y: 140 };
  const A = body(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 4; i++) { const x = lerp(-160 - i * 170, 300 - i * 150, ease.out(prog(t, 0, 1.6))), moving = t < 1.6;
      germ(g, { kind: 'green', x, y: A.GY + 10 - i * 18, s: 1.2 - i * 0.08, facing: 1, expr: i % 2 ? 'happy' : 'smirk', walk: moving ? t * 14 + i : null, arms: 'down', t: t + i, rim: A.rim, blink: blink(t, 2.9, i) });
      suitcase(g, x + 60, A.GY - 6 - i * 18, 0.9); }
    const lx = E.W * 0.7;
    germ(g, { kind: 'green', x: lx, y: A.GY + 30, s: 1.7, facing: -1, expr: 'happy', arms: 'wave', armsB: 'down', t, talk: talk(info.globalT, 'd05'), rim: A.rim });
    suitcase(g, lx - 100, A.GY + 30, 1.4);
  });
  bodyFg(g, t, cam, 2);
} });

// s07 — germs: "Split! Split! Split!"  each word doubles the gang
registerShot('s07', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.04 * io(t, info.dur), y: 140 };
  const A = body(g, t, cam, {});
  const W3 = [0, 1, 2].map(n => wordAt('d06', 'split', n)), gt = info.globalT;
  let gen = 0; for (const w of W3) if (gt >= w) gen++;
  const k = gen > 0 ? prog(gt, W3[gen - 1], W3[gen - 1] + 0.22) : 1;
  const grid = (n) => { const cols = n <= 2 ? n : n <= 4 ? 2 : 4, rows = Math.ceil(n / cols), out = []; for (let i = 0; i < n; i++) { const c = i % cols, r = Math.floor(i / cols); out.push([E.W / 2 + (c - (cols - 1) / 2) * V(260, 230), A.GY - (rows - 1 - r) * 150]); } return out; };
  const sz = [1.6, 1.35, 1.1, 0.85];
  layer(g, cam, 1, (g) => {
    if (k < 1 && gen > 0) grid(2 ** (gen - 1)).forEach(([x, y]) => germ(g, { kind: 'green', x, y, s: sz[gen - 1], state: 'split', k: 0.2 + 0.8 * k, expr: 'determined', rim: A.rim }));
    else grid(2 ** gen).forEach(([x, y], i) => germ(g, { kind: 'green', x, y, s: sz[gen], facing: i % 2 ? -1 : 1, expr: 'joy', arms: 'up', t: t + i, talk: talk(gt, 'd06'), rim: A.rim, blink: blink(t, 3, i) }));
  });
  if (gen > 0 && k < 1) FX.rings(g, E.W / 2, A.GY - 160, k * 0.6, { count: 2, r0: 60, r1: 320, color: GREEN, a: 0.6 * (1 - k) });
  bodyFg(g, t, cam, 2, 5);
} });

// s08 is the 3D fly-through (02_army3d.js)

// s09 — "And every hour, I got weaker."  slumped, clock racing, a battery draining over her head
registerShot('s09', { draw(g, t, info) {
  const cam = { z: 1.3 + 0.06 * io(t, info.dur), x: -60, y: -120 };
  const drain = ease.inOut(prog(t, 0.2, info.dur - 0.1));
  aptScene(g, t, cam, { s: 1.7, set: { clockSpeed: 3600 * 1.2, clockT: t, lamp: 1 - drain * 0.5 },
    seated: (g, A, s) => {
      const x = A.couch.x - 40, p = { ...SIT_SICK, head: [14 + 10 * drain, -170 + 14 * drain], sh: [4 + 4 * drain, -140 + 6 * drain] };
      sitMaya(g, A, x, s, { pose: p, expr: drain > 0.5 ? 'sleepy' : 'sad', t });
      const bx = x + 10, by = A.GY - 330 * s / 1.7 - 120, bw = 140, bh = 64;
      rr(g, bx - bw / 2 - 6, by - bh / 2 - 6, bw + 12, bh + 12, 16); g.fillStyle = alpha('#0e0b12', 0.7); g.fill();
      rr(g, bx + bw / 2 + 6, by - 14, 12, 28, 4); g.fillStyle = '#f4efe6'; g.fill();
      const lvl = 1 - 0.85 * drain, col = lvl > 0.5 ? S().ui.good : lvl > 0.3 ? S().ui.gold : S().ui.accent;
      rr(g, bx - bw / 2 + 4, by - bh / 2 + 4, (bw - 8) * lvl, bh - 8, 8); g.fillStyle = col; g.fill(); glow(g, bx, by, 160, col, 0.3);
    } });
} });
