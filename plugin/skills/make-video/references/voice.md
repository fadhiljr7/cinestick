# How the voice-over is made

All offline: **Kokoro-82M** (via `kokoro-onnx`) speaks, **faster-whisper** (`base.en`) listens back.

## 1. Write `input/lines.json`
One entry per spoken line, in order:
```json
{"id": "d08", "who": "cap", "vo": false, "voice": "am_puck", "speed": 1.08, "treat": "side", "beat": "doubter",
 "text": "Wait, how can one tiny pill defeat an entire army of invisible monsters?"}
```
- `who`: the character id (or `narrator`). It drives lip-sync and caption grouping.
- `vo`: `true` = narration (never lip-synced), `false` = said on screen.
- `beat`: the seven beat names (Shorts), so the gap before `turn` and `reveal` becomes a held breath. `chapter` for long videos.
- `asr` (optional): what Whisper should hear when it can't spell a word ("Ugh" → "Ugg"). Numbers are handled automatically.
- Lines ≤ ~18 words. **No laugh-only lines** ("Ha ha ha", "Heh heh"): Kokoro garbles them. Give the laugh to a sound effect.

## 2. Voices (English Kokoro voices)
| role | default | notes |
|---|---|---|
| narrator, woman | `af_heart` | warm, clear; speed 1.0–1.1 |
| narrator, man | `am_michael` | alternatives `bm_george` (British), `am_adam` |
| side character, man | `am_puck` | bright, comic; `am_echo`, `am_eric`, `bm_lewis` |
| side character, woman | `af_bella` | `af_nicole`, `bf_emma` (British), `af_sky` |
| small creature | `am_echo` + `treat: creature` | pitched up ×1.3 |
| villain / boss | `am_onyx` + `treat: villain` | pitched down ×0.82, a light echo, more bass |

## 3. Treatments (ffmpeg, after Kokoro)
- `normal`: tempo ×1.1 (the fast story pace).
- `side`: tempo ×1.06 and slightly lower.
- `creature`: pitch up ×1.3.
- `villain`: pitch down ×0.82, echo, bass +4 dB.

## 4. Run it
```
.venv/bin/python tools/voice/voices.py --project projects/<slug>
```
For every line it:
1. speaks it with Kokoro, trimming silence;
2. applies the treatment;
3. transcribes it with Whisper and compares it with the text (or `asr`, or the numbers spelled out);
4. if misheard, makes it again up to **2 more times**, each 0.05 slower. If it still fails, it keeps the line and reports it as **flagged**: listen, then reword it or add an `asr`.

Lines that didn't change are reused (`voices/cache.json`), so editing one line re-makes only that line.

## 5. Assembly (automatic at the end of voices.py)
`tools/voice/assemble.py` lays the lines end to end with gaps:
- 0.05 s lead-in;
- 0.14 s between lines of the same speaker;
- 0.22 s before a reply by someone else;
- 0.4 s before the turn and the reveal.

It writes:
- `input/voiceover.wav`;
- `timeline/words.json` (every word with its time **and its line id**);
- `timeline/lines.json`;
- `scenes/dialogue.js` (`LINES`: who speaks when);
- `input/script.txt`.

Caption text uses the script's spelling (and its digits, e.g. "1000") with Whisper's timing.
