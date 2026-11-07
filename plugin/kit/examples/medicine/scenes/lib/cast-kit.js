// cast-kit.js — helpers every cinestick scene uses. People are the studio rig (drawFigure / bigFace) with ONE signature colour.
import { E, clamp, glow } from '/engine/core.js';
import { drawFigure } from '/engine/rig2d.js';
import { LINES } from '../dialogue.js';
export { LINES };

// blink: closed for ~0.12 s once per period (give each character a different period/offset)
export const blink = (t, period = 3.2, off = 0) => ((t + off) % period) > period - 0.12;
// mouth opening 0..1 while line `id` is spoken, from the real word timings (silent between words)
export function talk(globalT, id) {
  const L = LINES[id]; if (!L || globalT < L.t0 || globalT > L.t1) return 0;
  const w = E.words.find(w => w.line === id && globalT >= w.start - 0.02 && globalT <= w.end + 0.02); if (!w) return 0;
  return clamp(0.25 + 0.75 * Math.abs(Math.sin(globalT * 17)) * (0.6 + 0.4 * Math.sin(globalT * 5.3)));
}
// global time a word of a line is spoken (n = which occurrence); falls back to the line start
export function wordAt(id, word, n = 0) {
  const m = word.toLowerCase().replace(/[^\w']/g, '');
  const c = E.words.filter(w => w.line === id && w.word.toLowerCase().replace(/[^\w']/g, '').startsWith(m));
  return c[n] ? c[n].start : LINES[id]?.t0 ?? 0;
}
// world position of a figure's hand (F = near, B = far)
export function handPos(o, which = 'F') { const p = o.pose, s = o.s ?? 1, f = o.facing ?? 1, h = which === 'B' ? p.hB : p.hF; return [o.x + h[0] * s * f, o.y + h[1] * s]; }
// a person, plus an object drawn at the hand: o.hold = { hand:'F'|'B', draw(g, x, y, s) }
export function person(g, o) { drawFigure(g, o); if (o.hold) { const [x, y] = handPos(o, o.hold.hand || 'F'); o.hold.draw(g, x, y, o.s ?? 1); } }
// a small glowing prop (pill, gem, chip): the story's accent object
export function glowProp(g, x, y, r, color) { glow(g, x, y, r * 4, color, 0.55); g.fillStyle = color; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
