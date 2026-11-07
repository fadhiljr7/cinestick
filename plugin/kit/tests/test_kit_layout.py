import json, os, re, unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]          # repo root
KIT = ROOT / 'plugin' / 'kit'

class KitLayout(unittest.TestCase):
    def test_required_files_exist(self):
        for p in ['render.mjs', 'player.html', 'engine/core.js', 'engine/rig2d.js', 'audio/mix.py',
                  'tools/voice/tts.py', 'tools/voice/asr_check.py', 'NOTICE', 'examples/medicine/story/shots.json']:
            self.assertTrue((KIT / p).is_file(), p)

    def test_no_stickfolk(self):
        bad = [re.compile(r'folk2d'), re.compile(r'Montserrat'), re.compile(r"\bfolk: \{"), re.compile(r"FontFace\('Caption'")]
        for f in (ROOT / 'plugin').rglob('*'):
            if f.is_file() and f.suffix in {'.js', '.mjs', '.md', '.py', '.json', '.html'} and 'tests' not in f.parts:
                txt = f.read_text(errors='ignore')
                for b in bad: self.assertIsNone(b.search(txt), f'{b.pattern} in {f}')

    def test_patches_present(self):
        self.assertIn('window.CAPTIONS ||', (KIT / 'engine/player.js').read_text())
        self.assertIn('PW_CHROMIUM', (KIT / 'render.mjs').read_text())

    def test_manifests_parse(self):
        m = json.loads((ROOT / '.claude-plugin/marketplace.json').read_text())
        self.assertEqual(m['plugins'][0]['source'], './plugin')
        p = json.loads((ROOT / 'plugin/.claude-plugin/plugin.json').read_text())
        self.assertEqual(p['name'], 'cinestick'); self.assertEqual(p['license'], 'MIT')

if __name__ == '__main__': unittest.main()
