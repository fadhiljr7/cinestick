"""Write out/<Title>.srt from timeline/words.json, grouped like the on-screen captions (never two speakers in one cue).

  python tools/srt.py --project projects/<slug>
"""
import argparse, json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / 'voice'))


def groups(words, max_words=4):          # same rule as starter/grouping.js
    out, cur = [], []
    for i, w in enumerate(words):
        if cur and (w['line'] != words[cur[0]]['line'] or len(cur) == max_words): out.append(cur); cur = []
        cur.append(i)
        if re.search(r'[.?!]$', w['word']) and len(cur) >= 2: out.append(cur); cur = []
    if cur: out.append(cur)
    return out


def ts(t: float) -> str:
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'


def to_srt(words) -> str:
    cues = []
    for n, g in enumerate(groups(words), 1):
        cues.append(f"{n}\n{ts(words[g[0]]['start'])} --> {ts(words[g[-1]]['end'])}\n{' '.join(words[i]['word'] for i in g)}\n")
    return '\n'.join(cues)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--project', required=True); a = ap.parse_args()
    from assemble import out_name
    P = Path(a.project); cfg = json.load(open(P / 'config.json'))
    out = P / 'out' / out_name(cfg.get('title', P.name)).replace('.mp4', '.srt'); out.parent.mkdir(exist_ok=True)
    out.write_text(to_srt(json.load(open(P / 'timeline/words.json'))['words'])); print('wrote', out)
