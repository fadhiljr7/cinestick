---
name: make-video
description: "Cinestick: use when the user runs /cinestick:make-video or asks to make a cinestick video, or a cinematic stick-figure story video where the characters talk to each other, from a title, topic or script (e.g. \"make a cinestick short: What if you had 1000 IQ\"). Runs everything: the seven-beat (Short) or chapter (long) checkpoint, the dialogue script, Kokoro voices, word timings, directed shots, scene code with contact-sheet QC, render, music, SFX and the final MP4, in 9:16 or 16:9, short or long."
---

# Cinestick: make a video

One look (black stick figures with rim light, moody lit sets, giant face close-ups, blueprints, the `dusk` grade, gold-word captions), characters who talk to each other, and a narrator. Everything is drawn by code and voiced offline. **The user is asked one thing: the story checkpoint.** Everything else is your call; report it at the end.

References (in `references/`, read each one when its step needs it):
- `install.md`
- `story-short.md`, `story-long.md`
- `directing.md` (rhythm, camera, acting, shot types)
- `style-bible.md` (the look)
- `cast-and-creatures.md`
- `engine-api.md`
- `voice.md`
- `sound.md`
- `render-qc.md`
- `thumbnail.md`, `youtube-metadata.md` (the YouTube kit, step 9)

The worked example is `cinestick-studio/examples/medicine/`. Read its `scenes/` once to learn the patterns, but don't reuse its pictures.

## 0. Studio
Follow `references/install.md`: copy `<plugin root>/kit` to `./cinestick-studio/` if it isn't there, then run `sh tools/setup.sh`. Run every command below from `cinestick-studio/`. `PY=.venv/bin/python`.

## 1. Story → the checkpoint (the only stop)
- Read what the user gave: a title, topic, idea or script, with aspect and length if they said. **Missing format = 9:16 Short.** Don't ask; show it in the checkpoint.
- Short → `references/story-short.md`. Long → `references/story-long.md`.
- Write the beats and pick the narrator mode (hero / offscreen) with its voice, plus the cast with signature colours.
- Show the checkpoint in the exact shape from the reference. For a Short that is **Format, Narrator, Cast**, then **Hook, Setup, Doubter, Escalation, Turn, Reveal, Closing line**, ending with "Good to go, or what should change?"
- Wait. Rewrite and re-show on any change. After the OK, don't stop again.

## 2. Project + script
- `$PY tools/new_project.py --title "<title>" --aspect 9:16|16:9 --length short|long`. It prints `projects/<slug>`.
- Write `story/bible.md`: logline, narrator mode, cast (outfits + signature colours), the accent colour, sets (mood, key light, props), motifs, the music plan.
- Write `input/lines.json` from the approved beats: narration plus dialogue, every line with `who, vo, voice, speed, treat, beat` (see `references/voice.md`). Keep the user's own words verbatim.

## 3. Voices
`$PY tools/voice/voices.py --project projects/<slug>`. For any flagged line: reword it or add `asr`, then re-run (only changed lines are re-made). The output is `input/voiceover.wav` + `timeline/words.json` + `scenes/dialogue.js`. Check `timeline/transcript.txt`.

## 4. Shots
- Write `story/shots.json` per `references/directing.md` and `engine-api.md`:
  - contiguous shots cut on stressed words, using `timeline/words.json`;
  - every shot has `type`, `scene`, `set`, `in` (default `{"type":"fade","dur":0.2}`), `sfx`, `amb`;
  - `duration` = the voice length + 1.5 s;
  - the `music` plan, with `"cut": true` before the reveal.
- Run `$PY tools/plan_check.py --project projects/<slug>` and fix the plan until it prints `clean`.

## 5. Scenes (batches of 8–12 shots)
- Write `scenes/cast.js` (outfits, story props; import the helpers from `./lib/`), `scenes/sets/<place>.js` and `scenes/shots/NN_<name>.js` with `registerShot`.
- Follow `style-bible.md` (rim light, moody value structure, atmosphere, `mood()` colours, `V()` for aspect) and `directing.md`: one camera move per shot, faces changing in held close-ups, listeners reacting, literal gags, a callback ending.
- After each batch: `PW_CHROMIUM=… node render.mjs --project projects/<slug> --sheet --scale 0.5`. **Open every sheet image yourself** and check it against `render-qc.md`. Fix errors, MISSING shots and composition before the next batch.
- Check motion where it matters: `--stills a,b,c` or `--from A --to B --scale 0.5`.

## 6. Show progress (no wait)
Send the user the final contact sheet with one line on what's coming, then continue.

## 7. Render + sound
- Short: `node render.mjs --project projects/<slug>` (background; share the ETA from the log). Long: `$PY tools/render_long.py --project projects/<slug>`.
- Then `$PY audio/mix.py --project projects/<slug>`, which builds the music, SFX and ambience, ducks the music under the voice, normalises to −14 LUFS and writes `out/<Title>.mp4`.

## 8. QC
- `ffprobe`: duration ≈ `shots.json` duration, audio present.
- Loudness −14 ±1 LUFS (`ffmpeg -af ebur128`).
- A 1-frame-per-6-s contact sheet of the final file (look at it).
- Write `out/<Title>.srt` from `timeline/words.json` (caption groups).

## 9. YouTube kit (automatic, after the MP4)
The format comes from `config.json` (aspect + length). Never ask for the thumbnail size or description style.
- **Thumbnail** (`references/thumbnail.md`): write `scenes/shots/thumbnail.js` (`registerShot('thumbnail', …)`), a composition made for this video. Run `$PY tools/thumbnail.py --project projects/<slug>`. It renders exactly **1080 × 1920** for 9:16 or **1280 × 720** for 16:9. Open the JPG and redraw until it passes the checklist.
- **Metadata** (`references/youtube-metadata.md`): `$PY tools/publish.py facts --project projects/<slug>`, then write `story/metadata.json` (3 titles with one best, the description, tags). Run `$PY tools/publish.py build --project projects/<slug>` until it prints no `META` problems. For long videos the real chapter timestamps are inserted from the shot plan.

## 10. Deliver
Send the MP4 and the thumbnail. Then show the YouTube kit in this order:
1. **Video Title** (best ★ + 2 alternatives, one line on why the best);
2. **Video Description**;
3. **Video Tags**;
4. **Generated Thumbnail**;
5. **Thumbnail Resolution and Aspect Ratio**.

Finish with a short paragraph: where the files are (`out/`: MP4, `.srt`, thumbnail JPG, `.youtube.md`, `.description.txt`, `.tags.txt`), the narrator/cast/voices used, anything flagged or assumed, and one tweak to consider.
