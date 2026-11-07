# Example: The Medicine That Fights Back (9:16 Short)

The film that set the cinestick look. Use it as the **visual and code reference** (sets, cast, creatures, blueprints,
3D fly-through, freeze-frame, captions). It was cut before the directing rulebook existed, so `tools/plan_check.py`
reports its pacing (a few shots over 3.5 s, mostly hard cuts): new films follow the rulebook, not this example's rhythm.

Re-make its voices and render it:
    .venv/bin/python tools/voice/voices.py --project examples/medicine
    node render.mjs --project examples/medicine --sheet --scale 0.5
