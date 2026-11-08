# Directing rulebook: rhythm, camera, acting

Learned by watching ten reference story shorts frame by frame (cut timing, moves, faces), then fitted to the cinestick look.
`tools/plan_check.py` enforces the numbers; the rest is your job while writing `shots.json` and the scene code.

## Rhythm
**Shorts (9:16 or 16:9, at least 60 s, about 60–90 s)**
- A new shot every **~1–2 s**: median target **1.5 s**, `plan_check` fails above **2.0 s**. No shot over **3.5 s** except the last (closing hold).
- Cut on the **stressed word**, not the sentence end. Start the shot 0.1–0.2 s before that word (`wordAt()` / timeline/words.json).
- Default transition: **cross-dissolve of 4–6 frames** → `"in": {"type": "fade", "dur": 0.2}`. At most 40 % hard cuts, and only for impacts, snaps and jump-scares.
- `flash` (white) or `whip` **only** on the turn ("Then…", "Until…") and on big realisations. `dip` (to black) only for a real time jump.
- 1–2 freeze-frames per Short, never more.

**Long videos (at least 8 min, 10+ recommended)**
- Median **2–4 s**, nothing over 10 s. Every chapter opens with an **establishing** shot entered with `dip`. Inside a chapter the Short rules apply, just slower.

## Camera
- **Every shot moves, one move per shot.** Pick by intent:
  - **push-in** on whoever speaks or realises (`z` 1.0 → 1.06–1.12);
  - **pan or track following action**: keep the moving subject in frame as it travels, so the world slides past;
  - **slow dolly past a prop** (`x` drift ±40–80 with the prop on a nearer layer);
  - **pull-back reveal**: start tight on a detail, end wide on the consequence;
  - **dutch tilt** ±3–6° (`cam.r` 0.05–0.1) for unease, lies and wrongness;
  - **top-down** on tables, desks, maps and diagrams;
  - **shake** only on impacts, ≤ 6 frames (`shake(t, amp)`).
- Speakers left facing right, listeners right facing left. Keep that within a scene.

## Acting (the faces carry the story)
- In a held close-up of 2–3 s the face changes **2–4 times** as the line plays. The bookie-style arc is neutral → nervous + sweat → cry → smirk. Each change lands on a stressed word (`wordAt`).
- The **speaker** talks with `talk(globalT, lineId)` lip-sync. **Listeners react**: they blink, look at the speaker (`look:[±0.6, 0]`), and shift expression a beat after the key word.
- The **doubter beat is always a face**: the skeptic's close-up with the line in their mouth, snapping to `shocked`/`confused` on the last word, with `rings` and a `pop`.
- **Quoted side-character lines are acted out literally.** "That horse lost to the milk cart" → show the milk cart winning. Never just show the speaker saying it.
- Reactions are fast and big: `shocked`, `scared`, `smirk`, `cry` or `joy`, plus sweat drops, steam or a tear. Hold the reaction 0.3–0.6 s before cutting.
- The narrator is never lip-synced. In `hero` mode the same character is lip-synced only on their `vo:false` lines.

## Shot types (set `"type"` on every shot; no type more than twice in a row)
| type | what it is | recipe (engine) |
|---|---|---|
| `establishing` | the place, small figures | set function + `layer` parallax, slow push, figures `s` 1.0–1.3; or `3d` for big spaces |
| `two-shot` | two characters talking or acting | medium, `s` 1.6–2.1, speaker left facing right, listener reacting |
| `ots` | over-the-shoulder | blurred **back of the head** + shoulder in the foreground (`blurLayer` 10, ink circle + signature colour, no face), the other character sharp |
| `bigface` | giant face close-up | `bigFace(g, W/2, H*0.47, 300–320, …)` over `aptBlur`-style blurred set + `veil`; 2–4 expression changes |
| `insert` | the key object, big | a hand or prop filling the frame, the background blurred; the story's accent colour glows |
| `pov` | what a character sees on a screen or paper | a phone/screen/page filling the frame, UI drawn in code, a slight hand sway |
| `circle` | a telescope / keyhole / binocular view | the scene clipped to a circle (or two) on black, slow pan inside |
| `meanwhile` | another place at the same time | an exterior (city, building, sky) with a dissolve or whip in, the light colour changed |
| `timeskip` | time passing | a clock spinning, a calendar page flipping, a stopwatch, a battery draining |
| `fact-object` | the fact written on something in the world | a sign, label, chart or board beside the speaker; push onto it; hold ≥ 1.8 s |
| `blueprint` | a mechanism explained | `UI.blueprint` grid, line art, gold/coral labels synced with `wordAt` |
| `data` | numbers | `UI.badge` / `dataCard` / counters ticking as the number is spoken |
| `3d` | big space or crowd | three-kit stage, `dolly`/`orbit`, about one per 60 s |
| `freeze` | time-stop | `flash` in, the world slowed ×0.06, `FX.drops`, a cool `soft-light` veil, a corner badge, the `freeze` SFX |
| `callback` | the ending | an earlier framing returned to, **changed** (same room/face/object, new state), with the last word landing on the change |

## Story beats → shots (Shorts)
- **Hook:** the strangest image first: an `insert` or `bigface` in the middle of the act. No title card.
- **Setup:** an `establishing` shot of the place, then quick `two-shot`/`insert` cuts.
- **Doubter:** a `bigface` of the skeptic (see Acting).
- **Escalation:** the fastest cutting. Literal gags, `data` counters, a `freeze` if it fits.
- **Turn:** a `flash` or `whip`, a `dutch` tilt, the light changes (a lamp dies, colour drains).
- **Reveal:** "You see…" in a `blueprint` or `fact-object`. Music silent ~0.3 s just before it.
- **Closing line:** a `callback`.

## Sound sync
- `whoosh` on whips and flashes; `pop`/`blip` on graphics and face snaps; `impact`/`hit` on contact.
- `riser` into the turn; `stinger` on the closing word.
- The music section before the reveal has `"cut": true` and ends ~0.35 s before "You see"; the next section starts on it.
