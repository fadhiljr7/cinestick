"""YouTube-ready metadata for a finished cinestick video: title options, description, tags, plus the organized report.

  python tools/publish.py facts --project P     what the video actually contains (read this before writing metadata)
  python tools/publish.py build --project P     validate story/metadata.json, insert real chapters, write out/<Title>.youtube.md …

story/metadata.json (written by Claude from the facts):
  {"titles": [{"text": "...", "best": true}, {"text": "...", "best": false}, {"text": "...", "best": false}],
   "description": "... (long videos: a line {{chapters}} where the timestamps go — never type timestamps yourself)",
   "tags": ["...", ...]}
Long-video chapters come from story/shots.json: shots[].chapter + "chapters": [{"id", "title"}], timed by the real shot starts.
"""
import argparse, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'voice'))
from assemble import out_name

TITLE_MAX, DESC_MAX, SHORT_DESC_MAX = 100, 5000, 500
TAGS_MIN, TAGS_MAX, TAGS_CHARS = 8, 25, 500
CH_MIN, CH_LEN = 3, 10.0
PLACEHOLDER = '{{chapters}}'
TS_LINE = re.compile(r'(?m)^\s*(?:\d{1,2}:)?\d{1,2}:\d{2}\b')


def fmt_ts(sec: float) -> str:
    s = int(sec); h, s = divmod(s, 3600); m, s = divmod(s, 60)
    return f'{h}:{m:02d}:{s:02d}' if h else f'{m:02d}:{s:02d}'


def is_long(config) -> bool:
    return config.get('length') == 'long'


def chapter_list(shots: dict) -> list:
    """[(start seconds, title)] from the real shots: each chapter starts at its first shot; the first one is pinned to 0."""
    titles = {c['id']: c['title'] for c in shots.get('chapters', [])}
    out, seen = [], set()
    for s in shots['shots']:
        c = s.get('chapter')
        if c and c not in seen: seen.add(c); out.append((float(s['start']), titles.get(c, c)))
    if out: out[0] = (0.0, out[0][1])
    return out


def validate_chapters(ch: list, duration: float = None) -> list:
    errs = []
    if len(ch) < CH_MIN: errs.append(f'chapters: YouTube needs at least {CH_MIN} chapters, the video has {len(ch)}')
    if ch and ch[0][0] != 0: errs.append('chapters: the first chapter must start at 00:00')
    ends = [c[0] for c in ch[1:]] + ([duration] if duration else [])
    for (t, name), e in zip(ch, ends):
        if e is not None and e - t < CH_LEN: errs.append(f"chapters: '{name}' is {e - t:.1f} s; YouTube needs each chapter ≥ {CH_LEN:.0f} s")
    return errs


def _tag_chars(tags) -> int:
    return sum(len(t) + (2 if ' ' in t else 0) for t in tags) + max(0, len(tags) - 1)


def validate(meta: dict, config: dict, shots: dict) -> list:
    errs = []
    T = meta.get('titles', [])
    if len(T) != 3: errs.append(f'titles: give exactly 3 title options, got {len(T)}')
    if sum(bool(t.get('best')) for t in T) != 1: errs.append('titles: mark exactly one title as best')
    for t in T:
        if not t.get('text', '').strip(): errs.append('titles: empty title')
        elif len(t['text']) > TITLE_MAX: errs.append(f"titles: '{t['text'][:40]}…' is {len(t['text'])} chars (YouTube max {TITLE_MAX})")
        if re.search(r'[<>]', t.get('text', '')): errs.append("titles: YouTube rejects '<' and '>'")
    d = meta.get('description', '')
    if re.search(r'[<>]', d): errs.append("description: YouTube rejects '<' and '>'")
    if TS_LINE.search(d.replace(PLACEHOLDER, '')): errs.append(f'description: hand-written timestamp lines found; put {PLACEHOLDER} where the chapters go and let the tool fill the real ones')
    if is_long(config):
        if d.count(PLACEHOLDER) != 1: errs.append(f'description: a long video needs exactly one {PLACEHOLDER} line (the real chapter timestamps go there)')
        errs += validate_chapters(chapter_list(shots), shots.get('duration'))
        if len(final_description(meta, config, shots)) > DESC_MAX: errs.append(f'description: over {DESC_MAX} chars')
    else:
        if PLACEHOLDER in d: errs.append(f'description: Shorts have no chapters; remove {PLACEHOLDER}')
        if len(d) > SHORT_DESC_MAX: errs.append(f'description: too long for a Short ({len(d)} chars, keep it ≤ {SHORT_DESC_MAX}): short and to the point')
    tags = meta.get('tags', [])
    if not TAGS_MIN <= len(tags) <= TAGS_MAX: errs.append(f'tags: give {TAGS_MIN}–{TAGS_MAX} tags, got {len(tags)}')
    low = [t.strip().lower() for t in tags]
    if len(set(low)) != len(low): errs.append('tags: duplicate tags (case-insensitive)')
    if any(re.search(r'[<>,]', t) for t in tags): errs.append("tags: no '<', '>' or ',' inside a tag")
    if _tag_chars(tags) > TAGS_CHARS: errs.append(f'tags: {_tag_chars(tags)} chars in total, YouTube allows {TAGS_CHARS}')
    return errs


