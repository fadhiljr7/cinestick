// shots/04_turn.js — s17 (blueprint), s20–s25: the survivors multiply, the medicine bounces off, "resistant".
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, mix, rr, circle, seg, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { body, bodyFg } from '../sets/body.js';
import { MAYA, CAP, ACCENT, PURPLE, GREEN, person, germ, bigGerm, talk, blink, wordAt } from '../cast.js';
import { io, aptScene, sitMaya, aptBlur, army, SIT_SICK } from './01_setup.js';

// ---------- blueprint line art (shared with the reveal) ----------
export const BP = () => S().ui.blueprint;
export function bpGerm(g, x, y, r, o = {}) {
  g.save(); g.translate(x, y); g.lineWidth = o.w ?? 5; g.strokeStyle = o.color || BP(); g.lineCap = 'round';
  const k = o.split ?? 0;
  if (k > 0) for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * r * (0.42 + 0.25 * k), 0, r * 0.62, r * 1.2, 0, 0, 7); g.stroke(); }
  else { g.beginPath(); g.ellipse(0, 0, r * 0.78, r * 1.2, 0, 0, 7); g.stroke(); }
  if (o.wall) { g.setLineDash(o.wallBreak ? [18, 22] : []); g.lineWidth = (o.w ?? 5) * 1.6; g.strokeStyle = o.wallColor || S().ui.gold; g.beginPath(); g.ellipse(0, 0, r * 0.98, r * 1.42, 0, 0, 7); g.stroke(); g.setLineDash([]); }
  circle(g, -r * 0.25, -r * 0.2, r * 0.09, o.color || BP()); circle(g, r * 0.22, -r * 0.24, r * 0.09, o.color || BP());
  g.restore();
}
export function label(g, str, x, y, a, col, size = V(40, 50)) { if (a <= 0) return; g.save(); g.globalAlpha *= clamp(a); const sc = 0.85 + 0.15 * ease.outBack(clamp(a)); g.translate(x, y); g.scale(sc, sc); text(g, str, 0, 0, { size, color: col, font: FONTS.ui, weight: 900, spacing: 3, glow: 16, glowColor: alpha(col, 0.6) }); g.restore(); }
export function cross(g, x, y, r, col, a = 1, w = 14) { if (a <= 0) return; g.save(); g.globalAlpha *= a; seg(g, [[x - r, y - r], [x + r, y + r]], w, col); seg(g, [[x + r, y - r], [x - r, y + r]], w, col); glow(g, x, y, r * 2, col, 0.3); g.restore(); }
export function bpFrame(g, t, info) { const z = 1 + 0.03 * io(t, info.dur); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); UI.blueprint(g, { grid: 60, a: 0.08 }); }

// s17 — "Some lost their protective walls. Others could no longer reproduce."
registerShot('s17', { draw(g, t, info) {
  const gt = info.globalT, ui = S().ui; g.save(); bpFrame(g, t, info);
  const tw = wordAt('d13', 'walls'), tr = wordAt('d13', 'reproduce');
  const y1 = E.H * 0.2, b = prog(gt, tw - 0.1, tw + 0.5);
  if (b < 0.7) bpGerm(g, E.W / 2, y1 + 40, 110, { wall: true, wallBreak: b > 0.05 });
  else for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, d = 60 + 180 * ease.out(prog(b, 0.7, 1)); seg(g, [[E.W / 2 + Math.cos(a) * d, y1 + 40 + Math.sin(a) * d], [E.W / 2 + Math.cos(a + 0.4) * (d + 50), y1 + 40 + Math.sin(a + 0.4) * (d + 50)]], 6, ui.gold); }
  if (b > 0.7) glow(g, E.W / 2, y1 + 40, 220, ui.gold, 0.3 * (1 - prog(b, 0.7, 1)));
  label(g, 'WALL BREAKS', E.W / 2, y1 + 270, ease.out(prog(gt, tw, tw + 0.3)), ui.gold);
  seg(g, [[E.W * 0.15, E.H * 0.42], [E.W * 0.85, E.H * 0.42]], 2, alpha(BP(), 0.3));
  const y2 = E.H * 0.55, k = Math.min(0.45, prog(gt, tw + 0.6, tr) * 0.45);
  bpGerm(g, E.W / 2, y2, 100, { split: Math.max(0.01, k) });
  cross(g, E.W / 2, y2, 90, ui.accent, ease.out(prog(gt, tr, tr + 0.25)));
  label(g, "CAN'T COPY", E.W / 2, y2 + 200, ease.out(prog(gt, tr, tr + 0.3)), ui.accent);
  g.restore();
} });

