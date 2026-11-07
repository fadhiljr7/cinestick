"""Render a long video chapter by chapter (resumable), then join the chapters into build/video_silent.mp4.

  python tools/render_long.py --project projects/<slug> [--workers 6]

Chapters come from shots[].chapter in story/shots.json (no chapters = one range). A chapter whose file already exists with the
expected number of frames is skipped, so a stopped render picks up where it left off. Set PW_CHROMIUM as for render.mjs.
"""
import argparse, json, subprocess, sys
from pathlib import Path

KIT = Path(__file__).resolve().parents[1]


def chapter_ranges(shots: dict) -> list:
    S = shots['shots']
    if not any('chapter' in s for s in S): return [('all', 0, shots.get('duration', S[-1]['end']))]
    out = []
    for s in S:
        c = s.get('chapter', out[-1][0] if out else 'c0')
        if out and out[-1][0] == c: out[-1] = (c, out[-1][1], s['end'])
        else: out.append((c, s['start'], s['end']))
    if shots.get('duration') and out: out[-1] = (out[-1][0], out[-1][1], max(out[-1][2], shots['duration']))
    return out


def _frames(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', str(path)], capture_output=True, text=True)
    try: return int(r.stdout.strip())
    except ValueError: return -1


def main(project, workers=6):
    P = Path(project).resolve(); fps = json.load(open(P / 'config.json')).get('fps', 24)
    parts = P / 'build' / 'chapters'; parts.mkdir(parents=True, exist_ok=True)
    files = []
    for i, (name, a, b) in enumerate(chapter_ranges(json.load(open(P / 'story/shots.json')))):
        f = parts / f'{i:02d}_{name}.mp4'; files.append(f)
        want = round(b * fps) - round(a * fps)
        if f.exists() and abs(_frames(f) - want) <= 1: print('skip', f.name); continue
        print(f'render {name}: {a:.2f}–{b:.2f} s'); sys.stdout.flush()
        subprocess.run(['node', str(KIT / 'render.mjs'), '--project', str(P), '--from', str(a), '--to', str(b), '--workers', str(workers), '--out', str(f)], cwd=KIT, check=True)
    lst = parts / 'list.txt'; lst.write_text(''.join(f"file '{f}'\n" for f in files))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c', 'copy', str(P / 'build/video_silent.mp4')], check=True)
    print('joined', len(files), 'chapters →', P / 'build/video_silent.mp4')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--project', required=True); ap.add_argument('--workers', type=int, default=6); a = ap.parse_args()
    main(a.project, a.workers)