def final_description(meta: dict, config: dict, shots: dict) -> str:
    d = meta.get('description', '').strip()
    if is_long(config) and PLACEHOLDER in d:
        d = d.replace(PLACEHOLDER, '\n'.join(f'{fmt_ts(t)} {name}' for t, name in chapter_list(shots)))
    return d


def report(meta: dict, config: dict, shots: dict, thumb: dict) -> str:
    best = next(t['text'] for t in meta['titles'] if t.get('best'))
    vertical = config.get('aspect') == '9:16'
    lines = [f"# YouTube kit — {config.get('title', '')}", '', f"Format: {'Short' if not is_long(config) else 'Long video'} · {config.get('aspect')} · {fmt_ts(shots.get('duration', 0))}", '',
             '## 1. Video Title', '', f'**{best}**  ★ best', '', 'Other options:']
    lines += [f"- {t['text']}" for t in meta['titles'] if not t.get('best')]
    lines += ['', '## 2. Video Description', '', '```', final_description(meta, config, shots), '```', '',
              '## 3. Video Tags', '', '```', ', '.join(meta['tags']), '```', '',
              '## 4. Generated Thumbnail', '', f"![thumbnail]({Path(thumb['path']).name})", '', f"`{thumb['path']}`", '',
              '## 5. Thumbnail Resolution and Aspect Ratio', '',
              f"{thumb['width']} × {thumb['height']} px · {'9:16 (Shorts)' if vertical else '16:9 (long video)'} · JPG, {thumb['bytes'] / 1e6:.2f} MB (YouTube limit 2 MB)", '']
    return '\n'.join(lines)


def facts(P: Path) -> dict:
    cfg = json.load(open(P / 'config.json')); shots = json.load(open(P / 'story/shots.json'))
    L = json.load(open(P / 'input/lines.json')) if (P / 'input/lines.json').exists() else []
    beats, cur = {}, None
    for l in L:
        cur = l.get('beat') or cur or 'opening'
        beats.setdefault(cur, []).append(f"{l.get('who')}: {l['text']}")
    bible = (P / 'story/bible.md').read_text()[:1500] if (P / 'story/bible.md').exists() else ''
    return {'title': cfg.get('title'), 'aspect': cfg.get('aspect'), 'length': cfg.get('length', 'short'), 'duration': fmt_ts(shots.get('duration', 0)),
            'speakers': sorted({l.get('who') for l in L}), 'beats': beats,
            'chapters': [f'{fmt_ts(t)} {n}' for t, n in chapter_list(shots)] if is_long(cfg) else [],
            'shots': [s.get('scene', '') for s in shots['shots']], 'bible': bible}


def build(P: Path) -> int:
    cfg = json.load(open(P / 'config.json')); shots = json.load(open(P / 'story/shots.json'))
    meta = json.load(open(P / 'story/metadata.json'))
    errs = validate(meta, cfg, shots)
    tj = P / 'out/thumbnail.json'
    if not tj.exists(): errs.append('thumbnail: not rendered yet; run tools/thumbnail.py first')
    for e in errs: print('META', e)
    if errs: return 1
    thumb = json.load(open(tj)); base = out_name(cfg.get('title', 'video'))[:-4]
    (P / 'out' / f'{base}.youtube.md').write_text(report(meta, cfg, shots, thumb))
    (P / 'out' / f'{base}.description.txt').write_text(final_description(meta, cfg, shots) + '\n')
    (P / 'out' / f'{base}.tags.txt').write_text(', '.join(meta['tags']) + '\n')
    json.dump({'title': next(t['text'] for t in meta['titles'] if t['best']), 'titles': meta['titles'], 'description': final_description(meta, cfg, shots),
               'tags': meta['tags'], 'thumbnail': thumb}, open(P / 'out' / f'{base}.metadata.json', 'w'), indent=1)
    print('wrote', P / 'out' / f'{base}.youtube.md'); return 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('cmd', choices=['facts', 'build']); ap.add_argument('--project', required=True); a = ap.parse_args()
    P = Path(a.project)
    if a.cmd == 'facts': print(json.dumps(facts(P), indent=1, ensure_ascii=False))
    else: sys.exit(build(P))
