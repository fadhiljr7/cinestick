# The thumbnail

Every video gets its own thumbnail, **drawn in code** with the same engine, cast and sets as the film. It is not a frame grab. The size follows the video's aspect; never ask about it again:

| video | thumbnail | tools/thumbnail.py renders |
|---|---|---|
| 9:16 Short | **1080 × 1920** | exactly, JPG ≤ 2 MB |
| 16:9 long | **1280 × 720** | exactly, JPG ≤ 2 MB |

## How
1. Write `scenes/shots/thumbnail.js` with `registerShot('thumbnail', { draw(g, t, info) { … } })`. Draw a still moment; `t` is the time you pass with `--at`, default 1.0 s. That's enough to let particles and glows settle.
2. `.venv/bin/python tools/thumbnail.py --project projects/<slug>` writes `out/<Title>_thumbnail.jpg` and `out/thumbnail.json`.
3. **Open the JPG yourself and judge it at phone size** (look at it small too). Redraw until it passes the checklist.

## Design rules
- **One idea at a glance.** One hero subject, big: a giant face reacting (`bigFace` / `bigCreature`), or the story's key object (the glowing pill, the broken dial). It fills 40–60 % of the frame. Two subjects at most, e.g. a face plus the object it reacts to.
- **The strongest contrast in the whole video:** a dark, simple background (the set blurred, or a bold gradient) and a bright subject with a thick rim light. Push the story's **accent colour** (the gold glow, the cyan pill) as the brightest thing.
- **Text is optional, and short:** at most **3–4 words**, all caps, Fredoka 700, a heavy dark stroke (`stroke` ≈ 0.16·size) and a glow. It names the hook, not the title: "1000 IQ?", "IT FIGHTS BACK". Make the text big, about 12–18 % of the frame height for 9:16 and 18–25 % for 16:9. Never write a sentence, and never put the video title verbatim.
- **Hierarchy:** the face or object first, the text second, the background last. Use one or two strong diagonals or a curiosity gap (something half-revealed, an arrow or circle pointing at a detail).
- **Its own identity:** a composition made for this story: a different angle, prop, colour accent or layout from your other thumbnails. No reusable template look: no stock-style frames, no busy collage, no generic red arrow on every video.
- **Safe zones:**
  - **9:16:** keep the face and text in the middle 70 % of the height. Avoid the bottom ~20 % (Shorts UI and title) and the right edge (buttons). Shorts also crop to a centred square in some feeds, so the hero must work inside the central 1080 × 1080.
  - **16:9:** avoid the bottom-right corner, where the duration badge sits.
- **Grade:** the style's grade is applied automatically. Add `veil` vignettes or a light `glow` bloom on the hero if it still looks flat.

## Checklist (look at the rendered JPG)
- [ ] Readable as a 160 px-wide image: the subject and text are still clear.
- [ ] One clear subject; the accent colour is the brightest thing.
- [ ] Text ≤ 4 words and not covered by the UI zones.
- [ ] Nothing cut awkwardly at the edges; the rim light is visible.
- [ ] It matches the video: the same characters, colours and promise; no misleading content.
