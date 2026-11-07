"""tools/new_project.py — create the folder for one cinestick video (before any voice exists: the story comes first).

  python tools/new_project.py --title "What if you had 1000 IQ" [--aspect 9:16|16:9] [--length short|long] [--resolution 1080p]

Creates projects/<slug>/ with input/ timeline/ story/ scenes/{sets,shots,lib}/ voices/ build/ out/ and config.json, and copies the
starter scene kit (starter/*.js) into scenes/lib/. An existing project is never overwritten (only missing folders/files are added).
Based on aiTrends 2D Studio's new_project.py (see NOTICE).
"""
import argparse, json, shutil, sys
from pathlib import Path

KIT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(KIT / 'tools' / 'voice'))
from assemble import slugify


def create_project(root, title: str, aspect: str = '9:16', length: str = 'short', resolution: str = '1080p') -> Path:
    P = Path(root) / 'projects' / slugify(title)
    for d in ['input', 'timeline', 'story', 'scenes/sets', 'scenes/shots', 'scenes/lib', 'voices', 'build', 'out', 'audio']:
        (P / d).mkdir(parents=True, exist_ok=True)
    for f in (KIT / 'starter').glob('*.js'):
        if not (P / 'scenes/lib' / f.name).exists(): shutil.copy2(f, P / 'scenes/lib' / f.name)
    if not (P / 'config.json').exists():
        vertical = aspect == '9:16'
        cfg = {'title': title, 'aspect': aspect, 'length': length, 'resolution': resolution, 'fps': 24, 'style': 'dusk',
               'voiceover': 'input/voiceover.wav', 'script': 'input/script.txt', 'duration': 0,
               'captions': vertical, 'bars': None if vertical else 'wide', 'fadeIn': 0.5, 'fadeOut': 0.8,
               'music': {'enabled': True, 'gainDb': -17}, 'sfx': {'enabled': True, 'gainDb': -6}, 'loudness': -14}
        json.dump(cfg, open(P / 'config.json', 'w'), indent=1)
    return P


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--title', required=True); ap.add_argument('--aspect', default='9:16', choices=['9:16', '16:9'])
    ap.add_argument('--length', default='short', choices=['short', 'long'])
    ap.add_argument('--resolution', default='1080p', choices=['720p', '1080p', '1440p', '2160p', '4k'])
    a = ap.parse_args()
    p = create_project(Path.cwd(), a.title, a.aspect, a.length, a.resolution)
    print(f'project {p}  ({a.aspect}, {a.length}, {a.resolution} @ 24 fps, style dusk)')
