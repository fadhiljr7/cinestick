// cast.js — aiTrends cast for "The Medicine That Fights Back".
// People: black stick figures (rig2d) with ONE signature colour each. Germs: black bodies whose cell WALL is the colour
// (green = ordinary, purple armour = resistant), white minimal faces, stick limbs, rim light like everyone else.
import { E, V, S, clamp, lerp, ease, seg, circle, ring, alpha, shade, mix, glow, rr } from '/engine/core.js';
import { BASE_MOODS } from '/engine/styles.js';
import { face, drawFigure } from '/engine/rig2d.js';
import { LINES } from './dialogue.js';
export { LINES };

export const MAYA = { top: 'hoodie', color: '#d64a33', head: 'bun' };                 // narrator + patient: red-orange hoodie
export const CAP = { top: 'none', head: 'cap', headColor: '#f2c21a' };                 // roommate, the doubter: yellow cap
export const ACCENT = '#35d0f0';                                                        // reserved for the antibiotic
export const GREEN = '#7fdc5a', PURPLE = '#a066ff';

// inside the body: a dark red cave lit from above
BASE_MOODS.body = { sky: ['#14030a', '#3a0b18', '#5e1626'], ambient: '#3a1020', key: '#ffb4a0', rim: '#ffb39a', wall: '#6a1a2a', floor: '#3f0f1c', dark: '#1a040b', practical: '#ff8a7a', grass: '#3d5a48', road: '#3a3040', fog: '#8a2a40' };

