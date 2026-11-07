"""Make every voice line: Kokoro (offline) → per-role treatment → Whisper speech check → retry → cache → assemble.

  python tools/voice/voices.py --project projects/<slug> [--no-assemble]

lines.json fields: id, who, vo (narration, not lip-synced), voice (Kokoro id), speed, treat (normal|side|creature|villain),
beat (hook|setup|doubter|escalation|turn|reveal|closing, optional), text, asr (optional: what Whisper should hear).
A misheard line is made again up to 2 times, each 0.05 slower; if it still fails it is kept and reported as flagged.
Unchanged lines (same text, voice, speed, treatment) are not made again: voices/cache.json.
"""
import argparse, hashlib, json, re, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
TREATMENTS = {
    'normal': 'atempo=1.1',
    'side': 'atempo=1.06,asetrate=24000*0.96,aresample=24000,atempo=1.04',
    'creature': 'asetrate=24000*1.3,aresample=24000,atempo=0.92',
    'villain': 'asetrate=24000*0.82,aresample=24000,atempo=1.08,aecho=0.6:0.5:40:0.25,bass=g=4',
}
SPEED_STEP = 0.05

_ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
_TENS = 'twenty thirty forty fifty sixty seventy eighty ninety'.split()


def _words(n: int) -> str:
    if n < 20: return _ONES[n]
    if n < 100: return _TENS[n // 10 - 2] + ('' if n % 10 == 0 else ' ' + _ONES[n % 10])
    for div, name in ((10 ** 9, 'billion'), (10 ** 6, 'million'), (1000, 'thousand'), (100, 'hundred')):
        if n >= div:
            head, rest = divmod(n, div)
            h = 'a' if head == 1 else _words(head)
            return f'{h} {name}' + ('' if rest == 0 else ' ' + _words(rest))
    return str(n)


def number_asr(text: str):
    """The line as Whisper will likely spell it when it contains digits ("1000" → "a thousand"); None when no digits."""
    if not re.search(r'\d', text): return None
    def rep(m):
        s = m.group(0).replace(',', '')
        if '.' in s:
            a, b = s.split('.', 1); return _words(int(a)) + ' point ' + ' '.join(_ONES[int(c)] for c in b)
        return _words(int(s))
    return re.sub(r'\d[\d,]*(?:\.\d+)?', rep, text)


def line_hash(line: dict) -> str:
    key = json.dumps([line.get('text'), line.get('voice'), line.get('speed', 1.0), line.get('treat', 'normal')])
    return hashlib.sha1(key.encode()).hexdigest()


# ---------- default Kokoro synth and Whisper check (loaded once, lazily) ----------
_K = {}

def kokoro_synth(line: dict, speed: float, out: Path):
    import numpy as np, soundfile as sf
    if 'k' not in _K:
        from kokoro_onnx import Kokoro
        m, v = HERE / 'kokoro-v1.0.onnx', HERE / 'voices-v1.0.bin'
        if not (m.exists() and v.exists()): sys.exit(f'voices.py: the Kokoro model is missing in {HERE}. Run: sh tools/setup.sh')
        _K['k'] = Kokoro(str(m), str(v))
    a, sr = _K['k'].create(line['text'], voice=line.get('voice', 'af_heart'), speed=speed, lang='en-us')
    nz = np.where(np.abs(a) > (np.abs(a).max() if len(a) else 0) * .02)[0]
    if len(nz): a = a[max(0, nz[0] - int(.03 * sr)): nz[-1] + int(.08 * sr)]
    with tempfile.TemporaryDirectory() as td:
        raw = Path(td) / 'raw.wav'; sf.write(str(raw), a, sr)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(raw), '-af', TREATMENTS[line.get('treat', 'normal')], str(out)], check=True)


def whisper_check(line: dict, wav: Path):
    import numpy as np, soundfile as sf, soxr
    sys.path.insert(0, str(HERE)); import asr_check as AC
    if 'w' not in _K: _K['w'] = AC.load_model('base.en')
    y, sr = sf.read(str(wav))
    if y.ndim > 1: y = y.mean(1)
    y = soxr.resample(y, sr, 16000, quality='HQ'); pad = np.zeros(int(.6 * 16000))
    segs, _ = _K['w'].transcribe(np.concatenate([pad, y, pad]).astype(np.float32), beam_size=5, language='en', word_timestamps=True)
    tail = (len(y) + len(pad)) / 16000 - .5
    segs = [s for s in segs if not (s.no_speech_prob > .5 and s.start > tail)]
    got = ' '.join(s.text.strip() for s in segs)
    words = [[w.word.strip(), round(w.start - .6, 3), round(w.end - .6, 3)] for s in segs for w in s.words]
    wants = [x for x in (line.get('asr'), line['text'], number_asr(line['text'])) if x]
    ok = any(AC.compare(w, got, 'en')[0] for w in wants)
    print(('OK  ' if ok else 'DIFF'), line['id'], '|', line['text'], '→', got)
    return ok, words


def build_voices(project_dir, max_retries: int = 2, synth=None, check=None) -> dict:
    synth, check = synth or kokoro_synth, check or whisper_check
    P = Path(project_dir); V = P / 'voices'; V.mkdir(exist_ok=True)
    lines = json.load(open(P / 'input/lines.json'))
    cache = json.load(open(V / 'cache.json')) if (V / 'cache.json').exists() else {}
    words = json.load(open(V / 'words.json')) if (V / 'words.json').exists() else {}
    res = {'ok': [], 'flagged': [], 'cached': []}
    for l in lines:
        h, wav = line_hash(l), V / f"{l['id']}.wav"
        if cache.get(l['id']) == h and wav.exists() and l['id'] in words:
            res['cached'].append(l['id']); continue
        speed, ok = float(l.get('speed', 1.0)), False
        for attempt in range(max_retries + 1):
            synth(l, speed, wav)
            ok, w = check(l, wav)
            words[l['id']] = w
            if ok: break
            speed = round(speed - SPEED_STEP, 3)
        res['ok' if ok else 'flagged'].append(l['id'])
        cache[l['id']] = h
    ids = {l['id'] for l in lines}
    json.dump({k: v for k, v in words.items() if k in ids}, open(V / 'words.json', 'w'), indent=0)
    json.dump({k: v for k, v in cache.items() if k in ids}, open(V / 'cache.json', 'w'), indent=1)
    return res


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--project', required=True); ap.add_argument('--no-assemble', action='store_true'); a = ap.parse_args()
    r = build_voices(a.project)
    print(f"voices: {len(r['ok'])} made, {len(r['cached'])} cached, {len(r['flagged'])} flagged {r['flagged'] or ''}")
    if not a.no_assemble:
        sys.path.insert(0, str(HERE)); import assemble
        P = Path(a.project); out = assemble.assemble(P, json.load(open(P / 'input/lines.json')), P / 'voices')
        print(f"voiceover {out['duration']} s → {P / 'input/voiceover.wav'}")
    sys.exit(1 if r['flagged'] else 0)
