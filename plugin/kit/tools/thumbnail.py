"""Render the video's custom thumbnail at YouTube's exact size, from the project's own `thumbnail` shot.

  python tools/thumbnail.py --project P [--at 1.0]

The thumbnail is drawn in code like the video: write scenes/shots/thumbnail.js with registerShot('thumbnail', {...}) (see
skills/make-video/references/thumbnail.md). Size follows the video's aspect, never asked again:
  9:16 (Shorts) → 1080 × 1920      16:9 (long)   → 1280 × 720
Writes out/<Title>_thumbnail.jpg (≤ 2 MB, YouTube's limit) and out/thumbnail.json {path, width, height, aspect, bytes}.
"""
import argparse, json, os, subprocess, sys
from pathlib import Path

KIT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(KIT / 'tools' / 'voice'))
from assemble import out_name

RES = {'720p': 720, '1080p': 1080, '1440p': 1440, '2160p': 2160, '4k': 2160}
MAX_BYTES = 2_000_000


def thumb_size(config) -> tuple:
    return (1080, 1920) if config.get('aspect') == '9:16' else (1280, 720)


def render_scale(config) -> float:
    """--scale for render.mjs so the player's short side equals the thumbnail's short side."""
    return min(thumb_size(config)) / RES.get(config.get('resolution', '1080p'), 1080)


def out_path(P: Path, config) -> Path:
    return P / 'out' / (out_name(config.get('title', 'video'))[:-4] + '_thumbnail.jpg')


def _dims(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', str(path)], capture_output=True, text=True, check=True)
    w, h = r.stdout.strip().split(','); return int(w), int(h)


def main(project, at=1.0):
    P = Path(project).resolve(); cfg = json.load(open(P / 'config.json'))
    if not (P / 'scenes/shots/thumbnail.js').exists(): sys.exit('thumbnail.py: write scenes/shots/thumbnail.js (registerShot("thumbnail", …)) first')
    W, H = thumb_size(cfg); raw = P / 'build' / 'thumb_raw.png'; raw.parent.mkdir(exist_ok=True)
    subprocess.run(['node', str(KIT / 'render.mjs'), '--project', str(P), '--thumbnail', '--at', str(at), '--scale', f'{render_scale(cfg):.6f}', '--out', str(raw)], cwd=KIT, check=True)
    out = out_path(P, cfg); out.parent.mkdir(exist_ok=True)
    for q in (2, 3, 4, 6, 8):                                      # best quality that fits YouTube's 2 MB limit
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(raw), '-vf', f'scale={W}:{H}:flags=lanczos', '-q:v', str(q), str(out)], check=True)
        if os.path.getsize(out) <= MAX_BYTES: break
    w, h = _dims(out)
    if (w, h) != (W, H): sys.exit(f'thumbnail.py: got {w}×{h}, expected {W}×{H}')
    info = {'path': str(out.relative_to(P)), 'width': w, 'height': h, 'aspect': cfg.get('aspect'), 'bytes': os.path.getsize(out)}
    json.dump(info, open(P / 'out/thumbnail.json', 'w'), indent=1); print(json.dumps(info))


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--project', required=True); ap.add_argument('--at', type=float, default=1.0); a = ap.parse_args()
    main(a.project, a.at)
