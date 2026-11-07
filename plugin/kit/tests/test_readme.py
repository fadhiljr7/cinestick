import unittest
from pathlib import Path
R = Path(__file__).resolve().parents[3] / 'README.md'
HEADS = ['## What it makes', '## Install', '## Use', '## How it works', '## How the voice-over is made', '## How the music is made',
         '## How the sound effects are made', '## The mix', '## YouTube title, description, tags and thumbnail', '## Directing rules', '## Troubleshooting', '## Credits & licenses']

class Readme(unittest.TestCase):
    def test_headings_in_order(self):
        t = R.read_text(); pos = [t.find(h) for h in HEADS]
        self.assertTrue(all(p >= 0 for p in pos), [h for h, p in zip(HEADS, pos) if p < 0]); self.assertEqual(pos, sorted(pos))
    def test_key_strings(self):
        t = R.read_text()
        for s in ['WSL', '--with-deps', 'deadsnakes', 'NodeSource', 'side by side', 'python@3.12', 'kokoro-onnx', 'faster-whisper', 'npx playwright install chromium', 'PW_CHROMIUM', '/plugin marketplace add']: self.assertIn(s, t, s)

if __name__ == '__main__': unittest.main()
