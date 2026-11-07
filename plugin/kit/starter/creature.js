// creature.js — non-human characters in the cinestick look (cells, germs, robots-as-blobs, critters):
// a black body whose outline/shell is the signature colour, white minimal faces, stick limbs, rim light like everyone else.
// creature(g, { x, y (feet), s, facing, shell:'#hex', armour (thick shell + highlight), spikes, scar, expr, talk, blink, look,
//               arms:'down'|'up'|'wave'|'flex'|'fist', armsB, walk (phase), state:'ok'|'flat'|'burst'|'split', k, side, cracks:0..1,
//               sweat, glow, rim:{color, dir:[x,y], w}, alpha, shadow, t })
// Local units: feet at y = 0, body centre at y = -92, about 150 tall at s = 1 (a person is ~240).
import { S, clamp, lerp, ease, seg, circle, ring, alpha, shade, glow } from '/engine/core.js';
import { face } from '/engine/rig2d.js';

export function creature(g, o) {
  const st = S(), ink = st.ink, s = o.s ?? 1, f = o.facing ?? 1, purple = !!o.armour, SH = o.shell || '#7fdc5a';
  const wallC = SH, cy = -92, rx = 38, ry = 50;
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
  if (o.spikes) { g.fillStyle = shade(SH, -0.45); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a); g.beginPath(); g.moveTo(c * (rx + 6) - sn * 8, cy + sn * (ry + 6) + c * 8); g.lineTo(c * (rx + 26), cy + sn * (ry + 26)); g.lineTo(c * (rx + 6) + sn * 8, cy + sn * (ry + 6) - c * 8); g.fill(); } }
  // the wall (signature colour) then the black body
  g.fillStyle = purple ? shade(SH, -0.15) : shade(SH, -0.1); shape(purple ? 10 : 5); g.fill();
  if (purple) { g.fillStyle = alpha(shade(SH, 0.35), 0.8); shape(10); g.save(); g.clip(); g.fillRect(-rx - 20, cy - ry - 20, (rx + 20) * 0.7, ry * 2.4); g.restore(); }
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
// giant close-up: body centre at (cx, cy), body height ≈ h logical px
export function bigCreature(g, cx, cy, h, o = {}) { const s = h / 100; creature(g, { ...o, x: cx, y: cy + 92 * s, s, shadow: false }); }
