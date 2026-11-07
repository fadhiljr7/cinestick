# Writing a long video (minutes, up to ~10)

Long videos do not use the seven beats as a whole. Their shape:

1. **Cold open** (15–40 s): the most striking moment of the whole story, in the middle of the act, ending on a question. A mini-version of hook → doubter.
2. **Chapters** (4–8): each one has
   - a **mini-hook** (its own strange fact or question in the first sentence);
   - a body with dialogue scenes, examples acted out, and data or blueprint moments;
   - a **payoff** line that answers the mini-hook and points to the next chapter.
3. **Outro** (15–30 s): the real takeaway ("You see, …"), then a callback to the cold open.

Rules:
- The narrator mode and cast rules are the same as Shorts (`story-short.md`). Dialogue in every chapter.
- 150–190 wpm. A sentence is ≤ 22 words.
- Chapter ids go into `lines.json` (`"chapter": "c1"` …) and into every shot (`"chapter"`), so the plan check and `tools/render_long.py` work per chapter.
- Music: one mood section per chapter (or two for a chapter with a turn).

## The checkpoint for a long video
```
**Format:** 16:9 long (~7 min, 6 chapters)
**Narrator:** …
**Cast:** …

**Cold open** — …
**1. <chapter title>** — mini-hook … → payoff …
**2. …**
…
**Outro** — "You see, …" → callback …

Good to go, or what should change?
```
