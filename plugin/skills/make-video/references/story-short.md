# Writing a Short: the seven beats

Every Short follows seven beats, whatever the user gives you (a title, a topic, half an idea or a full script):

1. **Hook**: one sentence, an absurd or paradoxical fact or moment. ("They painted the jail cell pink." "I took one tiny pill, and it started a war inside my body.")
2. **Setup**: the place, the people, one strange rule or detail.
3. **Doubter**: a character says what the viewer is thinking: "Wait… how can…?" / "Wait, what?". It is always a **character line** (dialogue), never narration.
4. **Escalation**: it gets bigger and funnier. Exaggerated consequences, quoted side characters, numbers.
5. **Turn**: "Then…" / "Until one day…". The story flips.
6. **Reveal**: opens with "You see, …" and states the **real, checkable fact or mechanism** in plain words. If the topic is speculative ("What if you had 1000 IQ"), the reveal is the real science the speculation rests on (e.g. what IQ scores measure and why 1000 is off the scale), never invented facts.
7. **Closing line**: a short flip or callback to the hook.

## Length and pace
- **The finished Short must be at least 60 s long** (`tools/plan_check.py` fails below that). Write **60–80 s of speech**: about 190–215 words per minute after the voice tempo, so **≈ 210–280 words** in total. If the voiceover comes out short, add escalation beats or dialogue. Never pad with pauses or slower speech.
- Short sentences. One idea per line. Split any sentence over ~18 words.

## Who tells it: narrator mode (choose per story, show it at the checkpoint)
- **hero**: the main character tells their own story in the first person ("I took one tiny pill…"). Their narration lines are `vo: true` (not lip-synced); their on-screen dialogue uses the same voice with `vo: false`. Use it for personal experiences, diaries and "I tried…" stories.
- **offscreen**: a separate narrator voice that is never on screen, in the second person ("Imagine you…", "What if you…") or the third person. Use it for "What if…", history, how-things-work and someone else's story. The "you" character appears on screen and talks.
- Either way the **characters talk to each other**: at least the doubter line, one exchange in the escalation, and a line in the turn or reveal. 1–4 voiced characters; creatures can speak (green germs, a robot, a cat).

## The user's own lines
- If the user wrote lines for any beat, keep those words **exactly**, as narration or as the character who would say them. Only add connecting dialogue around them.
- Fill missing beats yourself, in the same voice.

## Cast
- Every recurring character gets **one** signature colour (hoodie, cap, beanie, coat, shell): red-orange `#d64a33`, yellow `#f2c21a`, pink `#f29ac0`, green `#3fb950`, blue `#3a6ea5`, purple `#8a5ad6`, or a lab coat with glasses. No two characters share it.
- Reserve **one accent colour** for the story's key object or power (the pill, the brain glow) and use it nowhere else.

## The checkpoint (the only time you stop)
Show it exactly in this shape, then wait:

```
**Format:** 9:16 Short (~65 s, minimum 60 s)          ← default when the user didn't say; they can change it here
**Narrator:** offscreen, woman (af_heart) — because "What if you…" speaks to the viewer
**Cast:** You (yellow cap) · Dr. Lee (lab coat + glasses) · Brain (pink creature, talks)

**Hook** — …
**Setup** — …
**Doubter** — Dr. Lee: "Wait… …?"
**Escalation** — …
**Turn** — "Then…"
**Reveal** — "You see, …"
**Closing line** — …

Good to go, or what should change?
```
If they change anything, rewrite and show the whole checkpoint again. After "go", never stop again until the MP4.
