// shots/05_reveal.js — s26–s32: "You see…", the mechanism, misuse, the pharmacy shelf, the closing callback.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, glow, alpha, mix, rr, circle, seg, text, rng, FONTS } from '/engine/core.js';
import { drawFigure, POSES, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { body } from '../sets/body.js';
import { pharmacy } from '../sets/pharmacy.js';
import { MAYA, CAP, ACCENT, PURPLE, GREEN, person, germ, bigGerm, pill, holdPill, holdBottle, talk, blink, wordAt } from '../cast.js';
import { io, aptScene, sitMaya, aptBlur, army } from './01_setup.js';
import { BP, bpGerm, label, cross, bpFrame } from './04_turn.js';

// s26 — Maya: "You see, antibiotics don't teach your body to fight bacteria."  she explains with the bottle, Cap beside her
registerShot('s26', { draw(g, t, info) {
  const gt = info.globalT, cam = { z: 1.3 + 0.05 * io(t, info.dur), x: 40 - 60 * io(t, info.dur), y: -100 };
  aptScene(g, t, cam, { s: 1.7, set: { lamp: 0.6, cold: 0.45 }, table: { bottle: false },
    seated: (g, A, s) => {
      person(g, { x: A.couch.x + 170, y: A.GY, s, facing: -1, outfit: CAP, pose: breathe(POSES.sitBack, t, 1, 5), expr: gt > wordAt('d20', 'fight') ? 'thinking' : 'neutral', rim: A.rim, shadow: false, blink: blink(t, 2.6, 1) });
      sitMaya(g, A, A.couch.x - 140, s, { pose: { ...POSES.sit, eF: [26, -140], hF: [44, -162] }, t, expr: 'neutral', talk: talk(gt, 'd20'), hold: holdBottle, blink: blink(t, 3.1) });
    } });
} });

// s27 — "They work by killing bacteria or stopping them from growing."  blueprint: pill → two outcomes
registerShot('s27', { draw(g, t, info) {
  const gt = info.globalT, ui = S().ui, tk = wordAt('d20', 'killing'), ts = wordAt('d20', 'stopping');
  g.save(); bpFrame(g, t, info);
  const py = E.H * 0.13; pill(g, E.W / 2, py, 30, -0.3);
  const L = [E.W * 0.27, E.H * 0.42], R = [E.W * 0.73, E.H * 0.42];
  const a1 = ease.out(prog(gt, tk - 0.3, tk + 0.1)), a2 = ease.out(prog(gt, ts - 0.3, ts + 0.1));
  const arrow = (to, a) => { if (a <= 0) return; const fx = E.W / 2, fy = py + 70, x = lerp(fx, to[0], a), y = lerp(fy, to[1] - 170, a); seg(g, [[fx, fy], [x, y]], 5, BP()); if (a > 0.95) seg(g, [[x - 16, y - 20], [x, y], [x + 16, y - 20]], 5, BP()); };
  arrow(L, a1); arrow(R, a2);
  const b = prog(gt, tk + 0.1, tk + 0.6);
  if (a1 > 0) { if (b < 0.5) bpGerm(g, L[0], L[1], 80, { wall: true }); else for (let i = 0; i < 6; i++) { const an = i / 6 * 6.28, d = 30 + 90 * ease.out(prog(b, 0.5, 1)); seg(g, [[L[0] + Math.cos(an) * d, L[1] + Math.sin(an) * d], [L[0] + Math.cos(an + 0.4) * (d + 30), L[1] + Math.sin(an + 0.4) * (d + 30)]], 6, ui.gold); } }
  label(g, 'KILLS THEM', L[0], L[1] + 250, a1, ui.gold, V(36, 44));
  if (a2 > 0) { bpGerm(g, R[0], R[1], 80, { split: 0.3 }); const pa = ease.out(prog(gt, ts + 0.1, ts + 0.4)); g.save(); g.globalAlpha *= pa; for (const dx of [-22, 22]) { rr(g, R[0] + dx - 11, R[1] - 50, 22, 100, 6); g.fillStyle = ui.gold; g.fill(); } glow(g, R[0], R[1], 160, ui.gold, 0.25 * pa); g.restore(); }
  label(g, 'STOPS GROWTH', R[0], R[1] + 250, a2, ui.gold, V(36, 44));
  g.restore();
} });

// s28 — Cap: "So what happens if we use them wrong?"  giant face
registerShot('s28', { draw(g, t, info) {
  aptBlur(g, t, { x: 200, set: { lamp: 0.6, cold: 0.45 } });
  layer(g, { z: 1.02 + 0.05 * io(t, info.dur) }, 1, (g) => bigFace(g, E.W / 2, E.H * 0.47, V(300, 320), { outfit: CAP, expr: t < 0.5 ? 'thinking' : 'worried', talk: talk(info.globalT, 'd21'), blink: blink(t, 2.8), rimColor: '#ffc68a', rimSide: 1, look: [-0.3, 0] }));
} });

// s29 — "When antibiotics are used incorrectly, resistant bacteria can survive and multiply."
// three rounds of medicine: green dots are wiped out, the purple ones survive and take over
registerShot('s29', { draw(g, t, info) {
  const gt = info.globalT, ui = S().ui;
  g.save(); bpFrame(g, t, info);
  const tsv = wordAt('d22', 'survive'), tmu = wordAt('d22', 'multiply');
  label(g, 'USED INCORRECTLY', E.W / 2, E.H * 0.08, ease.out(prog(t, 0.1, 0.4)), ui.accent, V(40, 48));
  const rounds = [{ purple: 3, t0: 0.3 }, { purple: 12, t0: tsv - info.shot.start - 0.2 }, { purple: 30, t0: tmu - info.shot.start - 0.2 }];
  const cols = 8, cell = 108, rnd = rng(31);
  const order = Array.from({ length: 32 }, (_, i) => i).sort(() => rnd() - 0.5);
  rounds.forEach((R, j) => {
    const a = ease.out(prog(t, R.t0, R.t0 + 0.3)); if (a <= 0) return;
    const ox = E.W / 2 - (cols - 1) * cell / 2, oy = E.H * (0.16 + j * 0.19);
    text(g, `ROUND ${j + 1}`, E.W / 2, oy - 22, { size: V(24, 28), color: alpha(ui.cream, 0.75 * a), font: FONTS.ui, weight: 900, spacing: 3 });
    const wipe = prog(t, R.t0 + 0.5, R.t0 + 1.0);
    for (let i = 0; i < 32; i++) {
      const isP = order.indexOf(i) < R.purple, x = ox + (i % cols) * cell, y = oy + 30 + Math.floor(i / cols) * 44;
      if (!isP && wipe >= 1) { circle(g, x, y, 5, alpha(BP(), 0.25 * a)); continue; }
      const r = 18 * (isP ? 1 : 1 - wipe * 0.8);
      g.fillStyle = alpha('#0e0b12', a); g.beginPath(); g.ellipse(x, y, r, r * 0.75, 0, 0, 7); g.fill();
      g.lineWidth = isP ? 5 : 3; g.strokeStyle = alpha(isP ? PURPLE : GREEN, a); g.stroke();
      if (isP) glow(g, x, y, 30, PURPLE, 0.25 * a);
    }
    if (wipe > 0 && wipe < 1) { const wx = ox - 60 + wipe * (cols * cell + 120); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(ACCENT, 0.25); g.fillRect(wx - 34, oy + 6, 68, 190); g.restore(); }
  });
  label(g, 'SURVIVE', E.W * 0.3, E.H * 0.72, ease.out(prog(gt, tsv, tsv + 0.3)), '#d6b0ff', V(36, 44));
  label(g, '+ MULTIPLY', E.W * 0.7, E.H * 0.72, ease.out(prog(gt, tmu, tmu + 0.3)), '#d6b0ff', V(36, 44));
  g.restore();
} });

// s30 — "Eventually, medicines that once worked may no longer work."  pharmacy shelf, red ✕ stamps one by one
registerShot('s30', { draw(g, t, info) {
  const cam = { z: 1.15, x: -120 + 260 * io(t, info.dur), y: -40 };
  const P = pharmacy(g, t, cam);
  const tn = wordAt('d22', 'longer'), stamps = [[1.0, 2, 0], [1.6, 3, 2], [2.2, 1, 4], [tn - info.shot.start, 4, 1], [tn - info.shot.start + 0.3, 2, 6]];
  layer(g, cam, 0.85, (g) => {
    const base = P.slots.filter(s => s.x > E.W * 0.05 && s.x < E.W * 1.05);
    stamps.forEach(([ts, row, col]) => { const k = prog(t, ts, ts + 0.15); if (k <= 0) return; const r_ = base.filter(s => s.row === row), sl = r_[Math.min(r_.length - 1, col + 2)]; if (!sl) return;
      const sc = lerp(1.8, 1, ease.out(k)); g.save(); g.translate(sl.x, sl.y - 60); g.scale(sc, sc); g.rotate(-0.12); cross(g, 0, 0, 46, S().ui.accent, k, 16); g.restore(); });
  });
  veil(g, '#0a1020', 0.12);
} });

// s31 — "The scariest part? Antibiotics don't become weaker."  Maya alone at the night window, the pill still glowing in her hand
registerShot('s31', { draw(g, t, info) {
  const gt = info.globalT, tw = wordAt('d23', 'weaker'), pulse = ease.out(prog(gt, tw - 0.1, tw + 0.3));
  const cam = { z: 1.35 + 0.1 * io(t, info.dur), x: -40, y: -140 };
  aptScene(g, t, cam, { s: 1.9, set: { night: true, lamp: 0 }, table: { bottle: true },
    front: (g, A) => {
      const o = { x: A.CX - 80, y: A.GY + 40, s: 2.0, facing: 1, outfit: MAYA, pose: breathe({ ...POSES.holdFront, eB: [-7, -136], hB: [-9, -100] }, t), expr: 'neutral', look: [0.6, 0.3], rim: { color: '#a9b8ff', dir: [0.3, -1], w: 5 }, blink: blink(t, 3.4), hold: holdPill };
      person(g, o); const [hx, hy] = [o.x + 36 * o.s, o.y - 152 * o.s];
      glow(g, hx, hy, 120 + 140 * pulse, ACCENT, 0.35 + 0.4 * pulse);
    } });
} });

// s32 — "The bacteria become harder to kill."  callback to s03: the purple boss, an army behind him now, grin on "kill"
registerShot('s32', { draw(g, t, info) {
  const gt = info.globalT, tk = wordAt('d24', 'kill'), grin = gt >= tk - 0.05;
  const cam = { z: 1.12 - 0.08 * io(t, info.dur), y: 120 };
  body(g, t, cam, { dim: 0.7, purple: 1 });
  layer(g, cam, 0.7, (g) => { const A = { GY: E.H * 0.6, rim: { color: '#d6b0ff', dir: [0, -1], w: 4 } }; army(g, A, 30, 41, (i) => ({ kind: 'purple', expr: 'happy', arms: 'up', t: t + i, blink: blink(t, 2.4, i) }), { s: 0.9, spread: 1.2 }); });
  veil(g, '#06020a', 0.3);
  layer(g, { z: 1 + 0.04 * io(t, info.dur) }, 1, (g) => {
    glow(g, E.W / 2, E.H * 0.45, 600, PURPLE, 0.3);
    bigGerm(g, E.W / 2, E.H * 0.47, 520, { kind: 'purple', expr: grin ? 'happy' : 'smirk', spikes: true, scar: true, arms: gt > tk - 0.4 ? 'flex' : 'down', t, rim: { color: '#d6b0ff', dir: [-0.6, -1], w: 8 } });
  });
  FX.dust(g, t, { count: 30, color: '#d6b0ff', a: 0.25, speed: 6 });
} });
