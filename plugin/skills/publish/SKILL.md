---
name: publish
description: "Cinestick: use when the user runs /cinestick:publish or asks for a YouTube title, description, tags or thumbnail for a cinestick video (a finished one or one being re-done), or wants to redo the thumbnail or metadata. Writes three title options (one marked best), a format-aware description (Shorts concise; long videos with real chapter timestamps), relevant tags and a code-drawn thumbnail at 1080×1920 (9:16) or 1280×720 (16:9)."
---

# Cinestick: YouTube kit

Run step 9 and step 10 of `../make-video/SKILL.md` for the existing project in `cinestick-studio/projects/<slug>/`, following `../make-video/references/thumbnail.md` and `youtube-metadata.md`. Take the format from the project's `config.json`; don't ask. Start from `tools/publish.py facts`, so everything describes what the video really contains. Then show the five-part report: title, description, tags, thumbnail, resolution and aspect.
