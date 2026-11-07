---
name: sound
description: "Cinestick: use when the user runs /cinestick:sound or asks to change the music mood, make the music louder or quieter, add or move sound effects, use their own music, or remix the audio of a cinestick video."
---

# Cinestick: sound

Read `../make-video/references/sound.md` and the sync rules in `directing.md`. Edit `projects/<slug>/story/shots.json`:
- `music` sections (mood, intensity, `"cut": true` before the reveal);
- per-shot `sfx` and `amb`;
- or `config.json` → `music.gainDb`, `music.file` (the user's own track), `sfx.gainDb`.

Then `.venv/bin/python audio/mix.py --project projects/<slug>` (no re-render needed when only sound changes). Check −14 ±1 LUFS and listen-check notes in the report.
