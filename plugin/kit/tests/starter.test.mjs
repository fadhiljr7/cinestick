// node --test tests/ : the pure caption grouping and the creature rig (engine imports rewritten to file paths)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('groupWords never crosses a speaker change and caps at 4', async () => {
  const { groupWords } = await import(pathToFileURL(path.join(KIT, 'starter/grouping.js')));
  const W = ['a', 'a', 'b', 'b', 'b', 'b', 'b'].map((line, i) => ({ word: 'w' + i, line }));
  assert.deepEqual(groupWords(W), [[0, 1], [2, 3, 4, 5], [6]]);
  const S = ['Split!', 'Split!', 'Split!'].map(word => ({ word, line: 'x' }));
  assert.deepEqual(groupWords(S), [[0, 1], [2]]);   // closes after ! once 2 words are in
});

test('creature draws ok, flat and burst states without throwing', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cs-'));
  const src = fs.readFileSync(path.join(KIT, 'starter/creature.js'), 'utf8').replaceAll("'/engine/", `'${pathToFileURL(path.join(KIT, 'engine')).href}/`);
  fs.writeFileSync(path.join(tmp, 'creature.mjs'), src);
  const core = await import(pathToFileURL(path.join(KIT, 'engine/core.js')));
  core.setStyle('dusk');
  const { creature, bigCreature } = await import(pathToFileURL(path.join(tmp, 'creature.mjs')));
  let fills = 0;
  const g = new Proxy({}, { get: (t, k) => k === 'fill' ? () => { fills++; } : (k in t ? t[k] : (k.startsWith('create') ? () => ({ addColorStop() {} }) : () => {})), set: (t, k, v) => { t[k] = v; return true; } });
  for (const state of ['ok', 'flat', 'burst', 'split']) creature(g, { x: 100, y: 500, s: 1, shell: '#7fdc5a', state, k: 0.5, expr: 'happy', rim: { color: '#ffb', dir: [0, -1] } });
  bigCreature(g, 540, 800, 400, { shell: '#a066ff', armour: true, spikes: true, scar: true, arms: 'flex' });
  assert.ok(fills > 10);
});
