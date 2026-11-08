"""Check story/shots.json against the cinestick directing rulebook before any scene is written.

  python tools/plan_check.py --project projects/<slug>        exit 0 = clean, 1 = problems (each printed)

Rules (skills/make-video/references/directing.md):
  all      contiguous shots; every shot has a known "type"; no type more than twice in a row
  short    at least 60 s long; median ≤ 2.0 s; no shot over 3.5 s except the last; ≤ 2 freeze shots; last shot type "callback";
           at most 40 % hard cuts (cross-dissolve "fade" is the default transition)
  long     at least 8 min long (10+ min recommended: printed as a note); median 2–4 s; no shot over 10 s; a new chapter opens with "dip" and an "establishing" shot
"""
import argparse, json, statistics, sys
from pathlib import Path

SHOT_TYPES = ['establishing', 'two-shot', 'ots', 'bigface', 'insert', 'pov', 'circle', 'meanwhile', 'timeskip',
              'fact-object', 'blueprint', 'data', '3d', 'freeze', 'callback']
SHORT_MEDIAN, SHORT_MAX, MAX_FREEZE, MAX_CUT_SHARE = 2.0, 3.5, 2, 0.4
LONG_MEDIAN, LONG_MAX = (2.0, 4.0), 10.0
SHORT_MIN_DUR, LONG_MIN_DUR, LONG_RECOMMENDED_DUR = 60.0, 480.0, 600.0


def check(shots: dict, config: dict) -> list:
    S, errs = shots['shots'], []
    long = config.get('length') == 'long'
    durs = [s['end'] - s['start'] for s in S]
    for a, b in zip(S, S[1:]):
        if abs(a['end'] - b['start']) > 1e-3: errs.append(f"gap: {a['id']} ends {a['end']} but {b['id']} starts {b['start']}")
    if S and abs(S[0]['start']) > 1e-3: errs.append(f"gap: first shot starts at {S[0]['start']}, not 0")
    for s in S:
        if s.get('type') not in SHOT_TYPES: errs.append(f"type: {s['id']} has type {s.get('type')!r}; use one of {', '.join(SHOT_TYPES)}")
    for i in range(2, len(S)):
        if S[i].get('type') == S[i - 1].get('type') == S[i - 2].get('type'): errs.append(f"repeat: {S[i - 2]['id']}–{S[i]['id']} are three '{S[i]['type']}' shots in a row")
    med = statistics.median(durs) if durs else 0
    total = video_duration(shots)
    if long and total < LONG_MIN_DUR: errs.append(f'duration: the video is {total / 60:.1f} min; a long video must be at least {LONG_MIN_DUR / 60:.0f} min (10+ recommended) — add chapters or material, not padding')
    if not long and total < SHORT_MIN_DUR: errs.append(f'duration: the video is {total:.1f} s; a Short must be at least {SHORT_MIN_DUR:.0f} s — lengthen the script (more escalation or dialogue), not the pauses')
    if long:
        if not LONG_MEDIAN[0] <= med <= LONG_MEDIAN[1]: errs.append(f"median: shot median {med:.2f} s, want {LONG_MEDIAN[0]}–{LONG_MEDIAN[1]} s for a long video")
        for s, d in zip(S, durs):
            if d > LONG_MAX: errs.append(f"too long: {s['id']} is {d:.2f} s (max {LONG_MAX} s)")
        for a, b in zip(S, S[1:]):
            if b.get('chapter') and b.get('chapter') != a.get('chapter'):
                if (b.get('in') or {}).get('type') != 'dip': errs.append(f"chapter: {b['id']} opens chapter {b['chapter']} without a 'dip'")
                if b.get('type') != 'establishing': errs.append(f"chapter: {b['id']} opens chapter {b['chapter']} without an 'establishing' shot")
    else:
        if med > SHORT_MEDIAN: errs.append(f"median: shot median {med:.2f} s, want ≤ {SHORT_MEDIAN} s (target 1.5) for a Short")
        for s, d in list(zip(S, durs))[:-1]:
            if d > SHORT_MAX: errs.append(f"too long: {s['id']} is {d:.2f} s (max {SHORT_MAX} s except the last shot); split it on a stressed word")
        if sum(s.get('type') == 'freeze' for s in S) > MAX_FREEZE: errs.append(f"freeze: more than {MAX_FREEZE} freeze shots")
        if S and S[-1].get('type') != 'callback': errs.append("callback: the last shot must be a 'callback' to an earlier framing, changed")
        cuts = sum((s.get('in') or {}).get('type', 'cut') == 'cut' for s in S[1:])
        if S[1:] and cuts / len(S[1:]) > MAX_CUT_SHARE: errs.append(f"dissolve: {cuts}/{len(S) - 1} hard cuts; the default transition is a 0.2 s 'fade' (hard cuts for impacts only)")
    return errs


def video_duration(shots: dict) -> float:
    S = shots['shots']
    return float(shots.get('duration') or (S[-1]['end'] if S else 0))


def notes(shots: dict, config: dict) -> list:
    """Recommendations that don't fail the plan."""
    total = video_duration(shots)
    if config.get('length') == 'long' and LONG_MIN_DUR <= total < LONG_RECOMMENDED_DUR:
        return [f'the video is {total / 60:.1f} min: allowed, but 10+ min is recommended for long videos']
    return []


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--project', required=True); a = ap.parse_args()
    P = Path(a.project)
    errs = check(json.load(open(P / 'story/shots.json')), json.load(open(P / 'config.json')))
    for e in errs: print('PLAN', e)
    for n in notes(json.load(open(P / 'story/shots.json')), json.load(open(P / 'config.json'))): print('NOTE', n)
    print('plan_check:', 'clean' if not errs else f'{len(errs)} problem(s)')
    sys.exit(1 if errs else 0)
