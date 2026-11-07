# Installing the studio (once per workspace)

The plugin carries the studio in `kit/` (next to this skill's folder: `<plugin root>/kit`). The plugin folder may be read-only, so copy it into the user's workspace and work there.

1. **Find the kit:** `<plugin root>/kit/render.mjs`. The plugin root is two levels above this skill's base directory. If unsure: `find ~/.claude -path "*cinestick*/kit/render.mjs" 2>/dev/null | head -1`.
2. **Copy** into the current workspace as `cinestick-studio/`. Skip this if it exists with `render.mjs` inside. Never overwrite its `projects/`.
   - macOS/Linux: `cp -R "<kit>/." cinestick-studio/`
   - Windows: `Copy-Item -Recurse "<kit>\*" cinestick-studio\`
3. **Setup:** `cd cinestick-studio && sh tools/setup.sh`. It does all of this:
   1. checks Node ≥ 18 and ffmpeg;
   2. creates `.venv` with **Python 3.11–3.13** (kokoro-onnx does not run on 3.14) and installs `numpy scipy soundfile soxr faster-whisper "av<19" kokoro-onnx`;
   3. runs `npm install`, then `npx playwright install chromium` (skipped when `PW_CHROMIUM` is set);
   4. downloads the Kokoro model (`kokoro-v1.0.onnx`, `voices-v1.0.bin`, ~350 MB) into `tools/voice/`;
   5. runs `tools/doctor.py`;
   6. renders a self-test sheet of `examples/medicine`.
4. If setup stops, read the message and tell the user the one command to run. Most fixes need their password (`brew install node ffmpeg python@3.12`), so don't try to run those yourself. Then re-run `sh tools/setup.sh`.
5. Whisper downloads `base.en` (~145 MB) on the first voice check; that needs huggingface.co (or `HF_ENDPOINT` set to a mirror).

**Chromium download slow or blocked:** set `PW_CHROMIUM=/path/to/chrome-headless-shell` (any recent Chromium binary) for setup and every render.

Python tools always run with `cinestick-studio/.venv/bin/python` (Windows: `.venv\Scripts\python`).
