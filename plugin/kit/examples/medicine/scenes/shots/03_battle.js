// shots/03_battle.js — s10–s19: Cap doubts, Maya swallows the pill, the germs collapse, the purple survivors.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, glow, alpha, mix, rr, circle, seg } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { body, bodyFg } from '../sets/body.js';
import { MAYA, CAP, ACCENT, PURPLE, GREEN, person, germ, bigGerm, pill, holdPill, holdGlass, talk, blink, wordAt } from '../cast.js';
import { io, aptScene, sitMaya, aptBlur, bodyBlur, army, SIT_SICK } from './01_setup.js';

const HOLD_UP = { ...POSES.stand, eF: [24, -172], hF: [40, -206] };                 // Cap holds the pill up to look at it

// s10 — Cap: "Wait, how can one tiny pill defeat an entire army"  OTS from behind Maya, Cap holds up the pill
registerShot('s10', { draw(g, t, info) {
  const cam = { z: 1.35 + 0.05 * io(t, info.dur), x: 120, y: -140 };
  const gt = info.globalT;
  aptScene(g, t, cam, { s: 2.0,
    front: (g, A) => {
      const o = { x: A.CX + V(280, 220), y: A.GY + 30, s: 2.1, facing: -1, outfit: CAP, pose: breathe(HOLD_UP, t, 1, 3), expr: gt > wordAt('d08', 'army') ? 'confused' : 'thinking', talk: talk(gt, 'd08'), rim: A.rim, blink: blink(t, 2.8), hold: holdPill };
      person(g, o); FX.rings(g, o.x - 10, A.GY + 30 - 215 * 2.1, t, { count: 2, r0: 60, r1: 120, a: 0.25 * (talk(gt, 'd08') > 0 ? 1 : 0) });
    } });
  // Maya's shoulder and head, big and blurred in the foreground
  // Maya from behind: the back of her head and hoodie shoulder, big and blurred in the foreground (no face)
  blurLayer(g, 10, (g) => { const x = E.W * 0.1, y = E.H * 0.6, r = 330, ink = S().ink;
    g.fillStyle = MAYA.color; g.beginPath(); g.ellipse(x, y + r * 1.65, r * 1.25, r * 0.85, 0, Math.PI, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(x, y, r * 1.06, 0, 7); g.arc(x - r * 0.07, y + r * 0.02, r, 0, 7, true); g.fillStyle = '#ffc68a'; g.fill('evenodd'); g.restore();
    circle(g, x, y, r, ink); circle(g, x - r * 0.35, y - r * 0.95, r * 0.42, ink); }, { z: 1 }, 1.6);
} });

// s11 — Cap: "of invisible monsters?"  giant face, snaps to shocked on "monsters"
registerShot('s11', { draw(g, t, info) {
  aptBlur(g, t, { x: 200 });
  const gt = info.globalT, snap = wordAt('d08', 'monsters'), shocked = gt >= snap;
  const z = 1 + 0.05 * io(t, info.dur) + (shocked ? 0.06 * ease.out(prog(gt, snap, snap + 0.12)) : 0);
  layer(g, { z }, 1, (g) => bigFace(g, E.W / 2, E.H * 0.47, V(300, 320), { outfit: CAP, expr: shocked ? 'shocked' : 'confused', talk: shocked ? 0 : talk(gt, 'd08'), blink: blink(t, 2.8), rimColor: '#ffc68a', rimSide: 1, look: [-0.3, 0] }));
  if (shocked) FX.rings(g, E.W / 2, E.H * 0.47, gt - snap, { count: 3, r0: 340, r1: 620, color: '#fff1e6', a: 0.4 * (1 - prog(gt, snap, snap + 0.8)) });
} });

// s12 — Maya: "Just watch."  giant face, smirk
registerShot('s12', { draw(g, t, info) {
  aptBlur(g, t, { x: -200 });
  layer(g, { z: 1.02 + 0.05 * io(t, info.dur) }, 1, (g) => bigFace(g, E.W / 2, E.H * 0.47, V(300, 320), { outfit: MAYA, expr: 'smirk', talk: talk(info.globalT, 'd09'), rimColor: '#ffc68a', rimSide: -1, look: [0.3, 0], tilt: -0.05 }));
  FX.sparkle(g, E.W * 0.74, E.H * 0.3, 40 * ease.outBack(prog(t, 0.3, 0.6)), '#ffffff', 0.7);
} });

// s13 — "I swallowed the antibiotic."  pill to the mouth, then the glass, head back, gulp
registerShot('s13', { draw(g, t, info) {
  const cam = { z: 1.5 + 0.05 * io(t, info.dur), x: -150, y: -80 };
  const gulp = 1.25;
  aptScene(g, t, cam, { s: 2.0, table: { glass: false },
    seated: (g, A, s) => {
      const x = A.couch.x - 10;
      const toMouth = { ...POSES.sit, eF: [26, -126], hF: [22, -168] };
      const drink = { ...POSES.sit, head: [-2, -180], eF: [24, -134], hF: [20, -174] };
      const p = t < 0.65 ? toMouth : drink;
      sitMaya(g, A, x, s, { pose: p, t, expr: t < 0.65 ? 'determined' : t < gulp + 0.3 ? 'sleepy' : 'neutral', hold: t < 0.65 ? holdPill : holdGlass });
      if (t > gulp && t < gulp + 0.6) FX.rings(g, x + 6 * s, A.GY - 150 * s, t - gulp, { count: 2, r0: 10, r1: 80, color: ACCENT, a: 0.8 * (1 - prog(t, gulp, gulp + 0.6)), w: 4 });
    } });
} });

// s14 — "Suddenly, millions of bacteria started collapsing."  the cyan wave sweeps the cave; FREEZE mid-wave
registerShot('s14', { draw(g, t, info) {
  const frz0 = 0.9, frz1 = 1.5, tw = t < frz0 ? t : t < frz1 ? frz0 + (t - frz0) * 0.06 : frz0 + 0.036 + (t - frz1);
  const cam = { z: 1.05 + 0.04 * io(t, info.dur), x: -80 + 160 * io(t, info.dur), y: 140 };
  const A = body(g, tw, cam, { cyan: 0.6 });
  const wx = lerp(-300, E.W + 500, prog(tw, 0, 1.9));
  layer(g, cam, 1, (g) => {
    army(g, A, 18, 9, (i, p) => p.x < wx ? { state: 'flat', side: 1, expr: 'sleepy' } : { expr: 'scared', arms: 'up', sweat: true, t: tw + p.ph });
    g.save(); g.globalCompositeOperation = 'lighter';
    const gr = g.createLinearGradient(wx - 500, 0, wx + 100, 0); gr.addColorStop(0, alpha(ACCENT, 0)); gr.addColorStop(0.8, alpha(ACCENT, 0.32)); gr.addColorStop(1, alpha('#e8fbff', 0)); g.fillStyle = gr; g.fillRect(wx - 500, -E.H, 600, E.H * 3);
    for (let k = 0; k < 18; k++) circle(g, wx - 40 - (k * 53) % 400, A.GY - 60 - ((k * 137) % 900), 8 + (k % 4) * 5, alpha(ACCENT, 0.5));
    g.restore();
  });
  bodyFg(g, tw, cam, 2, 8);
  if (t > frz0 && t < frz1 + 0.3) { const a = clamp(Math.min((t - frz0) / 0.1, (frz1 + 0.3 - t) / 0.3)); FX.drops(g, t, { count: 40, color: '#d8f4ff', rMax: 8, drift: 2 }); veil(g, '#4a80ff', 0.22 * a, 'soft-light'); UI.badge(g, { str: 'MILLIONS', a, size: V(46, 64), y: V(110, 250) }); }
} });

// s15 — germ: "My wall! It's cracking!"  close: cracks spread, then it bursts
registerShot('s15', { draw(g, t, info) {
  bodyBlur(g, t, { set: { cyan: 0.5 } });
  const popT = info.dur - 0.14, gt = info.globalT;
  const [sx, sy] = shake(t, 3 + 6 * prog(t, 0, popT), 20);
  layer(g, { z: 1 + 0.06 * io(t, info.dur), x: sx, y: sy }, 1, (g) => {
    glow(g, E.W * 0.2, E.H * 0.3, 500, ACCENT, 0.25);
    if (t < popT) bigGerm(g, E.W / 2, E.H * 0.45, 480, { expr: 'scared', cracks: clamp(t / 0.9), talk: talk(gt, 'd11'), sweat: true, arms: 'up', t, rim: { color: ACCENT, dir: [-0.7, -0.6], w: 7 } });
    else bigGerm(g, E.W / 2, E.H * 0.45, 480, { state: 'burst', k: prog(t, popT, info.dur + 0.1) });
  });
} });

// s16 — germ: "I can't split! Why can't I split?"  stuck halfway through dividing, cyan clamps hold it
registerShot('s16', { draw(g, t, info) {
  bodyBlur(g, t, { x: 200, set: { cyan: 0.5 } });
  const k = 0.35 + 0.06 * Math.sin(t * 9);
  layer(g, { z: 1.02 + 0.05 * io(t, info.dur) }, 1, (g) => {
    bigGerm(g, E.W / 2, E.H * 0.45, 460, { state: 'split', k, expr: 'worried', talk: talk(info.globalT, 'd12'), arms: 'up', t, rim: { color: ACCENT, dir: [0.6, -0.8], w: 7 } });
    const a = ease.out(prog(t, 0.2, 0.5)); g.save(); g.globalAlpha *= a;
    for (const sy of [-1, 1]) { const y = E.H * 0.45 + sy * 290; rr(g, E.W / 2 - 22, y - 46, 44, 92, 18); g.fillStyle = ACCENT; g.fill(); glow(g, E.W / 2, y, 140, ACCENT, 0.5); }
    g.restore();
  });
} });

// s18 — "But a few bacteria survived."  smoke over the fallen green germs; three purple ones stand untouched
registerShot('s18', { draw(g, t, info) {
  const cam = { z: 1.08 + 0.05 * io(t, info.dur), y: 130 };
  const A = body(g, t, cam, { dim: 0.3, purple: 0.35 });
  layer(g, cam, 1, (g) => {
    army(g, A, 18, 13, (i, p) => [4, 8, 13].includes(i) ? null : { state: 'flat', side: p.side, expr: 'sleepy' });
    [[-250, 1.3, 'neutral'], [0, 1.6, 'smirk'], [250, 1.3, 'neutral']].forEach(([dx, s, ex], j) =>
      germ(g, { kind: 'purple', x: E.W / 2 + dx, y: A.GY + 60, s, facing: dx > 0 ? -1 : 1, expr: ex, spikes: j === 1, scar: j === 1, t: t + j, blink: blink(t, 2.4, j), rim: { color: '#d6b0ff', dir: [0, -1], w: 6 } }));
  });
  FX.fog(g, A.GY - 60, 300, '#c08a9a', 0.22); FX.fog(g, A.GY - 400, 260, '#a07090', 0.14);
  bodyFg(g, t, cam, 1, 30);
} });

// s19 — boss: "Is that all you've got?"  giant face, smug, scope bars
registerShot('s19', { draw(g, t, info) {
  bodyBlur(g, t, { set: { dim: 0.4, purple: 0.6 }, veil: 0.42 });
  layer(g, { z: 1 + 0.05 * io(t, info.dur) }, 1, (g) => bigGerm(g, E.W / 2, E.H * 0.47, 520, { kind: 'purple', expr: 'smirk', spikes: true, scar: true, talk: talk(info.globalT, 'd14'), arms: 'down', t, rim: { color: '#d6b0ff', dir: [-0.5, -1], w: 8 } }));
  const a = 1 - prog(t, 0.4, 1.2); if (a > 0) pill(g, E.W * 0.82, E.H * 0.3 + t * 80, 16, t * 4, a);
} });
