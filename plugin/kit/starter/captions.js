// captions.js — the studio's caption look (Fredoka caps, current word in gold, dark stroke, pop on each word),
// grouped so one card never mixes two speakers. Installed by loading this module (the player calls window.CAPTIONS).
import { E, V, S, text, measure, prog, ease } from '/engine/core.js';
import { groupWords } from './grouping.js';

let GROUPS = null;
export function drawCaptions(g, globalT, o = {}) {
  const words = E.words; if (!words.length) return; GROUPS ||= groupWords(words);
  const { y = V(E.H - 150, E.H * 0.79), size = V(58, 74), color = '#ffffff', hi = S().ui.gold } = o;
  let i = -1; for (let k = words.length - 1; k >= 0; k--) if (globalT >= words[k].start - 0.05) { if (globalT <= words[k].end + 0.35) i = k; break; }
  if (i < 0) return;
  const grp = GROUPS.find(gr => gr.includes(i)), group = grp.map(k => words[k]), strs = group.map(w => w.word.trim().toUpperCase());
  const w0 = strs.map(s => measure(g, s, size)).reduce((a, b) => a + b, 0) + size * 0.3 * (strs.length - 1);
  const sz = size * Math.min(1, (E.W * 0.88) / w0), gap = sz * 0.3, widths = strs.map(s => measure(g, s, sz));
  let x = E.W / 2 - (widths.reduce((a, b) => a + b, 0) + gap * (strs.length - 1)) / 2;
  strs.forEach((s, k) => {
    const cur = grp[k] === i, pop = cur ? 1 + 0.08 * ease.out(prog(globalT, group[k].start, group[k].start + 0.12)) : 1;
    g.save(); g.translate(x + widths[k] / 2, y); g.scale(pop, pop);
    text(g, s, 0, 0, { size: sz, color: cur ? hi : color, stroke: sz * 0.16, strokeColor: 'rgba(0,0,0,.85)' }); g.restore();
    x += widths[k] + gap;
  });
}
if (typeof window !== 'undefined') window.CAPTIONS = drawCaptions;
