// grouping.js — caption groups (pure, no imports). A group never crosses a change of speaker (word.line),
// holds at most 4 words, and closes after . ? ! once it has 2+ words.
export function groupWords(words, max = 4) {
  const out = []; let cur = [];
  words.forEach((w, i) => {
    if (cur.length && (w.line !== words[cur[0]].line || cur.length === max)) { out.push(cur); cur = []; }
    cur.push(i);
    if (/[.?!]$/.test(w.word) && cur.length >= 2) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
}