// s20 — "Then, something terrifying happens."  the lamp flickers out, the room turns cold
registerShot('s20', { draw(g, t, info) {
  const flick = t < 0.7 ? (Math.sin(t * 60) > 0.2 ? 1 : 0.2) : 0, cold = ease.inOut(prog(t, 0.3, 1.2));
  const cam = { z: 1.35 + 0.12 * ease.inOut(t / info.dur), x: -150, y: -100, r: 0.015 * Math.sin(t * 1.3) };
  aptScene(g, t, cam, { s: 2.0, set: { lamp: flick, cold },
    seated: (g, A, s) => sitMaya(g, A, A.couch.x - 20, s, { pose: { ...POSES.sit, eF: [22, -130], hF: [8, -116] }, t, expr: t > 0.6 ? 'scared' : 'worried', look: [-0.6, -0.3] }) });
  veil(g, '#0a1030', 0.2 * cold);
} });

// s21 — boss: "Boys. Multiply."  fist up, the purple gang behind splits
registerShot('s21', { draw(g, t, info) {
  const gt = info.globalT, tm = wordAt('d16', 'multiply'), k = prog(gt, tm + 0.1, tm + 0.45);
  const cam = { z: 1.2 + 0.05 * io(t, info.dur), y: 140 };
  const A = body(g, t, cam, { dim: 0.35, purple: 0.6 }), rim = { color: '#d6b0ff', dir: [0, -1], w: 5 };
  layer(g, cam, 1, (g) => {
    [-330, -115, 115, 330].forEach((dx, j) => {
      const x = E.W / 2 + dx, y = A.GY - 120;
      if (k <= 0) germ(g, { kind: 'purple', x, y, s: 0.95, facing: dx > 0 ? -1 : 1, expr: 'smirk', t: t + j, blink: blink(t, 2.6, j), rim });
      else if (k < 1) germ(g, { kind: 'purple', x, y, s: 0.95, state: 'split', k: 0.2 + 0.8 * k, expr: 'happy', rim });
      else for (const sx of [-1, 1]) germ(g, { kind: 'purple', x: x + sx * 50, y: y + (sx > 0 ? 20 : 0), s: 0.8, facing: sx, expr: 'happy', arms: 'up', t: t + j + sx, rim });
    });
    germ(g, { kind: 'purple', x: E.W / 2, y: A.GY + 80, s: 1.7, facing: 1, expr: gt > tm ? 'determined' : 'smirk', spikes: true, scar: true, talk: talk(gt, 'd16'), arms: gt > tm ? 'fist' : 'down', t, rim });
  });
  if (k > 0 && k < 1) FX.rings(g, E.W / 2, A.GY - 140, k, { count: 2, r0: 100, r1: 500, color: '#d6b0ff', a: 0.5 * (1 - k) });
  bodyFg(g, t, cam, 2, 14);
} });

// s22 — "The surviving bacteria began multiplying again."  the purple army doubles across the cave
registerShot('s22', { draw(g, t, info) {
  const per = info.dur / 6.2, gen = Math.min(5, Math.floor(t / per)), n = Math.min(30, 2 ** gen + 2);
  const cam = { z: 1.1 - 0.06 * io(t, info.dur), y: 140 };
  const A = body(g, t, cam, { dim: 0.3, purple: 0.4 + 0.5 * t / info.dur });
  layer(g, cam, 1, (g) => army(g, A, 30, 21, (i) => i < n ? { kind: 'purple', expr: i % 3 ? 'happy' : 'smirk', arms: i % 2 ? 'up' : 'down', t: t + i, blink: blink(t, 2.5, i), rim: { color: '#d6b0ff', dir: [0, -1], w: 5 }, scale: i >= n - 2 ? ease.outBack(clamp((t % per) * 5)) : 1 } : null, { s: 1.0 }));
  UI.badge(g, { str: '×' + (2 ** (gen + 1)), size: V(48, 72), y: V(110, 250), color: '#d6b0ff' });
  bodyFg(g, t, cam, 2, 16);
} });