// ---------- timing ----------
export const blink = (t, period = 3.2, off = 0) => ((t + off) % period) > period - 0.12;
export function talk(globalT, id) {
  const L = LINES[id]; if (!L || globalT < L.t0 || globalT > L.t1) return 0;
  const w = E.words.find(w => w.line === id && globalT >= w.start - 0.02 && globalT <= w.end + 0.02); if (!w) return 0;
  return clamp(0.25 + 0.75 * Math.abs(Math.sin(globalT * 17)) * (0.6 + 0.4 * Math.sin(globalT * 5.3)));
}
export const wordAt = (id, word, n = 0) => { const c = E.words.filter(w => w.line === id && w.word.toLowerCase().replace(/[^\w']/g, '').startsWith(word)); return c[n] ? c[n].start : LINES[id]?.t0 ?? 0; };

// world position of a figure's hand (F = near, B = far)
export function handPos(o, which = 'F') { const p = o.pose, s = o.s ?? 1, f = o.facing ?? 1, h = which === 'B' ? p.hB : p.hF; return [o.x + h[0] * s * f, o.y + h[1] * s]; }
// person + optional held object drawn at the hand
export function person(g, o) { drawFigure(g, o); if (o.hold) { const [x, y] = handPos(o, o.hold.hand || 'F'); o.hold.draw(g, x, y, o.s ?? 1); } }

// ---------- props ----------
export function pill(g, x, y, r, rot = 0, a = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= a;
  glow(g, 0, 0, r * 4, ACCENT, 0.55);
  g.fillStyle = ACCENT; rr(g, -r * 1.7, -r, r * 3.4, r * 2, r); g.fill();
  g.save(); rr(g, -r * 1.7, -r, r * 3.4, r * 2, r); g.clip(); g.fillStyle = '#eafcff'; g.fillRect(-r * 1.7, -r, r * 1.7, r * 2); g.restore();
  g.fillStyle = 'rgba(255,255,255,.75)'; rr(g, -r * 1.2, -r * 0.7, r * 2.2, r * 0.32, r * 0.16); g.fill();
  g.restore();
}
export const holdPill = { draw: (g, x, y, s) => pill(g, x + 6 * s, y - 6 * s, 6 * s, -0.4) };
export const holdGlass = { draw: (g, x, y, s) => { g.fillStyle = 'rgba(200,230,255,.55)'; rr(g, x - 7 * s, y - 24 * s, 14 * s, 24 * s, 2 * s); g.fill(); g.fillStyle = 'rgba(140,200,255,.55)'; g.fillRect(x - 6 * s, y - 13 * s, 12 * s, 12 * s); } };
export function bottle(g, x, y, s, label = ACCENT) {
  g.fillStyle = '#c8741e'; rr(g, x - 9 * s, y - 30 * s, 18 * s, 30 * s, 3 * s); g.fill();
  g.fillStyle = '#efe8dc'; rr(g, x - 10 * s, y - 37 * s, 20 * s, 8 * s, 2 * s); g.fill();
  g.fillStyle = '#f4efe6'; g.fillRect(x - 7 * s, y - 24 * s, 14 * s, 13 * s); g.fillStyle = label; g.fillRect(x - 7 * s, y - 20 * s, 14 * s, 4 * s);
  g.fillStyle = 'rgba(255,230,200,.35)'; g.fillRect(x - 7 * s, y - 29 * s, 3 * s, 26 * s);
}
export const holdBottle = { draw: (g, x, y, s) => bottle(g, x + 4 * s, y + 4 * s, s) };

// ---------- germs ----------
// germ(g, { x, y (feet), s, facing, kind:'green'|'purple', expr, talk, blink, look, arms:'down'|'up'|'wave'|'flex'|'fist', walk (phase),
//           state:'ok'|'flat'|'burst'|'split', k, cracks:0..1, spikes, scar, sweat, rim:{color,dir,w}, alpha, glow })
// Local units: feet at y = 0, body centre at y = -92, about 150 tall at s = 1 (a person is ~240).
export function germ(g, o) {
  const st = S(), ink = st.ink, s = o.s ?? 1, f = o.facing ?? 1, purple = o.kind === 'purple';
  const wallC = purple ? PURPLE : GREEN, cy = -92, rx = 38, ry = 50;
  const rim = o.rim ? { w: st.rimWidth, ...o.rim } : null;
  g.save(); g.translate(o.x, o.y); if (o.alpha != null) g.globalAlpha *= o.alpha;
  if (o.state !== 'flat' && o.shadow !== false) { g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 2, 34 * s, 6 * s, 0, 0, 7); g.fill(); }
  g.scale(f * s, s);
  if (o.state === 'flat') { g.translate(0, -38); g.rotate(Math.PI / 2 * (o.side ?? 1)); g.translate(0, 92); }   // knocked over: lying on its side
  if (o.glow) glow(g, 0, cy, 140, wallC, o.glow);
  if (o.state === 'burst') { burst(g, o, wallC, ink, cy, rx, ry); g.restore(); return; }
  const k = o.state === 'split' ? clamp(o.k ?? 0.4) : 0;
  const shape = (grow) => { // body outline (one capsule, or two pinching lobes)
    g.beginPath();
    if (k > 0) { for (const sx of [-1, 1]) { g.moveTo(sx * (rx * 0.45 + 22 * k) + rx * 0.7 + grow, cy); g.ellipse(sx * (rx * 0.45 + 22 * k), cy, rx * 0.72 + grow, ry + grow, 0, 0, 7); } }
    else g.ellipse(0, cy, rx + grow, ry + grow, 0, 0, 7);
  };
  // limbs (ink, round caps)
  const L = 9, armY = cy + 8, legY = cy + ry - 6;
  const walk = o.walk != null ? Math.sin(o.walk) * 10 : 0;
  const limbs = (col, w) => {
    seg(g, [[-14, legY], [-16 - walk, -2]], w, col); seg(g, [[14, legY], [16 + walk, -2]], w, col);
    const arm = (sx, mode) => { const x0 = sx * (rx - 4); const tip = mode === 'up' ? [sx * (rx + 30), cy - 70] : mode === 'wave' ? [sx * (rx + 36), cy - 50 + Math.sin((o.t || 0) * 18) * 14] : mode === 'flex' ? [sx * (rx + 26), cy - 46] : mode === 'fist' ? [sx * (rx + 10), cy - 86] : [sx * (rx + 22), armY + 40];
      const el = mode === 'flex' ? [sx * (rx + 40), armY - 4] : [lerp(x0, tip[0], 0.5) + sx * 8, lerp(armY, tip[1], 0.5) + 6]; seg(g, [[x0, armY], el, tip], w, col); circle(g, tip[0], tip[1], w * (mode === 'fist' || mode === 'flex' ? 1.1 : 0.75), col); };
    arm(-1, o.armsB || o.arms || 'down'); arm(1, o.arms || 'down');
    // flagellum
    g.strokeStyle = col; g.lineWidth = w * 0.55; g.beginPath(); for (let i = 0; i <= 14; i++) { const x = -rx + 4 - i * 4.5, y = cy + 30 + Math.sin(i * 0.9 + (o.t || 0) * 8) * 5; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  };
  // rim pass (silhouette in the light colour, offset toward the light)
  if (rim) { g.save(); g.translate(rim.dir[0] * rim.w / s * f, rim.dir[1] * rim.w / s); limbs(rim.color, L + 3); g.fillStyle = rim.color; shape(purple ? 13 : 7); g.fill(); g.restore(); }
  limbs(ink, L);
  // spikes on the armoured wall
  if (purple && o.spikes) { g.fillStyle = shade(PURPLE, -0.45); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a); g.beginPath(); g.moveTo(c * (rx + 6) - sn * 8, cy + sn * (ry + 6) + c * 8); g.lineTo(c * (rx + 26), cy + sn * (ry + 26)); g.lineTo(c * (rx + 6) + sn * 8, cy + sn * (ry + 6) - c * 8); g.fill(); } }
  // the wall (signature colour) then the black body
  g.fillStyle = purple ? shade(PURPLE, -0.15) : shade(GREEN, -0.1); shape(purple ? 10 : 5); g.fill();
  if (purple) { g.fillStyle = alpha(shade(PURPLE, 0.35), 0.8); shape(10); g.save(); g.clip(); g.fillRect(-rx - 20, cy - ry - 20, (rx + 20) * 0.7, ry * 2.4); g.restore(); }
  g.fillStyle = ink; shape(0); g.fill();
  // cracks in the wall
  if (o.cracks) { g.strokeStyle = alpha('#ffffff', 0.9 * o.cracks); g.lineWidth = 2.5; g.beginPath(); g.moveTo(-rx - 3, cy - 30); g.lineTo(-rx + 10, cy - 14); g.lineTo(-rx + 2, cy + 4); g.moveTo(rx + 3, cy + 10); g.lineTo(rx - 12, cy + 24); g.lineTo(rx - 2, cy + 40); g.moveTo(-8, cy - ry - 4); g.lineTo(2, cy - ry + 12); g.lineTo(-4, cy - ry + 22); g.stroke(); }
  // face (white, minimal)
  const fr = 34;
  if (k > 0) { for (const sx of [-1, 1]) face(g, sx * (rx * 0.45 + 22 * k), cy - 6, fr * 0.7, { expr: o.expr, talk: o.talk, blink: o.blink, front: true }); }
  else face(g, 0, cy - 8, fr, { expr: o.expr, talk: o.talk, blink: o.blink, look: o.look, front: true, override: o.state === 'flat' ? { eyes: 'closed' } : null });
  if (o.scar) { seg(g, [[10, cy - 44], [30, cy - 4]], 3.2, alpha('#ffffff', 0.6)); for (const u of [0.3, 0.6]) seg(g, [[lerp(10, 30, u) - 5, lerp(cy - 44, cy - 4, u) + 3], [lerp(10, 30, u) + 6, lerp(cy - 44, cy - 4, u) - 3]], 2.4, alpha('#ffffff', 0.6)); }
  if (o.sweat) { g.fillStyle = '#9fd8ff'; g.beginPath(); g.ellipse(rx - 4, cy - ry + 8, 4, 7, 0, 0, 7); g.fill(); }
  g.restore();
}
function burst(g, o, wallC, ink, cy, rx, ry) {
  const k = clamp(o.k ?? 1);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, d = (20 + 120 * ease.out(k)); g.save(); g.translate(Math.cos(a) * d, cy + Math.sin(a) * d * 0.8); g.rotate(a + k * 2); g.globalAlpha *= 1 - k * 0.7;
    g.fillStyle = i % 2 ? wallC : ink; g.beginPath(); g.moveTo(-12, -8); g.lineTo(14, -10); g.lineTo(10, 10); g.lineTo(-10, 8); g.closePath(); g.fill(); g.restore(); }
  glow(g, 0, cy, 120 + 120 * k, wallC, 0.6 * (1 - k));
  ring(g, 0, cy, 30 + 160 * ease.out(k), 6 * (1 - k) + 1, alpha('#ffffff', 0.7 * (1 - k)));
}
// giant germ close-up: body centre at (cx, cy), body height ≈ h logical px
export function bigGerm(g, cx, cy, h, o = {}) { const s = h / 100; germ(g, { ...o, x: cx, y: cy + 92 * s, s, shadow: false }); }

// ---------- captions: the studio's own look (Fredoka caps, gold current word), but groups never cross a change of speaker ----------
import { text as _text, measure as _measure, prog as _prog, ease as _ease } from '/engine/core.js';
let GROUPS = null;
function groups() {
  const out = []; let cur = [];
  E.words.forEach((w, i) => { if (cur.length && (w.line !== E.words[cur[0]].line || cur.length === 4)) { out.push(cur); cur = []; } cur.push(i); if (/[.?!]$/.test(w.word) && cur.length >= 2) { out.push(cur); cur = []; } });
  if (cur.length) out.push(cur); return out;
}
window.CAPTIONS = function (g, globalT, o = {}) {
  const words = E.words; if (!words.length) return; GROUPS ||= groups();
  const { y = V(E.H - 150, E.H * 0.79), size = V(58, 74), color = '#ffffff', hi = S().ui.gold } = o;
  let i = -1; for (let k = words.length - 1; k >= 0; k--) if (globalT >= words[k].start - 0.05) { if (globalT <= words[k].end + 0.35) i = k; break; } if (i < 0) return;
  const grp = GROUPS.find(gr => gr.includes(i)), group = grp.map(k => words[k]); const strs = group.map(w => w.word.trim().toUpperCase());
  const w0 = strs.map(s => _measure(g, s, size)).reduce((a, b) => a + b, 0) + size * 0.3 * (strs.length - 1);
  const sz = size * Math.min(1, (E.W * 0.88) / w0), gap = sz * 0.3, widths = strs.map(s => _measure(g, s, sz)), total = widths.reduce((a, b) => a + b, 0) + gap * (strs.length - 1);
  let x = E.W / 2 - total / 2;
  strs.forEach((s, k) => { const cur = grp[k] === i; const pop = cur ? 1 + 0.08 * _ease.out(_prog(globalT, group[k].start, group[k].start + 0.12)) : 1; g.save(); g.translate(x + widths[k] / 2, y); g.scale(pop, pop); _text(g, s, 0, 0, { size: sz, color: cur ? hi : color, stroke: sz * 0.16, strokeColor: 'rgba(0,0,0,.85)' }); g.restore(); x += widths[k] + gap; });
};
