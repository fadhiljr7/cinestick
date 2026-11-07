# YouTube title, description and tags

Written from what the video **actually contains**. First run `.venv/bin/python tools/publish.py facts --project projects/<slug>`. It prints the format, duration, beats, every spoken line, the shots and, for long videos, the real chapter timestamps. Write `story/metadata.json`, then `tools/publish.py build` checks it and writes the outputs.

```json
{"titles": [{"text": "What If You Had a 1000 IQ?", "best": true},
            {"text": "…", "best": false}, {"text": "…", "best": false}],
 "description": "…",
 "tags": ["…"]}
```

## Titles (exactly 3, one marked `"best": true`)
- Accurate to the video, engaging, natural. Pose the hook as a question or a surprising claim the video **answers**. No misleading clickbait, no promises the video doesn't keep, no ALL-CAPS shouting (one capitalised word at most).
- Put the main search phrase near the start ("1000 IQ", "antibiotic resistance").
- Aim for 40–60 characters (100 max). Shorts: shorter is better.
- **The user's own title can be one of the three**, as given or lightly polished. Mark as best the one you would publish, and say why in one line in the report.

## Description, by format (taken from config.json; never ask again)
**Short (9:16):** 1–3 short sentences, ≤ 500 characters in total.
- Line 1 restates the hook in other words.
- Line 2 gives the real fact or payoff in one breath, without spoiling the closing line.
- Optionally one question to the viewer.
- Then 2–4 hashtags on the last line, including `#Shorts`.
- No chapters, no timestamps, no link lists.

**Long (16:9):** well structured, ≤ 5000 characters:
1. A 2–3 sentence hook-and-overview paragraph (what the viewer will learn or see).
2. `Chapters:` followed by a line containing only `{{chapters}}`. **Never type timestamps.** The tool inserts the real ones from the shot plan (YouTube needs ≥ 3 chapters, the first at 00:00, each ≥ 10 s; it checks this).
3. A short "In this video" paragraph with the key facts and names, using the keywords naturally (no keyword stuffing).
4. A call to action when it fits: subscribe, or a question for the comments.
5. 3–5 hashtags.

## Tags (8–25, ≤ 500 characters in total)
- Specific search terms first: the topic and its synonyms ("1000 iq", "high iq", "iq test", "what is iq"), then the niche and format ("what if", "animated explainer", "science short"), then the audience ("science for kids", "psychology facts"). Use only what the video really covers.
- Lower case, no duplicates, no `<` `>` or commas inside a tag, no unrelated trending terms, no competitor or channel names.

## Report (shown to the user)
`tools/publish.py build` writes:
- `out/<Title>.youtube.md`, with the sections **1. Video Title** (best ★ + the 2 alternatives), **2. Video Description**, **3. Video Tags**, **4. Generated Thumbnail**, **5. Thumbnail Resolution and Aspect Ratio**;
- `out/<Title>.description.txt`, `out/<Title>.tags.txt` and `out/<Title>.metadata.json`, ready to paste.

Show the report in the reply, in that order, and send the thumbnail image with it.
