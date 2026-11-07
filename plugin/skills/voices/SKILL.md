---
name: voices
description: "Cinestick: use when the user runs /cinestick:voices or asks to redo, change, speed up, slow down or fix a voice, narrator or character line in a cinestick video, or says a line sounds wrong. Re-makes only the changed lines with Kokoro, re-checks them with Whisper and rebuilds the voiceover and word timings."
---

# Cinestick: voices again

In `cinestick-studio/`: edit `projects/<slug>/input/lines.json` (voice, speed, treat, text, asr; see `../make-video/references/voice.md`), then run `.venv/bin/python tools/voice/voices.py --project projects/<slug>`. Only changed lines are re-made. If the timing moved, re-cut `story/shots.json` on the new `timeline/words.json`, run `tools/plan_check.py`, re-render (make-video step 7) and re-mix.
