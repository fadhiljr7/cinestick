---
name: story
description: "Cinestick: use when the user runs /cinestick:story or asks to rewrite, change or re-pitch the beats, hook, doubter, reveal, closing line, narrator or cast of a cinestick video. Re-runs only the story checkpoint (seven beats for a Short, chapters for a long video) and the dialogue script, then hands back to /cinestick:make-video from the voices step."
---

# Cinestick: the story step again

Run step 1 and step 2 (the `lines.json` part) of `../make-video/SKILL.md` for the existing project in `cinestick-studio/projects/<slug>/`, using `../make-video/references/story-short.md` or `story-long.md`. Show the checkpoint, wait for the OK, then rewrite `story/bible.md` and `input/lines.json`, keeping the ids of unchanged lines so their voices are reused. Then continue with make-video step 3 (voices) through to the MP4, unless the user asked only for the story.
