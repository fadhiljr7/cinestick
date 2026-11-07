# Cast and creatures

Helpers live in each project's `scenes/lib/` (copied from the plugin's starter kit). Import them as `../lib/cast-kit.js`, `../lib/creature.js`; `lib/captions.js` installs itself.

## People: the studio rig
- `drawFigure` / `person(g, o)` and `bigFace(g, cx, cy, r, o)` from `/engine/rig2d.js` (see `engine-api.md` for poses, outfits and expressions).
- **One signature colour per character**, the same in every shot: `{ top: 'hoodie', color: '#d64a33', head: 'bun' }`, `{ top: 'none', head: 'cap', headColor: '#f2c21a' }`, `{ top: 'labcoat', face: 'glasses' }`.
- Rim light on everyone: `rim: A.rim` from the set (direction toward the key light).
- Hold an object: `person(g, { …, hold: { draw(g, x, y, s) { … } } })`. It is drawn at the near hand (`hand: 'B'` for the far one). `handPos(o)` gives the hand's world position.
- Sitting on a couch or chair: `POSES.sit` has the hip at 72·s above the floor; draw the seat top at `GY − 72·s + 4`.
- Lip-sync: `talk: talk(info.globalT, 'd08')` only on that character's own `vo:false` line. Blink: `blink: blink(t, 2.8, offset)`, a different period per character.
- Global times of words: `wordAt('d08', 'monsters')` for face snaps, label pops and cuts.

## Creatures (germs, cells, critters, robot-blobs, monsters)
`creature(g, o)` / `bigCreature(g, cx, cy, h, o)` from `lib/creature.js`:
- a **black body** whose **shell** is the signature colour (`shell: '#7fdc5a'`), plus `armour: true` for a thick shell with highlight (tough/villain), `spikes`, `scar`;
- white minimal faces: the same `expr` names as people, with `talk` and `blink`;
- `arms: 'down'|'up'|'wave'|'flex'|'fist'` (`armsB` for the other arm), `walk: phase` for walking legs, `t` for wiggles;
- states: `'ok'`, `'flat'` (knocked over, eyes closed), `'burst'` (`k` 0→1 pieces flying), `'split'` (`k` 0→1 dividing in two);
- `cracks: 0..1`, `sweat`, `glow`;
- feet at `y`; about 150 tall at `s = 1` (a person is ~240). `bigCreature`: body height `h` in px, centred at (cx, cy).
- Several kinds in one story: one shell colour per kind (ordinary vs. resistant, team A vs. team B).

## Voices for the cast (see `voice.md`)
`treat`: people `normal` or `side`, small creatures `creature`, villains and bosses `villain`.
