// cast.js — the medicine story's cast and props. Generic helpers (talk, blink, person, creature, captions) live in ./lib/.
import { E, V, S, clamp, lerp, ease, seg, circle, ring, alpha, shade, mix, glow, rr } from '/engine/core.js';
import { BASE_MOODS } from '/engine/styles.js';
import { creature, bigCreature } from './lib/creature.js';
export { blink, talk, wordAt, handPos, person, LINES } from './lib/cast-kit.js';

export const MAYA = { top: 'hoodie', color: '#d64a33', head: 'bun' };                 // narrator + patient: red-orange hoodie
export const CAP = { top: 'none', head: 'cap', headColor: '#f2c21a' };                 // roommate, the doubter: yellow cap
export const ACCENT = '#35d0f0';                                                        // reserved for the antibiotic
export const GREEN = '#7fdc5a', PURPLE = '#a066ff';

// inside the body: a dark red cave lit from above
BASE_MOODS.body = { sky: ['#14030a', '#3a0b18', '#5e1626'], ambient: '#3a1020', key: '#ffb4a0', rim: '#ffb39a', wall: '#6a1a2a', floor: '#3f0f1c', dark: '#1a040b', practical: '#ff8a7a', grass: '#3d5a48', road: '#3a3040', fog: '#8a2a40' };

// germs = creatures: green ordinary bacteria, purple armoured resistant ones
export const germ = (g, o) => creature(g, { ...o, shell: o.kind === 'purple' ? PURPLE : GREEN, armour: o.kind === 'purple' });
export const bigGerm = (g, cx, cy, h, o = {}) => bigCreature(g, cx, cy, h, { ...o, shell: o.kind === 'purple' ? PURPLE : GREEN, armour: o.kind === 'purple' });

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