// s23 — "This time, the medicine didn't work against them."  the cyan wave bounces off the purple wall
registerShot('s23', { draw(g, t, info) {
  const hit = 0.9, cam = { z: 1.12 + 0.04 * io(t, info.dur), x: 0, y: 140 };
  const [sx, sy] = t > hit ? shake(t, 8 * (1 - prog(t, hit, hit + 0.4)), 30) : [0, 0]; cam.x += sx; cam.y += sy;
  const A = body(g, t, cam, { dim: 0.25, purple: 0.8 });
  const wx = t < hit ? lerp(-400, E.W * 0.36, ease.in(t / hit)) : lerp(E.W * 0.36, -500, ease.out(prog(t, hit, hit + 1.3)));
  const sq = t > hit && t < hit + 0.12 ? 0.92 : 1;
  layer(g, cam, 1, (g) => {
    for (let j = 0; j < 4; j++) germ(g, { kind: 'purple', x: E.W * 0.6 + (j % 2) * 170 - 60, y: A.GY + 60 - Math.floor(j / 2) * 130, s: 1.25 * sq, facing: -1, expr: j === 1 ? 'smirk' : 'neutral', t: t + j, blink: blink(t, 2.7, j), rim: { color: ACCENT, dir: [-1, -0.3], w: 6 } });
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(wx - 450, 0, wx + 60, 0); gr.addColorStop(0, alpha(ACCENT, 0)); gr.addColorStop(0.85, alpha(ACCENT, 0.4)); gr.addColorStop(1, alpha('#e8fbff', 0)); g.fillStyle = gr; g.fillRect(wx - 450, -E.H, 510, E.H * 3); g.restore();
  });
  if (t > hit) FX.rings(g, E.W * 0.42, A.GY - 20, t - hit, { count: 2, r0: 40, r1: 360, color: ACCENT, a: 0.6 * (1 - prog(t, hit, hit + 0.8)), w: 6 });
  bodyFg(g, t, cam, 2, 17);
} });

// s24 — Cap: "Why isn't it working anymore?"  two-shot, Cap leans in by the couch
registerShot('s24', { draw(g, t, info) {
  const cam = { z: 1.3 + 0.05 * io(t, info.dur), x: 20, y: -100 };
  aptScene(g, t, cam, { s: 1.75, set: { lamp: 0, cold: 0.7 },
    seated: (g, A, s) => sitMaya(g, A, A.couch.x - 40, s, { pose: SIT_SICK, expr: 'nervous', t, blink: blink(t, 3.1) }),
    front: (g, A) => person(g, { x: A.CX + V(250, 240), y: A.GY + 30, s: 1.8, facing: -1, outfit: CAP, pose: breathe(POSES.shrug, t, 1, 4), expr: 'worried', talk: talk(info.globalT, 'd18'), rim: A.rim, blink: blink(t, 2.8) }) });
} });

// s25 — Maya: "Because they've become resistant."  giant face, the purple glow creeps in on "resistant"
registerShot('s25', { draw(g, t, info) {
  aptBlur(g, t, { set: { lamp: 0, cold: 0.7 }, veil: 0.4 });
  const gt = info.globalT, tr = wordAt('d19', 'resistant'), p = ease.out(prog(gt, tr - 0.1, tr + 0.6));
  glow(g, E.W / 2, E.H * 0.47, 900, PURPLE, 0.5 * p);
  layer(g, { z: 1.02 + 0.06 * io(t, info.dur) }, 1, (g) => bigFace(g, E.W / 2, E.H * 0.47, V(300, 320), { outfit: MAYA, expr: p > 0.3 ? 'determined' : 'worried', talk: talk(gt, 'd19'), rimColor: mix('#b8c6ff', '#d6b0ff', p), rimSide: -1 }));
} });
