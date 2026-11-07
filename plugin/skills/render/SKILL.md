---
name: render
description: "Cinestick: use when the user runs /cinestick:render or asks to show a contact sheet, check or fix shots, preview, or render or re-render a cinestick video (9:16 or 16:9, short or long, any resolution). Covers sheet QC, stills, preview ranges, the full render and chapter-by-chapter renders for long videos."
---

# Cinestick: render

In `cinestick-studio/` (set `PW_CHROMIUM` if Chromium was not installed by Playwright):
- **Contact sheet:** `node render.mjs --project projects/<slug> --sheet --scale 0.5`. Open every `build/sheets/sheet_XX.png` and check it against `../make-video/references/render-qc.md`.
- **Stills or a preview range:** `--stills 3.2,8.5` or `--from 10 --to 25 --scale 0.5` (writes `build/preview.mp4`).
- **Full render:** Short: `node render.mjs --project projects/<slug>`. Long: `.venv/bin/python tools/render_long.py --project projects/<slug>` (resumable per chapter).
- Then `.venv/bin/python audio/mix.py --project projects/<slug>` and QC as in make-video step 8.
